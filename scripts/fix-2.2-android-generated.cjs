'use strict';
const fs=require('node:fs'),path=require('node:path');
const target=path.resolve(__dirname,'../app/src/main/java/com/zerostreams/app/MainActivity.java');
let text=fs.readFileSync(target,'utf8');
const broken='        }else{LinearLayout heading=        }else{LinearLayout heading=';
if(!text.includes(broken))throw new Error('Expected generated 2.2 home renderer join was not found');
text=text.replace(broken,'        }else{LinearLayout heading=');
fs.writeFileSync(target,text);
console.log('Fixed generated ZeroPlay 2.2 Android home renderer join');
