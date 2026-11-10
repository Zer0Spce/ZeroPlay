'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {parse}=require('../playlist.cjs');
const root=path.join(__dirname,'..');
test('Windows playlist reads clean names and bounded status metadata',()=>{
 const playlist='#EXTM3U\n#EXTINF:-1 x-stream-status="verified",WWE RAW — Feed 1\nhttps://cdn.example/wwe.m3u8\n#EXTINF:-1 x-stream-status="reachable",WWE RAW — Feed 2\nhttps://cdn.example/wwealt.m3u8\n#EXTINF:-1 x-stream-status="bogus",Legacy\nhttps://cdn.example/legacy.m3u8';
 const channels=parse(playlist);
 assert.deepEqual(channels.map(x=>x.streamStatus),['verified','reachable','unverified']);
 assert.equal(channels[0].name,'WWE RAW — Feed 1');
});
test('Windows Live PPV shows nonclickable status badges and no favorite action',()=>{
 const s=fs.readFileSync(path.join(root,'ui','app.js'),'utf8');
 assert.match(s,/function streamBadgeHTML\(channel\)/);
 assert.match(s,/stream-pill-live/);
 assert.match(s,/stream-pill-verified/);
 assert.match(s,/stream-pill-reachable/);
 assert.match(s,/stream-pill-unverified/);
 assert.match(s,/live\?'':'<button data-favorite-channel/);
 const css=fs.readFileSync(path.join(root,'ui','style.css'),'utf8');
 assert.match(css,/pointer-events:none/);
});
test('Updater remains open with visible status and persistent file logging',()=>{
 const source=fs.readFileSync(path.join(root,'updater-helper','Program.cs'),'utf8');
 assert.match(source,/WaitForConfirmation/);
 assert.match(source,/ZeroPlayUpdater.log/);
 assert.match(source,/Copy logs/);
 assert.doesNotMatch(source,/await Task.Delay\(2200\);\s*Close\(\);/);
 assert.match(source,/close.Enabled = true/);
 const pkg=require('../package.json');
 assert.ok(pkg.build.extraFiles.some(x=>x.to==='ZeroPlayUpdater.exe'));
 const js=fs.readFileSync(path.join(root,'updater.cjs'),'utf8');
 assert.match(js,/windowsHide:false/);
});
