'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),p=rel=>path.join(root,rel);
function req(text,from,to,label){if(text.includes(to))return text;if(!text.includes(from))throw Error('Missing Windows episode marker: '+label);return text.replace(from,to);}

const mainPath=p('windows/main.cjs');let main=fs.readFileSync(mainPath,'utf8');
if(!main.includes('ZERO22_WINDOWS_EPISODES')){
  main=req(main,
    "let miniBounds=null,currentPlaybackSource='vidstuck',sourceRecoveryAttempted=false;",
    "let miniBounds=null,currentPlaybackSource='vidstuck',sourceRecoveryAttempted=false;\n// ZERO22_WINDOWS_EPISODES\nlet currentPlaybackEpisode=null,episodeSwitching=false,autoNextTimer=null,autoNextBusy=false;",
    'episode fields');
  main=req(main,
    "  if(selected&&saved&&saved.season===position.season&&saved.episode===position.episode)position=saved;",
    "  if(selected&&saved&&saved.season===position.season&&saved.episode===position.episode)position=saved;currentPlaybackEpisode=value.type==='tv'?core.episode(position):null;",
    'current episode selection');
  main=req(main,
    "  clearInterval(scanTimer);clearInterval(cursorTimer);if(qrWorker)qrWorker.terminate();qrWorker=null;scanning=false;host.close();",
    "  clearInterval(scanTimer);clearInterval(cursorTimer);clearInterval(autoNextTimer);autoNextTimer=null;autoNextBusy=false;if(qrWorker)qrWorker.terminate();qrWorker=null;scanning=false;host.close();",
    'clear auto-next timer');
  main=req(main,
    "  await toolbar.webContents.loadFile(path.join(__dirname,'ui/player-tools.html'));toolbar.webContents.send('player-title',value.title);",
    "  await toolbar.webContents.loadFile(path.join(__dirname,'ui/player-tools.html'));toolbar.webContents.send('player-title',value.title);toolbar.webContents.send('episode-mode',{enabled:value.type==='tv',season:currentPlaybackEpisode?.season||1,episode:currentPlaybackEpisode?.episode||1});",
    'toolbar episode mode');
  const helper=`async function moveEpisode(delta){\n  if(episodeSwitching||!current||current.type!=='tv'||![-1,1].includes(Number(delta)))return false;episodeSwitching=true;const item=current,view=player,source=currentPlaybackSource,position=currentPlaybackEpisode||core.episode(state.positions[core.key(item)]||{});\n  try{const details=await api('/tv/'+item.id);if(player!==view||current!==item)return false;const next=require('./episode-navigation.cjs').target(details,position,Number(delta));if(!next)return false;await openPlayer(item,next,null,false,source);return true;}finally{episodeSwitching=false;}\n}\nfunction armAutoNext(view){clearInterval(autoNextTimer);autoNextTimer=null;autoNextBusy=false;if(!current||current.type!=='tv'||state.settings.autoplayNext===false)return;autoNextTimer=setInterval(async()=>{if(autoNextBusy||player!==view||!player||player.webContents.isDestroyed())return;try{for(const frame of player.webContents.mainFrame.framesInSubtree){const ended=await frame.executeJavaScript(\`(()=>{const videos=[...document.querySelectorAll('video')].filter(v=>v.duration>60);const v=videos.sort((a,b)=>(b.clientWidth*b.clientHeight)-(a.clientWidth*a.clientHeight))[0];return !!v&&(v.ended||(Number.isFinite(v.duration)&&v.currentTime>=v.duration-.5));})()\`).catch(()=>false);if(ended){autoNextBusy=true;clearInterval(autoNextTimer);autoNextTimer=null;setTimeout(()=>moveEpisode(1).finally(()=>{autoNextBusy=false;}),650);break;}}}catch{}},1500);\n}\n`;
  main=req(main,'async function openSports(',helper+'async function openSports(','episode helper');
  main=req(main,
    "  scanTimer=setInterval(scanAd,3500);\n  try{if(fixture&&smoke)await contents.loadFile(fixture);else await contents.loadURL(core.playerUrl(value,position,playbackSource));contents.focus();}catch(error){if(player===view)closePlayer();throw error;}",
    "  scanTimer=setInterval(scanAd,3500);\n  try{if(fixture&&smoke)await contents.loadFile(fixture);else await contents.loadURL(core.playerUrl(value,position,playbackSource));contents.focus();armAutoNext(view);}catch(error){if(player===view)closePlayer();throw error;}",
    'arm auto next');
  main=req(main,
    "  ipcMain.handle('player-diagnostics',async event=>{if(event.sender!==toolbar?.webContents&&event.sender!==main?.webContents)throw Error('Untrusted player control');if(!player||player.webContents.isDestroyed())return null;const data=await player.webContents.executeJavaScript('window.__zeroPlayerDiagnostics?window.__zeroPlayerDiagnostics():{}').catch(()=>({}));return {...data,source:currentPlaybackSource,health:sourceHealth(currentPlaybackSource)};});",
    "  ipcMain.handle('player-diagnostics',async event=>{if(event.sender!==toolbar?.webContents&&event.sender!==main?.webContents)throw Error('Untrusted player control');if(!player||player.webContents.isDestroyed())return null;const data=await player.webContents.executeJavaScript('window.__zeroPlayerDiagnostics?window.__zeroPlayerDiagnostics():{}').catch(()=>({}));return {...data,source:currentPlaybackSource,health:sourceHealth(currentPlaybackSource),episode:currentPlaybackEpisode};});\n  ipcMain.handle('player-episode',async(event,direction)=>{if(event.sender!==toolbar?.webContents)throw Error('Untrusted episode control');const delta=direction==='next'?1:direction==='previous'?-1:0;if(!delta)throw Error('Unsupported episode direction');return moveEpisode(delta);});",
    'episode IPC');
  fs.writeFileSync(mainPath,main);
}

const sourcePath=p('windows/playback-sources.cjs');let source=fs.readFileSync(sourcePath,'utf8');
// ZeroPlay owns the 2.2 autoplay toggle so providers cannot double-advance an episode.
source=source.replace("if(item.type==='tv')for(const k of ['nextEpisode','episodeSelector','autoplayNextEpisode'])u.searchParams.set(k,'true');","if(item.type==='tv')for(const k of ['nextEpisode','episodeSelector'])u.searchParams.set(k,'true');");
source=source.replace("if(id==='vidsrc-sh'){u.searchParams.set('ds_lang','en');if(item.type==='tv')u.searchParams.set('autonext','1');}","if(id==='vidsrc-sh')u.searchParams.set('ds_lang','en');");
fs.writeFileSync(sourcePath,source);

const preloadPath=p('windows/player-preload.cjs');let preload=fs.readFileSync(preloadPath,'utf8');
preload=req(preload,"const origins=new Set(['https://vidstuck.xyz','https://vidsrc.sh']);","const origins=new Set(['https://vidstuck.xyz','https://embedwave.cc','https://vidsrc.sh']);",'Embedwave progress origin');
fs.writeFileSync(preloadPath,preload);

const toolsPreloadPath=p('windows/player-tools.cjs');let toolsPreload=fs.readFileSync(toolsPreloadPath,'utf8');
toolsPreload=req(toolsPreload,
  "diagnostics:()=>ipcRenderer.invoke('player-diagnostics'),onTitle:",
  "diagnostics:()=>ipcRenderer.invoke('player-diagnostics'),episode:direction=>ipcRenderer.invoke('player-episode',direction),onEpisodeMode:callback=>ipcRenderer.on('episode-mode',(_event,value)=>callback(value)),onTitle:",
  'toolbar episode bridge');
fs.writeFileSync(toolsPreloadPath,toolsPreload);

const htmlPath=p('windows/ui/player-tools.html');let html=fs.readFileSync(htmlPath,'utf8');
html=req(html,
  '<span id="title">ZeroPlay</span><button id="back10"',
  '<button id="prev-episode" hidden title="Previous episode">⏮ Episode</button><span id="title">ZeroPlay</span><button id="next-episode" hidden title="Next episode">Episode ⏭</button><button id="back10"',
  'episode toolbar buttons');
fs.writeFileSync(htmlPath,html);

const jsPath=p('windows/ui/player-tools.js');let js=fs.readFileSync(jsPath,'utf8');
if(!js.includes("getElementById('prev-episode')"))js += `\nconst previousEpisode=document.getElementById('prev-episode'),nextEpisode=document.getElementById('next-episode');\npreviousEpisode?.addEventListener('click',()=>window.playerTools.episode('previous'));nextEpisode?.addEventListener('click',()=>window.playerTools.episode('next'));window.playerTools.onEpisodeMode?.(value=>{const enabled=value?.enabled===true;if(previousEpisode)previousEpisode.hidden=!enabled;if(nextEpisode)nextEpisode.hidden=!enabled;if(enabled){previousEpisode.title='Previous episode · S'+value.season+' E'+value.episode;nextEpisode.title='Next episode · S'+value.season+' E'+value.episode;}});\n`;
fs.writeFileSync(jsPath,js);
console.log('Applied ZeroPlay 2.2 Windows episode controls and app-level autoplay');
