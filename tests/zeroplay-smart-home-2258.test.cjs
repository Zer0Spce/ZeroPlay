'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const e=require('../windows/ui/fresh-recommendations.js');
const now=Date.parse('2026-11-12T12:00:00Z');
function movie(id,options={}){
  return {id,type:'movie',title:'Film '+id,date:'2020-03-01',rating:7.7,
    voteCount:900,popularity:45,poster:'/p'+id,backdrop:'/b'+id,
    genreIds:[28],...options};
}
function fixture(){
  return {
    now,seed:'one',perShelf:12,
    pools:{
      trending:Array.from({length:50},(_,i)=>movie(i+1)),
      day:Array.from({length:50},(_,i)=>movie(i+30)),
      recommended:Array.from({length:50},(_,i)=>movie(i+90)),
      popular:Array.from({length:50},(_,i)=>movie(i+150)),
      series:Array.from({length:45},(_,i)=>movie(i+200,{type:'tv'})),
      now:Array.from({length:45},(_,i)=>movie(i+260)),
      gems:Array.from({length:45},(_,i)=>movie(i+320)),
      classics:Array.from({length:45},(_,i)=>movie(i+390,{date:'2005-02-02'})),
      airing:Array.from({length:25},(_,i)=>movie(i+470,{type:'tv'}))
    }
  };
}
const flatten=r=>[...r.hero,...Object.values(r.shelves).flat()];
test('TMDB recommendations are deduplicated across all homepage shelves and hero',()=>{
  const r=e.select(fixture());
  assert.ok(r.candidateCount>400);
  assert.ok(flatten(r).length>55);
  assert.equal(new Set(flatten(r).map(e.id)).size,flatten(r).length);
});
test('recently shown titles are avoided when unseen titles exist',()=>{
  const x=fixture();
  x.seen=Object.fromEntries(Array.from({length:50},(_,i)=>['movie:'+(i+1),now-e.DAY]));
  x.pools.trending.push(...Array.from({length:20},(_,i)=>movie(850+i)));
  const hero=e.select(x).hero;
  assert.ok(hero.length>0);
  hero.forEach(x=>assert.ok(!Object.hasOwn(fixture().seen||{},e.id(x))));
});
test('watched, not-interested, upcoming, and media without artwork excluded from recommended shelves',()=>{
  const x=fixture();
  x.positions={'movie:1':{percent:45},'movie:2':{percent:100}};
  x.notInterested=['movie:3','tv:201'];
  x.pools.popular.push(movie(900,{poster:'',backdrop:''}),movie(901,{date:'2027-03-01'}));
  const items=flatten(e.select(x)).map(e.id);
  for(const id of ['movie:1','movie:2','movie:3','tv:201','movie:900','movie:901'])assert.ok(!items.includes(id),id);
});
test('manual refresh seed rotates selection without using fabricated titles',()=>{
  const a=fixture(),b=fixture();b.seed='two';
  const get=x=>e.select(x).hero.map(e.id);
  assert.notDeepEqual(get(a),get(b));
});
test('same seed and same source pages return stable selections',()=>{
  const a=fixture();
  assert.deepEqual(e.select(a).hero.map(e.id),e.select(a).hero.map(e.id));
});
test('14-day repetition window expires and old history is pruned',()=>{
  assert.deepEqual(e.prune({'movie:7':now-e.DAY,'movie:8':now-90*e.DAY,'notAnId':now},now),{'movie:7':now-e.DAY});
});
test('watchlist and Continue Watching hero selections remain user controlled',()=>{
  const a=fixture();a.carouselSource='continue';
  assert.equal(e.select(a).hero.length,0);
  a.carouselSource='watchlist';
  assert.equal(e.select(a).hero.length,0);
});
test('six-swatch Sunset palette is on Windows and Android, and absolute baseline stays untouched',()=>{
  const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
  const theme=read('windows/themes.cjs'),css=read('windows/ui/sunset-palette.css');
  const android=read('app/src/main/java/com/zerostreams/app/MainActivity.java');
  const native=read('app/src/main/java/com/zerostreams/app/SmartHomeRecommendations.java');
  for(const hex of ['#181A2F','#242E49','#37415C','#FDA481','#B4182D','#54162B']){
    assert.ok(theme.includes(hex)||css.includes(hex),'Missing brand swatch '+hex);
  }
  assert.match(android,/#181A2F/);
  assert.match(android,/#FDA481/);
  assert.match(native,/14\*DAY/);
  assert.match(native,/Zero22\.activeProfile/);
  assert.match(read('windows/ui/app.js'),/window.ZeroFreshHome.prepare/);
  assert.match(read('windows/ui/index.html'),/src="fresh-home.js"/);
  assert.ok(!read('windows/ui/index.html').includes('figma-one'));
});
