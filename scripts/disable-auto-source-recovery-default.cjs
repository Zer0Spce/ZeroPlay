'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
function patch(rel,replacements){const target=path.join(root,rel);let text=fs.readFileSync(target,'utf8'),changed=false;for(const [from,to,label] of replacements){if(text.includes(to)&&!text.includes(from))continue;if(!text.includes(from))throw Error(`Missing marker in ${rel}: ${label}`);text=text.split(from).join(to);changed=true;}if(changed)fs.writeFileSync(target,text);console.log(`${rel}: ${changed?'updated':'already correct'}`);}

patch('app/src/main/java/com/zerostreams/app/BrowserPlayerActivity.java',[
 ['prefs.getBoolean("autoSourceRecovery",true)','prefs.getBoolean("autoSourceRecovery",false)','Android player recovery default']
]);
patch('app/src/main/java/com/zerostreams/app/MainActivity.java',[
 ['recovery.setChecked(prefs.getBoolean("autoSourceRecovery",true))','recovery.setChecked(prefs.getBoolean("autoSourceRecovery",false))','Android settings recovery default'],
 ['prefs=getSharedPreferences("zero",MODE_PRIVATE);if(!prefs.getBoolean("trailerDelay175",false))','prefs=getSharedPreferences("zero",MODE_PRIVATE);if(!prefs.getBoolean("autoSourceRecoveryDefaultOff22",false)){prefs.edit().putBoolean("autoSourceRecovery",false).putBoolean("autoSourceRecoveryDefaultOff22",true).apply();}if(!prefs.getBoolean("trailerDelay175",false))','Android one-time recovery migration']
]);
patch('windows/main.cjs',[
 ['autoSourceRecovery:true','autoSourceRecovery:false','Windows defaults recovery off'],
 ['state.settings.autoSourceRecovery!==false','state.settings.autoSourceRecovery===true','Windows failover opt-in'],
 ['autoSourceRecovery:value.autoSourceRecovery!==false','autoSourceRecovery:value.autoSourceRecovery===true','Windows settings normalization'],
 ['try{const saved=JSON.parse(fs.readFileSync(file,\'utf8\'));state={...state,...saved,settings:{...state.settings,...saved.settings}};}catch{}if(!state.settings.trailerDelay175)','try{const saved=JSON.parse(fs.readFileSync(file,\'utf8\'));state={...state,...saved,settings:{...state.settings,...saved.settings}};}catch{}if(!state.settings.autoSourceRecoveryDefaultOff22){state.settings.autoSourceRecovery=false;state.settings.autoSourceRecoveryDefaultOff22=true;}if(!state.settings.trailerDelay175)','Windows one-time recovery migration']
]);
patch('windows/ui/app.js',[
 ['$(\'#zero22-recovery\').checked=state.settings.autoSourceRecovery!==false','$(\'#zero22-recovery\').checked=state.settings.autoSourceRecovery===true','Windows recovery checkbox default'],
 ["autoSourceRecovery:$('#zero22-recovery')?.checked!==false","autoSourceRecovery:$('#zero22-recovery')?.checked===true",'Windows recovery save opt-in']
]);

// Keep deterministic 2.2 generators aligned so regeneration cannot turn recovery back on.
patch('scripts/apply-2.2-android-core.cjs',[
 ['getBoolean(\\"autoSourceRecovery\\",true)','getBoolean(\\"autoSourceRecovery\\",false)','Android generator recovery defaults']
]);
patch('scripts/apply-2.2-windows.cjs',[
 ['autoSourceRecovery:true','autoSourceRecovery:false','Windows generator defaults'],
 ['autoSourceRecovery!==false','autoSourceRecovery===true','Windows generator opt-in semantics']
]);
console.log('Automatic source recovery now defaults OFF and remains user-opt-in.');
