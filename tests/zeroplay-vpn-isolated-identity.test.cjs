'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const gradle=fs.readFileSync('app/build.gradle','utf8');
const workflow=fs.readFileSync('.github/workflows/test-vpn-adblock-android-tv.yml','utf8');
test('VPN QA build has opt-in distinct application IDs for all four flavors',()=>{
 assert.match(gradle,/gradleProperty\('zeroVpnQaIsolated'\)/);
 assert.match(gradle,/flavor\.applicationIdSuffix = "\$\{flavor\.applicationIdSuffix\}\.vpntest"/);
 assert.match(gradle,/ZeroPlay VPN Test Lite/);
 assert.match(gradle,/ZeroPlay VPN Test/);
 assert.match(workflow,/-PzeroVpnQaIsolated=true :app:assembleMobileDebug/);
 assert.match(workflow,/-PzeroVpnQaIsolated=true :app:testMobileDebugUnitTest/);
 for(const suffix of ['mobile.vpntest','tv.vpntest','lite.mobile.vpntest','lite.tv.vpntest'])
  assert.ok(workflow.includes('com.zerostreams.app.'+suffix),suffix);
});
test('Original production identities are not rewritten',()=>{
 assert.match(gradle,/applicationId 'com\.zerostreams\.app'/);
 for(const suffix of [".mobile",".tv",".lite.mobile",".lite.tv"])
  assert.ok(gradle.includes("applicationIdSuffix '"+suffix+"'"));
 assert.doesNotMatch(workflow,/gh release create|softprops\/action-gh-release/);
});
