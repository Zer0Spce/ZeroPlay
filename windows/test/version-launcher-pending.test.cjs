'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const vm=require('node:vm');
const {EventEmitter}=require('node:events');

// Exercise the packaged launcher without spawning real EXEs or Electron windows.
// Previous --ui-smoke-test skipped maybeLaunchCurrent completely, concealing a
// ReferenceError in the real pending-update startup path.
function fixture(pointer){
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'zeroplay-launcher-'));
  const version='versions'+path.sep+'2.2.5.9'+path.sep+'ZeroPlay.exe';
  fs.mkdirSync(path.join(root,'versions','2.2.5.9'),{recursive:true});
  fs.writeFileSync(path.join(root,'ZeroPlay.exe'),'placeholder');
  fs.writeFileSync(path.join(root,version),'placeholder');
  if(pointer)fs.writeFileSync(path.join(root,'current.json'),JSON.stringify({
    version:'2.2.5.9',path:version,pending:false,...pointer
  }));
  const children=[],timeouts=[],intervals=[],exits=[];
  function spawn(exe,args,opts){
    const child=new EventEmitter();
    child.unref=()=>{child.unrefCalled=true;};
    child.kill=()=>{child.killed=true;};
    children.push({exe,args,opts,child});
    return child;
  }
  function schedule(queue,callback){const t={callback,cleared:false};queue.push(t);return t;}
  const module={exports:{}};
  const source=fs.readFileSync(path.join(__dirname,'..','version-manager.cjs'),'utf8');
  vm.runInNewContext(source,{
    module,require:id=>id==='node:child_process'?{spawn}:require(id),
    process:{env:{ZERO_LAUNCHER_ROOT:root},execPath:process.execPath,argv:['ZeroPlay.exe'],pid:12345},
    setTimeout:(callback)=>schedule(timeouts,callback),
    setInterval:(callback)=>schedule(intervals,callback),
    clearTimeout:t=>{if(t)t.cleared=true;},
    clearInterval:t=>{if(t)t.cleared=true;}
  },{filename:'version-manager.cjs'});
  const app={isPackaged:true,getVersion:()=> '2.2.5-9',exit:code=>exits.push(code)};
  return {root,version,children,timeouts,intervals,exits,app,versions:module.exports,
    changePointer:newPointer=>fs.writeFileSync(path.join(root,'current.json'),JSON.stringify(newPointer)),
    cleanup:()=>fs.rmSync(root,{recursive:true,force:true})};
}
test('normal first launch without a saved update does not redirect',()=>{
  const x=fixture();try{
    assert.equal(x.versions.maybeLaunchCurrent(x.app),false);
    assert.equal(x.children.length,0);
  }finally{x.cleanup();}
});
test('confirmed cached version launches detached and exits only after spawning',()=>{
  const x=fixture({pending:false});try{
    assert.equal(x.versions.maybeLaunchCurrent(x.app),true);
    assert.equal(x.children.length,1);
    assert.equal(x.children[0].child.unrefCalled,true);
    assert.deepEqual(Array.from(x.children[0].args),['--version-child']);
    assert.equal(x.exits.length,0);
    x.timeouts[0].callback();
    assert.deepEqual(x.exits,[0]);
  }finally{x.cleanup();}
});
test('pending cached version registers child exit and confirmation handlers without ReferenceError',()=>{
  const x=fixture({pending:true});try{
    assert.doesNotThrow(()=>assert.equal(x.versions.maybeLaunchCurrent(x.app),true));
    assert.equal(x.children.length,1);
    assert.equal(x.children[0].child.listenerCount('exit'),1);
    assert.equal(x.intervals.length,1);
    assert.equal(x.timeouts.length,1);
    x.changePointer({version:'2.2.5.9',path:x.version,pending:false});
    x.intervals[0].callback();
    assert.deepEqual(x.exits,[0]);
    assert.equal(x.children[0].child.killed,undefined);
    assert.equal(x.intervals[0].cleared,true);
    assert.equal(x.timeouts[0].cleared,true);
  }finally{x.cleanup();}
});
test('failed pending child rolls back and relaunches previous stable app',()=>{
  const x=fixture({pending:true,previous:{version:'2.2.5.8',path:'ZeroPlay.exe'}});try{
    assert.equal(x.versions.maybeLaunchCurrent(x.app),true);
    x.children[0].child.emit('exit',1);
    assert.equal(x.children[0].child.killed,true);
    assert.equal(x.children.length,2);
    assert.ok(x.children[1].args.includes('--rollback'));
    assert.equal(x.versions.readPointer().pending,false);
    assert.equal(x.versions.readPointer().version,'2.2.5.8');
    assert.deepEqual(x.exits,[0]);
  }finally{x.cleanup();}
});
test('newer portable executable never launches an older cached version',()=>{
  const x=fixture({version:'2.2.5.8',pending:true});
  x.app.getVersion=()=> '2.2.5-9';
  try{
    assert.equal(x.versions.maybeLaunchCurrent(x.app),false);
    assert.equal(x.children.length,0);
  }finally{x.cleanup();}
});
