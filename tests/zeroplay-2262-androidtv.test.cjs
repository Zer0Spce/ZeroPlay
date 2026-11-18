'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('Provider Hub assets remain while carousel no longer needs compiled logo drawables',()=>{
 const a=read('app/src/main/java/com/zerostreams/app/MainActivity.java');
 const script=read('scripts/render-provider-wordmarks.py');
 assert.ok(script.includes('drawable-nodpi'));
 assert.ok(a.includes('void providerCards('));
 assert.ok(!a.includes('int providerCarouselDrawable('));
 const hero=a.slice(a.indexOf('    void carousel(List<Catalog.Item> all,int token)'),a.indexOf('    void upcomingRow('));
 assert.ok(!hero.includes('providerBadge'));
});
test('Android TV Continue Watching reads playback history and is pinned when resumable',()=>{
 const a=read('app/src/main/java/com/zerostreams/app/MainActivity.java');
 assert.match(a,/JSONArray played=new JSONArray\(prefs\.getString\("watchHistory"/);
 assert.match(a,/BuildConfig\.TV&&id\.equals\("continue"\)\)\{if\(!resumes\.isEmpty\(\)\)posterRow\("Continue watching",resumes,token\)/);
 assert.match(a,/BuildConfig\.TV&&id\.equals\("continue"\)\)\{if/);
 assert.match(a,/percent<95/);
});
test('TMDB Popular replaces streaming source and removes Refresh Picks',()=>{
 const a=read('app/src/main/java/com/zerostreams/app/MainActivity.java');
 assert.ok(a.includes('String carouselSource(){return "popular";}'));
 assert.ok(a.includes('CatalogDiskCache.load(this,"carousel:tmdb-popular")'));
 assert.ok(!a.includes('Button refreshPicks=button'));
});
test('Windows UI and movie/provider functionality remain untouched',()=>{
 const main=read('windows/main.cjs');
 assert.ok(main.includes(String.raw`2\.2\.6\.5$/.test(result.version)`)||main.includes(String.raw`2\.2\.6\.6$/.test(result.version)`)||main.includes(String.raw`2\.2\.6\.7$/.test(result.version)`)||main.includes(String.raw`2\.2\.6\.8$/.test(result.version)`));
});
