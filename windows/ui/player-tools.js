document.getElementById('back').addEventListener('click',()=>window.playerTools.back());
document.getElementById('fullscreen').addEventListener('click',()=>window.playerTools.fullscreen());
window.playerTools.onTitle(title=>document.getElementById('title').textContent=title);


window.playerTools.onSportsMode(value=>{const select=document.getElementById('sports-sources');select.hidden=false;document.getElementById('sports-retry').hidden=false;value.sources.forEach((label,i)=>{const option=document.createElement('option');option.textContent=label;option.value=i;select.append(option);});select.value=value.index;select.onchange=()=>window.playerTools.sportsControl('source',Number(select.value));});document.getElementById('sports-retry').onclick=()=>window.playerTools.sportsControl('retry');

for(const [id,action] of [['back10','back10'],['play-pause','play'],['forward10','forward10'],['skip-intro','intro']])document.getElementById(id)?.addEventListener('click',()=>window.playerTools.control(action));document.getElementById('mini')?.addEventListener('click',()=>window.playerTools.mini());document.getElementById('diagnostics')?.addEventListener('click',async()=>{const data=await window.playerTools.diagnostics();alert(data?JSON.stringify(data,null,2):'Diagnostics unavailable');});
