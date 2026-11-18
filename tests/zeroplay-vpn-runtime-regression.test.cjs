'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
const main=read('app/src/main/java/com/zerostreams/app/MainActivity.java');
const fixed=read('app/src/main/java/com/zerostreams/app/FixedMainActivity.java');
const presentation=read('app/src/main/java/com/zerostreams/app/PresentationMainActivity.java');
const player=read('app/src/main/java/com/zerostreams/app/BrowserPlayerActivity.java');
const tvManifest=read('app/src/tv/AndroidManifest.xml');
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
test('TV launcher actually uses PresentationMainActivity and FixedMainActivity override',()=>{
  assert.match(tvManifest,/android:name="\.PresentationMainActivity"/);
  assert.match(presentation,/extends CategoryMainActivity/);
  assert.match(fixed,/extends MainActivity/);
  const override=fixed.slice(fixed.indexOf('@Override void addGoogleNavigation'),fixed.indexOf('private LinearLayout mainContent'));
  assert.match(override,/modernFixedBar\.addView\(top,new LinearLayout\.LayoutParams\(0,dp\(54\),1\)\)/);
  assert.match(override,/Switch shield=subtleAdModeChip\(\)/);
  assert.match(override,/modernFixedBar\.addView\(shield,shieldLp\)/);
  assert.match(override,/body\.addView\(modernFixedBar,tp\)/);
  assert.match(override,/if\(BuildConfig\.TV\)/);
});
test('VPN diagnostics is reachable from Settings; VPN retains original filtering',()=>{
  assert.match(main,/panel\.addView\(button\("VPN blocking status \/ controls",this::showVpnAdblockDiagnostics\)\)/);
  assert.match(main,/void showVpnAdblockDiagnostics\(\)/);
  assert.match(main,/ads\.setEnabled\(!realBlockAdsSelected\(\)\)/);
  assert.match(main,/ads\.isChecked\(\)\|\|realBlockAdsSelected\(\)/);
  assert.match(player,/"blockads"\.equals\(prefs\.getString\("adBlockingMode","original"\)\)/);
});
test('VPN shares safe host blocklist with WebView and reports blocked subresources',()=>{
  assert.match(vpn,/static boolean blocksPlayerHost\(String host\)/);
  assert.match(player,/ZeroVpnAdblockService\.blocksPlayerHost\(host\)/);
  assert.match(player,/putLong\("playerAdRequestsBlocked",n\)/);
  assert.match(vpn,/vpnBlocklistStatus/);
});
