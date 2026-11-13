'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const t=require('../ui/series-tracker-2260.js');
const eps=[{episode_number:1,name:'Pilot'},{episode_number:2,name:'The Plan'},{episode_number:3,name:'Finale'}];
test('TV tracker prioritizes partially watched episodes and next unwatched',()=>{
 const state={'tv:100:1:1':{percent:100},'tv:100:1:2':{percent:37}};
 const r=t.analyze(state,100,1,eps);
 assert.equal(r.watched,1);assert.equal(r.total,3);
 assert.deepEqual(r.next,{season:1,episode:2,name:'The Plan',continue:true});
});
test('TV tracker ignores unrelated profiles and specials do not mix with season 1',()=>{
 const state={'tv:100:0:1':{percent:100},'tv:100:1:1':{percent:0},'tv:101:1:1':{percent:100}};
 assert.equal(t.seriesWatched(state,100),1);
 assert.equal(t.analyze(state,100,1,eps).watched,0);
 assert.equal(t.analyze(state,100,0,[{episode_number:1,name:'Special'}]).watched,1);
});
test('completed seasons do not fabricate a next episode',()=>{
 const p={'tv:100:2:1':{percent:100},'tv:100:2:2':{percent:100}};
 assert.equal(t.analyze(p,100,2,eps.slice(0,2)).next,null);
 assert.equal(t.analyze(p,100,2,[]).total,0);
});
test('detail page visibly exposes per-season progress and next episode button',()=>{
 const s=fs.readFileSync(path.join(__dirname,'..','ui','app.js'),'utf8');
 assert.ok(s.includes('ZeroSeriesTracker.analyze('));
 assert.ok(s.includes('data-play-next-episode'));
 assert.ok(s.includes('Season progress'));
});
