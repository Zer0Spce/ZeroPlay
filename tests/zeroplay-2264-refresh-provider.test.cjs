'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const native=read('app/src/main/java/com/zerostreams/app/MainActivity.java'),desktop=read('windows/ui/app.js');
test('Native streaming-provider wordmark follows movie metadata before synopsis',()=>{
 const hero=native.slice(native.indexOf('void carousel('),native.indexOf('List<Catalog.Item> localItems(){'));
 const facts=hero.indexOf('info.addView(facts);'),logo=hero.indexOf('info.addView(providerBadge,badgeSlot);'),desc=hero.indexOf('info.addView(description,');
 assert.ok(facts>=0&&facts<logo&&logo<desc,'Logo must be between facts and synopsis');
 assert.match(hero,/providerBadge\.setImageResource\(drawable\)/);
 assert.match(hero,/providerBrandKey\(item\.raw\.optString\("providerBrand"\)\)/);
 assert.match(hero,/providerBadge\.setVisibility\(View\.VISIBLE\)/);
 assert.match(hero,/providerFallback\.setVisibility\(View\.VISIBLE\)/);
});
test('Refresh Picks is guaranteed top right and is not gated by TV build flavor',()=>{
 const hero=native.slice(native.indexOf('void carousel('),native.indexOf('List<Catalog.Item> localItems(){'));
 assert.match(hero,/Button refreshPicks=button\("↻ Refresh picks",this::refreshHomePicks\)/);
 assert.match(hero,/Gravity\.TOP\|Gravity\.RIGHT/);
 assert.match(hero,/refreshPicks\.setBackground\(shape\(Color\.rgb\(224,36,54\),Color\.WHITE\)\)/);
 assert.match(hero,/refreshPicks\.setElevation\(dp\(28\)\)/);
 assert.match(hero,/refreshPicks\.bringToFront\(\)/);
 assert.match(hero,/refreshPicks\.setVisibility\(View\.VISIBLE\)/);
 assert.doesNotMatch(hero,/if\(BuildConfig\.TV\)\{\s*Button refreshPicks/);
 assert.match(native,/void homepagePreview\(Catalog\.Item item,FrameLayout hero\)\{if\(isTelevisionDevice\(\)\)return;/);
});
test('Windows source logo is below metadata above synopsis; refresh reuses existing handler',()=>{
 const hero=desktop.slice(desktop.indexOf('function hero(){'),desktop.indexOf('function watchlistHome(){'));
 const facts=hero.indexOf('${badge(item)}'),logo=hero.indexOf('class="hero-provider-logo"'),desc=hero.indexOf('<p>${escape(item.overview');
 assert.ok(facts>=0&&facts<logo&&logo<desc,'Windows logo placement');
 assert.match(hero,/data-fresh-picks aria-label="Refresh featured picks"/);
 assert.match(desktop,/window\.ZeroFreshHome\.request\(\)/);
 assert.match(read('windows/ui/sunset-palette.css'),/\.hero \.hero-refresh-picks\{position:absolute;top:17px;right:20px;z-index:100/);
});
test('TEST packages are isolated and CI never publishes a release',()=>{
 const gradle=read('app/build.gradle'),flow=read('.github/workflows/zeroplay-2264-provider-refresh-test.yml'),prep=read('scripts/prepare-2264-windows-test.cjs');
 assert.match(gradle,/applicationIdSuffix '\.tv\.test2264'/);
 assert.match(gradle,/appLabel: 'ZeroPlay 2264 TEST'/);
 assert.match(flow,/permissions:\s*contents: read/);
 assert.doesNotMatch(flow,/gh release|contents: write|\n  release:\n/);
 assert.match(prep,/const production=false;/);
 assert.match(prep,/ZeroPlay-2\.2\.6\.4-TEST-Windows-x64/);
});
