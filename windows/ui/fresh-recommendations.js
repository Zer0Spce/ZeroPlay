/* ZeroPlay v2.2.5.8 TEST — deterministic, exposure-aware homepage discovery.
 * Pure selection logic, with no UI, networking or persistent state in this file.
 * Titles are ranked only from real TMDB results. No invented availability.
 */
((root,factory)=>{
  const x=factory();
  if(typeof module==='object'&&module.exports)module.exports=x;
  else root.ZeroFreshRecommendations=x;
})(typeof globalThis!=='undefined'?globalThis:this,()=>{
  'use strict';
  const DAY=86400000;
  const id=item=>item.type+':'+item.id;
  function hash(value){
    let h=2166136261;for(const char of String(value)){h^=char.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;
  }
  function prune(seen,now=Date.now()){
    return Object.fromEntries(Object.entries(seen||{}).filter(([k,v])=>
      /^(movie|tv):[1-9]\d*$/.test(k)&&Number.isFinite(Number(v))&&
      Number(v)>now-30*DAY&&Number(v)<=now+DAY).slice(-1600));
  }
  function select({
    pools={}, now=Date.now(), seed='default', seen={}, positions={},
    history=[], notInterested=[], carouselSource='top', perShelf=18
  }={}){
    const used=new Set(),ignored=new Set(notInterested),
      watched=new Set(Object.keys(positions||{}));
    const all=new Map();
    for(const source of Object.values(pools)){
      for(const item of Array.isArray(source)?source:[]){
        if(!item||!['movie','tv'].includes(item.type)||!Number.isSafeInteger(Number(item.id))||
          Number(item.id)<1||!item.poster&&!item.backdrop)continue;
        const k=id(item);
        if(ignored.has(k)||watched.has(k))continue;
        if(!all.has(k))all.set(k,item);
      }
    }
    const today=new Date(now).toISOString().slice(0,10);
    const recentCutoff=now-14*DAY;
    const genres=new Set((history||[]).slice(0,30).flatMap(h=>h.genreIds||[]));
    function candidates(sources,test=()=>true){
      const distinct=new Map();
      for(const source of sources)for(const original of pools[source]||[]){
        if(!original)continue;
        const key=id(original),item=all.get(key);
        if(!item||used.has(key)||distinct.has(key)||!test(item))continue;
        distinct.set(key,item);
      }
      return [...distinct.values()];
    }
    const rating=item=>Math.max(0,Math.min(.10,(Number(item.rating)||0)-6)*.015);
    function take(label,sources,condition=()=>true,n=perShelf){
      const list=candidates(sources,condition);
      list.sort((a,b)=>(
        (hash(seed+':'+label+':'+id(b))/4294967295+rating(b))-
        (hash(seed+':'+label+':'+id(a))/4294967295+rating(a))
      ));
      const fresh=list.filter(x=>!(Number(seen[id(x)])>=recentCutoff));
      const recycled=list.filter(x=>Number(seen[id(x)])>=recentCutoff);
      const chosen=fresh.concat(recycled).slice(0,n);
      for(const item of chosen)used.add(id(item));
      return chosen;
    }
    const available=item=>!item.date||item.date<=today;
    const typeMovie=item=>available(item)&&item.type==='movie';
    let hero=[];
    if(!['watchlist','continue'].includes(carouselSource)){
      const heroPool=carouselSource==='recommended'?['recommended','top','trending','popular']:
        carouselSource==='popular'?['popular','trending','now','top']:
        carouselSource==='now'?['now','trending','popular']:
        ['trending','day','popular','series','recommended'];
      hero=take('hero:'+carouselSource,heroPool,item=>available(item)&&Boolean(item.backdrop),6);
    }
    const shelves={};
    shelves.because=genres.size?take('because',['trending','recommended','popular','series','top'],item=>
      available(item)&&(item.genreIds||[]).some(g=>genres.has(g))):[];
    shelves.hidden=take('hidden',['gems','classics','top','recommended','popular'],item=>
      typeMovie(item)&&Number(item.rating)>=6.7&&Number(item.voteCount)>=100&&Number(item.popularity)<300);
    shelves.tonight=take('tonight',['top','recommended','popular','trending','gems'],item=>
      typeMovie(item)&&Number(item.rating)>=6.6&&Number(item.voteCount)>=125);
    shelves.recommended=take('recommended',['recommended','top','popular','trending'],typeMovie);
    shelves.trending=take('trending',['trending','day','popular','series'],available);
    shelves.popular=take('popular',['popular','recommended','trending'],typeMovie);
    shelves.series=take('series',['series','trending','day'],item=>available(item)&&item.type==='tv');
    shelves.now=take('now',['now','popular','trending'],typeMovie);
    shelves.airing=take('airing',['airing','series'],item=>available(item)&&item.type==='tv');
    shelves.upcoming=take('upcoming',['upcoming'],item=>Boolean(item.date&&item.date>today)&&item.type==='movie');
    // Short source categories should not forcibly fill from unrelated media.
    return {hero,shelves,used:[...used],candidateCount:all.size};
  }
  return Object.freeze({select,prune,id,hash,DAY});
});
