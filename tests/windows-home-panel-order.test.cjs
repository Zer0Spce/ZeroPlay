'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');

test('Windows homepage order normalizer removes duplicate Up Next and preserves every known panel once',()=>{
  const source=fs.readFileSync('windows/main.cjs','utf8');
  const ids=source.match(/const homePanelIds=\[[^;]+\];/)?.[0];
  const fn=source.match(/function normalizeHomePanelOrder\(value\)\{.*?return out;\}/)?.[0];
  assert.ok(ids,'homePanelIds declaration should exist');
  assert.ok(fn,'normalizeHomePanelOrder should exist');
  const context={};vm.createContext(context);vm.runInContext(ids+'\n'+fn,context);
  const result=Array.from(context.normalizeHomePanelOrder(['clock','upnext','upnext','featured','upnext','bogus']));
  assert.equal(result.filter(id=>id==='upnext').length,1,'Up Next must render once');
  assert.equal(new Set(result).size,result.length,'no homepage panel ID may be duplicated');
  assert.equal(result[0],'clock');
  assert.equal(result[1],'upnext');
  assert.equal(result[2],'featured');
});

test('Windows renderer also deduplicates saved homepage order defensively',()=>{
  const ui=fs.readFileSync('windows/ui/app.js','utf8');
  assert.match(ui,/function homeOrder\(\).*?seen=new Set\(\).*?!seen\.has\(id\).*?return order;/s);
  assert.doesNotMatch(ui,/return \[\.\.\.saved\.filter\(id=>known\.has\(id\)\)/);
});

test('Windows settings and startup normalize persisted homepage order',()=>{
  const source=fs.readFileSync('windows/main.cjs','utf8');
  assert.match(source,/state\.settings\.homePanelOrder=normalizeHomePanelOrder\(state\.settings\.homePanelOrder\)/);
  assert.match(source,/homePanelOrder:normalizeHomePanelOrder\(Array\.isArray\(value\.homePanelOrder\)\?value\.homePanelOrder:state\.settings\.homePanelOrder\)/);
});
