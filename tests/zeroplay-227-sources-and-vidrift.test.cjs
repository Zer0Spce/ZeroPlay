'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const windows=require('../windows/playback-sources.cjs');
const web=require('../web/public/playback-sources.js');
const movie={type:'movie',id:597};
const tv={type:'tv',id:1399};

test('EmbedMaster uses documented movie/episode paths and remains trusted',()=>{
 for(const sources of [windows,web]){
  const movieUrl=sources.url(movie,{},'embedmaster');
  const tvUrl=sources.url(tv,{season:2,episode:3},'embedmaster');
  assert.match(movieUrl,/^https:\/\/embedmaster\.link\/movie\/597\?/);
  assert.match(tvUrl,/^https:\/\/embedmaster\.link\/tv\/1399\/2\/3\?/);
  assert.equal(sources.trusted(movieUrl),true);
 }
});
test('NexStream requires a credential and creates documented URL routes',()=>{
 const before=process.env.NEXSTREAM_API_KEY;
 try{
  delete process.env.NEXSTREAM_API_KEY;
  assert.throws(()=>windows.url(movie,{},'nexstream'),/not configured/);
  process.env.NEXSTREAM_API_KEY='nx_testkey';
  const url=windows.url(movie,{},'nexstream');
  assert.match(url,/^https:\/\/api\.codespecters\.com\/embed\/movie\/597\?/);
  assert.equal(new URL(url).searchParams.get('apikey'),'nx_testkey');
  assert.equal(windows.trusted(url),true);
 }finally{
  if(before===undefined)delete process.env.NEXSTREAM_API_KEY;else process.env.NEXSTREAM_API_KEY=before;
 }
});
test('VidRift guard is restricted to its player and supports input wake-up',()=>{
 for(const path of ['windows/assets/vidrift-idle-227.js','app/src/main/assets/vidrift-idle-227.js']){
  const script=fs.readFileSync(path,'utf8');
  assert.match(script,/location\.hostname!=='embed\.vidrift\.net'/);
  assert.match(script,/IDLE_MS=3200/);
  assert.match(script,/pointermove/);
  assert.match(script,/video\.paused/);
 }
});
