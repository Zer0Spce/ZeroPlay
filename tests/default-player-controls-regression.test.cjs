const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const host=fs.readFileSync('windows/player-host.cjs','utf8');
const main=fs.readFileSync('windows/main.cjs','utf8');
const android=fs.readFileSync('app/src/main/java/com/zerostreams/app/BrowserPlayerActivity.java','utf8');

test('Windows embedded movie/live playback opts out of the ZeroPlay toolbar',()=>{
  assert.match(main,/new PlayerHost\(main,view,toolbar,\{toolbar:false\}\);installPlayerScripts/);
  assert.match(main,/new PlayerHost\(main,view,toolbar,\{toolbar:false\}\);view\.setBackgroundColor/);
  assert.match(host,/this\.toolbarEnabled=options\.toolbar!==false/);
  assert.match(host,/if\(this\.toolbarEnabled\)main\.contentView\.addChildView\(toolbar\)/);
});

test('Windows sports keeps its existing dedicated support bar',()=>{
  assert.match(main,/new PlayerHost\(main,view,toolbar,\{bottom:true\}\)/);
  assert.match(host,/this\.bottom\?Math\.max\(0,height-44\):0/);
});

test('Android and TV do not draw a ZeroPlay quick bar over provider players',()=>{
  assert.doesNotMatch(android,/if\(!reader\)buildQuickBar\(\);/);
  assert.match(android,/private void buildQuickBar\(\)\{\}/);
  assert.match(android,/private void showQuickBar\(\)\{\}/);
  assert.match(android,/window\.__zeroTvWake/);
});
