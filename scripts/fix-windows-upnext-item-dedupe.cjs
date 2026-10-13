'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const uiPath=path.join(root,'windows/ui/app.js');
const generatorPath=path.join(root,'scripts/apply-2.2-windows-ui.cjs');

function replaceRequired(text,from,to,label){
  if(text.includes(to))return text;
  if(!text.includes(from))throw new Error('Missing '+label+' marker');
  return text.replace(from,to);
}

let ui=fs.readFileSync(uiPath,'utf8');
ui=replaceRequired(ui,
"function continueItems(){return Object.values(state.positions).filter(item=>Number(item.timestamp)>0&&Number(item.percent)<95).sort((a,b)=>b.at-a.at);}",
"function continueItems(){return Object.values(state.positions).filter(item=>Number(item.timestamp)>0&&Number(item.percent)<95).sort((a,b)=>b.at-a.at);}\nfunction upNextItems(items=Object.values(state.positions||{})){const rows=[...(items||[])].filter(item=>item?.type==='tv'&&Number(item.episode)>0).sort((a,b)=>(b.at||0)-(a.at||0)),seen=new Set(),out=[];for(const item of rows){const numericId=Number(item.id);if(!Number.isSafeInteger(numericId)||numericId<1)continue;const identity='tv:'+numericId;if(seen.has(identity))continue;seen.add(identity);out.push(item);if(out.length>=20)break;}return out;}",
'Windows Up Next helper');
ui=replaceRequired(ui,
"upnext=Object.values(state.positions||{}).filter(x=>x?.type==='tv'&&Number(x.episode)>0).sort((a,b)=>(b.at||0)-(a.at||0)).slice(0,20);",
"upnext=upNextItems();",
'Windows Up Next derived row');
fs.writeFileSync(uiPath,ui);

let generator=fs.readFileSync(generatorPath,'utf8');
const generatorOld="`  const upcoming=(homeData.upcoming||[]).filter(item=>item.date>new Date().toLocaleDateString('en-CA')),historyGenres=new Set((state.history||[]).flatMap(x=>x.genreIds||[])),because=(homeData.trending||[]).filter(x=>(x.genreIds||[]).some(g=>historyGenres.has(g))&&!state.positions[key(x)]).slice(0,20),hidden=(homeData.popular||[]).filter(x=>x.rating>=7.2&&x.voteCount>=80&&x.popularity<350).slice(0,20),tonight=(homeData.popular||[]).filter(x=>x.type==='movie'&&x.rating>=7&&!state.positions[key(x)]).slice(0,20),upnext=Object.values(state.positions||{}).filter(x=>x?.type==='tv'&&Number(x.episode)>0).sort((a,b)=>(b.at||0)-(a.at||0)).slice(0,20);const panels={clock:`";
const generatorNew="`  const upcoming=(homeData.upcoming||[]).filter(item=>item.date>new Date().toLocaleDateString('en-CA')),historyGenres=new Set((state.history||[]).flatMap(x=>x.genreIds||[])),because=(homeData.trending||[]).filter(x=>(x.genreIds||[]).some(g=>historyGenres.has(g))&&!state.positions[key(x)]).slice(0,20),hidden=(homeData.popular||[]).filter(x=>x.rating>=7.2&&x.voteCount>=80&&x.popularity<350).slice(0,20),tonight=(homeData.popular||[]).filter(x=>x.type==='movie'&&x.rating>=7&&!state.positions[key(x)]).slice(0,20),upnext=upNextItems();const panels={clock:`";
generator=replaceRequired(generator,generatorOld,generatorNew,'generator Up Next row');
const genContinue="`function continueItems(){return Object.values(state.positions).filter(item=>Number(item.timestamp)>0&&Number(item.percent)<95).sort((a,b)=>b.at-a.at);}`";
const genContinueNew="`function continueItems(){return Object.values(state.positions).filter(item=>Number(item.timestamp)>0&&Number(item.percent)<95).sort((a,b)=>b.at-a.at);}`";
// The current generator patches from the 2.1.2 renderer, where continueItems already exists unchanged.
// Inject the dedupe helper immediately after that function when generating 2.2 from a clean base.
if(!generator.includes("upNextItems(items=Object.values(state.positions||{}))")){
  const marker=" app=req(app,\n`function card(item,landscape=false)";
  if(!generator.includes(marker))throw new Error('Missing generator card marker for Up Next helper insertion');
  const insertion=" app=before(app,\n`const carouselSourceLabels=`,\n`function upNextItems(items=Object.values(state.positions||{})){const rows=[...(items||[])].filter(item=>item?.type==='tv'&&Number(item.episode)>0).sort((a,b)=>(b.at||0)-(a.at||0)),seen=new Set(),out=[];for(const item of rows){const numericId=Number(item.id);if(!Number.isSafeInteger(numericId)||numericId<1)continue;const identity='tv:'+numericId;if(seen.has(identity))continue;seen.add(identity);out.push(item);if(out.length>=20)break;}return out;}\\n`,\n'up next unique-series helper');\n";
  const anchor=" const oldPanels=`";
  if(!generator.includes(anchor))throw new Error('Missing generator panel anchor');
  generator=generator.replace(anchor,insertion+anchor);
}
fs.writeFileSync(generatorPath,generator);
console.log('Windows Up Next now dedupes by TV series ID and keeps the newest progress entry.');
