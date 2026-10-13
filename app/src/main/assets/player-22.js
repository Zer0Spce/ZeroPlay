(() => {
  if (window.__zeroPlayer22) return;
  window.__zeroPlayer22 = true;
  function roots(){const out=[document],queue=[document];for(let i=0;i<queue.length&&i<64;i++){let root=queue[i];try{root.querySelectorAll('*').forEach(node=>{if(node.shadowRoot&&!out.includes(node.shadowRoot)){out.push(node.shadowRoot);queue.push(node.shadowRoot);}});}catch(_){}}return out;}
  function videos(){const out=[];for(const root of roots())try{out.push(...root.querySelectorAll('video'));}catch(_){}return out.filter(v=>v&&Number.isFinite(v.duration||0));}
  function primary(){return videos().sort((a,b)=>(b.clientWidth*b.clientHeight)-(a.clientWidth*a.clientHeight))[0]||null;}
  window.__zeroSeekBy=seconds=>{const video=primary();if(!video)return false;try{video.currentTime=Math.max(0,Math.min(Number.isFinite(video.duration)?video.duration:1e12,(video.currentTime||0)+Number(seconds||0)));return true;}catch(_){return false;}};
  window.__zeroTogglePlayback=()=>{const video=primary();if(!video)return false;try{if(video.paused)video.play();else video.pause();return true;}catch(_){return false;}};
  window.__zeroPlayerDiagnostics=()=>{const video=primary();return {href:location.href,video:!!video,paused:video?video.paused:null,currentTime:video?video.currentTime:null,duration:video?video.duration:null,readyState:video?video.readyState:null,width:video?video.videoWidth:null,height:video?video.videoHeight:null,controls:typeof window.__zeroTvCanFocus==='function'?window.__zeroTvCanFocus():null};};
  window.__zeroTvCanFocus=window.__zeroTvCanFocus||(()=>{try{return document.querySelectorAll('button,a,[role="button"],[tabindex]:not([tabindex="-1"])').length>1;}catch(_){return false;}});
})();
