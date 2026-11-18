'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
const main=read('app/src/main/java/com/zerostreams/app/MainActivity.java');
const player=read('app/src/main/java/com/zerostreams/app/BrowserPlayerActivity.java');
const vpn=read('app/src/main/java/com/zerostreams/app/ZeroVpnAdblockService.java');
const manifest=read('app/src/main/AndroidManifest.xml');
test('Home two-state toggle offers Original on left and VPN DNS on right',()=>{
 assert.match(main,/LEFT: Original · RIGHT: Original \+ VPN DNS/);
 assert.match(main,/if\(right\)requestVpnAdblockMode\(\)/);
 assert.match(main,/else\{selectOriginalAdblockMode\(\)/);
 assert.match(main,/VpnService\.prepare\(this\)/);
 assert.match(main,/startActivityForResult\(permission,VPN_PERMISSION_REQUEST\)/);
 assert.match(read('scripts/apply-custom-livetv-test.cjs'),/if\(resultCode==RESULT_OK\)startVpnAdblockMode\(\)/);
 assert.match(main,/BuildConfig\.TV\?18:16/);
});
test('VPN mode uses real Android VpnService, forwards nonblocked DNS, keeps video un-tunneled',()=>{
 assert.match(vpn,/extends VpnService/);
 assert.match(vpn,/addAddress\("10\.119\.0\.2",32\)/);
 assert.match(vpn,/addDnsServer\(DNS\)\.addRoute\(DNS,32\)/);
 assert.match(vpn,/if\(!protect\(socket\)\)continue/);
 assert.match(vpn,/VpnDnsPacket\.error\(q,3\)/);
 assert.match(vpn,/LIST="https:\/\/raw\.githubusercontent\.com\/StevenBlack\/hosts/);
 assert.doesNotMatch(vpn,/addRoute\("0\.0\.0\.0",0\)/);
 assert.match(manifest,/android\.permission\.BIND_VPN_SERVICE/);
 assert.match(manifest,/android\.net\.VpnService/);
});
test('Original restored when VPN is denied stopped or revoked',()=>{
 assert.match(main,/selectOriginalAdblockMode/);
 assert.match(main,/stopService\(new Intent\(this,ZeroVpnAdblockService\.class\)\)/);
 assert.match(vpn,/void onRevoke\(\)/);
 assert.match(vpn,/void onDestroy\(\)/);
 assert.match(vpn,/putBoolean\("blockAds",true\)/);
 assert.match(player,/blockAds=!reader&&prefs\.getBoolean\("blockAds",true\)/);
 assert.match(read('app/src/main/assets/mappletv-guard-267.js'),/__zeroMappleGuard267/);
});

test('Home always renders the ad mode toggle when catalog has zero rows',()=>{
 const begin=main.indexOf('if(rows.isEmpty()){');
 const end=main.indexOf('if(category.equals("Home")&&displayQuery.isEmpty())',begin+120);
 assert.ok(begin>0);
 assert.match(main.slice(begin,begin+400),/if\(category\.equals\("Home"\)&&displayQuery\.isEmpty\(\)\)homeAdBlockingSwitch\(\)/);
 assert.match(main,/void renderHome22\(List<Catalog\.Item> rows,int token\)/);
 assert.match(main,/homeAdBlockingSwitch\(\);\s*List<Catalog.Item> clean=/);
});
test('Isolated QA embeds the same catalog secrets as production build',()=>{
 const workflow=read('.github/workflows/test-vpn-adblock-android-tv.yml');
 assert.match(workflow,/TMDB_API_KEY: \$\{\{ secrets\.TMDB_API_KEY \}\}/);
 assert.match(workflow,/OMDB_API_KEY: \$\{\{ secrets\.OMDB_API_KEY \}\}/);
 assert.match(workflow,/test -n "\$TMDB_API_KEY"/);
});

test('VPN does not disable original in-player blocking, including reloads',()=>{
 assert.match(main,/putString\("adBlockingMode","vpn"\).*putBoolean\("vpnAdblockStarting",true\)[\s\S]{0,180}putBoolean\("blockAds",true\)/);
 assert.match(vpn,/putString\(MODE,"vpn"\).*putBoolean\(ACTIVE,true\).*putBoolean\("vpnAdblockStarting",false\).*putBoolean\("blockAds",true\)/);
 assert.doesNotMatch(vpn,/putBoolean\("blockAds",false\)/);
 assert.match(player,/ZeroVpnAdblockService\.isRunning\(\)\?"VPN \+ Player blocker"/);
 assert.match(vpn,/vpnDnsQueryCount/);
 assert.match(vpn,/vpnDnsBlockedCount/);
});
