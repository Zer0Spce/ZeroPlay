'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const file=rel=>path.join(root,rel);

function patch(rel,fn){
  const target=file(rel),before=fs.readFileSync(target,'utf8'),after=fn(before);
  if(after===before)throw new Error('2.2.4.1 patch made no change: '+rel);
  fs.writeFileSync(target,after);
  console.log('Patched',rel);
}

patch('app/build.gradle',text=>{
  if(!text.includes('versionCode 49')||!text.includes("versionName '2.2.4'"))throw new Error('Expected 2.2.4 Android version markers');
  return text.replace('versionCode 49','versionCode 50').replace("versionName '2.2.4'","versionName '2.2.4.1'");
});

function safeGuard(text,label){
  const start=text.indexOf('  if (Number(window.__zeroGain) > 1) {');
  const end=text.indexOf("  {\n    const bars = '.jw-controlbar",start);
  if(start<0||end<0)throw new Error(label+' audio boost block markers not found');
  const safeBoost=`  if (Number(window.__zeroGain) > 1) {
    const amount = Math.min(10, Math.max(1, Number(window.__zeroGain) || 1));
    const graphs = new WeakMap();
    const pending = new WeakSet();
    let context, activeElement = null, noticeShown = false;
    function unavailable() {
      if (noticeShown || !document.body) return;
      noticeShown = true;
      const note = document.createElement('div');
      note.textContent = 'Audio boost unavailable for this source';
      note.style.cssText = 'position:fixed;bottom:12px;left:12px;z-index:2147483647;background:#202020;color:white;padding:8px;border-radius:4px;font:14px sans-serif;pointer-events:none';
      document.body.appendChild(note);
      setTimeout(() => note.remove(), 4000);
    }
    function score(element) {
      if (!element || element.paused || element.ended || !element.currentSrc || element.muted || Number(element.volume) <= 0 || element.readyState < 2) return -1;
      let visible = false, area = 0;
      try {
        const rect = element.getBoundingClientRect(), style = getComputedStyle(element);
        visible = rect.width > 2 && rect.height > 2 && style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > 0;
        if (visible) area = Math.min(100000000, rect.width * rect.height);
      } catch (_) {}
      return (visible ? 1000000000 : 0) + (element.tagName === 'VIDEO' ? 1000000 : 0) + area;
    }
    function activeMedia() {
      let best = null, bestScore = -1;
      document.querySelectorAll('video,audio').forEach(element => {
        const value = score(element);
        if (value > bestScore) { best = element; bestScore = value; }
      });
      return best;
    }
    function silencePrevious(next) {
      if (!activeElement || activeElement === next) return;
      const old = graphs.get(activeElement);
      if (old && old.gain) old.gain.gain.value = 0;
      activeElement = null;
    }
    function boost() {
      const element = activeMedia();
      if (!element || pending.has(element)) return;
      silencePrevious(element);
      const existing = graphs.get(element);
      if (existing) {
        activeElement = element;
        existing.gain.gain.value = amount;
        if (context && context.state !== 'running') context.resume().catch(()=>{});
        return;
      }
      let sameOrigin = false;
      try { sameOrigin = new URL(element.currentSrc, location.href).origin === location.origin; } catch (_) {}
      if (!sameOrigin && !element.currentSrc.startsWith('blob:') && !element.crossOrigin) { unavailable(); return; }
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) { unavailable(); return; }
      try {
        context = context || new Audio();
        pending.add(element);
        context.resume().then(() => {
          pending.delete(element);
          if (context.state !== 'running' || graphs.has(element) || element.muted || Number(element.volume) <= 0 || element.paused) return;
          const source = context.createMediaElementSource(element);
          const gain = context.createGain();
          const limiter = context.createDynamicsCompressor();
          gain.gain.value = amount;
          limiter.threshold.value = -8;
          limiter.knee.value = 16;
          limiter.ratio.value = 4;
          limiter.attack.value = 0.012;
          limiter.release.value = 0.25;
          source.connect(gain);
          gain.connect(limiter);
          limiter.connect(context.destination);
          graphs.set(element,{source,gain,limiter});
          silencePrevious(element);
          activeElement = element;
        }).catch(() => { pending.delete(element); unavailable(); });
      } catch (_) { pending.delete(element); unavailable(); }
    }
    document.addEventListener('playing', boost, true);
    document.addEventListener('volumechange', boost, true);
    document.addEventListener('pointerdown', boost);
    document.addEventListener('keydown', boost);
    window.addEventListener('message', event => {
      if (event.source === window.parent && event.data && event.data.type === 'zerostreams-remote-active') boost();
    });
    boost();
  }
`;
  return text.slice(0,start)+safeBoost+text.slice(end);
}

for(const rel of ['app/src/main/assets/player-guard.js','windows/assets/player-guard.js'])patch(rel,text=>safeGuard(text,rel));

patch('windows/package.json',text=>{
  const pkg=JSON.parse(text);
  if(pkg.version!=='2.2.4'||pkg.build?.buildVersion!=='2.2.4')throw new Error('Expected Windows 2.2.4 version markers');
  pkg.version='2.2.4.1';
  pkg.build.buildVersion='2.2.4.1';
  return JSON.stringify(pkg,null,2)+'\n';
});

console.log('ZeroPlay 2.2.4.1 audio hotfix applied.');
