'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');

test('Android and Windows guards boost only one active audible element',()=>{
  for(const rel of ['app/src/main/assets/player-guard.js','windows/assets/player-guard.js']){
    const text=read(rel);
    assert.match(text,/const graphs = new WeakMap\(\)/,rel);
    assert.match(text,/let context, activeElement = null/,rel);
    assert.match(text,/element\.muted \|\| Number\(element\.volume\) <= 0/,rel);
    assert.match(text,/function activeMedia\(\)/,rel);
    assert.match(text,/function silencePrevious\(next\)/,rel);
    assert.match(text,/old\.gain\.gain\.value = 0/,rel);
    assert.doesNotMatch(text,/const connected = new WeakSet\(\)/,rel);
  }
});

test('hotfix limiter is gentler and removes brick-wall pumping settings',()=>{
  for(const rel of ['app/src/main/assets/player-guard.js','windows/assets/player-guard.js']){
    const text=read(rel);
    assert.match(text,/limiter\.threshold\.value = -8/,rel);
    assert.match(text,/limiter\.knee\.value = 16/,rel);
    assert.match(text,/limiter\.ratio\.value = 4/,rel);
    assert.match(text,/limiter\.attack\.value = 0\.012/,rel);
    assert.match(text,/limiter\.release\.value = 0\.25/,rel);
    assert.doesNotMatch(text,/limiter\.ratio\.value = 20/,rel);
  }
});

test('2.2.4.1 versions are applied',()=>{
  const gradle=read('app/build.gradle');
  assert.match(gradle,/versionCode 50/);
  assert.match(gradle,/versionName '2\.2\.4\.1'/);
  const pkg=JSON.parse(read('windows/package.json'));
  assert.equal(pkg.version,'2.2.4.1');
  assert.equal(pkg.build.buildVersion,'2.2.4.1');
});
