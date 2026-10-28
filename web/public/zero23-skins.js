/* ZeroPlay 2.3 experimental visual skins. Discovery UI only. */
(()=>{'use strict';
const KEY='zeroplay-23-discovery-skin';
const skins={original:'Original ZeroPlay',cinematic:'Cinematic Dark',modern:'Modern Streaming',library:'Premium Media Library',signature:'ZeroPlay Signature'};
function valid(value){return Object.hasOwn(skins,value)?value:'original';}
function apply(value){const skin=valid(value);document.documentElement.dataset.zp23Skin=skin;const select=document.getElementById('zp23-skin');if(select)select.value=skin;try{localStorage.setItem(KEY,skin);}catch{}}
function install(){const settings=document.querySelector('#settings .settings-body');if(!settings||document.getElementById('zp23-skin'))return;const label=document.createElement('label');label.textContent='ZeroPlay 2.3 discovery appearance (test)';
const select=document.createElement('select');select.id='zp23-skin';select.setAttribute('aria-label','Discovery appearance');for(const [value,title] of Object.entries(skins)){const option=document.createElement('option');option.value=value;option.textContent=title;select.appendChild(option);}label.appendChild(select);
const interfaceLabel=document.getElementById('ui-layout')?.closest('label');if(interfaceLabel)interfaceLabel.insertAdjacentElement('afterend',label);else settings.appendChild(label);
const note=document.createElement('p');note.textContent='Visual skins affect discovery screens only. Original ZeroPlay restores the existing appearance. Playback, audio, TV remote navigation, Live TV and Sports are unchanged.';label.insertAdjacentElement('afterend',note);
select.addEventListener('change',()=>apply(select.value));select.value=document.documentElement.dataset.zp23Skin||'original';}
let saved='original';try{saved=localStorage.getItem(KEY)||'original';}catch{}
apply(saved);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
