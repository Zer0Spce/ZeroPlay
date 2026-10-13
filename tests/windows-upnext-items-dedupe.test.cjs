'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

function loadHelper(){
  const source=fs.readFileSync('windows/ui/app.js','utf8');
  const match=source.match(/function upNextItems\(items=Object\.values\(state\.positions\|\|\{\}\)\)\{[\s\S]*?return out;\}/);
  assert.ok(match,'upNextItems helper must exist in Windows renderer');
  return vm.runInNewContext('('+match[0]+')');
}

test('Up Next keeps only newest progress entry per series',()=>{
  const upNextItems=loadHelper();
  const rows=upNextItems([
    {id:1418,type:'tv',title:'Show A',episode:4,season:1,at:100},
    {id:1418,type:'tv',title:'Show A',episode:5,season:1,at:200},
    {id:1399,type:'tv',title:'Show B',episode:2,season:2,at:150},
    {id:1399,type:'tv',title:'Show B',episode:1,season:2,at:120},
    {id:999,type:'movie',title:'Movie',episode:1,at:500},
  ]);
  assert.equal(rows.length,2);
  assert.equal(rows[0].id,1418);
  assert.equal(rows[0].episode,5);
  assert.equal(rows[1].id,1399);
  assert.equal(rows[1].episode,2);
});

test('Up Next limits unique series to 20',()=>{
  const upNextItems=loadHelper();
  const input=[];
  for(let id=1;id<=25;id++)input.push({id,type:'tv',episode:1,at:100-id});
  assert.equal(upNextItems(input).length,20);
});
