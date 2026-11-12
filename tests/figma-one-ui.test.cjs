'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const engine=require('../windows/ui/figma-one-engine.js');
const now=Date.parse('2026-11-12T12:00:00Z');
function movie(id,options={}){
  return {id,type:'movie',title:'Movie '+id,date:'2020-02-02',
    rating:8.0,voteCount:900,popularity:35,poster:'/p/'+id,backdrop:'/b/'+id,
    genreIds:[28],...options};
}
function fixture(){
  return {now,seed:'profile-1:cycle-1',limit:12,
    pools:{
      day:Array.from({length:40},(_,i)=>movie(i+1)),
      week:Array.from({length:40},(_,i)=>movie(i+21)),
      movies:Array.from({length:40},(_,i)=>movie(i+81)),
      tv:Array.from({length:40},(_,i)=>movie(i+121,{type:'tv'})),
      now:Array.from({length:40},(_,i)=>movie(i+161,{date:'2026-10-01'})),
      top:Array.from({length:40},(_,i)=>movie(i+201)),
      gems:Array.from({length:40},(_,i)=>movie(i+241)),
      classics:Array.from({length:40},(_,i)=>movie(i+281,{date:'2001-01-01'}))
    }
  };
}
function all(result){
  return [result.hero,...Object.values(result.rails).flat()].filter(Boolean);
}
test('Figma One selects a TMDB-backed hero and shows unique titles across all rails',()=>{
  const result=engine.select(fixture());
  assert.ok(result.hero?.backdrop);
  assert.ok(all(result).length>36);
  const keys=all(result).map(engine.id);
  assert.equal(new Set(keys).size,keys.length);
});
test('Hidden, watched, missing image, future and person entries are not recommended',()=>{
  const opts=fixture();
  opts.hidden=['movie:1','tv:122'];
  opts.positions={'movie:2':{percent:100}};
  opts.pools.day.push(movie(900,{poster:''}),movie(901,{date:'2027-01-01'}),movie(902,{type:'person'}));
  const keys=all(engine.select(opts)).map(engine.id);
  for(const k of ['movie:1','movie:2','tv:122','movie:900','movie:901','person:902'])assert.ok(!keys.includes(k),k);
});
test('Fresh candidates outrank recently shown candidates for the hero',()=>{
  const opts=fixture();
  opts.seen=Object.fromEntries(Array.from({length:40},(_,i)=>['movie:'+(i+1),now-engine.DAY]));
  opts.pools.day.push(...Array.from({length:10},(_,i)=>movie(i+900)));
  const selected=engine.select(opts);
  assert.equal(Boolean(opts.seen[engine.id(selected.hero)]),false);
});
test('A small catalog gracefully reuses old picks without creating duplicates',()=>{
  const opts={now,seed:'small',pools:{day:[movie(1),movie(2)]},
    seen:{'movie:1':now-1000,'movie:2':now-1000}};
  const selected=engine.select(opts);
  assert.ok(selected.hero);
  assert.equal(new Set(all(selected).map(engine.id)).size,all(selected).length);
});
test('Personalized shelf is based on genres in actual watch history',()=>{
  const opts=fixture();
  opts.history=[{genreIds:[28]}];
  const rows=engine.select(opts).rails['Recommended For You'];
  assert.ok(rows.length>0);
  for(const row of rows)assert.ok(row.genreIds.includes(28));
});
test('Changing the refresh cycle changes the selection order',()=>{
  const a=fixture(),b=fixture();
  b.seed='profile-1:cycle-2';
  const ids=x=>all(engine.select(x)).map(engine.id).slice(0,15);
  assert.notDeepEqual(ids(a),ids(b));
});
test('Exposure history is per-profile, time bounded and key validated',()=>{
  const s=engine.cleanSeen({
    'movie:1':now-engine.DAY,'tv:2':now-45*engine.DAY,
    'movie:3':now+engine.DAY*5,'badkey':now
  },now);
  assert.deepEqual(s,{'movie:1':now-engine.DAY});
});
test('Figma One is optional and old Figma UI is not copied into release-based test branch',()=>{
  const root=path.join(__dirname,'..');
  const read=name=>fs.readFileSync(path.join(root,name),'utf8');
  const a=read('windows/ui/app.js'),index=read('windows/ui/index.html');
  const css=read('windows/ui/figma-one.css'),js=read('windows/ui/figma-one.js');
  assert.match(read('windows/main.cjs'),/'figma-one'\]\.includes\(value.uiLayout\)/);
  assert.match(read('windows/ui/layouts.js'),/'figma-one'\]\.includes\(value\)/);
  assert.match(index,/value="figma-one">Figma One UI \(Test\)/);
  assert.ok(!index.includes('figma-streaming'));
  assert.match(index,/src="figma-one-engine.js"/);
  assert.match(index,/src="figma-one.js"/);
  assert.match(index,/href="figma-one.css"/);
  assert.match(a,/window.zeroFigmaOne.render\(\{fresh,token\}\)/);
  assert.match(js,/data-one-refresh/);
  assert.match(js,/data-play=/);
  assert.match(js,/data-detail=/);
  assert.match(css,/grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
  assert.match(css,/\.one-card-wide\{height:136px\}/);
  assert.match(css,/\.one-card-poster\{height:361px\}/);
  assert.match(css,/aside \{/);
});
