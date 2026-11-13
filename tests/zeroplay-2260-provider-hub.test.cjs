'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('Windows Provider Hub has separate movie and series filters with safe TMDB sorts',()=>{
 const source=read('windows/ui/app.js');
 assert.match(source,/function providerHubTools\(\)/);
 assert.match(source,/providerSort==='new'/);
 assert.match(source,/primary_release_date[.]desc/);
 assert.match(source,/first_air_date[.]desc/);
 assert.match(source,/vote_average[.]desc/);
 assert.match(source,/with_watch_monetization_types:'flatrate'/);
 assert.match(source,/params[.]with_genres/);
 assert.ok(source.includes("state.settings.region"));
});
test('Android Provider Hub has D-pad buttons, sort/genre controls and safe region-aware API',()=>{
 const main=read('app/src/main/java/com/zerostreams/app/MainActivity.java');
 const api=read('app/src/main/java/com/zerostreams/app/ContentApi.java');
 assert.match(main,/void providerHubSortPicker\(/);
 assert.match(main,/void providerHubGenrePicker\(/);
 assert.match(main,/ContentApi[.]providerPageData\(key,providerMedia,pid,region,page,providerSorting,providerGenreId\)/);
 assert.match(api,/static String providerSortParam\(/);
 assert.match(api,/with_watch_monetization_types=flatrate/);
 assert.match(api,/page<1\|\|page>500/);
});
