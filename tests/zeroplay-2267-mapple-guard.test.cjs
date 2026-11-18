'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
test('MappleTV-only guard activates solely for exact mapple.fun watch routes',()=>{
 for(const p of ['app/src/main/assets/mappletv-guard-267.js','windows/assets/mappletv-guard-267.js']){
  const s=read(p);assert.match(s,/location.hostname!=='mapple.fun'/);assert.match(s,/watch/);
  assert.match(s,/Watch options/i);assert.match(s,/IDLE_MS=3000/);
  assert.match(s,/MutationObserver/);assert.match(s,/__zeroBlockAds/);
  assert.match(s,/new releases in full hd/);assert.match(s,/hasButtons&&hasBadge/);
 }
});
test('Guard is loaded for Android and Windows player content only',()=>{
 assert.match(read('app/src/main/java/com/zerostreams/app/BrowserPlayerActivity.java'),/mappletv-guard-267.js/);
 assert.match(read('windows/main.cjs'),/mappletv-guard-267.js/);
 assert.doesNotMatch(read('windows/playback-sources.cjs'),/mappletv-guard-267/);
});
