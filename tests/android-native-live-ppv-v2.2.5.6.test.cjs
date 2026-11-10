'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const read = file => fs.readFileSync(file,'utf8');
const main = read('app/src/main/java/com/zerostreams/app/MainActivity.java');
const native = read('app/src/main/java/com/zerostreams/app/LivePlayerActivity.java');
const playlist = read('app/src/main/java/com/zerostreams/app/M3uPlaylist.java');
const gradle = read('app/build.gradle');

test('Live PPV and Live TV both launch native Media3/ExoPlayer, not Shaka WebView', () => {
  assert.match(main,/tile\.setOnClickListener\(v->startActivity\(new Intent\(this,LivePlayerActivity\.class\)/);
  assert.doesNotMatch(main,/new Intent\(this,live\?LivePpvShakaActivity\.class:LivePlayerActivity\.class\)/);
  assert.match(main,/\.putExtra\("liveList",live\)/);
  assert.match(main,/\.putExtra\("channelUrl",channel\.url\)/);
});
test('Native player accepts separate live and IPTV playlists and preserves stream headers', () => {
  assert.match(native,/PlaylistStore\.cached\(getApplicationContext\(\),live\)/);
  assert.match(native,/livePpv=live/);
  assert.match(native,/new DefaultHttpDataSource\.Factory\(\)/);
  assert.match(native,/setDefaultRequestProperties\(requestHeaders\)/);
  assert.match(native,/new ExoPlayer\.Builder\(this\)/);
  assert.match(native,/LivePpvPlayback\.headers\(channel\.headers,ppvProfile\)/);
  assert.match(native,/LivePpvPlayback\.failure\(error\)/);
  assert.match(native,/tryNextPpvFeed\(\)/);
  assert.match(playlist,/http-referrer/);
  assert.match(playlist,/http-user-agent/);
});
test('Full mobile, TV and Lite use the same MainActivity player route', () => {
  assert.match(read('app/src/main/java/com/zerostreams/app/CategoryMainActivity.java'),/extends MainActivity/);
  assert.match(read('app/src/main/java/com/zerostreams/app/PresentationMainActivity.java'),/extends CategoryMainActivity/);
  assert.match(read('app/src/main/java/com/zerostreams/app/LiteMainActivity.java'),/extends PresentationMainActivity/);
  for (const flavor of ['mobile','tv','liteMobile','liteTv']) {
    const manifest = read('app/src/'+flavor+'/AndroidManifest.xml');
    assert.match(manifest,/\.PresentationMainActivity|\.LiteMainActivity/,flavor+' must use shared player route');
    assert.match(gradle,new RegExp('\\b'+flavor+'\\s*\\{'),flavor+' flavor must exist');
  }
});
test('Android stays Android-only and Shaka activity is retained but no longer selected', () => {
  assert.match(read('app/src/main/AndroidManifest.xml'),/\.LivePlayerActivity/);
  assert.match(read('app/src/main/AndroidManifest.xml'),/\.LivePpvShakaActivity/);
  assert.match(native,/video\.setUseController\(false\)/);
});
