'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
const main=read('app/src/main/java/com/zerostreams/app/MainActivity.java');
const player=read('app/src/main/java/com/zerostreams/app/BrowserPlayerActivity.java');
const vpn=read('app/src/main/java/com/zerostreams/app/ZeroVpnAdblockService.java');
const manifest=read('app/src/main/AndroidManifest.xml');
test('Home two-state toggle offers Original on left and VPN DNS on right',()=>{
 assert.match(main,/LEFT: Original · RIGHT: VPN DNS/);
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
