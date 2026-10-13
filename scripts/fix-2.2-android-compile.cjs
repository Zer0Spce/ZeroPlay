'use strict';
const fs=require('node:fs'),path=require('node:path');
const target=path.resolve(__dirname,'../app/src/main/java/com/zerostreams/app/BrowserPlayerActivity.java');
let text=fs.readFileSync(target,'utf8');
let changed=0;
if(text.includes('private void showQuickMenu(){List<String> items=')){text=text.replace('private void showQuickMenu(){List<String> items=','private void showQuickMenu(){java.util.List<String> items=');changed++;}
if(text.includes('JSONArray eps=ContentApi.seasonEpisodes')){text=text.replace('JSONArray eps=ContentApi.seasonEpisodes','org.json.JSONArray eps=ContentApi.seasonEpisodes');changed++;}
if(changed!==2)throw new Error('Expected both generated BrowserPlayerActivity compile markers; changed '+changed);
fs.writeFileSync(target,text);
console.log('Fixed generated ZeroPlay 2.2 Android compile types');
