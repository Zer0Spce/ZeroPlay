'use strict';
const fs=require('node:fs');
const path=require('node:path');
const packagePath=path.join(__dirname,'..','windows','package.json');
const pkg=JSON.parse(fs.readFileSync(packagePath,'utf8'));
const expected=['2.2.5-test1','2.2.4-1','2.2.4'];
if(!expected.includes(pkg.version))throw new Error('Unexpected Windows base version: '+pkg.version);
if(!pkg.build?.win||!Array.isArray(pkg.build.extraFiles)||
  !pkg.build.extraFiles.some(x=>x.to==='ZeroPlayUpdater.exe'))throw new Error('Standalone updater packaging config missing');
pkg.version='2.2.5-8';
pkg.build.buildVersion='2.2.5.8';
pkg.build.win.artifactName='ZeroPlay-2.2.5.8-TEST-Windows-x64.${ext}';
fs.writeFileSync(packagePath,JSON.stringify(pkg,null,2)+'\n');
const verified=JSON.parse(fs.readFileSync(packagePath,'utf8'));
if(verified.version!=='2.2.5-8'||verified.build.win.artifactName!=='ZeroPlay-2.2.5.8-TEST-Windows-x64.${ext}')throw new Error('Package version verification failed');
console.log('Verified ZeroPlay 2.2.5.8 test packaging:',verified.build.win.artifactName);
