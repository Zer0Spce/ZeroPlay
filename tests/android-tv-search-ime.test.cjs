'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

// Regression contract: only TV launchers opt into the TV-specific Search keyboard handoff.
const tv=fs.readFileSync('app/src/tv/AndroidManifest.xml','utf8');
const liteTv=fs.readFileSync('app/src/liteTv/AndroidManifest.xml','utf8');
const mobile=fs.readFileSync('app/src/mobile/AndroidManifest.xml','utf8');
const full=fs.readFileSync('app/src/main/java/com/zerostreams/app/TvMainActivity.java','utf8');
const lite=fs.readFileSync('app/src/main/java/com/zerostreams/app/LiteTvMainActivity.java','utf8');
const ime=fs.readFileSync('app/src/main/java/com/zerostreams/app/TvSearchIme.java','utf8');

test('Android TV launchers use the TV-only Search keyboard handoff',()=>{
  assert.match(tv,/android:name="\.TvMainActivity"/);
  assert.match(liteTv,/android:name="\.LiteTvMainActivity"/);
  assert.match(full,/super\.focusSearch\(\);\s*TvSearchIme\.show\(this\);/s);
  assert.match(lite,/super\.focusSearch\(\);\s*TvSearchIme\.show\(this\);/s);
});

test('TV Search suppresses broken firmware IMEs and opens the ZeroPlay D-pad keyboard',()=>{
  for(const marker of [
    'Search titles',
    'setShowSoftInputOnFocus(false)',
    'hideSoftInputFromWindow',
    'SOFT_INPUT_STATE_ALWAYS_HIDDEN',
    'showZeroPlayKeyboard(activity,field)',
    '"1234567890"',
    '"QWERTYUIOP"',
    '"ASDFGHJKL"',
    '"ZXCVBNM"',
    'EditorInfo.IME_ACTION_SEARCH',
    'postDelayed(open,120)',
    'postDelayed(open,320)'
  ]) assert.ok(ime.includes(marker),`Missing TV keyboard marker: ${marker}`);
  assert.doesNotMatch(ime,/showSoftInput\(|restartInput\(|SHOW_FORCED|toggleSoftInput/);
});

test('Android mobile keeps the existing launcher and does not opt into the TV workaround',()=>{
  assert.match(mobile,/android:name="\.PresentationMainActivity"/);
  assert.doesNotMatch(mobile,/TvMainActivity|LiteTvMainActivity/);
});
