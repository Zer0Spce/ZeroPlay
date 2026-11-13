/* ZeroPlay Discovery 2.0 — profile scoped source rotation, exposure history, and
 * source-pool merging. Playback and favorites remain in the native app.
 */
(()=>{
'use strict';
const engine=window.ZeroFreshRecommendations;
const PREFIX='zeroplay-fresh-v2:', SIX_HOURS=21600000;
let requestRefresh=false,used=new Set(),lastSeed='';
function getJSON(k,fallback){try{return JSON.parse(localStorage.getItem(k))??fallback;}catch{return fallback;}}
function put(k,value){try{localStorage.setItem(k,JSON.stringify(value));}catch{}}
function profileOf(state){return String(state.activeProfile||'Default').replace(/[^a-z0-9_-]/gi,'_').slice(0,75);}
function cycle(profile) {
  const key=PREFIX+profile+':cycle',base=Math.floor(Date.now()/SIX_HOURS),prev=getJSON(key,{});
  const bump=prev.base===base?(Number(prev.bump)||0)+(requestRefresh?1:0):0;
  put(key,{base,bump});requestRefresh=false;
  return {base,bump,seed:[base,bump,profile].join(':')};
}
function previous(profile,seed){
  const seen=engine.prune(getJSON(PREFIX+profile+':seen',{}));
  const current=getJSON(PREFIX+profile+':current',{});
  if(current.seed===seed)for(const id of current.ids||[])delete seen[id];
  return seen;
}
async function gather(load,state,loadProviderCatalog){
  const profile=profileOf(state),c=cycle(profile);
  const page=(base,range)=>base+(c.base+c.bump)%range;
  const endYear=new Date().getFullYear()-12;
  const today=new Date().toISOString().slice(0,10);
  const daysAgo=days=>new Date(Date.now()-days*86400000).toISOString().slice(0,10);
  const history=[...(state.history||[]),...(state.favorites||[])];
  const frequency=new Map();
  for(const row of history.slice(0,20))for(const g of row?.genreIds||[])frequency.set(g,(frequency.get(g)||0)+1);
  const bestGenre=[...frequency].sort((a,b)=>b[1]-a[1])[0]?.[0];
  const hollywood={with_original_language:'en',with_origin_country:'US'};
  // TMDB digital release type 4, distinct from first theatrical run (type 3).
  // A digital date in the US is NOT a guarantee of availability on a particular streaming service.
  const vodFilter={...hollywood,region:'US',with_release_type:'4',
    'release_date.gte':daysAgo(180),'release_date.lte':today,
    'primary_release_date.gte':daysAgo(550),
    sort_by:'primary_release_date.desc','vote_count.gte':10};
  const streamsFilter={...hollywood,watch_region:state.settings.region,
    with_watch_monetization_types:'flatrate',
    'primary_release_date.gte':daysAgo(365),'primary_release_date.lte':today,
    sort_by:'primary_release_date.desc','vote_count.gte':20};
  const tasks=[
    ['vod','/discover/movie',{...vodFilter,page:1},'movie'],
    ['vod','/discover/movie',{...vodFilter,page:page(2,3)},'movie'],
    ['streaming','/discover/movie',{...streamsFilter,page:1},'movie'],
    ['day','/trending/all/day',{},null],
    ['trending','/trending/all/week',{page:page(2,5)},null],
    ['popular','/discover/movie',{...hollywood,'primary_release_date.gte':daysAgo(850),
      sort_by:'popularity.desc',page:page(1,6)},'movie'],
    ['recommended','/discover/movie',{...hollywood,'primary_release_date.gte':daysAgo(850),
      sort_by:'vote_average.desc','vote_count.gte':180,page:page(1,4)},'movie'],
    ['series','/tv/popular',{page:page(2,5)},'tv'],
    ['now','/discover/movie',{...hollywood,'primary_release_date.gte':daysAgo(365),
      sort_by:'primary_release_date.desc',page:page(1,3)},'movie'],
    ['gems','/discover/movie',{...hollywood,'primary_release_date.gte':daysAgo(1400),
      sort_by:'vote_average.desc','vote_count.gte':120,page:page(1,4)},'movie'],
    ['classics','/discover/movie',{...hollywood,sort_by:'vote_count.desc',
      'primary_release_date.gte':endYear+'-01-01',
      'primary_release_date.lte':new Date().getFullYear()-5+'-12-31',page:page(1,4)},'movie'],
    ['thrillers','/discover/movie',{...hollywood,with_genres:53,
      'primary_release_date.gte':daysAgo(850),'vote_count.gte':120,
      sort_by:'vote_average.desc',page:page(1,4)},'movie']
  ];
  if(bestGenre)tasks.push(['similar','/discover/movie',{...hollywood,
    with_genres:String(bestGenre),sort_by:'popularity.desc',
    'primary_release_date.gte':daysAgo(850),page:page(1,3)},'movie']);
  const done=await Promise.allSettled(tasks.map(async ([name,path,params,type])=>
    [name,await load(path,params,type)]));
  const pools={};
  for(const entry of done)if(entry.status==='fulfilled'){
    const [name,rows]=entry.value;(pools[name] ||= []).push(...rows);
  }

  // Strict US flatrate selections from only the eight approved streaming providers.
  let streaming=[];
  try {
    const catalog=await loadProviderCatalog('/watch/providers/movie',{watch_region:'US'});
    const services=window.ZeroStreamingCarousel.providers(catalog?.results);
    if(services.length){
      const with_watch_providers=services.map(p=>p.provider_id).join('|');
      const filters={watch_region:'US',with_watch_providers,with_watch_monetization_types:'flatrate',
        'primary_release_date.gte':daysAgo(420),'primary_release_date.lte':today,
        sort_by:'primary_release_date.desc','vote_count.gte':10};
      const pages=[1,2,3+(c.base+c.bump)%3];
      const responses=await Promise.allSettled(pages.map(page=>
        load('/discover/movie',{...filters,page},'movie')));
      const movies=responses.filter(x=>x.status==='fulfilled').flatMap(x=>x.value);
      streaming=window.ZeroStreamingCarousel.topTen(movies,c.seed,today);
    }
  }catch(error){console.warn('US streaming carousel unavailable',error?.message||error);}
  pools.streaming=streaming;
  return {profile,seed:c.seed,pools};
}
function prepare(base,additions,state){
  const pools={...base};
  for(const [name,items] of Object.entries(additions.pools||{}))
    pools[name]=[...(base[name]||[]),...items];
  const selected=engine.select({
    pools,now:Date.now(),seed:additions.seed,seen:previous(additions.profile,additions.seed),
    positions:state.positions||{},history:state.history||[],
    favorites:state.favorites||[],notInterested:state.notInterested||[],
    carouselSource:'streaming'
  });
  const seen=engine.prune(getJSON(PREFIX+additions.profile+':seen',{}));
  for(const k of selected.used)seen[k]=Date.now();
  put(PREFIX+additions.profile+':seen',seen);
  put(PREFIX+additions.profile+':current',{seed:additions.seed,ids:selected.used});
  used=new Set(selected.used);
  for(const x of state.favorites||[])if(x?.id&&x.type)used.add(engine.id(x));
  for(const x of Object.values(state.positions||{}))if(x?.id&&x.type)used.add(engine.id(x));
  lastSeed=additions.seed;
  return {selected,pools,homeData:{...pools,
    trending:selected.shelves.trending,recommended:selected.shelves.recommended,
    popular:selected.shelves.popular,series:selected.shelves.series,
    now:selected.shelves.now,airing:selected.shelves.airing,
    upcoming:selected.shelves.upcoming
  }};
}
function takeExtra(rows){
  const result=[],today=new Date().toISOString().slice(0,10);
  for(const x of rows||[]){
    if(!x?.id||!x.type||!x.poster||(x.date&&x.date>today))continue;
    const k=engine.id(x);if(used.has(k))continue;
    used.add(k);result.push(x);
    if(result.length>=18)break;
  }
  return result;
}
window.ZeroFreshHome={
  gather,prepare,takeExtra,seed(){return lastSeed;},
  request(){requestRefresh=true;},
  key:profileOf
};
})();
