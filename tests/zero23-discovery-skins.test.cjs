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
