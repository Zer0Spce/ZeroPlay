'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const g=require('../ui/live-guide-2260.js');
const ts=(date)=>Date.parse(date)/1000;
test('PHT midnight crossing follows Asia/Manila not UTC calendar',()=>{
 const now=ts('2026-11-13T15:30:00Z'); // 23:30 Friday PHT
 const today={start:ts('2026-11-13T15:50:00Z')}; // 23:50 PHT
 const tomorrow={start:ts('2026-11-13T16:10:00Z')}; // 00:10 Saturday PHT
 assert.equal(g.eligible(today,'today',now),true);
 assert.equal(g.eligible(tomorrow,'today',now),false);
 assert.equal(g.eligible(tomorrow,'tomorrow',now),true);
 assert.equal(g.eligible(tomorrow,'week',now),true);
 assert.match(g.time(today.start),/PHT$/);
});
test('live, ended and unscheduled events are labeled without invented start times',()=>{
 const now=ts('2026-11-13T12:00:00Z');
 assert.equal(g.countdown({alwaysLive:true},now),'LIVE · 24/7');
 assert.equal(g.countdown({},now),'Schedule unavailable');
 assert.equal(g.countdown({start:now-100,end:now+100},now),'LIVE');
 assert.equal(g.countdown({start:now-1000,end:now-100},now),'Ended');
 assert.equal(g.countdown({start:now+3600},now),'Starts in 1h');
 assert.equal(g.eligible({start:0},'today',now),false);
});
test('Sports interface exposes Today/Tomorrow/This Week with PHT schedule',()=>{
 const source=fs.readFileSync(path.join(__dirname,'..','ui','app.js'),'utf8');
 assert.ok(source.includes("data-guide-window"));
 assert.ok(source.includes("ZeroLiveGuide.eligible("));
 assert.ok(source.includes("ZeroLiveGuide.countdown("));
 assert.ok(source.includes("ZeroLiveGuide.time("));
});
