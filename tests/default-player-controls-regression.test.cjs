const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const host=fs.readFileSync('windows/player-host.cjs','utf8');
const android=fs.readFileSync('app/src/main/java/com/zerostreams/app/BrowserPlayerActivity.java','utf8');

test('Windows does not attach the ZeroPlay toolbar over provider players',()=>{
  assert.match(host,/main\.contentView\.addChildView\(view\);/);
  assert.doesNotMatch(host,/addChildView\(toolbar\)/);
  assert.doesNotMatch(host,/toolbar\.setBounds/);
  assert.doesNotMatch(host,/toolbar\.setVisible/);
  assert.doesNotMatch(host,/removeChildView\(this\.toolbar\)/);
});

test('Android and TV do not draw a ZeroPlay quick bar over provider players',()=>{
  assert.doesNotMatch(android,/if\(!reader\)buildQuickBar\(\);/);
  assert.match(android,/private void buildQuickBar\(\)\{\}/);
  assert.match(android,/private void showQuickBar\(\)\{\}/);
  assert.doesNotMatch(android,/if\(web==null\)return;showQuickBar\(\);/);
  assert.match(android,/window\.__zeroTvWake/);
});
