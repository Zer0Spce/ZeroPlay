'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const actual=read('app/src/main/java/com/zerostreams/app/ReleaseMainActivity.java');
test('TV launcher uses Presentation -> Category -> Release real carousel, not MainActivity.carousel',()=>{
 const manifest=read('app/src/tv/AndroidManifest.xml');
 const presentation=read('app/src/main/java/com/zerostreams/app/PresentationMainActivity.java');
 const category=read('app/src/main/java/com/zerostreams/app/CategoryMainActivity.java');
 assert.match(manifest,/activity android:name="\.PresentationMainActivity"/);
 assert.match(presentation,/class PresentationMainActivity extends CategoryMainActivity/);
 assert.match(category,/class CategoryMainActivity extends ReleaseMainActivity/);
 assert.match(presentation,/@Override void carousel\(List<Catalog\.Item> all,int token\)\{\s*super\.carousel\(all,token\)/);
 assert.match(actual,/@Override void carousel\(List<Catalog\.Item> all,int token\)/);
});
test('Actual carousel contains visible branded provider row between facts and description',()=>{
 const carousel=actual.slice(actual.indexOf('    @Override void carousel('),actual.indexOf('    private String streamingServiceLabel('));
 const i=carousel.indexOf('info.addView(facts)'),j=carousel.indexOf('info.addView(sourceRow'),k=carousel.indexOf('info.addView(description)');
 assert.ok(i>=0&&i<j&&j<k);
 assert.match(carousel,/sourceRow\.setMinimumHeight\(dp\(44\)\)/);
 assert.match(carousel,/sourceRow\.addView\(sourceLogo/);
 assert.match(carousel,/sourceRow\.addView\(sourceLabel/);
 assert.match(carousel,/showVerifiedStreamingSource\(item,title,sourceLogo,sourceLabel\)/);
 assert.match(actual,/providerCarouselDrawable\(brand\)/);
 assert.match(actual,/logo\.setImageResource\(resource\)/);
 assert.match(actual,/label\.setText\("Streaming provider not verified"\)/);
 assert.match(actual,/ContentApi\.tmdb\("\/"\+media\+"\/"\+itemId\.substring.*\/watch\/providers/);
});
test('Actual TV hero refresh is top-right focusable and tagged with a distinct TEST2 marker',()=>{
 const carousel=actual.slice(actual.indexOf('    @Override void carousel('),actual.indexOf('    private String streamingServiceLabel('));
 assert.match(carousel,/Button refreshPicks=button\("↻ Refresh picks",this::refreshHomePicks\)/);
 assert.match(carousel,/hero\.addView\(refreshPicks,refreshAtTopRight\)/);
 assert.match(carousel,/Gravity\.TOP\|Gravity\.RIGHT/);
 assert.match(carousel,/refreshPicks\.setElevation\(dp\(32\)\)/);
 assert.match(carousel,/refreshPicks\.bringToFront\(\)/);
 assert.match(carousel,/testMarker=text\("2\.2\.6\.4 TEST2"/);
});
test('APK is separate from production and workflow cannot publish release',()=>{
 const gradle=read('app/build.gradle'),wf=read('.github/workflows/zeroplay-2264-real-carousel-tv-test.yml');
 assert.match(gradle,/applicationIdSuffix '\.tv\.test2264fix'/);
 assert.match(gradle,/appLabel: 'ZeroPlay 2264 TEST2'/);
 assert.match(wf,/permissions:\s*contents: read/);
 assert.doesNotMatch(wf,/gh release|\n  release:\n|contents: write/);
});
