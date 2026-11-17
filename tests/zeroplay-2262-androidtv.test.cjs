'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('Compiled provider icons stay available outside the featured carousel',()=>{
 const a=read('app/src/main/java/com/zerostreams/app/MainActivity.java');
 const script=read('scripts/render-provider-wordmarks.py');
 for(const key of ['netflix','hulu','disney','max','apple','paramount','peacock','youtube_tv'])assert.ok(a.includes('R.drawable.zero_provider_'+key));
 assert.ok(script.includes('drawable-nodpi'));
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
 assert.ok(main.includes(String.raw`2\.2\.6\.5$/.test(result.version)`));
});
