'use strict';
(() => {
  if(window.__zeroPlayHeroTrailer)return;
  window.__zeroPlayHeroTrailer=true;

  const TRAILER_MS=28000;
  const ART_MS=9000;
  let sequence=0;
  let currentFrame=null;
  let muted=true;
  const trailerCache=new Map();

  function reducedMotion(){return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;}
  function performanceMode(){
    try{return Boolean(JSON.parse(localStorage.getItem('zeroplay-web-22-ui')||'{}').performanceMode);}catch{return false;}
  }
  function saveData(){return Boolean(navigator.connection?.saveData);}

  function heroPicks(){
    try{return (homeData?.trending||[]).filter(item=>item.backdrop).slice(0,6);}catch{return [];}
  }

  function activeHeroItem(){
    const picks=heroPicks();
    if(!picks.length)return null;
    const index=((Number(heroIndex)||0)%picks.length+picks.length)%picks.length;
    return picks[index];
  }

  function setCarouselTimer(ms){
    try{
      clearInterval(heroTimer);
      if(performanceMode())return;
      heroTimer=setInterval(()=>{
        if(category==='Home'&&!heroPaused&&!document.hidden&&!$('#detail')?.open&&$('#hero')?.getBoundingClientRect().bottom>100){
          heroIndex++;
          renderHero();
        }
      },ms);
    }catch{}
  }

  function trailerKey(data){
    const videos=Array.isArray(data?.videos?.results)?data.videos.results:Array.isArray(data?.results)?data.results:[];
    return videos
      .filter(video=>video?.site==='YouTube'&&/^[A-Za-z\d_-]{6,20}$/.test(video.key||'')&&['Trailer','Teaser'].includes(video.type))
      .sort((a,b)=>Number(b.official)-Number(a.official)||Number(b.type==='Trailer')-Number(a.type==='Trailer'))[0]?.key||'';
  }

  async function fetchTrailer(item){
    const cacheKey=`${item.type}:${item.id}`;
    if(trailerCache.has(cacheKey))return trailerCache.get(cacheKey);
    try{
      const data=await api(`/${item.type}/${item.id}`,{append_to_response:'videos'});
      const key=trailerKey(data);
      trailerCache.set(cacheKey,key);
      return key;
    }catch{
      trailerCache.set(cacheKey,'');
      return '';
    }
  }

  function youtubeUrl(key){
    const origin=encodeURIComponent(location.origin);
    return `https://www.youtube-nocookie.com/embed/${key}?autoplay=1&mute=1&controls=0&loop=1&playlist=${key}&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&enablejsapi=1&origin=${origin}`;
  }

  function command(func,args=[]){
    if(!currentFrame?.contentWindow)return;
    currentFrame.contentWindow.postMessage(JSON.stringify({event:'command',func,args}),'https://www.youtube-nocookie.com');
  }

  function removeTrailer(){
    const hero=document.querySelector('#hero');
    if(hero){hero.classList.remove('trailer-ready');hero.querySelector('.hero-trailer')?.remove();hero.querySelector('.hero-audio')?.remove();hero.querySelector('.hero-trailer-badge')?.remove();}
    currentFrame=null;
    muted=true;
  }

  async function loadHeroTrailer(){
    const hero=document.querySelector('#hero');
    const item=activeHeroItem();
    const token=++sequence;
    removeTrailer();
    if(!hero||!item||document.hidden||reducedMotion()||performanceMode()||saveData()){
      setCarouselTimer(ART_MS);
      return;
    }

    const key=await fetchTrailer(item);
    if(token!==sequence||document.querySelector('#hero')!==hero)return;
    if(!key){setCarouselTimer(ART_MS);return;}

    const layer=document.createElement('div');
    layer.className='hero-trailer';
    layer.setAttribute('aria-hidden','true');
    const frame=document.createElement('iframe');
    frame.title=`${item.title} trailer`;
    frame.allow='autoplay; encrypted-media; picture-in-picture';
    frame.referrerPolicy='strict-origin-when-cross-origin';
    frame.tabIndex=-1;
    frame.src=youtubeUrl(key);
    layer.appendChild(frame);

    const badge=document.createElement('span');
    badge.className='hero-trailer-badge';
    badge.textContent='TRAILER';

    const audio=document.createElement('button');
    audio.type='button';
    audio.className='hero-audio';
    audio.dataset.heroAudio='1';
    audio.setAttribute('aria-label','Turn trailer sound on');
    audio.title='Trailer sound';
    audio.textContent='🔇';

    const art=hero.querySelector('.hero-art');
    if(art)art.insertAdjacentElement('afterend',layer);else hero.prepend(layer);
    hero.appendChild(badge);
    hero.appendChild(audio);
    currentFrame=frame;
    muted=true;

    frame.addEventListener('load',()=>{
      if(token!==sequence||currentFrame!==frame)return;
      window.setTimeout(()=>{if(token===sequence&&currentFrame===frame)hero.classList.add('trailer-ready');},450);
    },{once:true});

    setCarouselTimer(TRAILER_MS);
  }

  const baseBindHero=typeof bindHero==='function'?bindHero:null;
  if(baseBindHero){
    bindHero=function(){
      baseBindHero();
      window.setTimeout(loadHeroTrailer,120);
    };
  }

  const baseRenderHome=typeof renderHome==='function'?renderHome:null;
  if(baseRenderHome){
    renderHome=async function(...args){
      const result=await baseRenderHome(...args);
      window.setTimeout(loadHeroTrailer,160);
      return result;
    };
  }

  document.addEventListener('click',event=>{
    const button=event.target.closest?.('[data-hero-audio]');
    if(!button)return;
    event.preventDefault();
    event.stopPropagation();
    muted=!muted;
    if(muted){command('mute');button.textContent='🔇';button.setAttribute('aria-label','Turn trailer sound on');}
    else{command('unMute');command('setVolume',[65]);command('playVideo');button.textContent='🔊';button.setAttribute('aria-label','Mute trailer');}
  },true);

  document.addEventListener('visibilitychange',()=>{
    if(!currentFrame)return;
    command(document.hidden?'pauseVideo':'playVideo');
  });

  window.setTimeout(loadHeroTrailer,700);
})();
