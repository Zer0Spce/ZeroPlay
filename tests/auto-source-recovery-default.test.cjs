'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const read=path=>fs.readFileSync(path,'utf8');

test('automatic source recovery defaults off and is opt-in across 2.2 platforms',()=>{
  const androidPlayer=read('app/src/main/java/com/zerostreams/app/BrowserPlayerActivity.java');
  const androidMain=read('app/src/main/java/com/zerostreams/app/MainActivity.java');
  const winMain=read('windows/main.cjs');
  const winUi=read('windows/ui/app.js');
  assert.match(androidPlayer,/getBoolean\("autoSourceRecovery",false\)/);
  assert.doesNotMatch(androidPlayer,/getBoolean\("autoSourceRecovery",true\)/);
  assert.match(androidMain,/recovery\.setChecked\(prefs\.getBoolean\("autoSourceRecovery",false\)\)/);
  assert.match(androidMain,/autoSourceRecoveryDefaultOff22/);
  assert.match(winMain,/autoSourceRecovery:false/);
  assert.match(winMain,/state\.settings\.autoSourceRecovery===true/);
  assert.doesNotMatch(winMain,/state\.settings\.autoSourceRecovery!==false/);
  assert.match(winMain,/autoSourceRecovery:value\.autoSourceRecovery===true/);
  assert.match(winMain,/autoSourceRecoveryDefaultOff22/);
  assert.match(winUi,/zero22-recovery'\)\.checked=state\.settings\.autoSourceRecovery===true/);
  assert.match(winUi,/autoSourceRecovery:\$\('#zero22-recovery'\)\?\.checked===true/);
});

test('deterministic 2.2 generators cannot restore recovery-on defaults',()=>{
  const androidPatch=read('scripts/apply-2.2-android-core.cjs');
  const windowsPatch=read('scripts/apply-2.2-windows.cjs');
  assert.match(androidPatch,/autoSourceRecovery",false/);
  assert.doesNotMatch(androidPatch,/autoSourceRecovery",true/);
  assert.match(windowsPatch,/autoSourceRecovery:false/);
  assert.match(windowsPatch,/autoSourceRecovery===true/);
  assert.doesNotMatch(windowsPatch,/autoSourceRecovery:true/);
});
