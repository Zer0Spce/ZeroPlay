'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const intel=require('../source-intelligence.cjs');
test('HTML document load is not counted as actual media playback',()=>{
  const stats={};intel.touch(stats,'vidstuck','load',1600,10000);
  assert.equal(stats.vidstuck.ok,0);assert.equal(stats.vidstuck.fail,0);
  intel.touch(stats,'vidstuck','progress',0,11000);assert.equal(stats.vidstuck.ok,1);
});
test('auto-source retains preferred source without evidence, but respects measured reliability',()=>{
  assert.equal(intel.best({},'vidstuck'),'vidstuck');
  const s={vidstuck:{ok:0,fail:8,failStreak:2,lastFailAt:1000},
           zxcstream:{ok:11,fail:1,load:1400}};
  assert.equal(intel.best(s,'vidstuck',2000),'zxcstream');
  assert.notEqual(intel.next(s,'zxcstream',[],'vidstuck',2000),'vidstuck');
});
test('offline, untrusted and quota-limited sources are excluded from fallback',()=>{
  const s={rawcast:{ok:500},'vidsrc-sh':{ok:500},vidrock:{ok:500}};
  for(const source of intel.rank(s,'rawcast'))assert.ok(intel.ONLINE.includes(source));
  assert.equal(intel.next(s,'vidstuck',intel.ONLINE.slice(1)),null);
});
test('failure cooldown expires and the preferred source may recover',()=>{
  const s={vidstuck:{ok:20,fail:3,failStreak:3,lastFailAt:1000},zxcstream:{ok:4,fail:1,load:1100}};
  assert.equal(intel.best(s,'vidstuck',2000),'zxcstream');
  assert.equal(intel.best(s,'vidstuck',intel.COOLDOWN_MS+5000),'vidstuck');
});
test('Smart Playback 2.0 uses progress signals and prevents recovery loops',()=>{
  const code=fs.readFileSync(path.join(__dirname,'..','main.cjs'),'utf8');
  assert.match(code,/sourceIntelligence[.]best/);
  assert.match(code,/sourceIntelligence[.]next/);
  assert.ok(code.includes("recordSource(currentPlaybackSource,'progress')"));
  assert.ok(code.includes("sourceRecoveryAttempted=recovering"));
  assert.ok(code.includes("false,alternate,true)"));
});
