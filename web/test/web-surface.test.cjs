const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('website is labeled as ZeroPlay 2.1.2 Web',()=>{
  const html=read('web/public/index.html');
  const browser=read('web/public/browser.js');
  assert.match(html,/ZeroPlay 2\.1\.2/);
  assert.match(browser,/version:'2\.1\.2 Web'/);
});

test('website does not expose Live TV, PPV or Live Sports',()=>{
  const html=read('web/public/index.html');
  assert.doesNotMatch(html,/data-live-nav|live-player|web-live\.js|live\.css|shaka-player/i);
  assert.equal(fs.existsSync(path.join(root,'web/public/web-live.js')),false);
  assert.equal(fs.existsSync(path.join(root,'web/public/live.css')),false);
  assert.equal(fs.existsSync(path.join(root,'api/live.js')),false);
});

test('website infinite scroll waits for real user scroll intent and does not chain-load on tab render',()=>{
  const html=read('web/public/index.html');
  const infinite=read('web/public/infinite-scroll.js');
  assert.match(html,/infinite-scroll\.js/);
  assert.match(infinite,/data-action="next-page"/);
  assert.match(infinite,/scrollIntentUntil/);
  assert.match(infinite,/function armScrollIntent\(\)\{if\(!loading\)scrollIntentUntil=/);
  assert.match(infinite,/if\(Date\.now\(\)>scrollIntentUntil\|\|loading/);
  assert.match(infinite,/scrollIntentUntil=0;loading=true/);
  assert.match(infinite,/addEventListener\('wheel'/);
  assert.match(infinite,/addEventListener\('touchmove'/);
  assert.match(infinite,/addEventListener\('keydown'/);
  assert.match(infinite,/addEventListener\('scroll'/);
  assert.match(infinite,/savedGrid\.appendChild/);
  assert.match(infinite,/paging\.hidden=true/);
});
