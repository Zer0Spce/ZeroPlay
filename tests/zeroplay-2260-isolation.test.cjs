'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('Android 2.2.6 QA source always uses .test application IDs and TEST launcher labels',()=>{
 const gradle=read('app/build.gradle');
 for(const suffix of ['.mobile.test','.tv.test','.lite.mobile.test','.lite.tv.test'])
  assert.ok(gradle.includes("applicationIdSuffix '"+suffix+"'"),suffix);
 assert.match(gradle,/appLabel:\s*'ZeroPlay TEST'/);
 assert.match(gradle,/appLabelLite:\s*'ZeroPlay Lite TEST'/);
 assert.doesNotMatch(gradle,/applicationIdSuffix '[^']+' \+ \(System.getenv/);
});
test('TEST Android updater must not download or offer the published production APK',()=>{
 const code=read('app/src/main/java/com/zerostreams/app/AppUpdater.java');
 assert.ok(code.includes('BuildConfig.APPLICATION_ID.endsWith(".test")'));
 assert.ok(code.includes('production updates disabled'));
});
test('candidate validates all four unique Android package IDs, labels and test version',()=>{
 const yaml=read('.github/workflows/zeroplay-2260-candidate-test.yml');
 assert.ok(yaml.includes('test/v2.2.6-nextgen-feature-suite'));
 assert.ok(yaml.includes("ZERO_ANDROID_TEST_SIDE_BY_SIDE: '1'"));
 assert.ok(yaml.includes("versionCode='65'"));
 assert.ok(yaml.includes("versionName='2.2.6-TEST'"));
 for(const id of ['com.zerostreams.app.mobile.test','com.zerostreams.app.tv.test','com.zerostreams.app.lite.mobile.test','com.zerostreams.app.lite.tv.test'])
  assert.ok(yaml.includes(id),'Missing '+id);
 assert.ok(yaml.includes("application-label:'$expected_label'"));
 assert.doesNotMatch(yaml,/gh release (?:create|upload)|\n  release:\n/);
});
test('Windows build is test-only and its public version is 2.2.6',()=>{
 const script=read('scripts/prepare-2260-windows-test.cjs');
 assert.ok(script.includes("pkg.version='2.2.6'"));
 assert.ok(script.includes("const production=false"));
 assert.ok(script.includes('ZeroPlay-2.2.6-TEST-Windows-x64'));
 assert.ok(read('windows/main.cjs').includes(String.raw`2\.2\.6$/.test(result.version)`));
});
