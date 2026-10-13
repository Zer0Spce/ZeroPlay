'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
function patch(rel,from,to,label){const target=path.join(root,rel);let text=fs.readFileSync(target,'utf8');if(text.includes(to)&&!text.includes(from)){console.log(`${label}: already fixed`);return;}if(!text.includes(from))throw Error(`Missing marker: ${label}`);text=text.replace(from,to);fs.writeFileSync(target,text);console.log(`${label}: fixed`);}

patch('windows/ui/app.js',
"function homeOrder(){const known=new Set(homePanels.map(p=>p[0])),saved=Array.isArray(state.settings.homePanelOrder)?state.settings.homePanelOrder:[];return [...saved.filter(id=>known.has(id)),...homePanels.map(p=>p[0]).filter(id=>!saved.includes(id))];}",
"function homeOrder(){const known=new Set(homePanels.map(p=>p[0])),saved=Array.isArray(state.settings.homePanelOrder)?state.settings.homePanelOrder:[],seen=new Set(),order=[];for(const id of saved)if(known.has(id)&&!seen.has(id)){seen.add(id);order.push(id);}for(const [id] of homePanels)if(!seen.has(id)){seen.add(id);order.push(id);}return order;}",
'Windows renderer deduplicates homepage order');

patch('windows/main.cjs',
"const homePanelIds=['clock','featured','continue','upnext','because','watchlist','tonight','hidden','upcoming','providers','recommended','trending','popular','series','now','airing','action','comedy','horror','animation','anime','adventure','crime','documentary','drama','family','fantasy','history','music','mystery','romance','scifi','thriller','war','western','tvmovie'];",
"const homePanelIds=['clock','featured','continue','upnext','because','watchlist','tonight','hidden','upcoming','providers','recommended','trending','popular','series','now','airing','action','comedy','horror','animation','anime','adventure','crime','documentary','drama','family','fantasy','history','music','mystery','romance','scifi','thriller','war','western','tvmovie'];\nfunction normalizeHomePanelOrder(value){const out=[];for(const id of Array.isArray(value)?value:[])if(homePanelIds.includes(id)&&!out.includes(id))out.push(id);for(const id of homePanelIds)if(!out.includes(id))out.push(id);return out;}",
'Windows homepage order normalizer');

patch('windows/main.cjs',
"homePanelOrder:Array.isArray(value.homePanelOrder)?value.homePanelOrder.filter(id=>homePanelIds.includes(id)):state.settings.homePanelOrder||homePanelIds.slice()",
"homePanelOrder:normalizeHomePanelOrder(Array.isArray(value.homePanelOrder)?value.homePanelOrder:state.settings.homePanelOrder)",
'Windows settings deduplicate homepage order');

patch('windows/main.cjs',
"try{const saved=JSON.parse(fs.readFileSync(file,'utf8'));state={...state,...saved,settings:{...state.settings,...saved.settings}};}catch{}if(!state.settings.autoSourceRecoveryDefaultOff22)",
"try{const saved=JSON.parse(fs.readFileSync(file,'utf8'));state={...state,...saved,settings:{...state.settings,...saved.settings}};}catch{}state.settings.homePanelOrder=normalizeHomePanelOrder(state.settings.homePanelOrder);if(!state.settings.autoSourceRecoveryDefaultOff22)",
'Windows startup cleans legacy duplicate homepage order');

console.log('Windows homepage panel duplicates are normalized.');
