'use strict';
(() => {
  if(window.__zero23Compat)return;
  window.__zero23Compat=true;
  const VERSION='2.3-test';
  const STORAGE='zeroplay-zero23-v1';
  const originalApi=window.zero?.api?.bind(window.zero);
  const stateFn=window.zero?.state?.bind(window.zero);
  if(!originalApi)return;

  function readStore(){
    try{return JSON.parse(localStorage.getItem(STORAGE)||'{}')||{};}catch{return {};}
  }
  function writeCompat(key,data,name){
    try{
      const store=readStore();
      store.cache=store.cache&&typeof store.cache==='object'?store.cache:{};
      store.offline=store.offline&&typeof store.offline==='object'?store.offline:{};
      store.cache[key]={data,until:Date.now()+300000};
      store.offline[key]={data,at:Date.now(),name};
      localStorage.setItem(STORAGE,JSON.stringify(store));
    }catch{}
  }
  async function prewarmCompat(){
    // Keep the 2.2.2 catalog bridge immutable. New 2.3 recommendation data is
    // translated through routes the existing allowlist already accepts, then
    // stored under the 2.3 cache key before the enhancement core reads it.
    try{
      const state=stateFn?await stateFn():{};
      const positions=Object.values(state?.positions||{}).filter(x=>x&&x.id).sort((a,b)=>(b.at||0)-(a.at||0));
      const recent=positions[0];
      if(recent){
        const type=recent.type==='tv'||recent.type==='series'?'tv':'movie';
        const id=String(recent.id).replace(/^tmdb-(?:movie|series)-/,'');
        if(/^\d+$/.test(id)){
          const route=`/${type}/${id}/recommendations`,cacheKey=route+'|{}';
          const store=readStore(),hit=store?.cache?.[cacheKey];
          if(!(hit&&Number(hit.until)>Date.now())){
            const detail=await originalApi(`/${type}/${id}`,{});
            const genres=Array.isArray(detail?.genres)?detail.genres.map(row=>Number(row?.id)).filter(Number.isFinite).slice(0,2):[];
            const data=genres.length?await originalApi(`/discover/${type}`,{with_genres:genres.join(','),sort_by:'popularity.desc','vote_count.gte':50}):{results:[]};
            writeCompat(cacheKey,data,'Because You Watched');
          }
        }
      }
    }catch{}
    try{
      const healthKey='/configuration|{}',store=readStore(),hit=store?.cache?.[healthKey];
      if(!(hit&&Number(hit.until)>Date.now()))writeCompat(healthKey,await originalApi('/movie/popular',{page:1}),'Diagnostics health');
    }catch{}
  }

  async function start(){
    await prewarmCompat();
    const core=document.createElement('script');
    const anchor=document.currentScript?.src||location.href;
    core.src=new URL('zero23-core.js',anchor).href+(anchor.includes('?')?'&':'?')+'v=20261016c';
    core.dataset.zero23Core=VERSION;
    document.body.appendChild(core);
    window.setInterval(prewarmCompat,5000);
  }
  start();
})();
