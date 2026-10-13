const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const winMain=fs.readFileSync('windows/main.cjs','utf8');
const winUi=fs.readFileSync('windows/ui/app.js','utf8');
const android=fs.readFileSync('app/src/main/java/com/zerostreams/app/MainActivity.java','utf8');
const web=fs.readFileSync('web/public/browser.js','utf8');

test('Windows explicit source selection wins over auto-best scoring',()=>{
  assert.match(winMain,/if\(!sourceOverride\)requestedSource=bestSource\(requestedSource\);/);
  assert.doesNotMatch(winMain,/sourceOverride\|\|sourceOverride==='vidstuck'/);
  assert.match(winUi,/const global=state\?\.settings\?\.source/);
  assert.match(winUi,/return playbackSourceValid\(global\)\?global:'vidstuck'/);
});

test('Android and TV keep manual source precedence and expose VidSrc',()=>{
  assert.match(android,/Arrays\.asList\(PlaybackSources\.IDS\)\.contains\(source\)/);
  assert.match(android,/String selected=selectedPlaybackSource\(\);if\(allowedPlaybackSource\(selected\)\)return selected;return "vidstuck";/);
  assert.match(android,/java\.util\.Arrays\.copyOf\(PlaybackSources\.NAMES,3\)/);
  assert.doesNotMatch(android,/if\(prefs\.getBoolean\("autoBestSource",true\)\)return PlaybackHealth\.best/);
});

test('Website still sends the selected settings source directly',()=>{
  assert.match(web,/saved\.settings\.source\|\|'vidstuck'/);
});
