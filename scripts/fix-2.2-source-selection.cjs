const fs=require('node:fs');

function replaceExact(path,before,after,label){
  const source=fs.readFileSync(path,'utf8');
  if(!source.includes(before))throw new Error(`Missing ${label} in ${path}`);
  const next=source.replace(before,after);
  if(next===source)throw new Error(`No change for ${label} in ${path}`);
  fs.writeFileSync(path,next);
}

replaceExact(
  'windows/player-host.cjs',
  '    main.contentView.addChildView(view);main.contentView.addChildView(toolbar);',
  '    main.contentView.addChildView(view);',
  'Windows custom toolbar attachment'
);

replaceExact(
  'windows/player-host.cjs',
  "  layout(){if(this.closed||this.main.isDestroyed())return;const [width,height]=this.main.getContentSize();this.view.setBounds({x:0,y:0,width,height});this.toolbar.setBounds({x:0,y:this.bottom?Math.max(0,height-44):0,width,height:44});this.toolbar.setVisible((this.bottom||(!this.main.isFullScreen()&&!this.htmlFullscreen))&&!!this.toolbarVisible);}",
  "  layout(){if(this.closed||this.main.isDestroyed())return;const [width,height]=this.main.getContentSize();this.view.setBounds({x:0,y:0,width,height});}",
  'Windows custom toolbar layout'
);

replaceExact(
  'windows/player-host.cjs',
  "  activity(){if(this.closed)return;this.toolbarVisible=true;this.layout();clearTimeout(this.idle);this.idle=setTimeout(()=>{if(this.bottom&&this.toolbar.webContents.isFocused?.())this.view.webContents.focus?.();this.toolbarVisible=false;this.layout();},3000);}",
  "  activity(){if(this.closed)return;this.view.webContents.focus?.();}",
  'Windows custom toolbar activity'
);

replaceExact(
  'windows/player-host.cjs',
  "if(!this.main.isDestroyed()){this.main.contentView.removeChildView(this.toolbar);this.main.contentView.removeChildView(this.view);this.main.setFullScreen(this.beforeFullscreen);}",
  "if(!this.main.isDestroyed()){this.main.contentView.removeChildView(this.view);this.main.setFullScreen(this.beforeFullscreen);}",
  'Windows custom toolbar cleanup'
);

replaceExact(
  'app/src/main/java/com/zerostreams/app/BrowserPlayerActivity.java',
  '        if(!reader)buildQuickBar();',
  '        // Keep the provider player visually native; ZeroPlay controls stay off the video surface.',
  'Android custom quick-bar creation'
);

replaceExact(
  'app/src/main/java/com/zerostreams/app/BrowserPlayerActivity.java',
  '        if(web==null)return;showQuickBar();',
  '        if(web==null)return;',
  'Android custom quick-bar wake'
);

replaceExact(
  'app/src/main/java/com/zerostreams/app/BrowserPlayerActivity.java',
  'Toast.makeText(this,reason+" · use Menu for Retry / Next Source",Toast.LENGTH_LONG).show();showQuickBar();}',
  'Toast.makeText(this,reason+" · use Menu for Retry / Next Source",Toast.LENGTH_LONG).show();}',
  'Android failure quick-bar display'
);

let android=fs.readFileSync('app/src/main/java/com/zerostreams/app/BrowserPlayerActivity.java','utf8');
const barPattern=/    private void buildQuickBar\(\)\{.*?\}\n    private void showQuickBar\(\)\{.*?\}\n/s;
if(!barPattern.test(android))throw new Error('Missing Android quick-bar methods');
android=android.replace(barPattern,'    private void buildQuickBar(){}\n    private void showQuickBar(){}\n');
fs.writeFileSync('app/src/main/java/com/zerostreams/app/BrowserPlayerActivity.java',android);

const regression=`const test=require('node:test');\nconst assert=require('node:assert/strict');\nconst fs=require('node:fs');\n\nconst host=fs.readFileSync('windows/player-host.cjs','utf8');\nconst android=fs.readFileSync('app/src/main/java/com/zerostreams/app/BrowserPlayerActivity.java','utf8');\n\ntest('Windows does not attach the ZeroPlay toolbar over provider players',()=>{\n  assert.match(host,/main\\.contentView\\.addChildView\\(view\\);/);\n  assert.doesNotMatch(host,/addChildView\\(toolbar\\)/);\n  assert.doesNotMatch(host,/toolbar\\.setBounds/);\n  assert.doesNotMatch(host,/toolbar\\.setVisible/);\n  assert.doesNotMatch(host,/removeChildView\\(this\\.toolbar\\)/);\n});\n\ntest('Android and TV do not draw a ZeroPlay quick bar over provider players',()=>{\n  assert.doesNotMatch(android,/if\\(!reader\\)buildQuickBar\\(\\);/);\n  assert.match(android,/private void buildQuickBar\\(\\)\\{\\}/);\n  assert.match(android,/private void showQuickBar\\(\\)\\{\\}/);\n  assert.doesNotMatch(android,/if\\(web==null\\)return;showQuickBar\\(\\);/);\n  assert.match(android,/window\\.__zeroTvWake/);\n});\n`;
fs.writeFileSync('tests/default-player-controls-regression.test.cjs',regression);
console.log('Removed visible ZeroPlay player overlays while preserving provider-native controls and app-level behavior');
