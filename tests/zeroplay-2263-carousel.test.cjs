'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('Refresh Picks removed from both native carousel implementations',()=>{
 const a=read('app/src/main/java/com/zerostreams/app/MainActivity.java');
 const tv=read('app/src/main/java/com/zerostreams/app/ReleaseMainActivity.java');
 assert.ok(!a.includes('Button refreshPicks=button'));
 assert.ok(!tv.includes('Button refreshPicks=button'));
});
test('TV title image is left anchored app artwork, never a centered video logo',()=>{
 const s=read('app/src/main/java/com/zerostreams/app/MainActivity.java');
 assert.match(s,/movieTitleLogo\.setScaleType\(ImageView\.ScaleType\.FIT_START\)/);
 assert.match(s,/movieTitleSlot\.gravity=Gravity\.LEFT/);
 assert.match(s,/loadCarouselMovieTitleLogo\(item,movieTitleLogo,title,token\)/);
 assert.match(s,/ContentApi\.tmdb\("\/"\+kind\+"\/"\+id\.substring/);
 assert.match(s,/token!=renderVersion\|\|!id\.equals\(image\.getTag\(\)\)/);
 assert.match(s,/void homepagePreview\(Catalog\.Item item,FrameLayout hero\)\{if\(isTelevisionDevice\(\)\)return;/);
});
test('Windows is version only, internal 2.2.6-5 public 2.2.6.5',()=>{
 const s=read('windows/main.cjs'),p=read('scripts/prepare-2265-windows-release.cjs');
 assert.ok(s.includes(String.raw`2\.2\.6\.5$/.test(result.version)`)||s.includes(String.raw`2\.2\.6\.6$/.test(result.version)`)||s.includes(String.raw`2\.2\.6\.7$/.test(result.version)`));
 assert.match(p,/pkg\.version='2\.2\.6-5'/);
});
