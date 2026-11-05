'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const windows=require('../windows/playback-sources.cjs');
const web=require('../web/public/playback-sources.js');
const read=path=>fs.readFileSync(path,'utf8');
const expected=[
  {id:'vidrock',host:'vidrock.to',prefix:'/'},
  {id:'vidnest',host:'vidnest.fun',prefix:'/'},
  {id:'vidrift',host:'embed.vidrift.net',prefix:'/embed/'},
];
test('New sources use documented TMDB embed routes on Windows and web',()=>{
  for(const app of [windows,web])for(const x of expected){
    assert.equal(app.sources.find(s=>s.id===x.id)?.name,x.id==='vidrock'?'VidRock':x.id==='vidnest'?'VidNest':'VidRift');
    const movie=new URL(app.url({type:'movie',id:299534},{},x.id));
    const episode=new URL(app.url({type:'tv',id:1399},{season:1,episode:2},x.id));
    assert.equal(movie.origin,'https://'+x.host);
    assert.equal(movie.pathname,x.prefix+'movie/299534');
    assert.equal(episode.pathname,x.prefix+'tv/1399/1/2');
    assert.equal(app.trusted(movie.href),true);
    assert.equal(app.trusted(episode.href),true);
    assert.equal(app.trusted('http://'+x.host+'/movie/299534'),false);
    assert.equal(app.trusted('https://'+x.host+'.attacker.example/movie/299534'),false);
    assert.equal(app.trusted('https://'+x.host+':8443/movie/299534'),false);
  }
});
test('Existing IDs stay stable and only the VidSrc display name changes',()=>{
  for(const app of [windows,web]){
    assert.deepEqual(app.sources.map(x=>x.id).slice(0,4),['vidstuck','zxcstream','embedwave','vidsrc-sh']);
    assert.equal(app.sources.find(x=>x.id==='vidsrc-sh')?.name,'VidSrc [Offline]');
  }
  assert.equal(windows.sources.at(-1).id,'rawcast');
  const android=read('app/src/main/java/com/zerostreams/app/PlaybackSources.java');
  assert.match(android,/IDS=\{"vidstuck","zxcstream","embedwave","vidsrc-sh","vidrock","vidnest","vidrift","rawcast"\}/);
  assert.match(android,/VidSrc \[Offline\]/);
});
test('VidRift iframe is not sandboxed; origin and navigation restrictions remain enabled',()=>{
  const webPlayer=read('web/public/browser.js');
  const html=read('web/public/index.html');
  const android=read('app/src/main/java/com/zerostreams/app/BrowserPlayerActivity.java');
  const main=read('windows/main.cjs');
  const core=read('windows/core.cjs');
  assert.match(webPlayer,/document\.createElement\('iframe'\)/);
  assert.doesNotMatch(webPlayer,/\.sandbox\s*=|setAttribute\(['"]sandbox|sandbox\.add/);
  assert.match(html,/frame-src[^>]*https:\/\/embed\.vidrift\.net/);
  assert.match(android,/embed\.vidrift\.net/);
  assert.match(main,/embed\.vidrift\.net/);
  assert.match(core,/embed\.vidrift\.net/);
  assert.match(main,/function playerOrigin\(url\)\{return sources\.trusted\(url\)/);
  assert.match(android,/PlaybackSources\.trusted\(address\)/);
});
test('Provider choices are available in Windows, Android and web settings',()=>{
  const android=read('app/src/main/java/com/zerostreams/app/MainActivity.java');
  const winUi=read('windows/ui/app.js');
  const winSettings=read('windows/ui/index.html');
  const webSettings=read('web/public/index.html');
  assert.match(android,/copyOf\(PlaybackSources\.NAMES,PlaybackSources\.NAMES\.length-1\)/);
  for(const id of ['vidrock','vidnest','vidrift']){
    assert.ok(winUi.includes("['"+id+"'"));
    assert.ok(winSettings.includes('value="'+id+'"'));
    assert.ok(webSettings.includes('value="'+id+'"'));
  }
});
