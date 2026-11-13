'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('TV refresh picks button is pinned top right outside action row',()=>{
 const s=read('app/src/main/java/com/zerostreams/app/MainActivity.java');
 assert.match(s,/Button refreshPicks=button\("↻ Refresh picks",this::refreshHomePicks\)/);
 assert.match(s,/FrameLayout\.LayoutParams refreshPosition=new FrameLayout\.LayoutParams\(-2,dp\(46\),Gravity\.TOP\|Gravity\.RIGHT\)/);
 assert.match(s,/hero\.addView\(refreshPicks,refreshPosition\)/);
 assert.doesNotMatch(s,/actions\.addView\(refresh,rp\)/);
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
test('Windows is version only, internal 2.2.6-4 public 2.2.6.4',()=>{
 const s=read('windows/main.cjs'),p=read('scripts/prepare-2264-windows-release.cjs');
 assert.ok(s.includes(String.raw`2\.2\.6\.4$/.test(result.version)`));
 assert.match(p,/pkg\.version='2\.2\.6-3'/);
});
