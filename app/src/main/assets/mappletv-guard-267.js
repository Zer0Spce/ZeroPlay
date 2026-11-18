/* ZeroPlay MappleTV-only player overlay guard. No changes to other providers. */
(function(){
'use strict';
if(location.hostname!=='mapple.fun'||!/^\/watch\/(?:movie|tv)\//.test(location.pathname)||window.__zeroMappleGuard267)return;
window.__zeroMappleGuard267=true;
var lastUser=Date.now(),IDLE_MS=3000,options=new Set();
function label(node){return String(node.getAttribute('aria-label')||node.textContent||'').trim().replace(/\s+/g,' ').slice(0,110);}
function isWatchOption(node){return /^watch options(?:\s*[⌄▼▾])?$/i.test(label(node));}
function guardOptions(){
var idle=Date.now()-lastUser>=IDLE_MS;
for(var node of document.querySelectorAll('button,[role="button"],summary')){
 if(!isWatchOption(node))continue;
 options.add(node);
}
for(var btn of options){
 if(!btn.isConnected){options.delete(btn);continue;}
 if(!isWatchOption(btn))continue;
 var style=btn.style;
 if(idle){
  if(btn.dataset.zeroMappleIdle!=='1'){
   btn.dataset.zeroMappleIdle='1';style.setProperty('opacity','0','important');style.setProperty('visibility','hidden','important');style.setProperty('pointer-events','none','important');
  }
 }else if(btn.dataset.zeroMappleIdle==='1'){
  delete btn.dataset.zeroMappleIdle;style.removeProperty('opacity');style.removeProperty('visibility');style.removeProperty('pointer-events');
 }
}
}
function adPopup(node){
if(!node||node===document.body||node===document.documentElement||node.querySelector('video'))return false;
var text=(node.innerText||'').replace(/\s+/g,' ').trim().slice(0,600);
var adLanguage=/watch hit movies and hottest|new releases in full hd|watch movies and latest releases/i.test(text);
var hasButtons=Array.from(node.querySelectorAll('button,[role="button"]')).some(n=>/^(continue|close)$/i.test(label(n)));
return adLanguage&&hasButtons; // MappleTV's Ad badge can be outside the modal card.
}
function stripAds(){
if(!window.__zeroBlockAds)return;
for(var n of document.querySelectorAll('[role="dialog"],[aria-modal="true"],div,section')){
 if(!n.isConnected||n.dataset.zeroMappleAdHidden==='1')continue;
 if(!adPopup(n))continue;
 var child=Array.from(n.children).some(adPopup);
 if(child)continue;
 var rect=n.getBoundingClientRect();
 if(rect.width<150||rect.height<60||rect.width>innerWidth*.85||rect.height>innerHeight*.75)continue;
 n.dataset.zeroMappleAdHidden='1';
 n.style.setProperty('display','none','important');
}
}
var pending=false;
function scan(){pending=false;stripAds();guardOptions();}
function schedule(){if(pending)return;pending=true;setTimeout(scan,100);}
function active(ev){if(ev&&ev.isTrusted===false)return;lastUser=Date.now();schedule();}
for(var event of ['pointermove','pointerdown','touchstart','keydown','focusin'])document.addEventListener(event,active,{passive:true,capture:true});
new MutationObserver(schedule).observe(document,{subtree:true,childList:true,characterData:true});
document.addEventListener('DOMContentLoaded',scan);
setInterval(scan,700);
scan();
})();
