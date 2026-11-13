'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const actual=read('app/src/main/java/com/zerostreams/app/ReleaseMainActivity.java');
test('Android TV launcher reaches ReleaseMainActivity.carousel and not the unused base only',()=>{
 const manifest=read('app/src/tv/AndroidManifest.xml'),p=read('app/src/main/java/com/zerostreams/app/PresentationMainActivity.java'),c=read('app/src/main/java/com/zerostreams/app/CategoryMainActivity.java');
 assert.match(manifest,/activity android:name="\.PresentationMainActivity"/);
 assert.match(p,/class PresentationMainActivity extends CategoryMainActivity/);
 assert.match(c,/class CategoryMainActivity extends ReleaseMainActivity/);
 assert.match(p,/@Override void carousel\(List<Catalog\.Item> all,int token\)\{\s*super\.carousel\(all,token\)/);
 assert.match(actual,/@Override void carousel\(List<Catalog\.Item> all,int token\)/);
});
test('The real carousel has Refresh picks in the top right with remote focus',()=>{
 const hero=actual.slice(actual.indexOf('    @Override void carousel('),actual.indexOf('    private String streamingServiceLabel('));
 assert.match(hero,/Button refreshPicks=button\("↻ Refresh picks",this::refreshHomePicks\)/);
 assert.match(hero,/hero\.addView\(refreshPicks,refreshAtTopRight\)/);
 assert.match(hero,/Gravity\.TOP\|Gravity\.RIGHT/);
 assert.match(hero,/refreshPicks\.setFocusable\(true\)/);
 assert.match(hero,/refreshPicks\.bringToFront\(\)/);
 assert.doesNotMatch(hero,/2\.2\.6\.4 TEST2|testMarker/);
});
test('Real carousel logo follows metadata and service text hides when image loads',()=>{
 const hero=actual.slice(actual.indexOf('    @Override void carousel('),actual.indexOf('    private String streamingServiceLabel('));
 const facts=hero.indexOf('info.addView(facts)'),brand=hero.indexOf('info.addView(sourceRow'),description=hero.indexOf('info.addView(description)');
 assert.ok(facts>=0&&facts<brand&&brand<description);
 assert.match(actual,/providerCarouselDrawable\(brand\)/);
 assert.match(actual,/logo\.setImageResource\(resource\)/);
 const paint=actual.slice(actual.indexOf('    private void paintVerifiedStreamingSource('),actual.indexOf('    private void showVerifiedStreamingSource('));
 assert.match(paint,/logo\.setVisibility\(View\.VISIBLE\)/);
 assert.match(paint,/label\.setText\(""\)/);
 assert.match(paint,/label\.setVisibility\(View\.GONE\)/);
 assert.match(paint,/label\.setText\("Streaming provider not verified"\)/);
 assert.match(paint,/label\.setVisibility\(View\.VISIBLE\)/);
 assert.doesNotMatch(paint,/label\.setText\(streamingServiceLabel\(brand\)\)/);
});
test('Official production package IDs and Windows release version remain intact',()=>{
 const gradle=read('app/build.gradle'),flow=read('.github/workflows/release-2.2.6.4.yml');
 assert.match(gradle,/applicationIdSuffix '\.tv'/);
 assert.match(gradle,/appLabel: 'ZeroPlay'/);
 assert.doesNotMatch(gradle,/test2264|TEST2/);
 assert.match(flow,/versionName='2\.2\.6\.4'/);
 assert.match(flow,/versionCode='69'/);
 assert.match(flow,/gh release create v2\.2\.6\.4/);
 const win=read('windows/main.cjs');
 assert.ok(win.includes(String.raw`2\.2\.6\.4$/.test(result.version)`));
});
test('Windows provider logos remain after metadata; refresh uses existing handler',()=>{
 const ui=read('windows/ui/app.js'),css=read('windows/ui/sunset-palette.css');
 const hero=ui.slice(ui.indexOf('function hero(){'),ui.indexOf('function watchlistHome(){'));
 const meta=hero.indexOf('${badge(item)}'),logo=hero.indexOf('class="hero-provider-logo"'),desc=hero.indexOf('<p>${escape(item.overview');
 assert.ok(meta>=0&&meta<logo&&logo<desc);
 assert.match(hero,/data-fresh-picks aria-label="Refresh featured picks"/);
 assert.match(css,/\.hero \.hero-refresh-picks\{position:absolute;top:17px;right:20px;z-index:100/);
});
