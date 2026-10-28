'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../web/public');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'zero23-skins.css'),'utf8');
const js=fs.readFileSync(path.join(root,'zero23-skins.js'),'utf8');
test('experimental discovery skins are wired into the existing settings page',()=>{
  assert.match(html,/zero23-skins\.css/);
  assert.match(html,/zero23-skins\.js/);
  for(const name of ['original','cinematic','modern','library','signature'])assert.match(js,new RegExp(name+':'));
  assert.match(js,/localStorage\.setItem\(KEY,skin\)/);
});
test('all four skins have independent discovery styling',()=>{
  for(const name of ['cinematic','modern','library','signature'])assert.ok(css.includes('data-zp23-skin="'+name+'"'));
});
test('skin module does not reference protected playback, sports or TV navigation controls',()=>{
  assert.doesNotMatch(js,/player-stage|player-exit|tv-player-input|live-preload|audioContext|volumeBoost|sportsEvents/i);
  assert.doesNotMatch(css,/web-player|player-stage|live-tv|sports-|\.tv-player/i);
});

test('curated TMDB shelves have endpoints and configurable home panels',()=>{
 const source=fs.readFileSync(path.join(root,'zero22.js'),'utf8');
 for(const name of ['topSeries','newSeries','animation','kDrama','documentaries']){
   assert.match(source,new RegExp(name+':\\s*row\\('));
   assert.match(source,new RegExp(name+':\\s*\\['));
 }
 assert.match(source,/usedDiscovery=new Set\(\)/);
 assert.match(source,/usedDiscovery\.has\(key\(item\)\)/);
});

test('Windows discovery themes are linked and original remains selectable',()=>{
 const win=path.resolve(__dirname,'../windows/ui');
 const markup=fs.readFileSync(path.join(win,'index.html'),'utf8');
 const script=fs.readFileSync(path.join(win,'zero23-skins.js'),'utf8');
 assert.match(markup,/zero23-skins\.css/);
 assert.match(markup,/zero23-skins\.js/);
 for(const name of ['original','cinematic','modern','library','signature'])assert.ok(script.includes(name+':'));
});
test('Android discovery offers four selectable appearances and five curated shelves',()=>{
 const android=path.resolve(__dirname,'../app/src/main/java/com/zerostreams/app');
 const main=fs.readFileSync(path.join(android,'MainActivity.java'),'utf8');
 const panels=fs.readFileSync(path.join(android,'HomePanels.java'),'utf8');
 const api=fs.readFileSync(path.join(android,'ContentApi.java'),'utf8');
 for(const name of ['zp23cinematic','zp23modern','zp23library','zp23signature'])assert.ok(main.includes(name));
 for(const id of ['topSeries','newSeries','kDrama','animePicks','documentaryPicks']){
   assert.ok(panels.includes('"'+id+'"'));
   assert.ok(api.includes('case "'+id+'"'));
 }
 assert.match(main,/zero23PosterWidth\(\)/);
});
test('private preview workflow cannot publish a GitHub release',()=>{
 const yaml=fs.readFileSync(path.resolve(__dirname,'../.github/workflows/build-2.3-private-test.yml'),'utf8');
 assert.match(yaml,/contents: read/);
 assert.doesNotMatch(yaml,/gh release create|softprops\/action-gh-release|create-release|publish stable/i);
 for(const name of ['ZeroPlay-2.3-preview-Android.apk','ZeroPlay-2.3-preview-Android-TV.apk','ZeroPlay-2.3-preview-Windows-x64.zip'])assert.ok(yaml.includes(name));
});
