/* ZeroPlay v2.2.5.9: Top 10 new movies on eight US streaming-provider catalogs.
 * TMDB watch-provider IDs must be resolved from the US catalog. A streaming
 * listing is informational only; playback/rights are not guaranteed.
 */
((root,factory)=>{
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.ZeroStreamingCarousel=api;
})(typeof globalThis!=='undefined'?globalThis:this,()=>{
  'use strict';
  const SERVICES=Object.freeze(['netflix','hulu','disney','max','apple','paramount','peacock','youtube-tv']);
  function brand(name){
    const value=String(name||'').toLowerCase().trim().replace(/\s+/g,' ');
    if(/^netflix(?:\s|$)/.test(value))return 'netflix';
    if(/^hulu(?:\s|$)/.test(value))return 'hulu';
    if(value==='disney plus'||value==='disney+')return 'disney';
    if(value==='hbo max'||value==='max')return 'max';
    // Apple TV Store offers rentals and purchases; it is not Apple TV+.
    if(value==='apple tv+'||value==='apple tv plus')return 'apple';
    if(value==='paramount+'||value==='paramount plus')return 'paramount';
    if(value==='peacock'||value==='peacock premium')return 'peacock';
    if(value==='youtube tv')return 'youtube-tv';
    return null;
  }
  function providers(rows){
    const matched=new Map();
    for(const p of Array.isArray(rows)?rows:[]){
      const service=brand(p?.provider_name),number=Number(p?.provider_id);
      if(!service||!Number.isSafeInteger(number)||number<=0)continue;
      if(p.display_priorities&&typeof p.display_priorities==='object'&&!Object.hasOwn(p.display_priorities,'US'))continue;
      const label=String(p.provider_name).toLowerCase().trim();
      const score=label===({netflix:'netflix',hulu:'hulu',disney:'disney+',max:'hbo max',apple:'apple tv+',paramount:'paramount+',peacock:'peacock', 'youtube-tv':'youtube tv'})[service]?10:1;
      if(!matched.has(service)||matched.get(service).score<score)matched.set(service,{id:number,score});
    }
    return SERVICES.map(id=>({brand:id,provider_id:matched.get(id)?.id||0})).filter(p=>p.provider_id>0);
  }
  function hash(value){let h=2166136261;for(const c of String(value)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
  function topTen(items,seed,today=new Date().toISOString().slice(0,10)){
    const candidates=new Map();
    const cutoff=new Date(Date.parse(today+'T12:00:00Z')-420*86400000).toISOString().slice(0,10);
    for(const x of items||[]){
      if(!x||x.type!=='movie'||!Number.isSafeInteger(Number(x.id))||Number(x.id)<=0)continue;
      if(!x.backdrop||!x.date||x.date>today||x.date<cutoff)continue;
      if(Number(x.voteCount||0)<10||Number(x.popularity||0)<2)continue;
      const previous=candidates.get(x.id);
      if(!previous||Number(x.popularity)>Number(previous.popularity))candidates.set(x.id,x);
    }
    const values=[...candidates.values()];
    values.sort((a,b)=>{
      const score=x=>{
        const recency=Math.max(0,(Date.parse(x.date+'T00:00:00Z')-Date.parse(cutoff+'T00:00:00Z'))/86400000/420);
        const popularity=Math.min(1,Math.log1p(Math.max(0,Number(x.popularity)))/7);
        const confidence=Math.min(1,Math.log1p(Math.max(0,Number(x.voteCount)))/7);
        const noise=hash(seed+':'+x.id)/4294967295;
        return recency*.30+popularity*.28+confidence*.12+noise*.30;
      };
      return score(b)-score(a);
    });
    return values.slice(0,10);
  }
  return Object.freeze({SERVICES,brand,providers,topTen});
});
