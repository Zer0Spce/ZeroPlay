/* ZeroPlay v2.2.5.8 TEST — wire recommendation selection to existing app.
 * Browser state stays per local ZeroPlay profile. Selecting the same six-hour
 * cycle again produces the same list; Refresh Picks creates a new cycle.
 */
(()=>{
'use strict';
const engine=window.ZeroFreshRecommendations;
const PREFIX='zeroplay-fresh-v1:';
const SIX_HOURS=21600000;
let requestRefresh=false,used=new Set();
function getJSON(k, fallback) {
  try{return JSON.parse(localStorage.getItem(k)) ?? fallback;}catch{return fallback;}
}
function put(k,value) {try{localStorage.setItem(k,JSON.stringify(value));}catch{}}
function cycle(profile){
  const key=PREFIX+profile+':cycle';
  const base=Math.floor(Date.now()/SIX_HOURS);
  const prev=getJSON(key,{});
  const bump=prev.base===base ? (Number(prev.bump)||0)+(requestRefresh?1:0):0;
  put(key,{base,bump});
  requestRefresh=false;
  return {base,bump,seed:[base,bump,profile].join(':')};
}
function profileOf(state){
  return String(state.activeProfile||'Default').replace(/[^a-z0-9_-]/gi,'_').slice(0,75);
}
function previous(profile,seed) {
  const seen=engine.prune(getJSON(PREFIX+profile+':seen',{}));
  const current=getJSON(PREFIX+profile+':current',{});
  if(current.seed===seed)for(const key of current.ids||[])delete seen[key];
  return seen;
}
async function gather(load, state) {
  const profile=profileOf(state);
  const c=cycle(profile);
  const page=(base,range)=>base+(c.base+c.bump)%range;
  const endYear=new Date().getFullYear()-8;
  const tasks=[
    ['day','/trending/all/day',{},null],
    ['trending','/trending/all/week',{page:page(2,5)},null],
    ['popular','/movie/popular',{page:page(2,7)},'movie'],
    ['recommended','/movie/top_rated',{page:page(2,6)},'movie'],
    ['series','/tv/popular',{page:page(2,5)},'tv'],
    ['now','/movie/now_playing',{page:page(2,4)},'movie'],
    ['gems','/discover/movie',{'sort_by':'vote_average.desc','vote_count.gte':150,'vote_average.gte':6.8,page:page(1,4)},'movie'],
    ['classics','/discover/movie',{'sort_by':'vote_count.desc','primary_release_date.lte':endYear+'-12-31',page:page(1,4)},'movie']
  ];
  const done=await Promise.allSettled(tasks.map(async ([name,path,params,type])=>
    [name,await load(path,params,type)]));
  const pools={};
  for(const entry of done)if(entry.status==='fulfilled'){
    const [name,rows]=entry.value;(pools[name] ||= []).push(...rows);
  }
  return {profile,seed:c.seed,pools};
}
function prepare(base, additions, state, isWatchlistVisible) {
  const merged={...base};
  for(const [name,items] of Object.entries(additions.pools||{}))
    merged[name]=[...(base[name]||[]),...items];
  const favorites=isWatchlistVisible?(state.favorites||[]).filter(x=>x?.id&&x?.type).map(engine.id):[];
  const selected=engine.select({
    pools:merged, now:Date.now(), seed:additions.seed,
    seen:previous(additions.profile,additions.seed),
    positions:state.positions||{}, history:state.history||[],
    notInterested:[...(state.notInterested||[]),...favorites],
    carouselSource:state.settings.carouselSource||'top'
  });
  const seen=engine.prune(getJSON(PREFIX+additions.profile+':seen',{}));
  for(const key of selected.used)seen[key]=Date.now();
  put(PREFIX+additions.profile+':seen',seen);
  put(PREFIX+additions.profile+':current',{seed:additions.seed,ids:selected.used});
  used=new Set(selected.used);
  for(const x of state.favorites||[])if(x?.id&&x.type)used.add(engine.id(x));
  for(const x of Object.values(state.positions||{}))if(x?.id&&x.type)used.add(engine.id(x));
  return {selected,homeData:{...merged,
    trending:selected.shelves.trending,
    recommended:selected.shelves.recommended,
    popular:selected.shelves.popular,
    series:selected.shelves.series,
    now:selected.shelves.now,
    airing:selected.shelves.airing,
    upcoming:selected.shelves.upcoming
  }};
}
function takeExtra(rows){
  const chosen=[];
  for(const item of rows||[]) {
    if(!item?.type||!item.id)continue;
    const k=engine.id(item);
    if(used.has(k))continue;
    used.add(k);
    chosen.push(item);
  }
  return chosen;
}
window.ZeroFreshHome={gather,prepare,takeExtra,request(){requestRefresh=true;}};
})();
