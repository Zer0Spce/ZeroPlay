const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const core=require('../core.cjs');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('daily trending endpoint is allowed for Top 10',()=>{
  assert.equal(core.endpoint('/trending/all/day'),true);
  assert.equal(core.endpoint('/trending/all/week'),true);
});

test('Windows home loads official title art and ranked posters',()=>{
  const html=read('ui/index.html');
  const js=read('ui/home-visuals.js');
  const css=read('ui/home-visuals.css');
  assert.match(html,/home-visuals\.css/);
  assert.match(html,/home-visuals\.js/);
  assert.match(js,/append_to_response:'images'/);
  assert.match(js,/\/trending\/all\/day/);
  assert.match(js,/TOP 10 TODAY IN/);
  assert.match(js,/zeroplay-top10-optout/);
  assert.match(js,/zeroOpenDetails/);
  assert.match(js,/coming soon/i);
  assert.match(css,/-webkit-text-stroke/);
  assert.match(css,/zero-hero-title-art/);
  assert.match(css,/zero-top10-rank/);
  assert.match(css,/aspect-ratio:2\/3/);
  assert.match(css,/\.zero-top10-card\{[\s\S]*flex:0 0 clamp\(212px,15\.5vw,274px\);[\s\S]*height:clamp\(264px,20vw,342px\)/);
  assert.match(css,/\.zero-top10-rank\{[\s\S]*left:-4px;[\s\S]*z-index:3/);
  assert.match(css,/\.zero-top10-poster\{[\s\S]*right:0;[\s\S]*width:auto;[\s\S]*height:100%;[\s\S]*aspect-ratio:2\/3/);
  assert.match(css,/\.zero-top10-poster img\{[\s\S]*object-fit:cover/);
});

test('Windows Top 10 keeps normal clicks free until an actual drag starts',()=>{
  const js=read('ui/home-visuals.js');
  const downStart=js.indexOf("rail.addEventListener('pointerdown'");
  const moveStart=js.indexOf("rail.addEventListener('pointermove'");
  const endStart=js.indexOf('const endDrag=',moveStart);
  assert.ok(downStart>=0&&moveStart>downStart&&endStart>moveStart);
  const pointerDown=js.slice(downStart,moveStart);
  const pointerMove=js.slice(moveStart,endStart);
  assert.doesNotMatch(pointerDown,/setPointerCapture/);
  assert.match(pointerMove,/!moved&&Math\.abs\(distance\)>5/);
  assert.match(pointerMove,/moved=true;[\s\S]*setPointerCapture\(pointerId\)/);
  assert.match(js,/button\.addEventListener\('click',[\s\S]*window\.zeroOpenDetails\?\.\(item\)/);
});

test('VidSrc subtitle overlay can close on desktop and Android players',()=>{
  const desktop=read('assets/player-22.js');
  const android=fs.readFileSync(path.resolve(root,'../app/src/main/assets/player-22.js'),'utf8');
  for(const source of [desktop,android]){
    assert.match(source,/function subtitlePanel\(\)/);
    assert.match(source,/search by language/);
    assert.match(source,/function dismissSubtitlePanel/);
    assert.match(source,/__zeroDismissSubtitlePanel/);
    assert.match(source,/__zeroDismissMenus/);
    assert.match(source,/zeroplaySubtitleHidden/);
  }
});
