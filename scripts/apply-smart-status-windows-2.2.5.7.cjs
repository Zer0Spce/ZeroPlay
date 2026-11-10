'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
function patch(rel,changes){
 const file=path.join(root,rel);let code=fs.readFileSync(file,'utf8');
 for(const [from,to] of changes){
   if(code.includes(to))continue;
   if(!code.includes(from))throw Error('Missing Smart Status marker in '+rel+': '+from.slice(0,80));
   code=code.replaceAll(from,to);
 }
 fs.writeFileSync(file,code);
 console.log('Smart Status ready:',rel);
}
patch('windows/playlist.cjs',[[
 "mime:'',drmType:'',drmKey:''",
 "mime:'',drmType:'',drmKey:'',streamStatus:['verified','reachable'].includes(attrs['x-stream-status'])?attrs['x-stream-status']:'unverified'"
]]);
patch('windows/main.cjs',[
 ["logo:c.logo,favorite:", "logo:c.logo,streamStatus:c.streamStatus||'unverified',favorite:"],
 ["2\\.2\\.5\\.5$/.test(result.version)", "2\\.2\\.5\\.7$/.test(result.version)"]
]);
const badge='function streamBadgeHTML(channel){const status=channel.streamStatus===\'verified\'?\'verified\':channel.streamStatus===\'reachable\'?\'reachable\':\'unverified\';return (status===\'verified\'?\'<span class="stream-pill stream-pill-live">LIVE</span>\':\'\')+\'<span class="stream-pill stream-pill-\'+status+\'">\'+status.toUpperCase()+\'</span>\';}';
patch('windows/ui/app.js',[
 ['async function renderPlaylist(force=false)',badge+'\nasync function renderPlaylist(force=false)'],
 ["<small>● LIVE · '+escape(c.group)+'</small>","<small class=\"stream-badge-row\">'+streamBadgeHTML(c)+'</small><small>'+escape(c.group)+'</small>"],
 ["+'</button><button data-favorite-channel=\"'+c.index+'\" aria-label=\"'+(c.favorite?'Remove favorite':'Add favorite')+'\">'+(c.favorite?'★ Favorite':'☆ Add favorite')+'</button></article>'",
  "+'</button>'+(live?'':'<button data-favorite-channel=\"'+c.index+'\" aria-label=\"'+(c.favorite?'Remove favorite':'Add favorite')+'\">'+(c.favorite?'★ Favorite':'☆ Add favorite')+'</button>')+'</article>'"]
]);
const css='windows/ui/style.css',file=path.join(root,css);
let style=fs.readFileSync(file,'utf8');
if(!style.includes('/* SMART-STATUS-WINDOWS-2257 */')){
 style+='\n/* SMART-STATUS-WINDOWS-2257 */\n.stream-badge-row{display:flex;flex-wrap:wrap;gap:5px;align-items:center;margin:8px 0 4px}\n.stream-pill{display:inline-flex;align-items:center;padding:3px 7px;border-radius:5px;font-size:10px;font-weight:800;letter-spacing:.035em;color:#fff;pointer-events:none;cursor:default;user-select:none}\n.stream-pill-live{background:#c52d3b}.stream-pill-verified{background:#15834d}.stream-pill-reachable{background:#a86f16}.stream-pill-unverified{background:#657184}\n';
 fs.writeFileSync(file,style);
}
console.log('Smart Status ready:',css);
