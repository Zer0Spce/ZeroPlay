'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const main=fs.readFileSync('app/src/main/java/com/zerostreams/app/MainActivity.java','utf8');
const player=fs.readFileSync('app/src/main/java/com/zerostreams/app/BrowserPlayerActivity.java','utf8');
test('Android TV Home hides player ad control while mobile retains it',()=>{
 const home=main.slice(main.indexOf('void renderHome22('),main.indexOf('void mergeBrowse(')>0?main.indexOf('void mergeBrowse('):undefined);
 assert.match(home,/if\(!BuildConfig\.TV\)homeAdBlockingSwitch\(\)/);
});
test('Android TV WebView ad filtering remains on with existing settings',()=>{
 assert.match(main,/putBoolean\("blockAds",enabled\)/);
 assert.match(player,/prefs\.getBoolean\("blockAds",true\)/);
 assert.match(player,/blockAds&&AdBlockRules\.blocks/);
 assert.match(main,/Block ads in external video players/);
});
