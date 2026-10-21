'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const file=rel=>path.join(root,rel);
function required(text,from,to,label){
  if(!text.includes(from))throw new Error('Missing 2.2.4 patch marker: '+label);
  return text.replace(from,to);
}
function patch(rel,fn){
  const target=file(rel),before=fs.readFileSync(target,'utf8'),after=fn(before);
  if(after===before)throw new Error('2.2.4 patch made no change: '+rel);
  fs.writeFileSync(target,after);
  console.log('Patched',rel);
}

for(const rel of ['app/src/main/assets/player-guard.js','windows/assets/player-guard.js']){
  patch(rel,text=>required(
    text,
    'const amount = Math.min(2, Number(window.__zeroGain));',
    'const amount = Math.min(10, Math.max(1, Number(window.__zeroGain) || 1));',
    rel+' gain cap'
  ));
}

patch('app/src/main/java/com/zerostreams/app/MainActivity.java',text=>{
  text=required(
    text,
    'boost.setAdapter(spinnerAdapter(new String[]{"Off","1.5× boost","2× boost"}));float savedBoost=prefs.getFloat("audioBoost",1f);boost.setSelection(savedBoost>=2f?2:savedBoost>1f?1:0);',
    'boost.setAdapter(spinnerAdapter(new String[]{"Off","2× boost","3× boost","4× boost","5× boost","10× boost"}));float savedBoost=prefs.getFloat("audioBoost",1f);float[] boostLevels={1f,2f,3f,4f,5f,10f};int boostSelection=0;for(int i=1;i<boostLevels.length;i++)if(savedBoost>=boostLevels[i])boostSelection=i;boost.setSelection(boostSelection);',
    'Android boost options'
  );
  text=required(
    text,
    '.putFloat("audioBoost",boost.getSelectedItemPosition()==2?2f:boost.getSelectedItemPosition()==1?1.5f:1f)',
    '.putFloat("audioBoost",new float[]{1f,2f,3f,4f,5f,10f}[Math.max(0,Math.min(5,boost.getSelectedItemPosition()))])',
    'Android boost save mapping'
  );
  text=required(
    text,
    'panel.addView(text("Applies to compatible embedded streams when playback starts.",12,MUTED));',
    'panel.addView(text("Real audio gain for compatible embedded streams. Higher boosts can sound distorted on already-loud sources.",12,MUTED));',
    'Android boost help text'
  );
  return text;
});

patch('app/src/main/java/com/zerostreams/app/SportsPlayerActivity.java',text=>required(
  text,
  'guard="window.__zeroTv="+BuildConfig.TV+";window.__zeroBlockAds=true;window.__zeroGain=1;"+Catalog.read(input,1000000);',
  'float gain=getSharedPreferences("zero",MODE_PRIVATE).getFloat("audioBoost",1f);guard="window.__zeroTv="+BuildConfig.TV+";window.__zeroBlockAds=true;window.__zeroGain="+gain+";"+Catalog.read(input,1000000);',
  'Sports boost preference'
));

patch('windows/ui/index.html',text=>{
  text=required(
    text,
    '<label>Audio boost<select id="gain"><option value="1">Off</option><option value="1.5">1.5× boost</option><option value="2">2× boost</option></select></label>',
    '<label>Audio boost<select id="gain"><option value="1">Off</option><option value="2">2× boost</option><option value="3">3× boost</option><option value="4">4× boost</option><option value="5">5× boost</option><option value="10">10× boost</option></select></label>',
    'Windows boost options'
  );
  text=required(
    text,
    '<p>Audio boost requires a compatible embedded stream.</p>',
    '<p>Audio boost applies real gain to compatible embedded streams. Higher boosts can distort already-loud sources.</p>',
    'Windows boost help text'
  );
  return text;
});

patch('windows/main.cjs',text=>required(
  text,
  "const defaults=()=>({liveFavorites:[],favorites:[],planned:[],history:[],positions:{},searches:[],collections:{},notInterested:[],profiles:{},activeProfile:'Default',sourceHealth:{},settings:{region:'PH',gain:1,",
  "const defaults=()=>({liveFavorites:[],favorites:[],planned:[],history:[],positions:{},searches:[],collections:{},notInterested:[],profiles:{},activeProfile:'Default',sourceHealth:{},settings:{region:'PH',gain:1,",
  'Windows gain default marker'
).replace(
  "ipcMain.handle('live-context',event=>{liveTrusted(event);return {offline:!!liveSelection.channel.offline,vod:!!liveSelection.channel.vod,index:liveSelection.index,names:",
  "ipcMain.handle('live-context',event=>{liveTrusted(event);return {gain:Math.min(10,Math.max(1,Number(state.settings.gain)||1)),offline:!!liveSelection.channel.offline,vod:!!liveSelection.channel.vod,index:liveSelection.index,names:"
));

patch('windows/ui/live-player.js',text=>{
  text=required(
    text,
    "const $=id=>document.getElementById(id),video=$('video');let player,context,token=0,idle,loading=false,reconnectTimer=null,runtimeRetries=0,currentIndex=0;",
    "const $=id=>document.getElementById(id),video=$('video');let player,context,token=0,idle,loading=false,reconnectTimer=null,runtimeRetries=0,currentIndex=0,audioContext,audioGain,audioSource;",
    'Windows live boost fields'
  );
  text=required(
    text,
    "function canReconnect(){return !!context&&!context.offline&&!context.vod;}",
    "function canReconnect(){return !!context&&!context.offline&&!context.vod;}\nfunction applyBoost(){const amount=Math.min(10,Math.max(1,Number(context?.gain)||1));if(amount<=1)return;const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;try{audioContext=audioContext||new Audio();if(!audioSource){audioSource=audioContext.createMediaElementSource(video);audioGain=audioContext.createGain();const limiter=audioContext.createDynamicsCompressor();limiter.threshold.value=-1;limiter.knee.value=0;limiter.ratio.value=20;limiter.attack.value=.003;limiter.release.value=.1;audioSource.connect(audioGain);audioGain.connect(limiter);limiter.connect(audioContext.destination);}audioGain.gain.value=amount;audioContext.resume().catch(()=>{});}catch(error){console.warn('Audio boost unavailable',error?.message||error);}}",
    'Windows live boost graph'
  );
  text=required(
    text,
    "await video.play();loading=false;runtimeRetries=0;",
    "await video.play();applyBoost();loading=false;runtimeRetries=0;",
    'Windows live apply boost'
  );
  return text;
});

console.log('ZeroPlay 2.2.4 audio boost patch applied.');
