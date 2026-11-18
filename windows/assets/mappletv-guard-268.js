/* MappleTV only: broad ad-overlay removal, exact ad hosts blocked natively. */
(function(){
'use strict';
if((window.__zeroMappleSession!==true && !(location.hostname==='mapple.fun'&&/^\/watch\/(?:movie|tv)\//.test(location.pathname)))||window.__zeroMapple268)return;
window.__zeroMapple268=true;
var last=Date.now(),IDLE_MS=3000,optionNodes=new Set(),pending=false;
function txt(n){return String(n.getAttribute('aria-label')||n.getAttribute('title')||n.textContent||'').trim().replace(/\s+/g,' ').slice(0,110);}
function roots(){var r=[document];for(var i=0;i<r.length&&i<24;i++)try{for(var n of r[i].querySelectorAll('*'))if(n.shadowRoot&&r.length<24)r.push(n.shadowRoot);}catch(_){}return r;}
function nodes(sel){var a=[];for(var root of roots())try{a.push(...root.querySelectorAll(sel));}catch(_){}return a;}
function hasMedia(n){return !!n.querySelector('video,audio');}
function adMarker(n){var s=[n.id,typeof n.className==='string'?n.className:'',n.getAttribute('aria-label')||'',n.getAttribute('data-testid')||''].join(' ');return /(?:^|[\s_-])(?:ad|ads|advert|advertisement|sponsor|sponsored|interstitial|popup|popunder|admodal|adcontainer)(?:$|[\s_-])/i.test(s);}
function adCopy(n){return /watch hit movies and hottest|new releases in full hd|get access\?|unlock.{0,20}(?:movies|stream)|sponsored|advertisement|visit sponsor/i.test(String(n.innerText||n.textContent||'').slice(0,750));}
function adButton(n){return [...n.querySelectorAll('button,[role="button"],a')].some(x=>/^(continue|close|no thanks|skip ad|dismiss|learn more|visit site)$/i.test(txt(x)));}
function adBox(n){
 if(!n.isConnected||n===document.body||n===document.documentElement||hasMedia(n))return false;
 var r=n.getBoundingClientRect();if(r.width<90||r.height<30||r.width>innerWidth*.95||r.height>innerHeight*.90)return false;
 if(n.matches('[data-ad],[data-advertisement],ins.adsbygoogle'))return true;
 if(!adCopy(n)&&!adMarker(n))return false;
 return adButton(n)||n.matches('[role="dialog"],[aria-modal="true"],.ad-overlay,.popup-ad,.interstitial');
}
function hide(n){if(!n.isConnected||hasMedia(n))return;n.dataset.zeroMappleAdHidden='1';n.style.setProperty('display','none','important');}
function ads(){
 if(window.__zeroBlockAds===false)return;
 for(var n of nodes('[data-ad],[data-advertisement],ins.adsbygoogle,[role="dialog"],[aria-modal="true"],.ad-overlay,.popup-ad,.interstitial,div,section')){
  if(!adBox(n)||[...n.children].some(adBox))continue;
  hide(n);
 }
 for(var f of nodes('iframe')){
  var h='';try{h=new URL(f.src,location.href).hostname.toLowerCase();}catch(_){}
  if(!h)continue;
  if(["doubleclick.net","googlesyndication.com","googleadservices.com","adsterra.com","adsterra.org","popads.net","popcash.net","propellerads.com","onclicka.com","onclicksuper.com","exoclick.com","exosrv.com","trafficjunky.net","juicyads.com","hilltopads.net","adnxs.com","adskeeper.com","mgid.com","taboola.com","outbrain.com","revcontent.com","pubmatic.com","rubiconproject.com","openx.net","smartadserver.com","criteo.com","criteo.net","casalemedia.com","contextweb.com","lijit.com","yieldmo.com","sovrn.com","inmobi.com","applovin.com","adsrvr.org","bidr.io","sharethrough.com","media.net","adform.net","popmyads.com"].some(d=>h===d||h.endsWith('.'+d)))hide(f);
 }
}
function watch(){
 var idle=Date.now()-last>=IDLE_MS;
 for(var n of nodes('button,[role="button"],summary,[aria-haspopup]'))if(/^watch options?(?:\s*[⌄▼▾])?$/i.test(txt(n)))optionNodes.add(n);
 for(var n of optionNodes){
  if(!n.isConnected){optionNodes.delete(n);continue;}
  if(idle){
   n.dataset.zeroMappleIdle='1';n.style.setProperty('opacity','0','important');n.style.setProperty('visibility','hidden','important');n.style.setProperty('pointer-events','none','important');
  }else if(n.dataset.zeroMappleIdle==='1'){
   delete n.dataset.zeroMappleIdle;n.style.removeProperty('opacity');n.style.removeProperty('visibility');n.style.removeProperty('pointer-events');
  }
 }
}
function scan(){pending=false;ads();watch();}
function schedule(){if(pending)return;pending=true;setTimeout(scan,150);}
function activity(e){if(e&&!e.isTrusted)return;last=Date.now();schedule();}
for(var type of ['pointermove','pointerdown','touchstart','keydown','focusin'])document.addEventListener(type,activity,{passive:true,capture:true});
new MutationObserver(schedule).observe(document,{subtree:true,childList:true,characterData:true});
document.addEventListener('DOMContentLoaded',scan);setInterval(scan,1000);scan();
})();