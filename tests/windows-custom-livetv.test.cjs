'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const os=require('node:os');
const path=require('node:path');

test('Windows Live TV can switch file, URL, and original playlists',async()=>{
  const playlists=require('../windows/playlist.cjs');
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'zeroplay-custom-m3u-'));
  const body=name=>`#EXTM3U\n#EXTINF:-1 group-title="Test",${name}\nhttps://example.com/${name.toLowerCase().replace(/\\s+/g,'-')}.m3u8\n`;
  const fetcher=async url=>new Response(body(url.includes('custom.example')?'URL Channel':'Original Channel'),{status:200,headers:{'content-type':'audio/x-mpegurl'}});
  const store=playlists.createStore(root,fetcher);
  try{
    let snap=await store.setCustomFile(body('File Channel'));
    assert.equal(snap.channels[0].name,'File Channel');
    assert.equal((await store.source('IPTV')).mode,'file');
    snap=await store.get('IPTV',false);
    assert.equal(snap.channels[0].name,'File Channel');
    snap=await store.setCustomUrl('https://custom.example/list.m3u');
    assert.equal(snap.channels[0].name,'URL Channel');
    assert.equal((await store.source('IPTV')).mode,'url');
    snap=await store.restoreOriginal();
    assert.equal((await store.source('IPTV')).mode,'original');
    assert.equal(snap.channels[0].name,'Original Channel');
  }finally{await fs.rm(root,{recursive:true,force:true});}
});
