'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
test('MappleTV player is reverted to the 2.2.6.7 guard without 2.2.6.8 interception',()=>{
 for(const f of ['app/src/main/assets/mappletv-guard-267.js','windows/assets/mappletv-guard-267.js']){
  const code=read(f);assert.match(code,/__zeroMappleGuard267/);
 }
 const android=read('app/src/main/java/com/zerostreams/app/BrowserPlayerActivity.java');
 const win=read('windows/main.cjs');
 assert.match(android,/mappletv-guard-267\.js/);assert.match(win,/mappletv-guard-267\.js/);
 assert.doesNotMatch(android,/MappleAdRules/);assert.doesNotMatch(win,/mappletv-guard-268\.js/);
 assert.doesNotMatch(win,/adHosts=\[/);
});
test('VidStuck is reset as the global default on upgrade with autoBest off',()=>{
 const a=read('app/src/main/java/com/zerostreams/app/MainActivity.java'),w=read('windows/main.cjs'),ui=read('windows/ui/app.js'),web=read('web/public/browser.js');
 assert.match(a,/vidstuckDefault269Migrated/);assert.match(a,/putString\("playbackSource","vidstuck"\)/);
 assert.match(a,/putBoolean\("autoBestSource",false\)/);assert.match(a,/prefs\.getBoolean\("autoBestSource",false\)/);
 assert.match(w,/vidstuckDefault269Migrated/);assert.match(w,/autoBestSource:false/);assert.match(w,/state\.settings\.source='vidstuck'/);
 assert.match(ui,/zero-title-sources-269-migrated/);assert.match(web,/vidstuckDefault269Migrated/);
});
