/* MappleTV-only ZeroPlay QA ad cleanup. The injected flag is set by
 * BrowserPlayerActivity for MappleTV only, including child player frames.
 * This removes detected advertising creatives; it never clicks their CTAs,
 * removes verified playback, or interferes with CAPTCHA/Cloudflare. */
(function(){
'use strict';
if(!window.__zeroBlockAds || !window.__zeroMappleGuardEnabled || window.__zeroMappleAdGuard28)return;
window.__zeroMappleAdGuard28=true;
const media='video,audio,.jwplayer,.plyr,.vjs-player,[data-player]';
const challenge='iframe[src*="recaptcha"],iframe[src*="hcaptcha"],iframe[src*="challenges.cloudflare.com"],.g-recaptcha,.h-captcha,.cf-turnstile,input[name="cf-turnstile-response"],[role="checkbox"]';
const patterns=[
 /watch hit movies and hottest/i,
 /new releases in full hd/i,
 /get access\??/i,
 /big sale time!/i,
 /great deals at the best prices!/i
];
const adPatterns=/(watch hit movies and hottest|new releases in full hd|big sale time!|great deals at the best prices!)/i;
const allowedPaths=/^\/watch\/(?:movie|tv)\//;
let lastUser=Date.now(),pending=false;
const text=node=>String(node?.innerText||node?.textContent||'').replace(/\s+/g,' ').trim().slice(0,550);
const label=node=>String(node?.getAttribute?.('aria-label')||node?.textContent||'').replace(/\s+/g,' ').trim().slice(0,110);
const visible=node=>{
 try {const s=getComputedStyle(node),r=node.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>80&&r.height>25;}catch(_){return false;}
};
function report(kind){
 try{window.__zeroMappleAdStats=window.__zeroMappleAdStats||{hidden:0};window.__zeroMappleAdStats.hidden++;
     if(window.__zeroAdCleanupStats){window.__zeroAdCleanupStats.hidden++;window.__zeroAdCleanupStats.overlays++;}
     if(window.parent!==window)window.parent.postMessage({type:'zeroplay-ad-cleanup',kind:'overlay'},'*');
 }catch(_){}
}
function hide(node){
 if(!node||node.dataset.zeroMappleAdHidden==='1'||node===document.body||node===document.documentElement)return;
 if(node.matches(media+','+challenge)||node.querySelector(media+','+challenge))return;
 node.dataset.zeroMappleAdHidden='1';
 node.style.setProperty('display','none','important');
 node.style.setProperty('visibility','hidden','important');
 node.style.setProperty('pointer-events','none','important');
 report('overlay');
}
function adCreative(node){
 if(!node||!node.isConnected||!visible(node)||node.matches(media+','+challenge))return false;
 if(node.querySelector(media+','+challenge))return false;
 const txt=text(node);if(!adPatterns.test(txt))return false;
 const buttons=Array.from(node.querySelectorAll('button,a,[role="button"],[tabindex]'));
 return buttons.some(btn=>/^(continue|close|×|x)$/i.test(label(btn))) ||
   buttons.some(btn=>/continue/i.test(label(btn))) || /watch hit movies and hottest/i.test(txt);
}
function findCard(anchor){
 // Work from the visible CTA or a short ad phrase towards the outer ad card.
 // Do not hide the full-screen player or the page body.
 let best=null,child=anchor;
 for(let depth=0;child&&depth<8;child=child.parentElement,depth++){
   if(child===document.body||child===document.documentElement)break;
   if(child.querySelector(media+','+challenge))break;
   if(!adCreative(child))continue;
   const r=child.getBoundingClientRect();
   if(r.width>innerWidth*.82||r.height>innerHeight*.82||r.width<155||r.height<65)continue;
   // Keep the largest qualifying nested card.  It includes the confetti and
   // the actual Continue button, not just a paragraph of ad text.
   best=child;
 }
 return best;
}
function stripAds(){
 const targets=Array.from(document.querySelectorAll('button,a,[role="button"],[tabindex],p,span,h1,h2,h3,div,section,dialog,[role="dialog"]'));
 let removed=0;
 for(const node of targets){
   if(removed>=8)break;
   const own=text(node);
   if(own.length>550||!adPatterns.test(own))continue;
   const card=findCard(node);
   if(card&&card.dataset.zeroMappleAdHidden!=='1'){hide(card);removed++;}
 }
 // Known advertisement badge: select only the associated modal card,
 // not the video frame, spinner, source selection, or controls.
 for(const badge of document.querySelectorAll('[class*="badge"],[class*="label"],span,div')){
   if(removed>=8)break;
   if(label(badge)!=='Ad'||badge.children.length>2)continue;
   let current=badge.parentElement;
   for(let d=0;current&&d<5;current=current.parentElement,d++){
     if(current.querySelector(media+','+challenge))break;
     if(adCreative(current)){const card=findCard(current);if(card&&card.dataset.zeroMappleAdHidden!=='1'){hide(card);removed++;}break;}
   }
 }
}
function guardOptions(){
 if(location.hostname!=='mapple.fun'||!allowedPaths.test(location.pathname))return;
 const idle=Date.now()-lastUser>=3000;
 for(const btn of document.querySelectorAll('button,[role="button"],summary,[aria-haspopup]')){
   if(!/^watch options(?:\s*[⌄▼▾])?$/i.test(label(btn)))continue;
   if(idle){btn.dataset.zeroMappleIdle='1';btn.style.setProperty('opacity','0','important');btn.style.setProperty('visibility','hidden','important');btn.style.setProperty('pointer-events','none','important');}
   else if(btn.dataset.zeroMappleIdle==='1'){delete btn.dataset.zeroMappleIdle;for(const name of ['opacity','visibility','pointer-events'])btn.style.removeProperty(name);}
 }
}
function scan(){pending=false;try{stripAds();guardOptions();}catch(_){/* Keep playback working even if the ad DOM changes. */}}
function schedule(){if(pending)return;pending=true;setTimeout(scan,110);}
for(const evt of ['pointermove','pointerdown','touchstart','keydown','focusin'])document.addEventListener(evt,e=>{if(e&&e.isTrusted===false)return;lastUser=Date.now();schedule();},{passive:true,capture:true});
new MutationObserver(schedule).observe(document,{subtree:true,childList:true,characterData:true});
document.addEventListener('DOMContentLoaded',scan);
setInterval(scan,800);
scan();
})();