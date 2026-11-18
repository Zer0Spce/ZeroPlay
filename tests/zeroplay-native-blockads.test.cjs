'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const get=p=>fs.readFileSync(p,'utf8');
const main=get('app/src/main/java/com/zerostreams/app/MainActivity.java');
const vpn=get('app/src/main/java/com/zerostreams/app/ZeroVpnAdblockService.java');
const manifest=get('app/src/main/AndroidManifest.xml');
const gradle=get('app/build.gradle');
const workflow=get('.github/workflows/test-vpn-adblock-android-tv.yml');
test('Single ZeroPlay APK bundles authentic BlockAds Go engine',()=>{
 assert.match(vpn,/tunnel\.Tunnel\.newEngine\(\)/);
 assert.match(vpn,/new tunnel\.DomainChecker\(\)/);
 assert.match(vpn,/engine\.start\(tun\.getFd\(\)/);
 assert.match(vpn,/engine\.setTries\(/);
 assert.match(gradle,/implementation files\('libs\/blockads-tunnel\.aar'\)/);
 assert.match(workflow,/9e73407a9d31b1cfb9decece22686dc0b44a804598e4ddd96f9a6374580ded6e/);
 assert.match(workflow,/lib\/arm64-v8a\/libgojni.so/);
 assert.match(manifest,/android:name="\.ZeroVpnAdblockService"/);
 assert.doesNotMatch(main,/app\.pwhs\.blockadstv\.MainActivity|extra_start_vpn|Install original BlockAds first/);
});
test('Small nav toggle starts own VPN with user permission, stops internally',()=>{
 assert.match(main,/android\.net\.VpnService\.prepare\(this\)/);
 assert.match(main,/startForegroundService\(service\)/);
 assert.match(main,/stopService\(new Intent\(this,ZeroVpnAdblockService\.class\)\)/);
 assert.match(main,/header\.addView\(subtleAdModeChip\(\),ac\)/);
 assert.doesNotMatch(main,/homeAdBlockingSwitch\(\);\s*List<Catalog.Item> clean=/);
});
test('Original WebView ad blocker stays enabled even with Go engine',()=>{
 assert.match(main,/putString\("adBlockingMode","blockads"\)\.putBoolean\("blockAds",true\)/);
});
