'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const Module=require('node:module');
const path=require('node:path');
function fixture(){
 const file=path.join(__dirname,'..','updater.cjs'),m=new Module(file,module);
 m.filename=file;m.paths=module.paths;
 const real=m.require.bind(m);
 m.require=id=>id==='electron'?{app:{getPath:()=>process.cwd()},BrowserWindow:function(){},ipcMain:{}}:real(id);
 m._compile(require('node:fs').readFileSync(file,'utf8'),file);
 return m.exports;
}
const updater=fixture();
test('Updater 3.0 retries bounded 429 and 503 with server Retry-After',async()=>{
 const requests=[],delays=[];
 const response=async()=>{requests.push(1);
  return requests.length<3?{ok:false,status:requests.length===1?429:503,headers:{get:()=> '1'}}:
    {ok:true,status:200,json:async()=>[{tag_name:'v2.2.6',assets:[{name:'ZeroPlay-2.2.6-Windows-x64.zip'}]}]};
 };
 const releases=await updater.requestReleases(response,async ms=>{delays.push(ms);});
 assert.equal(requests.length,3);
 assert.equal(releases[0].tag_name,'v2.2.6');
 assert.ok(delays.length===2&&delays.every(ms=>ms>=1000&&ms<=10000));
});
test('Updater 3.0 fails immediately on non-retryable GitHub response',async()=>{
 let attempts=0;
 await assert.rejects(updater.requestReleases(async()=>{attempts++;return{ok:false,status:404,headers:{get:()=>null}};},async()=>{}),/HTTP 404/);
 assert.equal(attempts,1);
});
test('Updater 3.0 backs off finite durations and never retries forever',async()=>{
 const delays=[];
 await assert.rejects(updater.requestReleases(async()=>{throw Error('network down');},async ms=>{delays.push(ms);}),/network down/);
 assert.deepEqual(delays,[1000,2000]);
 assert.equal(updater.retryDelay(9),4000);
});
