'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=p=>fs.readFileSync(p,'utf8');
test('MappleTV broad cosmetic ad filtering parses and is scoped to Mapple only',()=>{
 for(const p of ['app/src/main/assets/mappletv-guard-268.js','windows/assets/mappletv-guard-268.js']){
  const s=read(p);new vm.Script(s);
  for(const term of ['__zeroMappleSession','__zeroBlockAds','MutationObserver','IDLE_MS=3000','shadowRoot','data-ad','adBox','watch options'])assert.ok(s.toLowerCase().includes(term.toLowerCase()),term);
 }
});
test('Native network ad filtering is limited to the MappleTV playback instance',()=>{
 const android=read('app/src/main/java/com/zerostreams/app/BrowserPlayerActivity.java'),win=read('windows/main.cjs'),rules=read('app/src/main/java/com/zerostreams/app/MappleAdRules.java');
 assert.match(android,/MappleAdRules.isMapple\(currentAddress\)/);assert.match(win,/playbackSource==='mappletv'/);assert.match(win,/details.webContentsId===contents.id/);
 assert.match(rules,/doubleclick.net/);assert.match(rules,/endsWith\("\."\+d\)/);assert.match(rules,/mapple.fun/);
});
