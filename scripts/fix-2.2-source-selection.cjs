const fs=require('node:fs');

function replaceExact(path,before,after,label){
  const source=fs.readFileSync(path,'utf8');
  if(!source.includes(before))throw new Error(`Missing ${label} in ${path}`);
  const next=source.replace(before,after);
  if(next===source)throw new Error(`No change for ${label} in ${path}`);
  fs.writeFileSync(path,next);
}

const playerHost=`// Owns embedded player layout and native fullscreen in the existing app window.\nclass PlayerHost {\n  constructor(main,view,toolbar,options={}){\n    this.bottom=!!options.bottom;\n    this.toolbarEnabled=options.toolbar!==false;\n    this.main=main;this.view=view;this.toolbar=toolbar;this.closed=false;\n    this.beforeFullscreen=main.isFullScreen();this.manualFullscreen=this.beforeFullscreen;this.htmlFullscreen=false;\n    this.resize=()=>this.layout();this.enter=()=>{this.htmlFullscreen=true;main.setFullScreen(true);this.layout();};this.leave=()=>{this.htmlFullscreen=false;main.setFullScreen(this.manualFullscreen);this.layout();};\n    main.contentView.addChildView(view);if(this.toolbarEnabled)main.contentView.addChildView(toolbar);\n    for(const event of ['resize','enter-full-screen','leave-full-screen'])main.on(event,this.resize);\n    view.webContents.on('enter-html-full-screen',this.enter);view.webContents.on('leave-html-full-screen',this.leave);\n    this.layout();this.activity();\n  }\n  layout(){if(this.closed||this.main.isDestroyed())return;const [width,height]=this.main.getContentSize();this.view.setBounds({x:0,y:0,width,height});if(this.toolbarEnabled){this.toolbar.setBounds({x:0,y:this.bottom?Math.max(0,height-44):0,width,height:44});this.toolbar.setVisible((this.bottom||(!this.main.isFullScreen()&&!this.htmlFullscreen))&&!!this.toolbarVisible);}}\n  activity(){if(this.closed)return;if(!this.toolbarEnabled){this.view.webContents.focus?.();return;}this.toolbarVisible=true;this.layout();clearTimeout(this.idle);this.idle=setTimeout(()=>{if(this.bottom&&this.toolbar.webContents.isFocused?.())this.view.webContents.focus?.();this.toolbarVisible=false;this.layout();},3000);}\n  async exitFullscreen(){this.manualFullscreen=false;this.htmlFullscreen=false;for(const frame of this.view.webContents.mainFrame.framesInSubtree)await frame.executeJavaScript('if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});').catch(()=>{});if(!this.closed){this.main.setFullScreen(false);this.activity();}}\n  async toggleFullscreen(){if(this.main.isFullScreen()||this.htmlFullscreen)return this.exitFullscreen();this.manualFullscreen=true;this.main.setFullScreen(true);this.layout();}\n  close(){if(this.closed)return;this.closed=true;clearTimeout(this.idle);for(const event of ['resize','enter-full-screen','leave-full-screen'])this.main.removeListener(event,this.resize);this.view.webContents.removeListener('enter-html-full-screen',this.enter);this.view.webContents.removeListener('leave-html-full-screen',this.leave);if(!this.main.isDestroyed()){if(this.toolbarEnabled)this.main.contentView.removeChildView(this.toolbar);this.main.contentView.removeChildView(this.view);this.main.setFullScreen(this.beforeFullscreen);}if(!this.toolbar.webContents.isDestroyed())this.toolbar.webContents.close();if(!this.view.webContents.isDestroyed())this.view.webContents.close();}\n}\nmodule.exports={PlayerHost};\n`;
fs.writeFileSync('windows/player-host.cjs',playerHost);

replaceExact(
  'windows/main.cjs',
  'playerHost=new PlayerHost(main,view,toolbar);installPlayerScripts(contents);',
  'playerHost=new PlayerHost(main,view,toolbar,{toolbar:false});installPlayerScripts(contents);',
  'Windows movie and series overlay opt-out'
);

replaceExact(
  'windows/main.cjs',
  "const view=player;playerHost=new PlayerHost(main,view,toolbar);view.setBackgroundColor('#000');toolbar.setBackgroundColor('#101621');",
  "const view=player;playerHost=new PlayerHost(main,view,toolbar,{toolbar:false});view.setBackgroundColor('#000');toolbar.setBackgroundColor('#101621');",
  'Windows local live overlay opt-out'
);

const regression=`const test=require('node:test');\nconst assert=require('node:assert/strict');\nconst fs=require('node:fs');\n\nconst host=fs.readFileSync('windows/player-host.cjs','utf8');\nconst main=fs.readFileSync('windows/main.cjs','utf8');\nconst android=fs.readFileSync('app/src/main/java/com/zerostreams/app/BrowserPlayerActivity.java','utf8');\n\ntest('Windows embedded movie/live playback opts out of the ZeroPlay toolbar',()=>{\n  assert.match(main,/new PlayerHost\\(main,view,toolbar,\\{toolbar:false\\}\\);installPlayerScripts/);\n  assert.match(main,/new PlayerHost\\(main,view,toolbar,\\{toolbar:false\\}\\);view\\.setBackgroundColor/);\n  assert.match(host,/this\\.toolbarEnabled=options\\.toolbar!==false/);\n  assert.match(host,/if\\(this\\.toolbarEnabled\\)main\\.contentView\\.addChildView\\(toolbar\\)/);\n});\n\ntest('Windows sports keeps its existing dedicated support bar',()=>{\n  assert.match(main,/new PlayerHost\\(main,view,toolbar,\\{bottom:true\\}\\)/);\n  assert.match(host,/this\\.bottom\\?Math\\.max\\(0,height-44\\):0/);\n});\n\ntest('Android and TV do not draw a ZeroPlay quick bar over provider players',()=>{\n  assert.doesNotMatch(android,/if\\(!reader\\)buildQuickBar\\(\\);/);\n  assert.match(android,/private void buildQuickBar\\(\\)\\{\\}/);\n  assert.match(android,/private void showQuickBar\\(\\)\\{\\}/);\n  assert.match(android,/window\\.__zeroTvWake/);\n});\n`;
fs.writeFileSync('tests/default-player-controls-regression.test.cjs',regression);
console.log('Scoped custom overlay removal to embedded movie/live playback while retaining sports support controls');
