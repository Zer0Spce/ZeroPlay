/* ZeroPlay Discovery 2.0 — pure, deterministic curation.
 * Live TMDB candidates; no availability promises. Source previews and genre keys
 * are per user profile, and the fallback intentionally allows re-use only when
 * the catalog cannot fill a rail with fresh candidates.
 */
((root,factory)=>{
  const engine=factory();
  if(typeof module==='object'&&module.exports)module.exports=engine;
  else root.ZeroFreshRecommendations=engine;
})(typeof globalThis!=='undefined'?globalThis:this,()=>{
  'use strict';
  const DAY=86400000, SUPPRESSION_DAYS=30;
  const id=item=>item.type+':'+item.id;
  const unique=items=>[...new Map(items.filter(Boolean).map(x=>[id(x),x])).values()];
  function hash(value){
    let h=2166136261;for(const ch of String(value)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;
  }
  function prune(seen,now=Date.now()){
    return Object.fromEntries(Object.entries(seen||{}).filter(([key,time])=>
      /^(movie|tv):[1-9]\d*$/.test(key) && Number(time)>now-45*DAY && Number(time)<=now+DAY)
      .slice(-1800));
  }
  function continueWatching(positions={}) {
    const found=new Map();
    for(const record of Object.values(positions||{})){
      if(!record || !['movie','tv'].includes(record.type) ||
        !Number.isSafeInteger(Number(record.id)) || Number(record.id)<1)continue;
      const percent=Number(record.percent),timestamp=Number(record.timestamp);
      if(!Number.isFinite(percent)||percent<=1||percent>=95||timestamp<=0)continue;
      if(!(record.poster||record.backdrop))continue;
      const key=id(record),old=found.get(key);
      if(!old||Number(record.at||0)>Number(old.at||0))found.set(key,record);
    }
    return [...found.values()].sort((a,b)=>Number(b.at||0)-Number(a.at||0)).slice(0,20);
  }
  function quality(x){ // Bayesian rating smoothing prevents low-vote 10.0 titles dominating.
    const votes=Math.max(0,Number(x.voteCount)||0),rating=Math.max(0,Math.min(10,Number(x.rating)||0));
    return (votes*rating+450*6.4)/(votes+450);
  }
  function select({pools={},now=Date.now(),seed='default',seen={},positions={},history=[],
    favorites=[],notInterested=[],carouselSource='top',perShelf=18}={}){
    const used=new Set(),ignored=new Set(notInterested),watched=new Set(Object.keys(positions||{}));
    const saved=new Set((favorites||[]).filter(x=>x?.id&&x.type).map(id));
    const streamingAllowed=new Set((pools.streaming||[]).filter(x=>x?.id&&x.type).map(id));
    const all=new Map(),today=new Date(now).toISOString().slice(0,10);
    for(const source of Object.values(pools))for(const item of Array.isArray(source)?source:[]){
      if(!item||!['movie','tv'].includes(item.type)||!Number.isSafeInteger(Number(item.id))||
        Number(item.id)<=0||(!item.poster&&!item.backdrop))continue;
      if(item.type==='movie'&&(item.originalLanguage&&item.originalLanguage!=='en'||
          Array.isArray(item.originCountry)&&item.originCountry.length>0&&!item.originCountry.includes('US')))continue;
      const key=id(item);
      if(ignored.has(key)||((watched.has(key)||saved.has(key))&&!streamingAllowed.has(key)))continue;
      if(!all.has(key))all.set(key,item);
    }
    const genreWeights=new Map();
    const watchedTitles=(history||[]).filter(x=>x?.genreIds?.length).slice(0,30);
    watchedTitles.forEach((item,i)=>(item.genreIds||[]).forEach(genre=>
      genreWeights.set(genre,(genreWeights.get(genre)||0)+Math.max(.15,1-i/40))));
    const favoritesWithGenres=(favorites||[]).filter(x=>x?.genreIds?.length).slice(0,15);
    favoritesWithGenres.forEach(x=>x.genreIds.forEach(g=>genreWeights.set(g,(genreWeights.get(g)||0)+.8)));
    const liked=new Set([...genreWeights.keys()]);
    const recentCutoff=now-SUPPRESSION_DAYS*DAY;
    const released=x=>!x.date||x.date<=today;
    const threeYears=new Date(now-3*365*DAY).toISOString().slice(0,10);
    const sixMonths=new Date(now-180*DAY).toISOString().slice(0,10);
    const movie=x=>x.type==='movie'&&released(x)&&Boolean(x.date)&&x.date>=threeYears;
    const tv=x=>x.type==='tv'&&released(x);
    const recentMedia=x=>x.type==='movie'?movie(x):tv(x);
    const enough=x=>quality(x)>=6.25&&(Number(x.voteCount)||0)>=70;
    const strong=x=>recentMedia(x)&&Boolean(x.backdrop)&&Number(x.voteCount)>=
      (x.type==='movie'?250:150)&&quality(x)>=6.6&&(Number(x.popularity)||0)>=8;
    function pool(names,rule=()=>true){
      const entries=new Map();
      for(const name of names)for(const row of pools[name]||[]){
        if(!row)continue;
        const k=id(row),item=all.get(k);
        if(item&&!used.has(k)&&!entries.has(k)&&rule(item))entries.set(k,item);
      }
      return [...entries.values()];
    }
    function rank(item,label){
      const random=hash(seed+':'+label+':'+id(item))/4294967295;
      const voteConfidence=Math.min(1,Math.log1p(Math.max(0,Number(item.voteCount)||0))/9);
      const fit=Math.min(3,(item.genreIds||[]).reduce((a,g)=>a+(genreWeights.get(g)||0),0));
      return random*.65+quality(item)*.115+voteConfidence*.13+Math.min(1,(item.popularity||0)/150)*.08+fit*.065;
    }
    function take(label,names,rule=()=>true,count=perShelf,diverse=true){
      const entries=pool(names,rule);
      entries.sort((a,b)=>rank(b,label)-rank(a,label));
      const unseen=entries.filter(x=>!(Number(seen[id(x)])>=recentCutoff));
      const old=entries.filter(x=>Number(seen[id(x)])>=recentCutoff);
      const chosen=[],genres=new Map();
      function fill(items,diversity=true){
        for(const item of items){
          if(chosen.length>=count)break;
          if(chosen.some(x=>id(x)===id(item)))continue;
          const dominant=(item.genreIds||[])[0];
          if(diversity&&dominant&&Number(genres.get(dominant)||0)>=Math.max(2,Math.ceil(count/3)))continue;
          chosen.push(item);if(dominant)genres.set(dominant,(genres.get(dominant)||0)+1);
        }
      }
      fill(unseen,diverse);
      fill(unseen,false);
      if(chosen.length<count){fill(old,diverse);fill(old,false);}
      for(const x of chosen)used.add(id(x));
      return chosen;
    }
    const heroSources=carouselSource==='streaming'?['streaming']:
      carouselSource==='recommended'?['recommended','top','trending','popular','day']:
      carouselSource==='popular'?['popular','trending','day','recommended']:
      carouselSource==='now'?['now','day','trending','popular']:
      ['day','trending','popular','recommended','series','now'];
    let hero=[];
    if(!['watchlist','continue'].includes(carouselSource)){
      hero=carouselSource==='streaming'?take('hero:streaming',heroSources,x=>x.type==='movie'&&Boolean(x.backdrop)&&released(x),10,false):take('hero:'+carouselSource,heroSources,strong,6,true);
      if(!hero.length&&carouselSource!=='streaming')hero=take('hero-fallback',heroSources,x=>recentMedia(x)&&Boolean(x.backdrop)&&enough(x),6,true);
    }
    const shelves={};
    // Digital type-4 release date supplied by TMDB's region-aware discover endpoint.
    // Do not silently substitute theatrical or generic popularity lists.
    shelves.vod=take('vod',['vod'],x=>x.type==='movie'&&released(x)&&
      Boolean(x.date)&&x.date>=sixMonths&&(!x.originalLanguage||x.originalLanguage==='en')&&
      Number(x.voteCount)>=10,18,true);
    shelves.because=liked.size?
      take('because',['similar','trending','recommended','popular','series','top'],
        x=>recentMedia(x)&&enough(x)&&(x.genreIds||[]).some(g=>liked.has(g))):[];
    shelves.hidden=take('hidden',['gems','classics','top','popular'],x=>movie(x)&&
      quality(x)>=6.8&&Number(x.voteCount)>=180&&Number(x.popularity)<300);
    shelves.tonight=take('tonight',['recommended','top','trending','popular','gems'],
      x=>movie(x)&&enough(x));
    shelves.recommended=take('recommended',['recommended','popular','top','trending','gems'],
      x=>movie(x)&&enough(x));
    shelves.trending=take('trending',['day','trending','series','popular'],x=>recentMedia(x)&&enough(x));
    shelves.popular=take('popular',['popular','trending','top'],x=>movie(x)&&enough(x));
    shelves.series=take('series',['series','trending','day'],x=>tv(x)&&enough(x));
    shelves.now=take('now',['now','day','popular'],x=>movie(x)&&enough(x));
    shelves.airing=take('airing',['airing','series'],x=>tv(x)&&enough(x));
    shelves.upcoming=take('upcoming',['upcoming'],x=>x.type==='movie'&&Boolean(x.date)&&x.date>today);
    shelves.thrillers=take('thrillers',['thrillers','top','gems','recommended'],x=>movie(x)&&
      (x.genreIds||[]).includes(53)&&quality(x)>=7&&Number(x.voteCount)>=180);
    const lastYear=new Date(now-365*DAY).toISOString().slice(0,10);
    shelves.recent=take('recent',['now','day','popular','new'],x=>movie(x)&&
      Boolean(x.date)&&x.date>=lastYear&&enough(x));
    const favoriteGenres=new Set([...liked]);
    shelves.different=take('different',['streaming','gems','day','trending','popular'],x=>recentMedia(x)&&
      enough(x)&&(!favoriteGenres.size||!(x.genreIds||[]).some(g=>favoriteGenres.has(g))));
    // A short modern-classics window, not old films from the 1970s/1980s.
    shelves.classics=take('classics',['classics'],x=>x.type==='movie'&&released(x)&&
      Number((x.date||'').slice(0,4))>=new Date(now).getFullYear()-12&&
      Number((x.date||'').slice(0,4))<=new Date(now).getFullYear()-5&&enough(x));
    return {hero,shelves,candidateCount:all.size,used:[...used],seed};
  }
  function rotatingPanels(order,seed,custom=false){
    if(custom)return [...order];
    const preferred=['featured','continue','upnext','watchlist','top10'];
    const dynamic=['because','tonight','hidden','recommended','thrillers','recent','different','classics',
      'trending','popular','series','now','airing'];
    const others=order.filter(x=>!preferred.includes(x)&&!dynamic.includes(x));
    const stable=preferred.filter(x=>order.includes(x));
    const rotating=dynamic.filter(x=>order.includes(x)).sort((a,b)=>hash(seed+':'+a)-hash(seed+':'+b));
    return [...stable,...rotating,...others];
  }
  return Object.freeze({select,prune,id,quality,continueWatching,rotatingPanels,DAY,SUPPRESSION_DAYS});
});
