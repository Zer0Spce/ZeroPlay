'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const desktop=require('../windows/playback-sources.cjs'),web=require('../web/public/playback-sources.js');
const expected=[
  ['mappletv','MappleTV (4K HDR)','mapple.fun','/watch/movie/550','/watch/tv/1399-0-2'],
  ['vidly','Vidly (4K)','vidly.pro','/movie/550','/tv/1399/0/2'],
  ['vidcore','Vidcore (4K)','vidcore.org','/embed/movie/550','/embed/tv/1399/0/2'],
  ['chillflix','Chillflix (4K)','www.chillflix.pw','/embed/movie/550','/embed/tv/1399/0/2']
];
test('new sources are selectable on desktop and web and use documented player hosts',()=>{
 for(const lib of [desktop,web]){
  for(const [id,label,host,moviePath,tvPath] of expected){
   assert.equal(lib.source(id).name,label);
   const movie=new URL(lib.url({id:550,type:'movie'},{},id));
   const tv=new URL(lib.url({id:1399,type:'tv'},{season:0,episode:2},id));
   assert.equal(movie.hostname,host);assert.equal(movie.pathname,moviePath);
   assert.equal(tv.pathname,tvPath);assert.equal(lib.trusted(movie.href),true);
   assert.equal(lib.trusted('https://'+host+'.example.invalid/'+moviePath),false);
   if(id==='chillflix')assert.equal(movie.searchParams.get('prefer4k'),'1');
  }
 }
});
test('Android source lists retain trusted origin checks and source ordering',()=>{
 const android=fs.readFileSync('app/src/main/java/com/zerostreams/app/PlaybackSources.java','utf8');
 const player=fs.readFileSync('app/src/main/java/com/zerostreams/app/BrowserPlayerActivity.java','utf8');
 for(const [id,label,host] of expected){assert.ok(android.includes('"'+id+'"'));assert.ok(android.includes(label));assert.ok(android.includes('https://'+host));assert.ok(player.includes(host));}
 assert.ok(android.includes('"chillflix","rawcast"'));
});
test('Smart Playback includes selectable sources in its evidence-based ranking',()=>{const intel=require('../windows/source-intelligence.cjs');for(const [id] of expected){assert.ok(intel.ONLINE.includes(id));assert.equal(intel.best({},id),id);}});
test('Web CSP allows only exact documented new player origins',()=>{
 const html=fs.readFileSync('web/public/index.html','utf8');
 for(const [, ,host] of expected)assert.ok(html.includes('https://'+host));
 assert.ok(!html.includes('https://*.'));
});
