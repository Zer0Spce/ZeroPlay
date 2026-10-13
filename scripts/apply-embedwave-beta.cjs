'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const file=rel=>path.join(root,rel);
function edit(rel,changes){const target=file(rel);if(!fs.existsSync(target))return false;let text=fs.readFileSync(target,'utf8'),changed=false;for(const change of changes){if(text.includes(change.to))continue;if(!text.includes(change.from)){if(change.optional)continue;throw Error('Missing Embedwave marker in '+rel+': '+change.label);}text=text.replace(change.from,change.to);changed=true;}if(changed)fs.writeFileSync(target,text);return changed;}
function replaceAll(rel,from,to,label){const target=file(rel);if(!fs.existsSync(target))return false;let text=fs.readFileSync(target,'utf8');if(text.includes(to)&&!text.includes(from))return false;if(!text.includes(from))throw Error('Missing Embedwave marker in '+rel+': '+label);text=text.split(from).join(to);fs.writeFileSync(target,text);return true;}
let touched=0;

// Android 2.2 generated source: source health, failover and navigation trust.
touched+=edit('app/src/main/java/com/zerostreams/app/MainActivity.java',[
 {label:'Android source health candidates',from:'PlaybackHealth.best(prefs,Arrays.asList("vidstuck","vidsrc-sh"),"vidstuck")',to:'PlaybackHealth.best(prefs,Arrays.asList("vidstuck","embedwave","vidsrc-sh"),"vidstuck")',optional:true}
])?1:0;
touched+=edit('app/src/main/java/com/zerostreams/app/BrowserPlayerActivity.java',[
 {label:'Android main-frame provider hosts',from:'java.util.Arrays.asList("vidstuck.xyz","vidsrc.sh")',to:'java.util.Arrays.asList("vidstuck.xyz","embedwave.cc","vidsrc.sh")',optional:true},
 {label:'Android current provider detection',from:'private String currentProvider(){try{return "vidsrc.sh".equals(Uri.parse(currentAddress).getHost())?"vidsrc-sh":"vidstuck";}catch(Exception e){return "vidstuck";}}',to:'private String currentProvider(){try{String host=Uri.parse(currentAddress).getHost();return "embedwave.cc".equals(host)?"embedwave":"vidsrc.sh".equals(host)?"vidsrc-sh":"vidstuck";}catch(Exception e){return "vidstuck";}}',optional:true},
 {label:'Android source failover cycle',from:'String next=currentProvider().equals("vidstuck")?"vidsrc-sh":"vidstuck";',to:'String current=currentProvider(),next=current.equals("vidstuck")?"embedwave":current.equals("embedwave")?"vidsrc-sh":"vidstuck";',optional:true}
])?1:0;

// Windows 2.2 generated source and UI.
touched+=edit('windows/main.cjs',[
 {label:'Windows requested sources',from:'["vidstuck","vidsrc-sh","rawcast"].includes(sourceOverride)',to:'["vidstuck","embedwave","vidsrc-sh","rawcast"].includes(sourceOverride)',optional:true},
 {label:'Windows best source candidates',from:"const ids=['vidstuck','vidsrc-sh'];",to:"const ids=['vidstuck','embedwave','vidsrc-sh'];",optional:true},
 {label:'Windows source failover cycle',from:"const alternate=playbackSource==='vidstuck'?'vidsrc-sh':'vidstuck';",to:"const alternate=playbackSource==='vidstuck'?'embedwave':playbackSource==='embedwave'?'vidsrc-sh':'vidstuck';",optional:true},
 {label:'Windows player navigation hosts',from:"['vidstuck.xyz','vidsrc.sh'].includes(u.hostname)",to:"['vidstuck.xyz','embedwave.cc','vidsrc.sh'].includes(u.hostname)",optional:true}
])?1:0;
touched+=edit('windows/ui/app.js',[
 {label:'Windows source picker',from:"const sources=[['vidstuck','VidStuck'],['vidsrc-sh','VidSrc.sh'],['rawcast','RawCast · Limited quota']];",to:"const sources=[['vidstuck','VidStuck'],['embedwave','Embedwave (BETA)'],['vidsrc-sh','VidSrc.sh'],['rawcast','RawCast · Limited quota']];",optional:true},
 {label:'Windows collection button live marker',from:"${row('More like this',related)}</div>`;",to:"${row('More like this',related)}${collection?.id?`<div class=\"actions\"><button data-collection-id=\"${Number(collection.id)}\" data-collection-name=\"${escape(collection.name||'Collection')}\">View ${escape(collection.name||'movie collection')}</button></div>`:''}</div>`;",optional:true}
])?1:0;

// Website: keep the web provider list intentionally limited to VidStuck + Embedwave.
touched+=edit('web/public/browser.js',[
 {label:'Web persisted source allowlist',from:"if(saved.settings.source!=='vidstuck'){saved.settings.source='vidstuck';try{localStorage.setItem(STORAGE,JSON.stringify(saved));}catch{}}",to:"if(!['vidstuck','embedwave'].includes(saved.settings.source)){saved.settings.source='vidstuck';try{localStorage.setItem(STORAGE,JSON.stringify(saved));}catch{}}",optional:true},
 {label:'Web source validation',from:"value.source!=='vidstuck'",to:"!['vidstuck','embedwave'].includes(value.source)",optional:true},
 {label:'Web source save',from:"theme:value.theme,source:'vidstuck'",to:"theme:value.theme,source:value.source",optional:true},
 {label:'Web selected source playback',from:"window.playbackSources.url(item,position,'vidstuck')",to:"window.playbackSources.url(item,position,saved.settings.source||'vidstuck')",optional:true},
 {label:'Web Embedwave referrer policy',from:"iframe.referrerPolicy='strict-origin-when-cross-origin';",to:"iframe.referrerPolicy=url.hostname==='embedwave.cc'?'no-referrer':'strict-origin-when-cross-origin';",optional:true}
])?1:0;
const oldWebOptions='<option value="vidstuck">VidStuck</option><option value="vidsrc-sh">VidSrc.sh</option>';
const newWebOptions='<option value="vidstuck">VidStuck</option><option value="embedwave">Embedwave (BETA)</option>';
if(fs.existsSync(file('web/public/app.js'))){let app=fs.readFileSync(file('web/public/app.js'),'utf8');if(app.includes(oldWebOptions)){app=app.split(oldWebOptions).join(newWebOptions);fs.writeFileSync(file('web/public/app.js'),app);touched++;}}
touched+=edit('web/public/index.html',[
 {label:'Web CSP frame source',from:"frame-src https://vidstuck.xyz;",to:"frame-src https://vidstuck.xyz https://embedwave.cc;",optional:true},
 {label:'Web settings source',from:'<option value="vidstuck">VidStuck · Recommended</option>',to:'<option value="vidstuck">VidStuck · Recommended</option><option value="embedwave">Embedwave (BETA)</option>',optional:true},
 {label:'Web source disclosure',from:'Web movie and series playback uses VidStuck.',to:'Web movie and series playback uses VidStuck or Embedwave (BETA).',optional:true}
])?1:0;
console.log('Embedwave (BETA) integration post-pass complete · files touched:',touched);
