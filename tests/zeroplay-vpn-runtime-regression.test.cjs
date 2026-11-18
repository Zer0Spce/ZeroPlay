'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
const main=read('app/src/main/java/com/zerostreams/app/MainActivity.java');
const vpn=read('app/src/main/java/com/zerostreams/app/ZeroVpnAdblockService.java');
test('Modern UI Android TV pins a focusable VPN toggle outside the horizontally scrolled tabs',()=>{
  assert.match(main,/if\(!BuildConfig\.TV\)row\.addView\(subtleAdModeChip\(/);
  assert.match(main,/fixedNav\.addView\(top,new LinearLayout\.LayoutParams\(0,dp\(64\),1\)\)/);
  assert.match(main,/Switch shield=subtleAdModeChip\(\)/);
  assert.match(main,/fixedNav\.addView\(shield,fixedChip\)/);
  assert.match(main,/body\.addView\(fixedNav,tp\)/);
  assert.match(main,/sw\.setFocusable\(true\)/);
});
test('Go engine uses exact upstream uppercase NXDOMAIN contract',()=>{
  assert.match(vpn,/engine\.setBlockResponseType\("NXDOMAIN"\)/);
  assert.doesNotMatch(vpn,/setBlockResponseType\("nxdomain"\)/);
});
test('VPN routes DNS over both IPv4 and IPv6 as in official BlockAds TV',()=>{
  assert.match(vpn,/addDnsServer\("100\.64\.100\.1"\)\.addRoute\("100\.64\.100\.1",32\)/);
  assert.match(vpn,/addAddress\("fd00::2",128\)\.addDnsServer\("fd00::1"\)\.addRoute\("fd00::1",128\)/);
  assert.doesNotMatch(vpn,/addRoute\("0\.0\.0\.0",0\)/);
});
test('On-device probe checks a real DNS response and engine counters',()=>{
  assert.match(vpn,/void verifyNativeDnsBlocking\(\)/);
  assert.match(vpn,/InetAddress\.getByAddress\(new byte\[\]\{100,64,100,1\}\)/);
  assert.match(vpn,/answer\[3\]&15\)==3/);
  assert.match(vpn,/queries\.get\(\)>before&&blocked\.get\(\)>0/);
  assert.match(main,/vpnDnsSelfTestStatus/);
  assert.match(main,/VPN DNS !/);
});
test('Both modes retain the original in-player filter',()=>{
  assert.match(vpn,/putBoolean\("blockAds",true\)/);
  assert.doesNotMatch(vpn,/putBoolean\("blockAds",false\)/);
  assert.match(main,/putString\("adBlockingMode","blockads"\)\.putBoolean\("blockAds",true\)/);
});