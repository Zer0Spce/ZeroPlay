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
test('Carousel logos appear below metadata and Android TV Modern UI suppresses diagnostics',()=>{
 const android=read('app/src/main/java/com/zerostreams/app/MainActivity.java');
 const windows=read('windows/ui/app.js');
 assert.match(android,/getAssets\(\)\.open\("provider-logos\/"\+logoAsset\)/);
 assert.match(android,/if\(BuildConfig\.TV&&googleLayout\(\)\)status\.setVisibility\(View\.GONE\)/);
 const hero=windows.slice(windows.indexOf('function hero(){'),windows.indexOf('function watchlistHome(){'));
 const meta=hero.indexOf('${badge(item)}'),logo=hero.indexOf('class="hero-provider-logo"'),synopsis=hero.indexOf('<p>${escape(item.overview');
 assert.ok(meta>=0&&meta<logo&&logo<synopsis,'Provider wordmark must follow movie metadata and precede synopsis');
 assert.doesNotMatch(hero,/<div class="hero-title-line">\$\{providerName\?/);
 assert.doesNotMatch(windows,/<span class="eyebrow">\$\{escape\(heroEyebrow\(\)\)\}<\/span>/);
});
test('Rejected add-on search and guide features are disabled; basics remain',()=>{
 const android=read('app/src/main/java/com/zerostreams/app/MainActivity.java');
 const windows=read('windows/ui/app.js');
 assert.doesNotMatch(android,/SearchFilters2260|SportsGuide2260|searchOptions/);
 assert.doesNotMatch(windows,/ZeroUniversalSearch|ZeroLiveGuide|searchFilterHTML|sportsGuideWindow/);
 assert.match(android,/void onlineSearch\(\)/);
 assert.match(windows,/async function renderSports\(force=false\)/);
});
