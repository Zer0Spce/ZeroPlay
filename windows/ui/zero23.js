'use strict';
(() => {
  if(window.__zero23Compat)return;
  window.__zero23Compat=true;
  const VERSION='2.3-test';
  const originalApi=window.zero?.api?.bind(window.zero);
  if(!originalApi)return;

  // Keep ZeroPlay 2.2.2's catalog allowlist frozen. Only translate new 2.3-only
  // recommendation/health requests into routes that the existing bridge already permits.
  window.zero.api=async(route,params={})=>{
    const match=/^\/(movie|tv)\/(\d+)\/recommendations$/.exec(String(route||''));
    if(match){
      const type=match[1],id=match[2];
      const detail=await originalApi(`/${type}/${id}`,{});
      const genres=Array.isArray(detail?.genres)?detail.genres.map(row=>Number(row?.id)).filter(Number.isFinite).slice(0,2):[];
      if(!genres.length)return {results:[]};
      return originalApi(`/discover/${type}`,{with_genres:genres.join(','),sort_by:'popularity.desc','vote_count.gte':50});
    }
    if(route==='/configuration')return originalApi('/movie/popular',{page:1});
    return originalApi(route,params);
  };

  const core=document.createElement('script');
  const anchor=document.currentScript?.src||location.href;
  core.src=new URL('zero23-core.js',anchor).href+(anchor.includes('?')?'&':'?')+'v=20261016b';
  core.dataset.zero23Core=VERSION;
  document.body.appendChild(core);
})();
