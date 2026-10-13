'use strict';
const fs=require('node:fs'),path=require('node:path');
const target=path.resolve(__dirname,'apply-2.2-windows-ui.cjs');
let text=fs.readFileSync(target,'utf8');
if(!text.includes('ZERO22_COLLECTION_POSTPASS')){
  const re=/\n app=req\(app,\n`\+row\('More like this',related\);`,\n`[\s\S]*?`,'details collection button'\);/;
  if(!re.test(text))throw Error('Could not find stale details collection button patch block');
  text=text.replace(re,"\n // ZERO22_COLLECTION_POSTPASS: the live 2.1.2 template is patched after this script runs.");
  fs.writeFileSync(target,text);
  console.log('Adjusted stale Windows UI collection patch marker');
}else console.log('Windows UI patcher marker already adjusted');
require('./fix-2.2-windows-regression-tests.cjs');
