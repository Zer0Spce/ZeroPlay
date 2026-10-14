'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const tv=fs.readFileSync('app/src/tv/AndroidManifest.xml','utf8');
const liteTv=fs.readFileSync('app/src/liteTv/AndroidManifest.xml','utf8');
const mobile=fs.readFileSync('app/src/mobile/AndroidManifest.xml','utf8');
const full=fs.readFileSync('app/src/main/java/com/zerostreams/app/TvMainActivity.java','utf8');
const lite=fs.readFileSync('app/src/main/java/com/zerostreams/app/LiteTvMainActivity.java','utf8');
const main=fs.readFileSync('app/src/main/java/com/zerostreams/app/MainActivity.java','utf8');

test('Android TV launchers use the normal app Search implementation',()=>{
  assert.match(tv,/android:name="\.TvMainActivity"/);
  assert.match(liteTv,/android:name="\.LiteTvMainActivity"/);
  assert.match(full,/extends PresentationMainActivity/);
  assert.match(lite,/extends LiteMainActivity/);
  assert.doesNotMatch(full,/focusSearch|TvSearchIme/);
  assert.doesNotMatch(lite,/focusSearch|TvSearchIme/);
});

test('Search delegates to the default Android system IME',()=>{
  assert.match(main,/search\.requestFocus\(\)/);
  assert.match(main,/showSoftInput\(search,android\.view\.inputmethod\.InputMethodManager\.SHOW_IMPLICIT\)/);
  assert.match(main,/setImeOptions\(android\.view\.inputmethod\.EditorInfo\.IME_ACTION_SEARCH\)/);
  assert.match(main,/setInputType\(android\.text\.InputType\.TYPE_CLASS_TEXT\)/);
});

test('custom ZeroPlay TV keyboard source is removed',()=>{
  assert.equal(fs.existsSync('app/src/main/java/com/zerostreams/app/TvSearchIme.java'),false);
});

test('Android mobile keeps its existing launcher',()=>{
  assert.match(mobile,/android:name="\.PresentationMainActivity"/);
  assert.doesNotMatch(mobile,/TvMainActivity|LiteTvMainActivity/);
});
