'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const main=fs.readFileSync('app/src/main/java/com/zerostreams/app/MainActivity.java','utf8');
const manifest=fs.readFileSync('app/src/main/AndroidManifest.xml','utf8');
const wf=fs.readFileSync('.github/workflows/test-vpn-adblock-android-tv.yml','utf8');
test('Uses actual official BlockAds app, no homemade registered VPN',()=>{
 assert.match(main,/app\.pwhs\.blockads\.MainActivity/);
 assert.match(main,/app\.pwhs\.blockadstv\.MainActivity/);
 assert.match(main,/extra_start_vpn/);
 assert.match(main,/app\.pwhs\.blockads\.TASKER_STOP/);
 assert.doesNotMatch(manifest,/android:name="\.ZeroVpnAdblockService"/);
 assert.match(manifest,/android:name="app\.pwhs\.blockads"/);
 assert.match(manifest,/android:name="app\.pwhs\.blockadstv"/);
 assert.match(wf,/sha256sum -c/);
 assert.match(wf,/Original-BlockAds-v7\.1\.2-VERIFIED-Android-and-TV/);
});
test('Compact toggle is in header and navigation, not floating above carousel',()=>{
 assert.match(main,/header\.addView\(subtleAdModeChip\(\),ac\)/);
 assert.match(main,/row\.addView\(subtleAdModeChip\(\)/);
 assert.match(main,/rail\.addView\(subtleAdModeChip\(\)/);
 assert.doesNotMatch(main,/homeAdBlockingSwitch\(\);\s*List<Catalog.Item> clean=/);
});
test('Original ZeroPlay player filter is retained in BlockAds mode',()=>{
 assert.match(main,/putString\("adBlockingMode","blockads"\)\.putBoolean\("blockAds",true\)/);
 assert.match(main,/putString\("adBlockingMode","original"\)\.putBoolean\("blockAds",true\)/);
});
test('Android TV stop must be confirmed in actual upstream app, not faked',()=>{
 assert.match(main,/The original BlockAds TV app does not expose remote VPN stop/);
 assert.match(main,/I stopped it/);
});
