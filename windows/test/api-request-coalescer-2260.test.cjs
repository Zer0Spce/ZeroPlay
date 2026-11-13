'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {RequestCoalescer}=require('../api-request-coalescer-2260.cjs');
test('duplicate catalog requests produce one network request and identical results',async()=>{
 const q=new RequestCoalescer();let calls=0;
 const tasks=Array.from({length:8},()=>q.run('movie:1',async()=>{calls++;await Promise.resolve();return {title:'Movie'};}));
 const rows=await Promise.all(tasks);
 assert.equal(calls,1);assert.ok(rows.every(x=>x.title==='Movie'));
 assert.equal(q.size(),0);
});
test('failed requests do not poison future retries or leave stuck promises',async()=>{
 const q=new RequestCoalescer(),first=q.run('tv:2',async()=>{throw Error('offline');});
 await assert.rejects(first,/offline/);
 await Promise.resolve();
 assert.equal(q.size(),0);
 assert.equal(await q.run('tv:2',async()=>42),42);
});
test('bounded request concurrency protects low memory devices',async()=>{
 const q=new RequestCoalescer(1);
 let release;const blocked=new Promise(resolve=>{release=resolve;});
 const one=q.run('one',()=>blocked);
 await assert.rejects(q.run('two',async()=>2),/Too many simultaneous/);
 release(1);await one;assert.equal(q.size(),0);
});
test('Windows catalog API uses the shared coalescer',()=>{
 const code=fs.readFileSync(path.join(__dirname,'..','main.cjs'),'utf8');
 assert.ok(code.includes('tmdbRequests.run('));
});
