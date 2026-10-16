'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const pth=p=>path.join(root,p),read=p=>fs.readFileSync(pth(p),'utf8'),write=(p,s)=>fs.writeFileSync(pth(p),s);
function must(s,needle,p){if(!s.includes(needle))throw new Error(`Missing expected text in ${p}: ${needle.slice(0,120)}`);}
function replace(p,from,to){let s=read(p);must(s,from,p);s=s.replace(from,to);write(p,s);}
function replaceAll(p,from,to){let s=read(p);must(s,from,p);s=s.split(from).join(to);write(p,s);}

// Start only from the clean 2.2.1 baseline.
must(read('app/build.gradle'),"versionName '2.2.1'",'app/build.gradle');
must(read('windows/package.json'),'"version": "2.2.1"','windows/package.json');

// Migrate every shipped VidStuck hostname reference.
for(const base of ['app','windows','web','tests','README.md','docs','vercel.json','netlify.toml']){
  const abs=pth(base);if(!fs.existsSync(abs))continue;
  const walk=f=>{const st=fs.statSync(f);if(st.isDirectory()){for(const n of fs.readdirSync(f))walk(path.join(f,n));return;}if(!/\.(java|js|cjs|html|json|toml|yml|yaml|md|txt)$/.test(f))return;let s=fs.readFileSync(f,'utf8');if(s.includes('vidstuck.xyz'))fs.writeFileSync(f,s.split('vidstuck.xyz').join('vidstuck.cc'));};walk(abs);
}

// Android provider registry.
{
 const p='app/src/main/java/com/zerostreams/app/PlaybackSources.java';let s=read(p);
 s=s.replace('static final String[] IDS={"vidstuck","embedwave","vidsrc-sh","rawcast"};','static final String[] IDS={"vidstuck","zxcstream","embedwave","vidsrc-sh","rawcast"};');
 s=s.replace('static final String[] NAMES={"VidStuck","Embedwave (BETA)","VidSrc.sh","RawCast · Limited API quota"};','static final String[] NAMES={"VidStuck","ZXCStream (Beta)","Embedwave (BETA)","VidSrc.sh","RawCast · Limited API quota"};');
 s=s.replace('static final String[] ORIGINS={"https://vidstuck.cc","https://embedwave.cc","https://vidsrc.sh"};','static final String[] ORIGINS={"https://vidstuck.cc","https://zxcstream.cc","https://embedwave.cc","https://vidsrc.sh"};');
 must(s,'String host=provider.equals("vidsrc-sh")?"vidsrc.sh":provider.equals("embedwave")?"embedwave.cc":"vidstuck.cc";',p);
 s=s.replace('String host=provider.equals("vidsrc-sh")?"vidsrc.sh":provider.equals("embedwave")?"embedwave.cc":"vidstuck.cc";\n        String value="https://"+host+"/embed/"+type+"/"+id+(type.equals("tv")?"/"+season+"/"+episode:"");',
 'String host=provider.equals("vidsrc-sh")?"vidsrc.sh":provider.equals("embedwave")?"embedwave.cc":provider.equals("zxcstream")?"zxcstream.cc":"vidstuck.cc";\n        String value=provider.equals("zxcstream")\n            ?"https://"+host+"/player/"+type+"/"+id+(type.equals("tv")?"/"+season+"/"+episode:"")+"?domainAd=zeroplay&color=65E6CC&autoplay=true"\n            :"https://"+host+"/embed/"+type+"/"+id+(type.equals("tv")?"/"+season+"/"+episode:"");');
 write(p,s);
}

// Android provider/ad/navigation safety.
{
 const p='app/src/main/java/com/zerostreams/app/AdBlockRules.java';let s=read(p);must(s,'"vidstuck.cc", "vidsrc.sh",',p);s=s.replace('"vidstuck.cc", "vidsrc.sh",','"vidstuck.cc", "zxcstream.cc", "embedwave.cc", "vidsrc.sh",');write(p,s);
}
{
 const p='app/src/main/java/com/zerostreams/app/BrowserPlayerActivity.java';let s=read(p);
 must(s,'java.util.Arrays.asList("vidstuck.cc","embedwave.cc","vidsrc.sh")',p);s=s.replace('java.util.Arrays.asList("vidstuck.cc","embedwave.cc","vidsrc.sh")','java.util.Arrays.asList("vidstuck.cc","zxcstream.cc","embedwave.cc","vidsrc.sh")');
 must(s,'&&!String.valueOf(request.getUrl().getPath()).startsWith("/embed/")',p);s=s.replace('&&!String.valueOf(request.getUrl().getPath()).startsWith("/embed/")','&&!("zxcstream.cc".equals(request.getUrl().getHost())?String.valueOf(request.getUrl().getPath()).startsWith("/player/"):String.valueOf(request.getUrl().getPath()).startsWith("/embed/"))');
 must(s,'return "embedwave.cc".equals(host)?"embedwave":"vidsrc.sh".equals(host)?"vidsrc-sh":"vidstuck";',p);s=s.replace('return "embedwave.cc".equals(host)?"embedwave":"vidsrc.sh".equals(host)?"vidsrc-sh":"vidstuck";','return "zxcstream.cc".equals(host)?"zxcstream":"embedwave.cc".equals(host)?"embedwave":"vidsrc.sh".equals(host)?"vidsrc-sh":"vidstuck";');
 must(s,'String current=currentProvider(),next=current.equals("vidstuck")?"embedwave":current.equals("embedwave")?"vidsrc-sh":"vidstuck";',p);s=s.replace('String current=currentProvider(),next=current.equals("vidstuck")?"embedwave":current.equals("embedwave")?"vidsrc-sh":"vidstuck";','String current=currentProvider(),next=current.equals("vidstuck")?"zxcstream":current.equals("zxcstream")?"embedwave":current.equals("embedwave")?"vidsrc-sh":"vidstuck";');
 write(p,s);
}

// Android Settings: explicit global default playback source.
{
 const p='app/src/main/java/com/zerostreams/app/MainActivity.java';let s=read(p);
 const marker='settingsHeading(panel,"PLAYBACK & DOWNLOADS","Sources, subtitles & downloads");Switch rawcastPlayback=';must(s,marker,p);
 s=s.replace(marker,'settingsHeading(panel,"PLAYBACK & DOWNLOADS","Sources, subtitles & downloads");panel.addView(text("Default video source",14,INK));java.util.List<String> defaultSourceIdsList=new java.util.ArrayList<>(),defaultSourceNamesList=new java.util.ArrayList<>();for(int i=0;i<PlaybackSources.IDS.length;i++){if(PlaybackSources.IDS[i].equals("rawcast"))continue;defaultSourceIdsList.add(PlaybackSources.IDS[i]);defaultSourceNamesList.add(PlaybackSources.NAMES[i]);}final String[] defaultSourceIds=defaultSourceIdsList.toArray(new String[0]);Spinner defaultSource=new Spinner(this);defaultSource.setAdapter(spinnerAdapter(defaultSourceNamesList.toArray(new String[0])));int defaultSourceIndex=java.util.Arrays.asList(defaultSourceIds).indexOf(selectedPlaybackSource());defaultSource.setSelection(Math.max(0,defaultSourceIndex));panel.addView(defaultSource);panel.addView(text("This source is used by default for every movie and episode. A title-specific choice can still override it later.",12,MUTED));space(panel,12);Switch rawcastPlayback=');
 must(s,'java.util.Arrays.copyOf(PlaybackSources.NAMES,3)',p);s=s.replace(/java\.util\.Arrays\.copyOf\(PlaybackSources\.NAMES,3\)/g,'java.util.Arrays.copyOf(PlaybackSources.NAMES,4)');
 must(s,'.putString("tmdbKey",tmdb.getText().toString().trim()).apply();',p);s=s.replace('.putString("tmdbKey",tmdb.getText().toString().trim()).apply();','.putString("tmdbKey",tmdb.getText().toString().trim()).putString("playbackSource",defaultSourceIds[Math.max(0,defaultSource.getSelectedItemPosition())]).apply();');
 s=s.replace('Other movies and series will continue using VidStuck.','Other movies and series will continue using your default source.');
 s=s.replace('Playback: VidStuck and VidSrc.sh.','Playback: VidStuck, ZXCStream (Beta), Embedwave and VidSrc.sh.');
 write(p,s);
}

// Android player progress origin and release version.
replaceAll('app/src/main/assets/player-guard.js','https://vidstuck.xyz','https://vidstuck.cc');
{
 const p='app/build.gradle';let s=read(p);s=s.replace(/versionCode\s+45/,'versionCode 46').replace(/versionName '2\.2\.1'/,"versionName '2.2.2'");write(p,s);
}

// Windows provider registry.
{
 const p='windows/playback-sources.cjs';let s=read(p);
 s=s.replace("{id:'vidstuck',name:'VidStuck'},{id:'embedwave',name:'Embedwave (BETA)'},{id:'vidsrc-sh',name:'VidSrc.sh'},{id:'rawcast',name:'RawCast · Limited API quota'}","{id:'vidstuck',name:'VidStuck'},{id:'zxcstream',name:'ZXCStream (Beta)'},{id:'embedwave',name:'Embedwave (BETA)'},{id:'vidsrc-sh',name:'VidSrc.sh'},{id:'rawcast',name:'RawCast · Limited API quota'}");
 s=s.replace("const hosts=['vidstuck.cc','embedwave.cc','vidsrc.sh'];","const hosts=['vidstuck.cc','zxcstream.cc','embedwave.cc','vidsrc.sh'];");
 must(s,"const host=id==='vidsrc-sh'?'vidsrc.sh':id==='embedwave'?'embedwave.cc':'vidstuck.cc';const u=new URL(`https://${host}/embed/${suffix}`);",p);
 s=s.replace("const host=id==='vidsrc-sh'?'vidsrc.sh':id==='embedwave'?'embedwave.cc':'vidstuck.cc';const u=new URL(`https://${host}/embed/${suffix}`);","const host=id==='vidsrc-sh'?'vidsrc.sh':id==='embedwave'?'embedwave.cc':id==='zxcstream'?'zxcstream.cc':'vidstuck.cc';const u=id==='zxcstream'?new URL(`https://${host}/player/${suffix}`):new URL(`https://${host}/embed/${suffix}`);if(id==='zxcstream'){u.searchParams.set('domainAd','zeroplay');u.searchParams.set('color','65E6CC');u.searchParams.set('autoplay','true');}");write(p,s);
}
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
{
 const p='windows/ui/app.js';let s=read(p);
 must(s,"const sources=[['vidstuck','VidStuck'],['embedwave','Embedwave (BETA)'],['vidsrc-sh','VidSrc.sh'],['rawcast','RawCast · Limited quota']];",p);s=s.replace("const sources=[['vidstuck','VidStuck'],['embedwave','Embedwave (BETA)'],['vidsrc-sh','VidSrc.sh'],['rawcast','RawCast · Limited quota']];","const sources=[['vidstuck','VidStuck'],['zxcstream','ZXCStream (Beta)'],['embedwave','Embedwave (BETA)'],['vidsrc-sh','VidSrc.sh'],['rawcast','RawCast · Limited quota']];");
 s=s.replace('Other movies and series stay on VidStuck.','Other movies and series use your default source.');write(p,s);
}
{
 const p='windows/ui/index.html';let s=read(p);
 const old='<option value="vidstuck">VidStuck · Recommended</option><option value="vidsrc-sh">VidSrc.sh</option><option value="rawcast" hidden>RawCast · Limited API quota</option>';must(s,old,p);
 s=s.replace(old,'<option value="vidstuck">VidStuck · Recommended</option><option value="zxcstream">ZXCStream (Beta)</option><option value="embedwave">Embedwave (BETA)</option><option value="vidsrc-sh">VidSrc.sh</option><option value="rawcast" hidden>RawCast · Limited API quota</option>');
 s=s.replace('Choose VidStuck or VidSrc.sh.','Choose VidStuck, ZXCStream (Beta), Embedwave or VidSrc.sh.').replace('Players: VidStuck and VidSrc.sh.','Players: VidStuck, ZXCStream (Beta), Embedwave and VidSrc.sh.');write(p,s);
}
for(const p of ['windows/package.json','windows/package-lock.json']){let data=JSON.parse(read(p));data.version='2.2.2';if(data.packages&&data.packages[''])data.packages[''].version='2.2.2';if(p.endsWith('package.json')){data.build=data.build||{};data.build.buildVersion='2.2.2';data.build.win=data.build.win||{};data.build.win.artifactName='ZeroPlay-2.2.2-Windows-x64.${ext}';}write(p,JSON.stringify(data,null,2)+'\n');}

// Website provider registry + global default setting.
{
 const p='web/public/playback-sources.js';let s=read(p);
 s=s.replace("const sources=[{id:'vidstuck',name:'VidStuck'},{id:'embedwave',name:'Embedwave (BETA)'}];","const sources=[{id:'vidstuck',name:'VidStuck'},{id:'zxcstream',name:'ZXCStream (Beta)'},{id:'embedwave',name:'Embedwave (BETA)'}];");
 s=s.replace("const hosts=['vidstuck.cc','embedwave.cc'];","const hosts=['vidstuck.cc','zxcstream.cc','embedwave.cc'];");
 must(s,"const u=new URL(`https://${id==='embedwave'?'embedwave.cc':'vidstuck.cc'}/embed/${suffix}`);",p);
 s=s.replace("const u=new URL(`https://${id==='embedwave'?'embedwave.cc':'vidstuck.cc'}/embed/${suffix}`);","const host=id==='embedwave'?'embedwave.cc':id==='zxcstream'?'zxcstream.cc':'vidstuck.cc';const u=id==='zxcstream'?new URL(`https://${host}/player/${suffix}`):new URL(`https://${host}/embed/${suffix}`);if(id==='zxcstream'){u.searchParams.set('domainAd','zeroplay');u.searchParams.set('color','65E6CC');u.searchParams.set('autoplay','true');}");write(p,s);
}
{
 const p='web/public/browser.js';let s=read(p);
 s=s.replace(/version:'2\.2 Web'/g,"version:'2.2.2 Web'").replace(/version:'2\.2 Web'\}/g,"version:'2.2.2 Web'}");
 s=s.replace("!['vidstuck','embedwave'].includes(saved.settings.source)","!['vidstuck','zxcstream','embedwave'].includes(saved.settings.source)");
 s=s.replace("!['dark','light'].includes(value.theme)||!['vidstuck','embedwave'].includes(value.source)","!['dark','light'].includes(value.theme)||!['vidstuck','zxcstream','embedwave'].includes(value.source)");write(p,s);
}
{
 const p='web/public/index.html';let s=read(p);
 s=s.replace('frame-src https://vidstuck.cc https://embedwave.cc','frame-src https://vidstuck.cc https://zxcstream.cc https://embedwave.cc');
 s=s.replace('<option value="vidstuck">VidStuck · Recommended</option><option value="embedwave">Embedwave (BETA)</option>','<option value="vidstuck">VidStuck · Recommended</option><option value="zxcstream">ZXCStream (Beta)</option><option value="embedwave">Embedwave (BETA)</option>');
 s=s.replace('Web movie and series playback uses VidStuck or Embedwave (BETA).','Web movie and series playback uses VidStuck, ZXCStream (Beta), or Embedwave (BETA).');write(p,s);
}
{
 const p='web/public/sw.js';let s=read(p);s=s.replace(/zeroplay-web-[^'"\s]+/,'zeroplay-web-2.2.2');write(p,s);
}
for(const p of ['vercel.json','netlify.toml'])if(fs.existsSync(pth(p))){let s=read(p);if(s.includes('frame-src https://vidstuck.cc https://embedwave.cc'))s=s.replaceAll('frame-src https://vidstuck.cc https://embedwave.cc','frame-src https://vidstuck.cc https://zxcstream.cc https://embedwave.cc');write(p,s);}

// Focused source regression coverage.
write('tests/source-selection-regression.test.cjs',`const test=require('node:test');\nconst assert=require('node:assert/strict');\nconst fs=require('node:fs');\nconst winMain=fs.readFileSync('windows/main.cjs','utf8');\nconst winUi=fs.readFileSync('windows/ui/app.js','utf8');\nconst android=fs.readFileSync('app/src/main/java/com/zerostreams/app/MainActivity.java','utf8');\nconst web=fs.readFileSync('web/public/browser.js','utf8');\ntest('global default source remains VidStuck and user setting is honored',()=>{assert.match(winUi,/const global=state\\?\\.settings\\?\\.source/);assert.match(winUi,/return playbackSourceValid\\(global\\)\\?global:'vidstuck'/);assert.match(android,/String selected=selectedPlaybackSource\\(\\);if\\(allowedPlaybackSource\\(selected\\)\\)return selected;return \\"vidstuck\\";/);assert.match(web,/saved\\.settings\\.source\\|\\|'vidstuck'/);});\ntest('Android Settings exposes a global default video source',()=>{assert.match(android,/Default video source/);assert.match(android,/putString\\(\\"playbackSource\\",defaultSourceIds/);assert.match(android,/java\\.util\\.Arrays\\.copyOf\\(PlaybackSources\\.NAMES,4\\)/);});\ntest('2.2.2 provider domains and ZXCStream are wired across platforms',()=>{for(const p of ['app/src/main/java/com/zerostreams/app/PlaybackSources.java','windows/playback-sources.cjs','web/public/playback-sources.js']){const s=fs.readFileSync(p,'utf8');assert.match(s,/vidstuck\\.cc/);assert.match(s,/zxcstream\\.cc/);assert.match(s,/ZXCStream \\(Beta\\)/);assert.doesNotMatch(s,/vidstuck\\.xyz/);}assert.match(fs.readFileSync('windows/playback-sources.cjs','utf8'),/\\/player\\/\\$\\{suffix\\}/);assert.match(fs.readFileSync('web/public/playback-sources.js','utf8'),/\\/player\\/\\$\\{suffix\\}/);});\n`);

// Release metadata from the clean 2.2.1 baseline only.
write('docs/release-2.2.2.md',`# ZeroPlay 2.2.2 — Playback Source Refresh\n\nZeroPlay 2.2.2 updates the provider layer without changing the established 2.2.1 player behavior.\n\n## Highlights\n\n- **VidStuck domain updated to \`vidstuck.cc\`** across Android, Android TV, Windows and Web.\n- **New ZXCStream (Beta)** playback source using \`zxcstream.cc\`.\n- **Global default video source restored in Settings**. Choose a provider once and it becomes the default for every movie and episode.\n- **VidStuck remains the default** for new installs, resets, or invalid saved source values.\n- Existing title-specific and one-time source choices remain available where supported.\n- Provider trust lists, navigation guards, ad-filter allowlists and website CSP rules include the new domains.\n- ZXCStream participates in native source health/failover where supported.\n- No player redesign: the established 2.2.1 controls and playback UX remain intact.\n\n## Compatibility\n\nAll 2.2.1 discovery, Top 10, Continue Watching, season/episode memory, Home customization and playback features remain in place.\n`);

{
 const p='README.md';let s=read(p);s=s.replace('# 🎬 ZeroPlay 2.2.1','# 🎬 ZeroPlay 2.2.2').replace(/Version \*\*2\.2\.1\*\*[^\n]*/,'Version **2.2.2** keeps the polished 2.2.1 experience and refreshes playback sources: VidStuck now uses `vidstuck.cc`, ZXCStream (Beta) is available, and Settings controls the default source for all videos.');
 s=s.replace('**[📋 2.2.1 release notes](docs/release-2.2.1.md)**','**[📋 2.2.2 release notes](docs/release-2.2.2.md)**');
 s=s.replaceAll('/releases/download/v2.2.1/ZeroPlay-2.2.1-','/releases/download/v2.2.2/ZeroPlay-2.2.2-');
 s=s.replace('## ⭐ What’s new in 2.2.1','## ⭐ What’s new in 2.2.2');
 s=s.replace(/\*\*Top 10 Today[^\n]*/,'**VidStuck → vidstuck.cc · NEW ZXCStream (Beta) · Restored global default playback source · VidStuck remains the default · Existing 2.2.1 player behavior preserved**');
 write(p,s);
}

console.log('ZeroPlay 2.2.2 clean source preparation complete.');
