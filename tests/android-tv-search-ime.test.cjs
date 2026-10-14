'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const tv=fs.readFileSync('app/src/tv/AndroidManifest.xml','utf8');
const liteTv=fs.readFileSync('app/src/liteTv/AndroidManifest.xml','utf8');
const mobile=fs.readFileSync('app/src/mobile/AndroidManifest.xml','utf8');
const full=fs.readFileSync('app/src/main/java/com/zerostreams/app/TvMainActivity.java','utf8');
const lite=fs.readFileSync('app/src/main/java/com/zerostreams/app/LiteTvMainActivity.java','utf8');
const bridge=fs.readFileSync('app/src/main/java/com/zerostreams/app/TvSystemIme.java','utf8');
const main=fs.readFileSync('app/src/main/java/com/zerostreams/app/MainActivity.java','utf8');

test('Android TV launchers use the system-only TV Search handoff',()=>{
  assert.match(tv,/android:name="\.TvMainActivity"/);
  assert.match(liteTv,/android:name="\.LiteTvMainActivity"/);
  assert.match(full,/super\.focusSearch\(\);\s*TvSystemIme\.open\(this\);/s);
  assert.match(lite,/super\.focusSearch\(\);\s*TvSystemIme\.open\(this\);/s);
});

test('TV Search never renders a ZeroPlay keyboard and delegates to Android IMEs',()=>{
  for(const marker of [
    'tvSystemImePicker214',
    'if(!pickerSeen)',
    'showInputMethodPicker',
    'showSoftInput(field,InputMethodManager.SHOW_IMPLICIT)',
    'setShowSoftInputOnFocus(true)',
    'hideSoftInputFromWindow',
    'Choose your Android TV keyboard'
  ]) assert.ok(bridge.includes(marker),`Missing system IME marker: ${marker}`);
  assert.doesNotMatch(bridge,/new Dialog\(|new Button\(|QWERTYUIOP|1234567890|showZeroPlayKeyboard|DEFAULT_INPUT_METHOD|getEnabledInputMethodList/);
  assert.equal(fs.existsSync('app/src/main/java/com/zerostreams/app/TvSearchIme.java'),false);
});

test('shared Search field remains a standard Android text editor',()=>{
  assert.match(main,/setImeOptions\(android\.view\.inputmethod\.EditorInfo\.IME_ACTION_SEARCH\)/);
  assert.match(main,/setInputType\(android\.text\.InputType\.TYPE_CLASS_TEXT\)/);
  assert.match(main,/search\.requestFocus\(\)/);
});

test('Android mobile keeps its existing launcher and no TV bridge',()=>{
  assert.match(mobile,/android:name="\.PresentationMainActivity"/);
  assert.doesNotMatch(mobile,/TvMainActivity|LiteTvMainActivity|TvSystemIme/);
});
