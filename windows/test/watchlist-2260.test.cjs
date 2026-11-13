'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const model=require('../ui/watchlist-2260.js');
test('renaming a collection preserves saved titles and existing order',()=>{
 const a={Favorites:[{id:1,type:'movie'}],Others:[{id:2,type:'tv'}]};
 const b=model.rename(a,'Favorites','Family');
 assert.deepEqual(b,{Family:[{id:1,type:'movie'}],Others:[{id:2,type:'tv'}]});
 assert.ok(Object.hasOwn(a,'Favorites'),'original input must not mutate');
});
test('collection deletion does not remove favorites or history',()=>{
 const original={List:[{id:1}],Other:[{id:3}]};
 assert.deepEqual(model.remove(original,'List'),{Other:[{id:3}]});
 assert.equal(original.List.length,1);
});
test('reserved names and duplicates are rejected',()=>{
 for(const n of ['__proto__','constructor','prototype','','   ','bad<code>'])assert.throws(()=>model.name(n));
 assert.throws(()=>model.rename({Family:[],Others:[]},'Family','Others'));
});
test('watched/unwatched filter reads stored progress without losing items',()=>{
 const items=[{id:3,type:'movie'},{id:4,type:'tv'}];
 const positions={'movie:3':{percent:100},'tv:4':{percent:44}};
 assert.deepEqual(model.filter(items,positions,'watched').map(x=>x.id),[3]);
 assert.deepEqual(model.filter(items,positions,'unwatched').map(x=>x.id),[4]);
 assert.equal(model.filter(items,positions).length,2);
});
test('real Windows UI exposes rename, remove, watched filters and backend actions',()=>{
 const root=path.join(__dirname,'..');
 const ui=fs.readFileSync(path.join(root,'ui/app.js'),'utf8');
 const main=fs.readFileSync(path.join(root,'main.cjs'),'utf8');
 assert.ok(ui.includes('data-collection-rename'));
 assert.ok(ui.includes('data-collection-delete'));
 assert.ok(ui.includes('data-watchlist-status'));
 assert.ok(main.includes("action==='collection-rename'"));
 assert.ok(main.includes("action==='collection-delete'"));
});
