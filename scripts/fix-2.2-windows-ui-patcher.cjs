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

// Fix the inherited click router before applying the 2.2 UI additions. The old
// router referenced `action` before its declaration, so action buttons fell into
// the handler catch before Theme/Settings/source-confirm/etc. could run.
const appPath=path.resolve(__dirname,'../windows/ui/app.js');
let app=fs.readFileSync(appPath,'utf8');
const clickStart="document.addEventListener('click',async event=>{const target=event.target.closest('button,[data-nav],.brand');if(!target)return;try{";
const clickFixed="document.addEventListener('click',async event=>{const target=event.target.closest('button,[data-nav],.brand');if(!target)return;const action=target.dataset.action;try{";
if(app.includes(clickStart))app=app.replace(clickStart,clickFixed);
const late="  const action=target.dataset.action;\n  if(action==='toggle-theme')";
if(app.includes(late))app=app.replace(late,"  if(action==='toggle-theme')");
if(!app.includes(clickFixed)||app.includes(late))throw Error('Windows click router action declaration fix did not apply cleanly');
fs.writeFileSync(appPath,app);
console.log('Fixed Windows action-button click router');

// Keep the branch-only regression fixtures aligned with the generated 2.2 UI contract.
require('./fix-2.2-windows-regression-tests.cjs');
