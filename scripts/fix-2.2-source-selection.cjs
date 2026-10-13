const fs=require('node:fs');

function replaceExact(path,before,after,label){
  const source=fs.readFileSync(path,'utf8');
  if(!source.includes(before))throw new Error(`Missing ${label} in ${path}`);
  const next=source.replace(before,after);
  if(next===source)throw new Error(`No change for ${label} in ${path}`);
  fs.writeFileSync(path,next);
}

replaceExact(
  'windows/main.cjs',
  "if(!sourceOverride||sourceOverride==='vidstuck')requestedSource=bestSource(requestedSource);",
  "if(!sourceOverride)requestedSource=bestSource(requestedSource);",
  'Windows explicit-source precedence'
);

replaceExact(
  'windows/ui/app.js',
  "function sourceFor(item){if(!item)return 'vidstuck';const once=oneTimeSources.get(key(item));if(sources.some(([id])=>id===once))return once;const saved=sourceOverrides()[key(item)];return sources.some(([id])=>id===saved)?saved:'vidstuck';}",
  "function playbackSourceValid(id){return sources.some(([sourceId])=>sourceId===id);}\nfunction sourceFor(item){const global=state?.settings?.source;if(!item)return playbackSourceValid(global)?global:'vidstuck';const once=oneTimeSources.get(key(item));if(playbackSourceValid(once))return once;const saved=sourceOverrides()[key(item)];if(playbackSourceValid(saved))return saved;return playbackSourceValid(global)?global:'vidstuck';}",
  'Windows global playback-source selection'
);

replaceExact(
  'app/src/main/java/com/zerostreams/app/MainActivity.java',
  'boolean allowedPlaybackSource(String source){return source!=null&&PlaybackSources.index(source)<PlaybackSources.IDS.length&&(!source.equals("rawcast")||prefs.getBoolean("rawcastPlayback",false));}',
  'boolean allowedPlaybackSource(String source){return source!=null&&Arrays.asList(PlaybackSources.IDS).contains(source)&&(!source.equals("rawcast")||prefs.getBoolean("rawcastPlayback",false));}',
  'Android explicit source validation'
);

replaceExact(
  'app/src/main/java/com/zerostreams/app/MainActivity.java',
  'String playbackSourceFor(Catalog.Item item){String once=oneTimePlaybackSources.get(item.id);if(allowedPlaybackSource(once))return once;String saved=prefs.getString("playbackSourceFor:"+item.id,"");if(allowedPlaybackSource(saved))return saved;if(prefs.getBoolean("autoBestSource",true))return PlaybackHealth.best(prefs,Arrays.asList("vidstuck","embedwave","vidsrc-sh"),"vidstuck");return "vidstuck";}',
  'String playbackSourceFor(Catalog.Item item){String once=oneTimePlaybackSources.get(item.id);if(allowedPlaybackSource(once))return once;String saved=prefs.getString("playbackSourceFor:"+item.id,"");if(allowedPlaybackSource(saved))return saved;String selected=selectedPlaybackSource();if(allowedPlaybackSource(selected))return selected;return "vidstuck";}',
  'Android manual playback-source precedence'
);

replaceExact(
  'app/src/main/java/com/zerostreams/app/MainActivity.java',
  'java.util.Arrays.copyOf(PlaybackSources.NAMES,2)',
  'java.util.Arrays.copyOf(PlaybackSources.NAMES,3)',
  'Android VidSrc picker visibility'
);

const regression=`const test=require('node:test');\nconst assert=require('node:assert/strict');\nconst fs=require('node:fs');\n\nconst winMain=fs.readFileSync('windows/main.cjs','utf8');\nconst winUi=fs.readFileSync('windows/ui/app.js','utf8');\nconst android=fs.readFileSync('app/src/main/java/com/zerostreams/app/MainActivity.java','utf8');\nconst web=fs.readFileSync('web/public/browser.js','utf8');\n\ntest('Windows explicit source selection wins over auto-best scoring',()=>{\n  assert.match(winMain,/if\\(!sourceOverride\\)requestedSource=bestSource\\(requestedSource\\);/);\n  assert.doesNotMatch(winMain,/sourceOverride\\|\\|sourceOverride==='vidstuck'/);\n  assert.match(winUi,/const global=state\\?\\.settings\\?\\.source/);\n  assert.match(winUi,/return playbackSourceValid\\(global\\)\\?global:'vidstuck'/);\n});\n\ntest('Android and TV keep manual source precedence and expose VidSrc',()=>{\n  assert.match(android,/Arrays\\.asList\\(PlaybackSources\\.IDS\\)\\.contains\\(source\\)/);\n  assert.match(android,/String selected=selectedPlaybackSource\\(\\);if\\(allowedPlaybackSource\\(selected\\)\\)return selected;return "vidstuck";/);\n  assert.match(android,/java\\.util\\.Arrays\\.copyOf\\(PlaybackSources\\.NAMES,3\\)/);\n  assert.doesNotMatch(android,/if\\(prefs\\.getBoolean\\("autoBestSource",true\\)\\)return PlaybackHealth\\.best/);\n});\n\ntest('Website still sends the selected settings source directly',()=>{\n  assert.match(web,/saved\\.settings\\.source\\|\\|'vidstuck'/);\n});\n`;
fs.writeFileSync('tests/source-selection-regression.test.cjs',regression);
console.log('Fixed 2.2 source precedence on Windows/Android TV and restored VidSrc picker visibility');
