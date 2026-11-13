'use strict';
const fs=require('node:fs'),fsp=require('node:fs/promises'),path=require('node:path'),{spawn}=require('node:child_process');
function rootDir(){if(process.env.ZERO_LAUNCHER_ROOT)return path.resolve(process.env.ZERO_LAUNCHER_ROOT);const exe=path.resolve(process.execPath),parts=exe.split(path.sep),index=parts.lastIndexOf('versions');if(index>0)return parts.slice(0,index).join(path.sep)||path.parse(exe).root;return path.dirname(exe);}
function pointerPath(){return path.join(rootDir(),'current.json');}
// Updater 3.0: reject unsafe/stale launcher pointers before a process is spawned.
function validSelection(value){
  if(!value||typeof value!=='object'||Array.isArray(value))return false;
  if(typeof value.version!=='string'||! /^[0-9]+[.][0-9]+(?:[.-][0-9]+){0,2}$/.test(value.version))return false;
  if(typeof value.path!=='string'||value.path.length>240||value.path.includes(String.fromCharCode(0)))return false;
  const normalized=value.path.split(String.fromCharCode(92)).join('/');
  if(normalized==='ZeroPlay.exe')return true;
  const parts=normalized.split('/');
  return parts.length===3&&parts[0]==='versions'&&
    /^[0-9]+(?:[.-][0-9]+){1,3}$/.test(parts[1])&&parts[2]==='ZeroPlay.exe';
}
function validatedPointer(value){
  if(!validSelection(value)||typeof value.pending!=='boolean')return null;
  const validPrevious=!value.previous||validSelection(value.previous);
  if(!validPrevious)return null;
  return value;
}
function readPointer(){try{
  const value=JSON.parse(fs.readFileSync(pointerPath(),'utf8'));
  return validatedPointer(value);
}catch{return null;}}
// Electron package.json requires semver. Our release 2.2.5.5 is packaged as
// 2.2.5-5; map *numeric* prerelease build markers back to the displayed version.
function publicVersion(value){
  const name=String(value||'').trim().replace(/^v/i,'');
  const match=name.match(/^(\d+)\.(\d+)\.(\d+)-(\d+)$/);
  return match?`${match[1]}.${match[2]}.${match[3]}.${match[4]}`:name;
}
function normalizedVersion(value){const parts=publicVersion(value).split('.').map(x=>Number(x)||0);while(parts.length>1&&parts[parts.length-1]===0)parts.pop();return parts.join('.');}
function sameVersion(a,b){return normalizedVersion(a)===normalizedVersion(b);}
function isNewerVersion(a,b){
  const left=publicVersion(a).split('.').map(v=>Number(v)||0);
  const right=publicVersion(b).split('.').map(v=>Number(v)||0);
  for(let i=0;i<Math.max(left.length,right.length,4);i++){
    if((left[i]||0)!==(right[i]||0))return (left[i]||0)>(right[i]||0);
  }
  return false;
}
function relativeExe(versionDir){return path.relative(rootDir(),path.join(versionDir,'ZeroPlay.exe'));}
function absoluteSelection(selection){
  if(!validSelection(selection))return null;
  const target=path.resolve(rootDir(),selection.path);
  if(!target.startsWith(rootDir()+path.sep)&&target!==path.join(rootDir(),'ZeroPlay.exe'))return null;
  // Avoid launching shortcuts or junction paths outside the installation root.
  try{
    if(fs.existsSync(target)){
      const resolved=fs.realpathSync(target),root=fs.realpathSync(rootDir());
      if(!resolved.startsWith(root+path.sep)&&resolved!==path.join(root,'ZeroPlay.exe'))return null;
    }
  }catch{return null;}
  return target;
}
function atomicWrite(value){const file=pointerPath(),temp=file+'.tmp-'+process.pid;fs.writeFileSync(temp,JSON.stringify(value,null,2));fs.renameSync(temp,file);}
function baseSelection(version='base'){return {version,path:'ZeroPlay.exe'};}
function currentSelection(localVersion){const pointer=readPointer(),target=absoluteSelection(pointer);if(pointer&&target&&fs.existsSync(target))return {version:pointer.version||localVersion,path:pointer.path};return baseSelection(localVersion);}
function activate(version,versionDir,localVersion){const previous=currentSelection(localVersion);const next={version,path:relativeExe(versionDir),pending:true,previous,activatedAt:new Date().toISOString()};atomicWrite(next);return next;}
function confirmCurrent(version){if(!process.argv.includes('--version-child'))return false;const pointer=readPointer();if(!pointer?.pending||!sameVersion(pointer.version,version))return false;pointer.pending=false;pointer.confirmedAt=new Date().toISOString();atomicWrite(pointer);return true;}
function spawnSelection(selection,extra=[]){const exe=absoluteSelection(selection);if(!exe||!fs.existsSync(exe))throw Error('Selected ZeroPlay version is missing: '+String(selection?.path||''));const child=spawn(exe,['--version-child',...extra],{cwd:path.dirname(exe),env:{...process.env,ZERO_LAUNCHER_ROOT:rootDir()},detached:true,stdio:'ignore',windowsHide:false});return child;}
function rollback(pointer){const previous=pointer?.previous||baseSelection();atomicWrite({...previous,pending:false,rolledBackAt:new Date().toISOString()});return previous;}
function maybeLaunchCurrent(app){if(!app.isPackaged||process.argv.includes('--smoke-test')||process.argv.includes('--ui-smoke-test')||process.argv.includes('--version-child'))return false;const pointer=readPointer(),target=absoluteSelection(pointer);
  if(pointer&&(!target||!fs.existsSync(target))){
    // A partial/external update cannot permanently strand the base installation.
    try{rollback(pointer);}catch{}
    return false;
  }
  if(!pointer||!target||path.resolve(target)===path.resolve(process.execPath))return false;// Never reopen an older cached version if the portable executable is newer.
  if(isNewerVersion(app.getVersion(),pointer.version))return false;
  // This declaration must not be part of the comment above. A pending update
  // registers exit/rollback handlers against this process; missing it caused
  // a startup ReferenceError when current.json pointed to a pending version.
  let child;
  try{
    child=spawnSelection(pointer);
    child.unref();
  }catch{return false;}
  // A confirmed version is already known-good. Start it detached and let the stable launcher exit.
  if(!pointer.pending){setTimeout(()=>app.exit(0),350);return true;}
  let finished=false;const finish=()=>{if(finished)return;finished=true;clearInterval(check);clearTimeout(timeout);app.exit(0);};const recover=()=>{if(finished)return;finished=true;clearInterval(check);clearTimeout(timeout);try{child.kill();}catch{}try{const previous=rollback(pointer),fallback=spawnSelection(previous,['--rollback']);fallback.unref();}catch{}app.exit(0);};
  child.once('exit',()=>{const now=readPointer();if(now?.pending)recover();else finish();});
  const check=setInterval(()=>{const now=readPointer();if(now&&!now.pending&&sameVersion(now.version,pointer.version))finish();},500);
  const timeout=setTimeout(()=>{const now=readPointer();if(now?.pending)recover();else finish();},20000);
  return true;}
function launchRoot(){const exe=path.join(rootDir(),'ZeroPlay.exe');const child=spawn(exe,[],{cwd:rootDir(),env:{...process.env,ZERO_LAUNCHER_ROOT:rootDir()},detached:true,stdio:'ignore',windowsHide:false});child.unref();return child;}
async function ensureVersionsDir(){const dir=path.join(rootDir(),'versions');await fsp.mkdir(dir,{recursive:true});return dir;}
module.exports={rootDir,pointerPath,readPointer,validSelection,validatedPointer,publicVersion,normalizedVersion,sameVersion,isNewerVersion,currentSelection,activate,confirmCurrent,maybeLaunchCurrent,launchRoot,ensureVersionsDir,absoluteSelection};
