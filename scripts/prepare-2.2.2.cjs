'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const write=(p,s)=>fs.writeFileSync(path.join(root,p),s);
const must=(s,needle,p)=>{if(!s.includes(needle))throw new Error(`Missing expected text in ${p}: ${needle.slice(0,120)}`);};
const rep=(p,from,to)=>{let s=read(p);must(s,from,p);s=s.replace(from,to);write(p,s);};
const repAll=(p,from,to)=>{let s=read(p);must(s,from,p);s=s.split(from).join(to);write(p,s);};

// Provider-domain migration everywhere relevant.
for(const base of ['app','windows','web','tests','README.md','docs','vercel.json','netlify.toml']){
  const abs=path.join(root,base);if(!fs.existsSync(abs))continue;
  const walk=p=>{const st=fs.statSync(p);if(st.isDirectory()){for(const n of fs.readdirSync(p))walk(path.join(p,n));return;}if(!/\.(java|js|cjs|html|json|toml|yml|yaml|md|txt)$/.test(p))return;let s=fs.readFileSync(p,'utf8');if(s.includes('vidstuck.xyz'))fs.writeFileSync(p,s.split('vidstuck.xyz').join('vidstuck.cc'));};
  walk(abs);
}

// Android provider registry + ZXCStream embed URL.
{
  const p='app/src/main/java/com/zerostreams/app/PlaybackSources.java';let s=read(p);
  repLocal=(from,to)=>{must(s,from,p);s=s.replace(from,to);};
  repLocal('static final String[] IDS={"vidstuck","embedwave","vidsrc-sh","rawcast"};','static final String[] IDS={"vidstuck","zxcstream","embedwave","vidsrc-sh","rawcast"};');
  repLocal('static final String[] NAMES={"VidStuck","Embedwave (BETA)","VidSrc.sh","RawCast · Limited API quota"};','static final String[] NAMES={"VidStuck","ZXCStream (Beta)","Embedwave (BETA)","VidSrc.sh","RawCast · Limited API quota"};');
  repLocal('static final String[] ORIGINS={"https://vidstuck.cc","https://embedwave.cc","https://vidsrc.sh"};','static final String[] ORIGINS={"https://vidstuck.cc","https://zxcstream.cc","https://embedwave.cc","https://vidsrc.sh"};');
  repLocal('String host=provider.equals("vidsrc-sh")?"vidsrc.sh":provider.equals("embedwave")?"embedwave.cc":"vidstuck.cc";\n        String value="https://"+host+"/embed/"+type+"/"+id+(type.equals("tv")?"/"+season+"/"+episode:"");',
`String host=provider.equals("vidsrc-sh")?"vidsrc.sh":provider.equals("embedwave")?"embedwave.cc":provider.equals("zxcstream")?"zxcstream.cc":"vidstuck.cc";\n        String value=provider.equals("zxcstream")\n            ?"https://"+host+"/player/"+type+"/"+id+(type.equals("tv")?"/"+season+"/"+episode:"")+"?domainAd=zeroplay&color=65E6CC&autoplay=true"\n            :"https://"+host+"/embed/"+type+"/"+id+(type.equals("tv")?"/"+season+"/"+episode:"");`);
  write(p,s);
}

// Android adblock/provider safety.
{
  const p='app/src/main/java/com/zerostreams/app/AdBlockRules.java';let s=read(p);
  must(s,'"vidstuck.cc", "vidsrc.sh",',p);s=s.replace('"vidstuck.cc", "vidsrc.sh",','"vidstuck.cc", "zxcstream.cc", "embedwave.cc", "vidsrc.sh",');write(p,s);
}

// Android settings: restore explicit global default source control and include ZXCStream.
{
  const p='app/src/main/java/com/zerostreams/app/MainActivity.java';let s=read(p);
  must(s,'settingsHeading(panel,"PLAYBACK & DOWNLOADS","Sources, subtitles & downloads");Switch rawcastPlayback=',p);
  s=s.replace('settingsHeading(panel,"PLAYBACK & DOWNLOADS","Sources, subtitles & downloads");Switch rawcastPlayback=',
`settingsHeading(panel,"PLAYBACK & DOWNLOADS","Sources, subtitles & downloads");panel.addView(text("Default video source",14,INK));java.util.List<String> defaultSourceIdsList=new java.util.ArrayList<>(),defaultSourceNamesList=new java.util.ArrayList<>();for(int i=0;i<PlaybackSources.IDS.length;i++){if(PlaybackSources.IDS[i].equals("rawcast"))continue;defaultSourceIdsList.add(PlaybackSources.IDS[i]);defaultSourceNamesList.add(PlaybackSources.NAMES[i]);}final String[] defaultSourceIds=defaultSourceIdsList.toArray(new String[0]);Spinner defaultSource=new Spinner(this);defaultSource.setAdapter(spinnerAdapter(defaultSourceNamesList.toArray(new String[0])));int defaultSourceIndex=java.util.Arrays.asList(defaultSourceIds).indexOf(selectedPlaybackSource());defaultSource.setSelection(Math.max(0,defaultSourceIndex));panel.addView(defaultSource);panel.addView(text("This source is used by default for every movie and episode. A title-specific choice can still override it later.",12,MUTED));space(panel,12);Switch rawcastPlayback=`);
  must(s,'java.util.Arrays.copyOf(PlaybackSources.NAMES,3)',p);s=s.replace(/java\.util\.Arrays\.copyOf\(PlaybackSources\.NAMES,3\)/g,'java.util.Arrays.copyOf(PlaybackSources.NAMES,4)');
  must(s,'.putString("tmdbKey",tmdb.getText().toString().trim()).apply();',p);s=s.replace('.putString("tmdbKey",tmdb.getText().toString().trim()).apply();', '.putString("tmdbKey",tmdb.getText().toString().trim()).putString("playbackSource",defaultSourceIds[Math.max(0,defaultSource.getSelectedItemPosition())]).apply();');
  s=s.replace('Playback: VidStuck and VidSrc.sh.','Playback: VidStuck, ZXCStream (Beta), Embedwave and VidSrc.sh.');
  write(p,s);
}

// Android embedded-player host handling + failover order.
{
  const p='app/src/main/java/com/zerostreams/app/BrowserPlayerActivity.java';let s=read(p);
  must(s,'java.util.Arrays.asList("vidstuck.cc","embedwave.cc","vidsrc.sh")',p);s=s.replace('java.util.Arrays.asList("vidstuck.cc","embedwave.cc","vidsrc.sh")','java.util.Arrays.asList("vidstuck.cc","zxcstream.cc","embedwave.cc","vidsrc.sh")');
  must(s,'&&!String.valueOf(request.getUrl().getPath()).startsWith("/embed/")',p);s=s.replace('&&!String.valueOf(request.getUrl().getPath()).startsWith("/embed/")','&&!("zxcstream.cc".equals(request.getUrl().getHost())?String.valueOf(request.getUrl().getPath()).startsWith("/player/"):String.valueOf(request.getUrl().getPath()).startsWith("/embed/"))');
  must(s,'return "embedwave.cc".equals(host)?"embedwave":"vidsrc.sh".equals(host)?"vidsrc-sh":"vidstuck";',p);s=s.replace('return "embedwave.cc".equals(host)?"embedwave":"vidsrc.sh".equals(host)?"vidsrc-sh":"vidstuck";','return "zxcstream.cc".equals(host)?"zxcstream":"embedwave.cc".equals(host)?"embedwave":"vidsrc.sh".equals(host)?"vidsrc-sh":"vidstuck";');
  must(s,'String current=currentProvider(),next=current.equals("vidstuck")?"embedwave":current.equals("embedwave")?"vidsrc-sh":"vidstuck";',p);s=s.replace('String current=currentProvider(),next=current.equals("vidstuck")?"embedwave":current.equals("embedwave")?"vidsrc-sh":"vidstuck";','String current=currentProvider(),next=current.equals("vidstuck")?"zxcstream":current.equals("zxcstream")?"embedwave":current.equals("embedwave")?"vidsrc-sh":"vidstuck";');
  write(p,s);
}

// Android version 2.2.2.
{
  const p='app/build.gradle';let s=read(p);s=s.replace(/versionCode\s+49/,'versionCode 50').replace(/versionName '2\.2\.1\.4'/,"versionName '2.2.2'");write(p,s);
}

// Windows provider registry.
{
  const p='windows/playback-sources.cjs';let s=read(p);
  must(s,"{id:'vidstuck',name:'VidStuck'},{id:'embedwave',name:'Embedwave (BETA)'},{id:'vidsrc-sh',name:'VidSrc.sh'},{id:'rawcast',name:'RawCast · Limited API quota'}",p);
  s=s.replace("{id:'vidstuck',name:'VidStuck'},{id:'embedwave',name:'Embedwave (BETA)'},{id:'vidsrc-sh',name:'VidSrc.sh'},{id:'rawcast',name:'RawCast · Limited API quota'}","{id:'vidstuck',name:'VidStuck'},{id:'zxcstream',name:'ZXCStream (Beta)'},{id:'embedwave',name:'Embedwave (BETA)'},{id:'vidsrc-sh',name:'VidSrc.sh'},{id:'rawcast',name:'RawCast · Limited API quota'}");
  must(s,"const hosts=['vidstuck.cc','embedwave.cc','vidsrc.sh'];",p);s=s.replace("const hosts=['vidstuck.cc','embedwave.cc','vidsrc.sh'];","const hosts=['vidstuck.cc','zxcstream.cc','embedwave.cc','vidsrc.sh'];");
  must(s,"const host=id==='vidsrc-sh'?'vidsrc.sh':id==='embedwave'?'embedwave.cc':'vidstuck.cc';const u=new URL(`https://${host}/embed/${suffix}`);",p);
  s=s.replace("const host=id==='vidsrc-sh'?'vidsrc.sh':id==='embedwave'?'embedwave.cc':'vidstuck.cc';const u=new URL(`https://${host}/embed/${suffix}`);","const host=id==='vidsrc-sh'?'vidsrc.sh':id==='embedwave'?'embedwave.cc':id==='zxcstream'?'zxcstream.cc':'vidstuck.cc';const u=id==='zxcstream'?new URL(`https://${host}/player/${suffix}`):new URL(`https://${host}/embed/${suffix}`);if(id==='zxcstream'){u.searchParams.set('domainAd','zeroplay');u.searchParams.set('color','65E6CC');u.searchParams.set('autoplay','true');}");
  write(p,s);
}

// Windows allowlists, source scoring and default-source plumbing.
{
  const p='windows/core.cjs';let s=read(p);must(s,"'vidstuck.cc','embedwave.cc','vidsrc.sh'",p);s=s.replace("'vidstuck.cc','embedwave.cc','vidsrc.sh'","'vidstuck.cc','zxcstream.cc','embedwave.cc','vidsrc.sh'");write(p,s);
}
{
  const p='windows/main.cjs';let s=read(p);
  must(s,"const ids=['vidstuck','embedwave','vidsrc-sh'];",p);s=s.replace("const ids=['vidstuck','embedwave','vidsrc-sh'];","const ids=['vidstuck','zxcstream','embedwave','vidsrc-sh'];");
  must(s,'let requestedSource=["vidstuck","embedwave","vidsrc-sh","rawcast"].includes(sourceOverride)?sourceOverride:"vidstuck";',p);s=s.replace('let requestedSource=["vidstuck","embedwave","vidsrc-sh","rawcast"].includes(sourceOverride)?sourceOverride:"vidstuck";','let requestedSource=["vidstuck","zxcstream","embedwave","vidsrc-sh","rawcast"].includes(sourceOverride)?sourceOverride:(state.settings.source||"vidstuck");');
  must(s,"['vidstuck.cc','embedwave.cc','vidsrc.sh'].includes(u.hostname)&&!u.pathname.startsWith('/embed/')",p);s=s.replace("['vidstuck.cc','embedwave.cc','vidsrc.sh'].includes(u.hostname)&&!u.pathname.startsWith('/embed/')","['vidstuck.cc','zxcstream.cc','embedwave.cc','vidsrc.sh'].includes(u.hostname)&&!(u.hostname==='zxcstream.cc'?u.pathname.startsWith('/player/'):u.pathname.startsWith('/embed/'))");
  write(p,s);
}

// Windows UI source choices and explicit global default behavior.
{
  const p='windows/ui/index.html';let s=read(p);
  must(s,'<option value="vidstuck">VidStuck · Recommended</option><option value="embedwave">Embedwave (BETA)</option><option value="vidsrc-sh">VidSrc.sh</option>',p);
  s=s.replace('<option value="vidstuck">VidStuck · Recommended</option><option value="embedwave">Embedwave (BETA)</option><option value="vidsrc-sh">VidSrc.sh</option>','<option value="vidstuck">VidStuck · Recommended</option><option value="zxcstream">ZXCStream (Beta)</option><option value="embedwave">Embedwave (BETA)</option><option value="vidsrc-sh">VidSrc.sh</option>');write(p,s);
}
{
  const p='windows/ui/app.js';let s=read(p);
  s=s.replace(/<option value=\\"vidstuck\\">VidStuck<\\\/option><option value=\\"embedwave\\">Embedwave \(BETA\)<\\\/option>/g,'<option value=\\"vidstuck\\">VidStuck</option><option value=\\"zxcstream\\">ZXCStream (Beta)</option><option value=\\"embedwave\\">Embedwave (BETA)</option><option value=\\"vidsrc-sh\\">VidSrc.sh</option>');
  const old="async function play(item,ep){if(!item)return;try{const source=$('#detail').open?$('#detail .title-source')?.value:state.settings.source;if(source&&source!==state.settings.source)await change('settings',{...state.settings,source});status('Opening '+item.title+'…');await window.zero.play(item,ep);";
  must(s,old,p);s=s.replace(old,"async function play(item,ep){if(!item)return;try{const source=$('#detail').open?($('#detail .title-source')?.value||state.settings.source):state.settings.source;status('Opening '+item.title+'…');await window.zero.play(item,ep,source||'vidstuck');");write(p,s);
}

// Windows package version.
for(const p of ['windows/package.json','windows/package-lock.json'])if(fs.existsSync(path.join(root,p))){let data=JSON.parse(read(p));data.version='2.2.2';if(data.packages&&data.packages[''])data.packages[''].version='2.2.2';if(p.endsWith('package.json')){data.build=data.build||{};data.build.buildVersion='2.2.2';data.build.win=data.build.win||{};data.build.win.artifactName='ZeroPlay-2.2.2-Windows-x64.${ext}';}write(p,JSON.stringify(data,null,2)+'\n');}

// Website provider registry + settings.
{
  const p='web/public/playback-sources.js';let s=read(p);
  must(s,"const sources=[{id:'vidstuck',name:'VidStuck'},{id:'embedwave',name:'Embedwave (BETA)'}];",p);s=s.replace("const sources=[{id:'vidstuck',name:'VidStuck'},{id:'embedwave',name:'Embedwave (BETA)'}];","const sources=[{id:'vidstuck',name:'VidStuck'},{id:'zxcstream',name:'ZXCStream (Beta)'},{id:'embedwave',name:'Embedwave (BETA)'}];");
  must(s,"const hosts=['vidstuck.cc','embedwave.cc'];",p);s=s.replace("const hosts=['vidstuck.cc','embedwave.cc'];","const hosts=['vidstuck.cc','zxcstream.cc','embedwave.cc'];");
  must(s,"const u=new URL(`https://${id==='embedwave'?'embedwave.cc':'vidstuck.cc'}/embed/${suffix}`);",p);s=s.replace("const u=new URL(`https://${id==='embedwave'?'embedwave.cc':'vidstuck.cc'}/embed/${suffix}`);","const host=id==='embedwave'?'embedwave.cc':id==='zxcstream'?'zxcstream.cc':'vidstuck.cc';const u=id==='zxcstream'?new URL(`https://${host}/player/${suffix}`):new URL(`https://${host}/embed/${suffix}`);if(id==='zxcstream'){u.searchParams.set('domainAd','zeroplay');u.searchParams.set('color','65E6CC');u.searchParams.set('autoplay','true');}");write(p,s);
}
{
  const p='web/public/browser.js';let s=read(p);s=s.replace("if(!['vidstuck','embedwave'].includes(saved.settings.source))","if(!['vidstuck','zxcstream','embedwave'].includes(saved.settings.source))");s=s.replace("!['dark','light'].includes(value.theme)||!['vidstuck','embedwave'].includes(value.source)","!['dark','light'].includes(value.theme)||!['vidstuck','zxcstream','embedwave'].includes(value.source)");write(p,s);
}
{
  const p='web/public/index.html';let s=read(p);s=s.replace('frame-src https://vidstuck.cc https://embedwave.cc','frame-src https://vidstuck.cc https://zxcstream.cc https://embedwave.cc');s=s.replace('<option value="vidstuck">VidStuck · Recommended</option><option value="embedwave">Embedwave (BETA)</option>','<option value="vidstuck">VidStuck · Recommended</option><option value="zxcstream">ZXCStream (Beta)</option><option value="embedwave">Embedwave (BETA)</option>');s=s.replace('Web movie and series playback uses VidStuck or Embedwave (BETA).','Web movie and series playback uses VidStuck, ZXCStream (Beta), or Embedwave (BETA).');write(p,s);
}
{
  const p='web/public/sw.js';let s=read(p);s=s.replace(/zeroplay-web-2\.2-shell-[^']+/,"zeroplay-web-2.2.2-shell-20261016");write(p,s);
}
for(const p of ['vercel.json','netlify.toml'])if(fs.existsSync(path.join(root,p))){let s=read(p);if(s.includes('frame-src https://vidstuck.cc https://embedwave.cc'))s=s.replace(/frame-src https:\/\/vidstuck\.cc https:\/\/embedwave\.cc/g,'frame-src https://vidstuck.cc https://zxcstream.cc https://embedwave.cc');write(p,s);}

// Regression test expectations for four non-RawCast Android choices and ZXCStream.
{
  const p='tests/source-selection-regression.test.cjs';let s=read(p);s=s.replace(/copyOf\\\(PlaybackSources\\\.NAMES,3\\\)/g,'copyOf\\(PlaybackSources\\.NAMES,4\\)');if(!s.includes("ZXCStream"))s+=`\ntest('2.2.2 provider domains and ZXCStream are wired across platforms',()=>{\n  const androidSources=fs.readFileSync('app/src/main/java/com/zerostreams/app/PlaybackSources.java','utf8');\n  const windowsSources=fs.readFileSync('windows/playback-sources.cjs','utf8');\n  const webSources=fs.readFileSync('web/public/playback-sources.js','utf8');\n  for(const source of [androidSources,windowsSources,webSources]){assert.match(source,/vidstuck\\.cc/);assert.match(source,/zxcstream\\.cc/);assert.match(source,/ZXCStream \\(Beta\\)/);}\n  assert.doesNotMatch(androidSources,/vidstuck\\.xyz/);assert.doesNotMatch(windowsSources,/vidstuck\\.xyz/);assert.doesNotMatch(webSources,/vidstuck\\.xyz/);\n});\n`;write(p,s);
}

// Documentation/release notes.
const releaseNotes=`# ZeroPlay 2.2.2 — Playback Source Refresh\n\nZeroPlay 2.2.2 updates the provider layer without changing the established player behavior.\n\n## Highlights\n\n- **VidStuck domain updated to \`vidstuck.cc\`** across Android, Android TV, Windows and Web.\n- **New ZXCStream (Beta)** playback source using \`zxcstream.cc\`.\n- **Global default video source restored in Settings** so the selected source is used automatically for movies and episodes.\n- Existing title-specific/one-time source choices remain available where supported.\n- Provider trust/allowlists, navigation guards and website CSP rules were updated for the new domains.\n- ZXCStream participates in native source health/failover where supported.\n- Android, Android TV, Windows and Web retain the existing 2.2.1 player controls and playback UX; this release does not redesign the player.\n\n## Compatibility\n\nAll 2.2.1 discovery, Top 10, Continue Watching, season/episode memory, Home customization and native playback features remain in place.\n`;
write('docs/release-2.2.2.md',releaseNotes);
{
  const p='README.md';let s=read(p);s=s.replace('# 🎬 ZeroPlay 2.2.1','# 🎬 ZeroPlay 2.2.2');s=s.replace(/Version \*\*2\.2\.1\*\* keeps the 2\.2 foundation and adds \*\*Top 10 Today\*\*, official featured-title artwork, stronger Continue Watching \/ episode resume behavior, smarter Home curation and player\/web polish\./,'Version **2.2.2** keeps the polished 2.2.1 experience and refreshes playback sources: VidStuck now uses `vidstuck.cc`, ZXCStream (Beta) is available, and Settings once again controls the default source for all videos.');s=s.replace('**[📋 2.2.1 release notes](docs/release-2.2.1.md)**','**[📋 2.2.2 release notes](docs/release-2.2.2.md)**');s=s.replace(/releases\/download\/v2\.2\.1\/ZeroPlay-2\.2\.1/g,'releases/download/v2.2.2/ZeroPlay-2.2.2');s=s.replace('## ⭐ What’s new in 2.2.1','## ⭐ What’s new in 2.2.2');s=s.replace('**Top 10 Today · Official carousel title artwork · Last season/episode resume · More reliable Continue Watching · Smarter Tonight’s Picks · Smarter Hidden Gems · Website trailer previews · Deep-link close fixes · VidSrc subtitle-menu close fix · Top 10 Home toggle**','**VidStuck → vidstuck.cc · NEW ZXCStream (Beta) · Restored global default video source setting · Provider allowlist/CSP refresh · Existing 2.2.1 player behavior preserved**');s=s.replace('**VidStuck**, **Embedwave (BETA)** and **VidSrc.sh**','**VidStuck**, **ZXCStream (Beta)**, **Embedwave (BETA)** and **VidSrc.sh**');s=s.replace('VidStuck and **Embedwave (BETA)** source selection.','VidStuck, **ZXCStream (Beta)** and **Embedwave (BETA)** source selection.');write(p,s);
}

console.log('ZeroPlay 2.2.2 source/provider patch prepared successfully.');
