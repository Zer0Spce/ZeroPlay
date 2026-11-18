'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const main=fs.readFileSync('app/src/main/java/com/zerostreams/app/MainActivity.java','utf8');
const player=fs.readFileSync('app/src/main/java/com/zerostreams/app/BrowserPlayerActivity.java','utf8');
test('Both Android and Android TV Home screens show a shared persistent ad toggle',()=>{
 assert.match(main,/void homeAdBlockingSwitch\(\)/);
 assert.match(main,/homeAdBlockingSwitch\(\);\s*List<Catalog.Item> clean=/);
 assert.match(main,/prefs\.edit\(\)\.putBoolean\("blockAds",enabled\)\.apply\(\)/);
 assert.match(main,/BuildConfig\.TV\?18:16/);
 assert.match(main,/toggle\.setContentDescription\("Block ads in ZeroPlay player"\)/);
 assert.match(main,/Block player ads/);
});
test('Player honors the saved toggle, including trusted streams and QR scanning',()=>{
 assert.match(player,/blockAds=!reader&&prefs\.getBoolean\("blockAds",true\)/);
 assert.doesNotMatch(player,/blockAds=true;/);
 assert.match(player,/if\(blockAds\)adScan=new PlayerAdScan\(this,web\)/);
 assert.match(player,/if\(blockAds&&!request\.isForMainFrame\(\)&&AdBlockRules\.blocks/);
 assert.match(player,/blockAds&&AdBlockRules\.blocks/);
 assert.match(player,/recreate\(\);/);
});
test('Player protection is not represented as system-wide VPN functionality',()=>{
 assert.match(main,/ZeroPlay player only/);
 assert.doesNotMatch(main,/VpnService\.prepare|BIND_VPN_SERVICE/);
});
