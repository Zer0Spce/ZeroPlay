'use strict';
const fs=require('node:fs'),path=require('node:path');
const target=path.resolve(__dirname,'apply-2.2-windows-ui.cjs');
let text=fs.readFileSync(target,'utf8'),changed=false;

if(!text.includes('ZERO22_COLLECTION_POSTPASS')){
  const re=/\n app=req\(app,\n`\+row\('More like this',related\);`,\n`[\s\S]*?`,'details collection button'\);/;
  if(!re.test(text))throw Error('Could not find stale details collection button patch block');
  text=text.replace(re,"\n // ZERO22_COLLECTION_POSTPASS: the live 2.1.2 template is patched after this script runs.");
  changed=true;
  console.log('Adjusted stale Windows UI collection patch marker');
}else console.log('Windows UI collection patch marker already adjusted');

// The inherited click router used to declare `action` late. We fix the live source
// before the 2.2 UI patch runs, so the 2.2 patch must insert its extra handlers at
// a stable marker rather than looking for that late declaration.
if(!text.includes('ZERO22_CLICK_POSTPASS')){
  const start=text.indexOf(' // Extra click handlers before action dispatch.');
  const label="'2.2 click handlers');";
  const end=start<0?-1:text.indexOf(label,start);
  if(start<0||end<0)throw Error('Could not find stale 2.2 click-handler patch block');
  const replacement=` // ZERO22_CLICK_POSTPASS: action is declared at click-router entry by compatibility patch.\n app=before(app,\n\`  if(target.classList.contains('brand')){\`,\n\`  if(target.dataset.person){await personPage(Number(target.dataset.person),target.dataset.personName||'Person');return;}if(target.dataset.collectionId){await collectionPage(Number(target.dataset.collectionId),target.dataset.collectionName||'Collection');return;}if(target.dataset.panelMove){moveHomePanel(target.dataset.panelId,target.dataset.panelMove==='up'?-1:1);panelSettings();return;}if(target.dataset.quick){await runQuick(target.dataset.quick);return;}\\\n\`,'2.2 click handlers');`;
  text=text.slice(0,start)+replacement+text.slice(end+label.length);
  changed=true;
  console.log('Adjusted Windows 2.2 click-handler patch marker');
}else console.log('Windows UI click patch marker already adjusted');

if(changed)fs.writeFileSync(target,text);

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
