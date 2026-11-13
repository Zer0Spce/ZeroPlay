'use strict';
const fs=require('node:fs');
const path=require('node:path');
const packagePath=path.join(__dirname,'..','windows','package.json');
const pkg=JSON.parse(fs.readFileSync(packagePath,'utf8'));
const expected=['2.2.5-test1','2.2.4-1','2.2.4'];
if(!expected.includes(pkg.version))throw new Error('Unexpected Windows base version: '+pkg.version);
if(!pkg.build?.win||!Array.isArray(pkg.build.extraFiles)||
  !pkg.build.extraFiles.some(x=>x.to==='ZeroPlayUpdater.exe'))throw new Error('Standalone updater packaging config missing');
// The title bar PNG is not the Windows Explorer .exe icon. Electron-builder
// requires a multi-resolution ICO embedded in the PE executable resource.
const assets=path.join(__dirname,'..','windows','assets');
const approved=path.join(assets,'zeroplay-app-icon.png');
const logoPng=path.join(assets,'zeroplay-home-logo.png');
if(!fs.existsSync(approved)||!fs.existsSync(logoPng))
  throw new Error('Approved red ZeroPlay playmark or wordmark missing');
const sizes=[16,24,32,48,64,128,256];
const pngs=sizes.map(size=>{
  const filepath=path.join(assets,'zeroplay-app-icon-'+size+'.png');
  if(!fs.existsSync(filepath))throw new Error('Required Windows app icon size missing: '+size);
  const bytes=fs.readFileSync(filepath);
  if(bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a'||
     bytes.readUInt32BE(16)!==size||bytes.readUInt32BE(20)!==size||bytes.length<200)
    throw new Error('Invalid transparent PNG for size '+size);
  return bytes;
});
const header=Buffer.alloc(6+pngs.length*16);
header.writeUInt16LE(0,0);
header.writeUInt16LE(1,2);
header.writeUInt16LE(pngs.length,4);
let offset=header.length;
for(let i=0;i<pngs.length;i++){
  const size=sizes[i],p=pngs[i],at=6+i*16;
  header[at]=size===256?0:size;header[at+1]=size===256?0:size;
  header[at+2]=0;header[at+3]=0;
  header.writeUInt16LE(1,at+4);
  header.writeUInt16LE(32,at+6);
  header.writeUInt32LE(p.length,at+8);
  header.writeUInt32LE(offset,at+12);
  offset+=p.length;
}
const iconIco=path.join(assets,'zeroplay-playmark.ico');
fs.writeFileSync(iconIco,Buffer.concat([header,...pngs]));
fs.copyFileSync(path.join(assets,'zeroplay-app-icon-256.png'),path.join(assets,'icon.png'));
const embedded=fs.readFileSync(iconIco);
if(embedded.readUInt16LE(4)!==7||embedded.length!==offset)throw new Error('ICO file invalid');
pkg.build.win.icon='assets/zeroplay-playmark.ico';
pkg.build.win.signAndEditExecutable=true;
console.log('Windows executable icon: seven sizes 16–256 px,',embedded.length,'bytes');
pkg.version='2.2.6-3';
pkg.build.buildVersion='2.2.6.3';
const production=true; // signed release workflow: public ZIP version and official identity
pkg.build.win.artifactName=production?'ZeroPlay-2.2.6.3-Windows-x64.${ext}':'ZeroPlay-2.2.6.3-TEST-Windows-x64.${ext}';
fs.writeFileSync(packagePath,JSON.stringify(pkg,null,2)+'\n');
const verified=JSON.parse(fs.readFileSync(packagePath,'utf8'));
if(verified.version!=='2.2.6-3'||verified.build.win.artifactName!==(production?'ZeroPlay-2.2.6.3-Windows-x64.${ext}':'ZeroPlay-2.2.6.3-TEST-Windows-x64.${ext}'))throw new Error('Package version verification failed');
console.log('Verified ZeroPlay 2.2.6.3 production packaging:',verified.build.win.artifactName);
