/* VidRift inactivity guard: never hide playback video, dialogs or controls while paused. */
(function(){
 'use strict';
 if(location.hostname!=='embed.vidrift.net'||window.__zeroVidriftIdle227)return;
 window.__zeroVidriftIdle227=true;
 const IDLE_MS=3200;
 let lastActivity=Date.now();
 const selectors=[
  '.plyr__controls','.jw-controls','.vjs-control-bar',
  '.video-js .vjs-control-bar','.art-controls','.dplayer-controller',
  '.media-control','.player-controls','[data-testid="player-controls"]',
  '[class*="Player_controls"]','[class*="player-controls"]'
 ];
 function eligible(node){
  if(!node||!node.isConnected||node.closest('[role="dialog"],[aria-modal="true"],[role="menu"]'))return false;
  const video=document.querySelector('video');
  if(!video||video.paused||video.ended||document.querySelector('[aria-expanded="true"]'))return false;
  return true;
 }
 function tick(){
  const idle=Date.now()-lastActivity>=IDLE_MS;
  for(const selector of selectors)for(const node of document.querySelectorAll(selector)){
   if(idle&&eligible(node)){
    if(node.dataset.zeroVidriftIdle!=='1'){
     node.dataset.zeroVidriftIdle='1';
     node.style.setProperty('opacity','0','important');
     node.style.setProperty('pointer-events','none','important');
    }
   }else if(node.dataset.zeroVidriftIdle==='1'){
    delete node.dataset.zeroVidriftIdle;
    node.style.removeProperty('opacity');node.style.removeProperty('pointer-events');
   }
  }
 }
 function wake(event){
  if(event&&event.isTrusted===false)return;
  lastActivity=Date.now();tick();
 }
 for(const event of ['pointermove','pointerdown','touchstart','keydown','focusin'])document.addEventListener(event,wake,{capture:true,passive:true});
 document.addEventListener('play',wake,true);
 document.addEventListener('pause',wake,true);
 document.addEventListener('visibilitychange',wake);
 setInterval(tick,500);tick();
})();
