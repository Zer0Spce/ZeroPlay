'use strict';
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const engine = require('../windows/ui/figma-streaming-engine.js');
const now = Date.parse('2026-11-12T12:00:00Z');
function movie(id,more={}) {
  return { id, type:'movie', title:'Film '+id, overview:'Sample', date:'2019-08-08',
    rating:8.2,voteCount:900,popularity:30,genreIds:[28],
    poster:'/poster/'+id,backdrop:'/backdrop/'+id,...more };
}
function tv(id,more={}) { return movie(id,{type:'tv',...more}); }
function fixtures() {
  return {
    now,seed:'demo',perRail:10,
    pools:{
      tv:Array.from({length:30},(_,i)=>tv(500+i)),
      day:Array.from({length:30},(_,i)=>movie(i+1)),
      week:Array.from({length:30},(_,i)=>movie(i+15)),
      movies:Array.from({length:30},(_,i)=>movie(i+60)),
      rated:Array.from({length:30},(_,i)=>movie(i+100)),
      gems:Array.from({length:30},(_,i)=>movie(i+130)),
      classics:Array.from({length:30},(_,i)=>movie(i+160))
    }
  };
}
test('Figma home uses a real eligible TV hero and deduplicates every shelf',()=>{
  const result=engine.prepare(fixtures());
  assert.equal(result.hero.type,'tv');
  const keys=[engine.id(result.hero),...Object.values(result.rails).flat().map(engine.id)];
  assert.equal(new Set(keys).size,keys.length);
  assert.ok(keys.length>30);
});
test('recent exposure gives way to unseen titles when enough alternatives exist',()=>{
  const opts=fixtures();
  opts.seen=Object.fromEntries(Array.from({length:30},(_,i)=>['tv:'+(500+i),now-engine.DAY]));
  opts.pools.tv.push(...Array.from({length:10},(_,i)=>tv(800+i)));
  const result=engine.prepare(opts);
  assert.ok(!opts.seen[engine.id(result.hero)],'hero was repeated');
});
test('watched and hidden titles never reappear',()=>{
  const opts=fixtures();
  opts.hidden=['tv:500','movie:1'];
  opts.positions={'tv:501':{percent:100},'movie:2':{percent:70}};
  const all=[engine.prepare(opts).hero,...Object.values(engine.prepare(opts).rails).flat()].filter(Boolean).map(engine.id);
  for(const k of ['tv:500','tv:501','movie:1','movie:2'])assert.ok(!all.includes(k),k);
});
test('future movies, posters missing and wrong media types are excluded',()=>{
  const opts=fixtures();
  opts.pools.day.push(movie(999,{date:'2027-01-01'}),movie(998,{poster:''}),movie(997,{type:'person'}));
  const values=[engine.prepare(opts).hero,...Object.values(engine.prepare(opts).rails).flat()].filter(Boolean).map(engine.id);
  assert.ok(!values.includes('movie:999'));
  assert.ok(!values.includes('movie:998'));
  assert.ok(!values.includes('person:997'));
});
test('personalized shelf is genre grounded, not invented',()=>{
  const opts=fixtures();
  opts.history=[{id:1000,type:'movie',genreIds:[28]}];
  const result=engine.prepare(opts);
  assert.ok(result.rails['Because You Watched'].length>0);
  for(const item of result.rails['Because You Watched'])assert.ok(item.genreIds.includes(28));
  opts.history=[];
  assert.deepEqual(engine.prepare(opts).rails['Because You Watched'],[]);
});
test('changing the selection seed rotates the discovery order',()=>{
  const one=fixtures(),other=fixtures();other.seed='another-cycle';
  const rows=opts=>engine.prepare(opts).rails['Popular on ZeroPlay'].map(engine.id);
  assert.notDeepEqual(rows(one),rows(other));
});
test('exposure retention is bounded and profile-safe by caller',()=>{
  const cleaned=engine.cleanSeen({
    'movie:20':now-2*engine.DAY,
    'tv:21':now-45*engine.DAY,
    random:now
  },now);
  assert.deepEqual(cleaned,{'movie:20':now-2*engine.DAY});
});
test('Opt-in layout includes real episode controls, 282x165 cards and existing app wiring',()=>{
  const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
  assert.match(read('windows/main.cjs'),/'figma-streaming'\]\.includes\(value.uiLayout\)/);
  assert.match(read('windows/ui/layouts.js'),/'figma-streaming'\]\.includes\(value\)/);
  assert.match(read('windows/ui/index.html'),/value="figma-streaming">Figma Streaming UI \(Test\)/);
  assert.match(read('windows/ui/app.js'),/window.zeroFigmaStreaming.render\(\{fresh,token\}\)/);
  assert.match(read('windows/ui/figma-streaming.js'),/data-season/);
  assert.match(read('windows/ui/figma-streaming.js'),/data-episode/);
  assert.match(read('windows/ui/figma-streaming.css'),/flex:0 0 282px/);
  assert.match(read('windows/ui/figma-streaming.css'),/height:165px/);
  assert.match(read('windows/ui/index.html'),/src="figma-streaming-engine.js"/);
  assert.match(read('windows/ui/index.html'),/src="figma-streaming.js"/);
  assert.match(read('windows/ui/index.html'),/href="figma-streaming.css"/);
});
