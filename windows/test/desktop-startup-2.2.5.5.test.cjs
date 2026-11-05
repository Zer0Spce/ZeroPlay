'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const main=fs.readFileSync(path.join(root,'main.cjs'),'utf8');
const versions=fs.readFileSync(path.join(root,'version-manager.cjs'),'utf8');
const updater=fs.readFileSync(path.join(root,'updater.cjs'),'utf8');
test('the desktop bootstrap uses an actually defined version formatter',()=>{
  assert.match(main,/version:versions\.publicVersion\(app\.getVersion\(\)\)/);
  assert.match(versions,/function publicVersion\(value\)/);
  assert.match(versions,/module\.exports=\{[^}]*publicVersion/);
  assert.doesNotMatch(main,/(?<!\.)\bpublicVersion\(app\.getVersion\(\)\)/);
});
test('the updater uses public release versions and shows 2.2.5.5',()=>{
  assert.match(updater,/cleanVersion=value=>versions\.publicVersion\(value\)/);
  assert.match(updater,/current:versions\.publicVersion\(app\.getVersion\(\)\)/);
});
test('a packaged desktop executable has a UI-only smoke test',()=>{
  assert.match(main,/process\.argv\.includes\('--ui-smoke-test'\)/);
  assert.match(main,/window\.zero\.state\(\)/);
  assert.match(main,/ZERO_WINDOWS_UI_SMOKE_PASS/);
});
