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
  assert.match(js,/coming soon/i);
  assert.match(css,/-webkit-text-stroke/);
  assert.match(css,/zero-hero-title-art/);
  assert.match(css,/zero-top10-rank/);
});
