'use strict';
(() => {
  const CACHE_MS=5*60*1000;
  let cachedAt=0,cachedItems=[],loading=null;
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const image=path=>/^\/[A-Za-z\d_.-]+$/.test(path||'')?`https://image.tmdb.org/t/p/w500${path}`:'';
  const clean=raw=>{
    const type=raw?.media_type;
    if(!['movie','tv'].includes(type)||raw?.adult||!Number.isSafeInteger(Number(raw.id))||Number(raw.id)<1)return null;
    return {
      id:Number(raw.id),type,
      title:raw.title||raw.name||'Untitled',
      overview:raw.overview||'',
      poster:image(raw.poster_path),
      backdrop:/^\/[A-Za-z\d_.-]+$/.test(raw.backdrop_path||'')?`https://image.tmdb.org/t/p/w1280${raw.backdrop_path}`:'',
      date:raw.release_date||raw.first_air_date||'',
      rating:Number(raw.vote_average)||0
    };
  };
  async function loadTop10(){
    if(cachedItems.length&&Date.now()-cachedAt<CACHE_MS)return cachedItems;
    if(loading)return loading;
    loading=window.zero.api('/trending/all/day').then(data=>{
      cachedItems=(data?.results||[]).map(clean).filter(Boolean).slice(0,10);
      cachedAt=Date.now();
      return cachedItems;
    }).catch(()=>[]).finally(()=>{loading=null;});
    return loading;
  }
  function regionLabel(){
    try{return JSON.parse(localStorage.getItem('zerostreams-web-v1')||'{}')?.settings?.region||'PH';}catch{return 'PH';}
  }
  async function render(){
    const content=document.querySelector('#content');
    const hero=document.querySelector('#hero');
    if(!content||!hero||document.documentElement.dataset.section!=='Home'||document.querySelector('.zero-web-top10'))return;
    const items=await loadTop10();
    if(!items.length||!hero.isConnected||document.documentElement.dataset.section!=='Home'||document.querySelector('.zero-web-top10'))return;
    const section=document.createElement('section');
    section.className='row-section zero-web-top10';
    const label=regionLabel()==='PH'?'TOP 10 TODAY IN PHILIPPINES':'TOP 10 TODAY';
    section.innerHTML=`<div class="section-head"><h3>${label}</h3><small>Trending now</small></div><div class="zero-web-top10-track">${items.map((item,index)=>`<button class="zero-web-top10-card" type="button" data-top10-index="${index}" aria-label="Watch ${esc(item.title)}">${item.poster?`<img loading="lazy" decoding="async" src="${esc(item.poster)}" alt="${esc(item.title)}">`:'<span class="poster-empty">Z</span>'}<span class="top10-rank">${index+1}</span><span class="top10-title">${esc(item.title)}</span></button>`).join('')}</div>`;
    section.addEventListener('click',async event=>{
      const button=event.target.closest('[data-top10-index]');
      if(!button)return;
      const item=items[Number(button.dataset.top10Index)];
      if(!item)return;
      button.disabled=true;
      try{await window.zero.play(item);}catch(error){console.warn('Top 10 playback failed',error);}finally{button.disabled=false;}
    });
    hero.insertAdjacentElement('afterend',section);
  }
  const observer=new MutationObserver(()=>queueMicrotask(render));
  observer.observe(document.documentElement,{subtree:true,childList:true});
  window.addEventListener('DOMContentLoaded',render,{once:true});
  render();
})();
