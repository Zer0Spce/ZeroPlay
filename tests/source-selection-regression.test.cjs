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
  assert.match(android,/java\.util\.Arrays\.copyOf\(PlaybackSources\.NAMES,4\)/);
  assert.doesNotMatch(android,/if\(prefs\.getBoolean\("autoBestSource",true\)\)return PlaybackHealth\.best/);
});

test('Website still sends the selected settings source directly',()=>{
  assert.match(web,/saved\.settings\.source\|\|'vidstuck'/);
});

test('2.2.2 provider domains and ZXCStream are wired across platforms',()=>{
  const androidSources=fs.readFileSync('app/src/main/java/com/zerostreams/app/PlaybackSources.java','utf8');
  const windowsSources=fs.readFileSync('windows/playback-sources.cjs','utf8');
  const webSources=fs.readFileSync('web/public/playback-sources.js','utf8');
  for(const source of [androidSources,windowsSources,webSources]){assert.match(source,/vidstuck\.cc/);assert.match(source,/zxcstream\.cc/);assert.match(source,/ZXCStream \(Beta\)/);}
  assert.doesNotMatch(androidSources,/vidstuck\.xyz/);assert.doesNotMatch(windowsSources,/vidstuck\.xyz/);assert.doesNotMatch(webSources,/vidstuck\.xyz/);
});
