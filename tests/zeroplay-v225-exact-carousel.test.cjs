'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const source=read('app/src/main/java/com/zerostreams/app/MainActivity.java');
const extract=(s,begin,end)=>{const i=s.indexOf(begin),j=s.indexOf(end,i);assert.ok(i>=0&&j>i);return s.slice(i,j);};
test('Full carousel renderer is exactly the v2.2.5 release except one explicit top-right refresh overlay',()=>{
 const compiled=extract(source,'    void carousel(List<Catalog.Item> all,int token){','    List<Catalog.Item> localItems(){');
 const fixture=read('tests/fixtures/v225-carousel.java.txt');
 const cleaned=compiled.replace(/        \/\/ ZERO225_TEST_OVERLAY_START:[\s\S]*?        \/\/ ZERO225_TEST_OVERLAY_END\n/,'');
 assert.equal(cleaned,fixture);
 assert.equal((compiled.match(/Button refreshPicks=button/g)||[]).length,1);
 assert.match(compiled,/hero\.addView\(refreshPicks,refreshPosition\)/);
 assert.match(compiled,/refreshPicks\.bringToFront\(\)/);
 assert.match(compiled,/refreshPicks\.setVisibility\(View\.VISIBLE\)/);
 assert.match(compiled,/Gravity\.TOP\|Gravity\.RIGHT/);
 assert.doesNotMatch(compiled,/movieTitleLogo|providerBadge/);
});
test('Movie preview logic is also copied exactly from v2.2.5',()=>{
 const live=extract(source,'    void homepagePreview(Catalog.Item item,FrameLayout hero){','    void focusPreview(');
 assert.equal(live,read('tests/fixtures/v225-homepage-preview.java.txt'));
});
test('Test package cannot overwrite official ZeroPlay or the earlier TEST app',()=>{
 const gradle=read('app/build.gradle');
 assert.match(gradle,/applicationIdSuffix '\.tv\.test225'/);
 assert.match(gradle,/appLabel: 'ZeroPlay 225 TEST'/);
 const wf=read('.github/workflows/zeroplay-exact-v225-carousel-test.yml');
 assert.match(wf,/contents: read/);
 assert.match(wf,/ZeroPlay-2\.2\.5-EXACT-TEST-Android-TV\.apk/);
 assert.doesNotMatch(wf,/gh release|contents: write|release\/tags/);
});
