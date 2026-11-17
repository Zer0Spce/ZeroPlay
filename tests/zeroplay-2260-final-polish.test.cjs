'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const read=path=>fs.readFileSync(path,'utf8');
test('Android filmography cards activate native details on tap and TV remote',()=>{
 const film=read('app/src/main/java/com/zerostreams/app/PersonFilmographyActivity.java');
 const main=read('app/src/main/java/com/zerostreams/app/MainActivity.java');
 assert.match(film,/card\.setOnClickListener\(v->\{Intent intent=new Intent\(this,FixedMainActivity\.class\)/);
 assert.match(main,/void openFilmographyCredit\(Intent intent\)/);
 assert.match(main,/details\(selected\)/);
});
test('Featured carousel shows TMDB popular titles without provider logos',()=>{
 const android=read('app/src/main/java/com/zerostreams/app/MainActivity.java');
 const windows=read('windows/ui/app.js');
 assert.ok(android.includes('String carouselSource(){return "popular";}'));
 assert.ok(android.includes('status.setVisibility(View.GONE)'));
 const hero=windows.slice(windows.indexOf('function hero(){'),windows.indexOf('function watchlistHome(){'));
 assert.ok(hero.includes('POPULAR ON TMDB'));
 assert.ok(!hero.includes('hero-provider-logo'));
 assert.ok(!hero.includes('data-fresh-picks'));
});
test('Rejected add-on search and guide features are disabled; basics remain',()=>{
 const android=read('app/src/main/java/com/zerostreams/app/MainActivity.java');
 const windows=read('windows/ui/app.js');
 assert.doesNotMatch(android,/SearchFilters2260|SportsGuide2260|searchOptions/);
 assert.doesNotMatch(windows,/ZeroUniversalSearch|ZeroLiveGuide|searchFilterHTML|sportsGuideWindow/);
 assert.match(android,/void onlineSearch\(\)/);
 assert.match(windows,/async function renderSports\(force=false\)/);
});
