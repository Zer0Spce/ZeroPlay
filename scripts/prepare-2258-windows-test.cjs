'use strict';
const fs=require('node:fs');
const path=require('node:path');
const packagePath=path.join(__dirname,'..','windows','package.json');
const pkg=JSON.parse(fs.readFileSync(packagePath,'utf8'));
const expected=['2.2.5-test1','2.2.4-1','2.2.4'];
if(!expected.includes(pkg.version))throw new Error('Unexpected Windows base version: '+pkg.version);
if(!pkg.build?.win||!Array.isArray(pkg.build.extraFiles)||
  !pkg.build.extraFiles.some(x=>x.to==='ZeroPlayUpdater.exe'))throw new Error('Standalone updater packaging config missing');
// Use the supplied playmark for the Windows title-bar icon and package icon.
// ICO with an embedded transparent PNG is supported by current Windows/Electron.
const assets=path.join(__dirname,'..','windows','assets');
const iconPng=path.join(assets,'zeroplay-app-icon.png');
const logoPng=path.join(assets,'zeroplay-home-logo.png');
if(!fs.existsSync(iconPng)||!fs.existsSync(logoPng))throw new Error('Approved ZeroPlay logo/icon assets missing');
const png=fs.readFileSync(iconPng);
if(png.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw new Error('App icon PNG signature invalid');
const width=png.readUInt32BE(16),height=png.readUInt32BE(20);
if(width!==height||width<128||width>256)throw new Error('App icon must be square and 128–256 pixels');
const header=Buffer.alloc(22);
header.writeUInt16LE(0,0);header.writeUInt16LE(1,2);header.writeUInt16LE(1,4);
header[6]=width===256?0:width;header[7]=height===256?0:height;
header.writeUInt16LE(1,10);header.writeUInt16LE(32,12);
header.writeUInt32LE(png.length,14);header.writeUInt32LE(22,18);
fs.writeFileSync(path.join(assets,'icon.ico'),Buffer.concat([header,png]));
fs.copyFileSync(iconPng,path.join(assets,'icon.png'));
console.log('Windows ZeroPlay icon updated:',width,'x',height,'and transparent ICO');
pkg.version='2.2.5-8';
pkg.build.buildVersion='2.2.5.8';
pkg.build.win.artifactName='ZeroPlay-2.2.5.8-TEST-Windows-x64.${ext}';
fs.writeFileSync(packagePath,JSON.stringify(pkg,null,2)+'\n');
const verified=JSON.parse(fs.readFileSync(packagePath,'utf8'));
if(verified.version!=='2.2.5-8'||verified.build.win.artifactName!=='ZeroPlay-2.2.5.8-TEST-Windows-x64.${ext}')throw new Error('Package version verification failed');
console.log('Verified ZeroPlay 2.2.5.8 test packaging:',verified.build.win.artifactName);
