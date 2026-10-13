'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8').replace(/\r\n/g,'\n');

/*
 * The 2.1.2 production pipeline applied this polish at build time. ZeroPlay 2.2
 * has since integrated those source-selection/history changes directly into the
 * committed application. Re-applying the old openPlayer renderer patch would
 * overwrite the newer Embedwave/source-health/manual-precedence implementation.
 *
 * Keep this release step as a compatibility assertion: fail if any of the
 * production behavior disappeared, otherwise leave the 2.2 implementation
 * untouched. Later production-only patches (episode refresh/completion, mpv,
 * player ad filtering) still run independently after this check.
 */
const core=read('core.cjs');
const preload=read('preload.cjs');
const main=read('main.cjs');
const app=read('ui/app.js');
const index=read('ui/index.html');

const required=[
  [core,'state.positions[historyKey]={...row}','per-episode positions'],
  [preload,"play:(item,episode,source)=>ipcRenderer.invoke('play',item,episode,source)",'source-aware preload play'],
  [main,'sourceOverride','source-aware openPlayer'],
  [main,'embedwave','Embedwave player handling'],
  [app,'function sourceOverrides()','per-title source storage'],
  [app,'function sourceFor(item)','manual source precedence'],
  [app,'oneTimeSources','one-time source selection'],
  [app,"data-action=\"clear-history\"",'clear-history UI action'],
  [index,'Clear watched history','watched-history settings control']
];
for(const [text,needle,label] of required)if(!text.includes(needle))throw Error('Missing integrated 2.2 final polish behavior: '+label);

console.log('ZeroPlay 2.2 already contains the final Windows source/history polish; legacy transform safely skipped.');
