(() => {
  if (window.__zeroPlayer22) return;
  window.__zeroPlayer22 = true;
  function roots(){const out=[document],queue=[document];for(let i=0;i<queue.length&&i<64;i++){const root=queue[i];try{root.querySelectorAll('*').forEach(node=>{if(node.shadowRoot&&!out.includes(node.shadowRoot)){out.push(node.shadowRoot);queue.push(node.shadowRoot);}});}catch(_){}}return out;}
  function videos(){const out=[];for(const root of roots())try{out.push(...root.querySelectorAll('video'));}catch(_){}return out;}
  function primary(){return videos().sort((a,b)=>(b.clientWidth*b.clientHeight)-(a.clientWidth*a.clientHeight))[0]||null;}
  window.__zeroSeekBy=seconds=>{const v=primary();if(!v)return false;try{v.currentTime=Math.max(0,Math.min(Number.isFinite(v.duration)?v.duration:1e12,(v.currentTime||0)+Number(seconds||0)));return true;}catch(_){return false;}};
  window.__zeroTogglePlayback=()=>{const v=primary();if(!v)return false;try{if(v.paused)v.play();else v.pause();return true;}catch(_){return false;}};
  window.__zeroToggleMute=()=>{const v=primary();if(!v)return false;try{v.muted=!v.muted;return v.muted;}catch(_){return false;}};
  window.__zeroPlayerDiagnostics=()=>{const v=primary();return {url:location.href,hasVideo:!!v,paused:v?v.paused:null,muted:v?v.muted:null,currentTime:v?v.currentTime:null,duration:v?v.duration:null,readyState:v?v.readyState:null,resolution:v&&v.videoWidth?`${v.videoWidth}×${v.videoHeight}`:'unknown',droppedFrames:v?.getVideoPlaybackQuality?.().droppedVideoFrames??null,totalFrames:v?.getVideoPlaybackQuality?.().totalVideoFrames??null};};
})();
