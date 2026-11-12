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
async function gather(load,state){
  const profile=profileOf(state),c=cycle(profile);
  const page=(base,range)=>base+(c.base+c.bump)%range;
  const endYear=new Date().getFullYear()-8,history=[...(state.history||[]),...(state.favorites||[])];
  const favoriteGenreCounts=new Map();
  for(const row of history.slice(0,20))for(const g of row?.genreIds||[])favoriteGenreCounts.set(g,(favoriteGenreCounts.get(g)||0)+1);
  const bestGenre=[...favoriteGenreCounts].sort((a,b)=>b[1]-a[1])[0]?.[0];
  const lang=['ja','ko','fr','es','hi','tl'][(c.base+c.bump)%6];
  const tasks=[
    ['day','/trending/all/day',{},null],
    ['trending','/trending/all/week',{page:page(2,6)},null],
    ['popular','/movie/popular',{page:page(2,8)},'movie'],
    ['recommended','/movie/top_rated',{page:page(2,8)},'movie'],
    ['series','/tv/popular',{page:page(2,6)},'tv'],
    ['now','/movie/now_playing',{page:page(2,5)},'movie'],
    ['gems','/discover/movie',{sort_by:'vote_average.desc','vote_count.gte':200,'vote_average.gte':7,page:page(1,5)},'movie'],
    ['classics','/discover/movie',{sort_by:'vote_count.desc','primary_release_date.lte':endYear+'-12-31',page:page(1,5)},'movie'],
    ['thrillers','/discover/movie',{with_genres:53,'vote_count.gte':200,sort_by:'vote_average.desc',page:page(1,4)},'movie'],
    ['world','/discover/movie',{with_original_language:lang,'vote_count.gte':80,sort_by:'popularity.desc',page:page(1,3)},'movie'],
    ['new','/movie/now_playing',{page:1},'movie']
  ];
  if(bestGenre)tasks.push(['similar','/discover/movie',{
    with_genres:String(bestGenre),sort_by:'popularity.desc',page:page(1,4)},'movie']);
  const done=await Promise.allSettled(tasks.map(async ([name,path,params,type])=>
    [name,await load(path,params,type)]));
  const pools={};
  for(const entry of done)if(entry.status==='fulfilled'){
    const [name,rows]=entry.value;(pools[name] ||= []).push(...rows);
  }
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
    carouselSource:state.settings.carouselSource||'top'
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
