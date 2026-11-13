'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),vm=require('node:vm');
const original=fs.readFileSync(path.join(__dirname,'..','version-manager.cjs'),'utf8');
function fixture(pointer){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'zeroplay-2260-recovery-'));
 fs.writeFileSync(path.join(root,'ZeroPlay.exe'),'ok');
 const children=[];
 const module={exports:{}},context={
   module,require:n=>n==='node:child_process'?{spawn:(file,args)=>{children.push(file);return {unref(){},once(){},kill(){}};}}:require(n),
   process:{env:{ZERO_LAUNCHER_ROOT:root},execPath:path.join(root,'ZeroPlay.exe'),argv:['ZeroPlay.exe'],pid:912},
   setTimeout:()=>({}),setInterval:()=>({}),clearTimeout:()=>{},clearInterval:()=>{}
 };
 vm.runInNewContext(original,context);
 const write=p=>fs.writeFileSync(path.join(root,'current.json'),typeof p==='string'?p:JSON.stringify(p));
 if(pointer)write(pointer);
 return {root,children,api:module.exports,write,app:{isPackaged:true,getVersion:()=> '2.2.6',exit:()=>{}},close:()=>fs.rmSync(root,{recursive:true,force:true})};
}
test('Updater 3.0 rejects traversal, absolute, arbitrary executable and malformed pointer JSON',()=>{
 const x=fixture(null);
 try{
  for(const pathValue of ['../../evil.exe','C:/evil.exe','versions/2.2.6/evil.exe','outside.exe','versions/../ZeroPlay.exe']){
   x.write({version:'2.2.6',path:pathValue,pending:false});
   assert.equal(x.api.readPointer(),null,pathValue);
   assert.equal(x.api.maybeLaunchCurrent(x.app),false);
  }
  x.write('{invalid:json');
  assert.equal(x.api.readPointer(),null);
  assert.equal(x.api.maybeLaunchCurrent(x.app),false);
  assert.equal(x.children.length,0);
 }finally{x.close();}
});
test('Updater 3.0 falls back to stable exe if a selected update binary is missing',()=>{
 const x=fixture({version:'2.2.6',path:'versions/2.2.6/ZeroPlay.exe',pending:true,
   previous:{version:'2.2.5.9',path:'ZeroPlay.exe'}});
 try{
  assert.equal(x.api.maybeLaunchCurrent(x.app),false);
  assert.equal(x.children.length,0);
  assert.equal(x.api.readPointer().pending,false);
  assert.equal(x.api.readPointer().path,'ZeroPlay.exe');
 }finally{x.close();}
});
test('Updater 3.0 preserves valid pending pointers from existing releases',()=>{
 const x=fixture({version:'2.2.5.9',path:'versions/2.2.5.9/ZeroPlay.exe',pending:true,
   previous:{version:'2.2.5.8',path:'ZeroPlay.exe'}});
 try{
  assert.equal(x.api.readPointer().pending,true);
  assert.equal(x.api.readPointer().version,'2.2.5.9');
 }finally{x.close();}
});
