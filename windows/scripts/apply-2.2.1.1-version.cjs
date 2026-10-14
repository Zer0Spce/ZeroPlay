'use strict';
const fs=require('node:fs');
const path=require('node:path');
const target=path.join(__dirname,'..','main.cjs');
let source=fs.readFileSync(target,'utf8');
const from='version:app.getVersion()';
const to='version:versions.normalizedVersion(app.getVersion())';
if(source.includes(to)){
  console.log('Windows 2.2.1.1 display version already normalized');
  process.exit(0);
}
if(!source.includes(from))throw Error('Could not find Windows snapshot version marker');
source=source.replace(from,to);
fs.writeFileSync(target,source);
console.log('Windows UI now exposes 2.2.1-1 internally as 2.2.1.1');
