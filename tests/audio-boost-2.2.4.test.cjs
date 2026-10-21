'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');

test('embedded player gain supports up to 10x',()=>{
  for(const rel of ['app/src/main/assets/player-guard.js','windows/assets/player-guard.js']){
    const text=read(rel);
    assert.match(text,/Math\.min\(10, Math\.max\(1, Number\(window\.__zeroGain\) \|\| 1\)\)/,rel);
    assert.doesNotMatch(text,/Math\.min\(2, Number\(window\.__zeroGain\)\)/,rel);
    assert.match(text,/createGain\(\)/,rel);
    assert.match(text,/gain\.gain\.value = amount/,rel);
  }
});

test('Android exposes requested boost levels and Sports inherits the setting',()=>{
  const main=read('app/src/main/java/com/zerostreams/app/MainActivity.java');
  for(const label of ['2× boost','3× boost','4× boost','5× boost','10× boost'])assert.ok(main.includes(label),label);
  assert.ok(main.includes('new float[]{1f,2f,3f,4f,5f,10f}'));
  const sports=read('app/src/main/java/com/zerostreams/app/SportsPlayerActivity.java');
  assert.ok(sports.includes('getFloat("audioBoost",1f)'));
  assert.ok(sports.includes('window.__zeroGain="+gain+";'));
});

test('Windows exposes requested boost levels and live player creates a gain node',()=>{
  const html=read('windows/ui/index.html');
  for(const value of ['2','3','4','5','10'])assert.ok(html.includes(`<option value="${value}">${value}× boost</option>`));
  const main=read('windows/main.cjs');
  assert.ok(main.includes('gain:Math.min(10,Math.max(1,Number(state.settings.gain)||1))'));
  const live=read('windows/ui/live-player.js');
  assert.ok(live.includes('createMediaElementSource(video)'));
  assert.ok(live.includes('audioGain.gain.value=amount'));
});
