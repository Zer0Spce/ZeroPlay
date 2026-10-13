'use strict';
const fs=require('node:fs'),path=require('node:path');
const target=path.resolve(__dirname,'../app/src/main/java/com/zerostreams/app/BrowserPlayerActivity.java');
let text=fs.readFileSync(target,'utf8'),changed=0;
if(text.includes('private void showQuickMenu(){List<String> items=')){text=text.replace('private void showQuickMenu(){List<String> items=','private void showQuickMenu(){java.util.List<String> items=');changed++;}
if(/(^|[^.A-Za-z0-9_])JSONArray eps=ContentApi\.seasonEpisodes/m.test(text)){text=text.replace(/(^|[^.A-Za-z0-9_])JSONArray eps=ContentApi\.seasonEpisodes/g,'$1org.json.JSONArray eps=ContentApi.seasonEpisodes');changed++;}
if(text.includes('private void showQuickMenu(){List<String> items='))throw new Error('Unqualified List remains in generated BrowserPlayerActivity');
if(/(^|[^.A-Za-z0-9_])JSONArray eps=ContentApi\.seasonEpisodes/m.test(text))throw new Error('Unqualified JSONArray remains in generated BrowserPlayerActivity');
fs.writeFileSync(target,text);
console.log('Verified/fixed generated ZeroPlay 2.2 Android compile types · changes:',changed);
