const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const browser=fs.readFileSync('app/src/main/java/com/zerostreams/app/BrowserPlayerActivity.java','utf8');
const mouse=fs.readFileSync('app/src/main/java/com/zerostreams/app/TvMouse.java','utf8');

test('Android TV Lite keeps the lightweight 2.1-style player wrapper',()=>{
  assert.match(browser,/liteTvPlayer=BuildConfig\.TV&&BuildConfig\.LITE&&!reader/);
  assert.match(browser,/liteTvPlayer\?"":v22Output\.toString\("UTF-8"\)/);
  assert.match(browser,/applySmartMode\(\)\{if\(liteTvPlayer\|\|!tvPlayer/);
  assert.match(browser,/web\.loadUrl\(address\);if\(!liteTvPlayer\)scheduleLoadTimeout\(\)/);
  assert.match(mouse,/private void snapCursor\(\)\{\s*if\(BuildConfig\.LITE\)return;/);
});

test('regular Android TV still retains the 2.2 player features',()=>{
  assert.match(browser,/else\{applyNavigationMode\(navigationMode\);/);
  assert.match(browser,/v22Output\.toString\("UTF-8"\)/);
  assert.match(browser,/if\(tvPlayer&&!liteTvPlayer&&key==KeyEvent\.KEYCODE_MENU\)/);
});
