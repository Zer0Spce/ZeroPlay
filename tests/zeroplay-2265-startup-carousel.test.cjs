'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('Native popular carousel caches last results and fetches fresh TMDB at startup',()=>{
 const app=read('app/src/main/java/com/zerostreams/app/MainActivity.java');
 const api=read('app/src/main/java/com/zerostreams/app/ContentApi.java');
 assert.ok(app.includes('ready=true;load();if(category.equals("Home"))primePopularCarousel()'));
 assert.ok(app.includes('CatalogDiskCache.load(this,"carousel:tmdb-popular")'));
 assert.ok(app.includes('CatalogDiskCache.save(this,"carousel:tmdb-popular",ready)'));
 assert.ok(app.includes('ensureCarouselSource("popular")'));
 assert.ok(api.includes('mode.equals("popular")'));
 assert.ok(api.includes('path="/movie/popular"'));
});
test('TV, mobile, and Windows hero never request provider logos or display Refresh Picks',()=>{
 const main=read('app/src/main/java/com/zerostreams/app/MainActivity.java');
 const tv=read('app/src/main/java/com/zerostreams/app/ReleaseMainActivity.java');
 const desktop=read('windows/ui/app.js'),html=read('windows/ui/index.html');
 const mainHero=main.slice(main.indexOf('    void carousel(List<Catalog.Item> all,int token)'),main.indexOf('    void upcomingRow('));
 const deskHero=desktop.slice(desktop.indexOf('function hero(){'),desktop.indexOf('function watchlistHome(){'));
 for(const body of [mainHero,tv,deskHero])for(const removed of ['Refresh picks','providerBadge','showVerifiedStreamingSource','hero-provider-logo'])assert.ok(!body.includes(removed),removed);
 assert.ok(!html.includes('data-fresh-picks'));
 assert.ok(main.includes('String carouselEyebrow(){return "WHAT\u0027S POPULAR ON TMDB";}'));
 assert.ok(deskHero.includes('POPULAR ON TMDB'));
});
test('Windows Popular loads before slower shelves and avoids provider-specific discovery requests',()=>{
 const app=read('windows/ui/app.js'),home=read('windows/ui/fresh-home.js');
 assert.ok(app.includes("popular:['/movie/popular','movie']"));
 assert.ok(app.includes("const popularPromise=api('/movie/popular'"));
 assert.ok(app.includes("const earlyPopular=await popularPromise"));
 assert.ok(app.includes("const results=await resultsPromise"));
 assert.ok(home.includes("selected.hero=(base.popular||[])"));
 assert.ok(!home.includes('ZeroStreamingCarousel.providers('));
 assert.ok(!home.includes('ZeroStreamingCarousel.topTen('));
});
test('Release contains four signed Android flavors and Windows updater and never publishes on PR',()=>{
 const flow=read('.github/workflows/release-2.2.6.5.yml');
 assert.ok(flow.includes('assembleMobileRelease :app:assembleTvRelease :app:assembleLiteMobileRelease :app:assembleLiteTvRelease'));
 assert.ok(flow.includes('ZeroPlayUpdater.exe'));
 assert.ok(flow.includes('gh release create v2.2.6.5'));
 assert.ok(flow.includes("if: github.event_name != 'pull_request'"));
 assert.ok(flow.includes("versionCode='70'"));
});
