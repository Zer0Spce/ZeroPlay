'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
test('Windows preserves original MappleTV 2.2.6.7-only guard behavior',()=>{
 const s=read('windows/assets/mappletv-guard-267.js');
 assert.match(s,/location.hostname!=='mapple.fun'/);
 assert.match(s,/watch/);
 assert.match(s,/Watch options/i);
 assert.match(s,/IDLE_MS=3000/);
 assert.match(s,/MutationObserver/);
 assert.match(s,/__zeroBlockAds/);
 assert.match(s,/new releases in full hd/);
 assert.match(s,/return adLanguage&&hasButtons/);
});
test('Android MappleTV guard supports embedded popup frames without affecting Windows',()=>{
 const s=read('app/src/main/assets/mappletv-guard-267.js');
 assert.match(s,/window\.__zeroMappleGuardEnabled/);
 assert.match(s,/__zeroMappleGuard267/);
 assert.match(s,/location.hostname!=='mapple.fun'/);
 assert.match(s,/Watch options/i);
 assert.match(s,/MutationObserver/);
 assert.match(s,/__zeroBlockAds/);
 assert.match(s,/new releases in full hd/);
 assert.match(s,/big sale time!/);
 assert.match(s,/function adCreative\(node\)/);
 assert.match(s,/querySelector\(media\+'\,'\+challenge\)/);
});
test('Guard is loaded for Android and Windows player content only',()=>{
 assert.match(read('app/src/main/java/com/zerostreams/app/BrowserPlayerActivity.java'),/mappletv-guard-267.js/);
 assert.match(read('windows/main.cjs'),/mappletv-guard-267.js/);
 assert.doesNotMatch(read('windows/playback-sources.cjs'),/mappletv-guard-267/);
});
