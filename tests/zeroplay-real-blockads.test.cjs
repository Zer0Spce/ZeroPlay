'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const main=fs.readFileSync('app/src/main/java/com/zerostreams/app/MainActivity.java','utf8');
const manifest=fs.readFileSync('app/src/main/AndroidManifest.xml','utf8');
test('Actual BlockAds companion replaces fake DNS tunnel',()=>{
 assert.match(main,/app\.pwhs\.blockads\.zeroplayqa/);
 assert.match(main,/extra_start_vpn/);
 assert.match(main,/zeroplay_command/);
 assert.match(main,/app\.pwhs\.blockads\.TASKER_STOP/);
 assert.match(main,/app\.pwhs\.blockads\.ZEROPLAY_STOP/);
 assert.doesNotMatch(manifest,/name="\.ZeroVpnAdblockService"/);
 assert.match(manifest,/<queries><package android:name="app\.pwhs\.blockads\.zeroplayqa"/);
});
test('Subtle mode chip is inside navigation, never above carousel',()=>{
 assert.match(main,/header\.addView\(subtleAdModeChip\(\),ac\)/);
 assert.match(main,/row\.addView\(subtleAdModeChip\(\)/);
 assert.match(main,/rail\.addView\(subtleAdModeChip\(\)/);
 assert.doesNotMatch(main,/homeAdBlockingSwitch\(\);\s*List<Catalog.Item> clean=/);
});
test('Original player adblock stays enabled in both modes',()=>{
 assert.match(main,/putString\("adBlockingMode","blockads"\)\.putBoolean\("blockAds",true\)/);
 assert.match(main,/putString\("adBlockingMode","original"\)\.putBoolean\("blockAds",true\)/);
});
