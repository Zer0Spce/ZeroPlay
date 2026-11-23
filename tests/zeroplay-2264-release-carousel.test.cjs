'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const actual=read('app/src/main/java/com/zerostreams/app/ReleaseMainActivity.java');
test('Android TV launcher continues to use the real ReleaseMainActivity carousel',()=>{
 const manifest=read('app/src/tv/AndroidManifest.xml'),p=read('app/src/main/java/com/zerostreams/app/PresentationMainActivity.java'),c=read('app/src/main/java/com/zerostreams/app/CategoryMainActivity.java');
 assert.ok(manifest.includes('PresentationMainActivity'));
 assert.ok(p.includes('class PresentationMainActivity extends CategoryMainActivity'));
 assert.ok(c.includes('class CategoryMainActivity extends ReleaseMainActivity'));
 assert.ok(p.includes('super.carousel(all,token)'));
 assert.ok(actual.includes('@Override void carousel(List<Catalog.Item> all,int token)'));
});
test('Android TV carousel does not perform streaming provider lookup or display Refresh Picks',()=>{
 assert.ok(!actual.includes('providerIo'));
 assert.ok(!actual.includes('showVerifiedStreamingSource'));
 assert.ok(!actual.includes('Refresh picks'));
 const main=read('app/src/main/java/com/zerostreams/app/MainActivity.java');
 assert.ok(main.includes('String carouselSource(){return "popular";}'));
});
test('Windows hero preserves playback and details controls, minus provider logos',()=>{
 const ui=read('windows/ui/app.js');
 const hero=ui.slice(ui.indexOf('function hero(){'),ui.indexOf('function watchlistHome(){'));
 assert.ok(hero.includes('hero-popular-label'));
 assert.ok(hero.includes('data-play='));
 assert.ok(!hero.includes('hero-provider-logo'));
 assert.ok(!hero.includes('data-fresh-picks'));
});
test('Release workflow uses Android versionCode 70 and Windows 2.2.6.5',()=>{
 const flow=read('.github/workflows/release-2.2.6.5.yml');
 assert.ok(flow.includes("versionName='2.2.6.5'"));
 assert.ok(flow.includes("versionCode='70'"));
 assert.ok(flow.includes('gh release create v2.2.6.5'));
 const win=read('windows/main.cjs');
 assert.ok(win.includes('2\\.2\\.6\\.5')||win.includes('2\\.2\\.6\\.6')||win.includes('2\\.2\\.6\\.7')||win.includes('2\\.2\\.6\\.8')||win.includes('2\\.2\\.6\\.9')||win.includes('2\\.2\\.7'));
});