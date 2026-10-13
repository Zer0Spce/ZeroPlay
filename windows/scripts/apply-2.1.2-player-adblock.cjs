'use strict';
const fs=require('node:fs');
const path=require('node:path');
const file=path.resolve(__dirname,'..','main.cjs');
let source=fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');

const filter=`  // Apply ZeroPlay's host rules at the network layer for embedded movie/show players.\n  // This blocks known ad/tracker frames before their UI can render while core.blocked() protects provider/CDN allowlists.\n  contents.session.webRequest.onBeforeRequest((details,callback)=>{\n    let cancel=false;\n    try{cancel=core.blocked(new URL(details.url).hostname);}catch{}\n    callback({cancel});\n  });`;

if(!source.includes("contents.session.webRequest.onBeforeRequest((details,callback)=>{")){
  const markers=[
    `  const view=player,contents=view.webContents;\n  playerHost=new PlayerHost(main,view,toolbar,{toolbar:false});installPlayerScripts(contents);`,
    `  const view=player,contents=view.webContents;\n  playerHost=new PlayerHost(main,view,toolbar);installPlayerScripts(contents);`
  ];
  const marker=markers.find(value=>source.includes(value));
  if(!marker)throw new Error('Missing embedded player network-filter marker for current player host.');
  const hostLine=marker.split('\n')[1];
  source=source.replace(marker,`  const view=player,contents=view.webContents;\n${filter}\n${hostLine}`);
}

if(!source.includes("contents.session.webRequest.onBeforeRequest((details,callback)=>{"))throw new Error('Embedded player network filter was not installed.');
fs.writeFileSync(file,source);
console.log('Applied 2.2-compatible embedded-player network adblock.');
