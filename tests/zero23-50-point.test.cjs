'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

const expected=[
  'For You','Taste Profile','Adaptive Home','Contextual Because You Watched','Household Profiles','Continue Watching cleanup','Finish It','Series Hub','Episode notifications','Release Radar',
  'Follow people/directors/franchises','Franchise progress','Collection timelines','Watchlist organization','Watchlist Roulette','Watchlist Voting','Calendar','Newly Added catalog','Decades','Awards & acclaim',
  'Seasonal Home','Philippines Trends','Critics vs Audience lens','Advanced Search','Aliases & typo tolerance','Universal Search','TV voice search','Habit-based suggestions','TV quick panel','Remote shortcuts',
  'Focus memory','Per-profile UI','Kids/Guest profiles','Avatars','Ambient artwork','Poster density','Accessibility','Quick presets','Storage dashboard','Smart cache',
  'Network-aware artwork','Offline catalog','Profile import/export','LAN sync packet','Backup scheduler','Unified Home state','What Changed','Feature Tips','Diagnostics health page','Profile backup foundations'
];

test('50-point contract is complete and uniquely named',()=>{
  assert.equal(expected.length,50);
  assert.equal(new Set(expected).size,50);
  for(const file of ['web/public/zero23.js','windows/ui/zero23.js','app/src/main/java/com/zerostreams/app/Zero23Store.java']){
    const source=read(file);
    for(const name of expected)assert.ok(source.includes(name),`${file} missing feature: ${name}`);
  }
});

test('web and windows load the additive 2.3 layer after their existing app',()=>{
  const webHtml=read('web/public/index.html'),webLoader=read('web/public/top10-today.js');
  const winHtml=read('windows/ui/index.html'),winLoader=read('windows/ui/home-visuals.js');
  assert.ok(webHtml.indexOf('app.js')<webHtml.indexOf('top10-today.js'),'web 2.3 loader must run after app.js');
  assert.match(webLoader,/zero23\.js/);assert.match(webLoader,/zero23\.css/);assert.match(webLoader,/2\.3 test branch additive loader/i);
  assert.ok(winHtml.indexOf('app.js')<winHtml.indexOf('home-visuals.js'),'Windows 2.3 loader must run after app.js');
  assert.match(winLoader,/zero23\.js/);assert.match(winLoader,/zero23\.css/);assert.match(winLoader,/2\.3 test branch additive loader/i);
});

test('android launchers wrap existing presentation layers instead of player activities',()=>{
  const normal=read('app/src/main/java/com/zerostreams/app/Zero23MainActivity.java');
  const lite=read('app/src/main/java/com/zerostreams/app/Zero23LiteMainActivity.java');
  const hub=read('app/src/main/java/com/zerostreams/app/Zero23HubActivity.java');
  assert.match(normal,/extends PresentationMainActivity/);
  assert.match(lite,/extends LiteMainActivity/);
  assert.doesNotMatch(normal,/PlayerActivity/);
  assert.doesNotMatch(lite,/PlayerActivity/);
  assert.match(hub,/never starts or alters playback/i);
  for(const file of ['app/src/mobile/AndroidManifest.xml','app/src/tv/AndroidManifest.xml','app/src/privateTv/AndroidManifest.xml'])assert.match(read(file),/\.Zero23MainActivity/);
  for(const file of ['app/src/liteMobile/AndroidManifest.xml','app/src/liteTv/AndroidManifest.xml'])assert.match(read(file),/\.Zero23LiteMainActivity/);
  assert.match(read('app/src/main/AndroidManifest.xml'),/\.Zero23HubActivity/);
});

test('2.3 test branch is visibly test-only and retains 2.2.2 package metadata',()=>{
  assert.match(read('docs/zero23-50-point-plan.md'),/test-only/i);
  assert.match(read('app/build.gradle'),/versionName '2\.2\.2'/);
  assert.match(read('windows/package.json'),/"version": "2\.2\.2"/);
  assert.match(read('web/public/zero23.js'),/2\.3-test/);
  assert.match(read('app/src/main/java/com/zerostreams/app/Zero23Store.java'),/2\.3-test/);
});

test('2.3 source does not call player launch/change APIs directly',()=>{
  const web=read('web/public/zero23.js');
  const win=read('windows/ui/zero23.js');
  const android=read('app/src/main/java/com/zerostreams/app/Zero23HubActivity.java');
  for(const source of [web,win]){
    assert.doesNotMatch(source,/window\.zero\.play\s*\(/);
    assert.doesNotMatch(source,/playbackSources\.url\s*\(/);
    assert.doesNotMatch(source,/sourceFor\s*\(/);
  }
  assert.doesNotMatch(android,/new Intent\([^\n]*PlayerActivity/);
  assert.doesNotMatch(android,/PlaybackSources\./);
});
