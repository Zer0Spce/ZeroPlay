from pathlib import Path

browser_path=Path('app/src/main/java/com/zerostreams/app/BrowserPlayerActivity.java')
browser=browser_path.read_text()

def replace_once(text, old, new, label):
    if old not in text:
        raise SystemExit('Missing marker: '+label)
    return text.replace(old,new,1)

browser=replace_once(browser,
    '    private boolean tvPlayer;\n',
    '    private boolean tvPlayer,liteTvPlayer;\n',
    'lite tv player field')

browser=replace_once(browser,
    '        tvPlayer=BuildConfig.TV&&!reader;prefs=getSharedPreferences("zero",MODE_PRIVATE);currentAddress=address;navigationMode=prefs.getString("playerNavigation","smart");\n',
    '        tvPlayer=BuildConfig.TV&&!reader;liteTvPlayer=BuildConfig.TV&&BuildConfig.LITE&&!reader;prefs=getSharedPreferences("zero",MODE_PRIVATE);currentAddress=address;navigationMode=prefs.getString("playerNavigation","smart");\n',
    'lite tv player detection')

browser=replace_once(browser,
    '                if(!reader){long elapsed=Math.max(1,android.os.SystemClock.elapsedRealtime()-loadStarted);PlaybackHealth.success(prefs,currentProvider(),elapsed);failoverTried=false;applySmartMode();scheduleLoadTimeout();}\n                status.setText(reader?"Publisher reader · use Back to return":"External player · use Menu for ZeroPlay controls");\n',
    '                if(!reader&&!liteTvPlayer){long elapsed=Math.max(1,android.os.SystemClock.elapsedRealtime()-loadStarted);PlaybackHealth.success(prefs,currentProvider(),elapsed);failoverTried=false;applySmartMode();scheduleLoadTimeout();}\n                else if(liteTvPlayer)failoverTried=false;\n                status.setText(reader?"Publisher reader · use Back to return":liteTvPlayer?"External player · use Back to return":"External player · use Menu for ZeroPlay controls");\n',
    'page finished lite path')

browser=replace_once(browser,
    '                    status.setText("Player unavailable. Retry, change source, or use the next source.");\n                    if(!reader)handlePlayerFailure("Player load error");\n',
    '                    status.setText(liteTvPlayer?"Player unavailable. Reload or try again later.":"Player unavailable. Retry, change source, or use the next source.");\n                    if(!reader){if(liteTvPlayer)Toast.makeText(BrowserPlayerActivity.this,"Player unavailable. Press Back and try again.",Toast.LENGTH_LONG).show();else handlePlayerFailure("Player load error");}\n',
    'lite player error handling')

browser=replace_once(browser,
    '        if(tvPlayer){\n            mouse=new TvMouse(this,web,screen,this::wakeControls);applyNavigationMode(navigationMode);\n            Toast.makeText(this,"Movie player · "+navigationModeLabel(),Toast.LENGTH_LONG).show();\n        }\n',
    '        if(tvPlayer){\n            mouse=new TvMouse(this,web,screen,this::wakeControls);\n            if(liteTvPlayer)Toast.makeText(this,mouse.isMouseEnabled()?"Movie player · Mouse control":"Movie player · D-pad navigation",Toast.LENGTH_LONG).show();\n            else{applyNavigationMode(navigationMode);Toast.makeText(this,"Movie player · "+navigationModeLabel(),Toast.LENGTH_LONG).show();}\n        }\n',
    'legacy lite navigation init')

browser=replace_once(browser,
    '        loadStarted=android.os.SystemClock.elapsedRealtime();web.loadUrl(address);scheduleLoadTimeout();\n',
    '        loadStarted=android.os.SystemClock.elapsedRealtime();web.loadUrl(address);if(!liteTvPlayer)scheduleLoadTimeout();\n',
    'initial lite load timeout')

browser=replace_once(browser,
    '        if(tvPlayer&&seriesPlayback()&&(key==KeyEvent.KEYCODE_MEDIA_NEXT||key==KeyEvent.KEYCODE_CHANNEL_UP||key==KeyEvent.KEYCODE_MEDIA_PREVIOUS||key==KeyEvent.KEYCODE_CHANNEL_DOWN)){if(event.getAction()==KeyEvent.ACTION_UP&&!event.isCanceled())moveEpisode((key==KeyEvent.KEYCODE_MEDIA_NEXT||key==KeyEvent.KEYCODE_CHANNEL_UP)?1:-1);return true;}\n        if(tvPlayer&&key==KeyEvent.KEYCODE_MENU){if(event.getAction()==KeyEvent.ACTION_UP&&!event.isCanceled())showQuickMenu();return true;}\n',
    '        if(tvPlayer&&!liteTvPlayer&&seriesPlayback()&&(key==KeyEvent.KEYCODE_MEDIA_NEXT||key==KeyEvent.KEYCODE_CHANNEL_UP||key==KeyEvent.KEYCODE_MEDIA_PREVIOUS||key==KeyEvent.KEYCODE_CHANNEL_DOWN)){if(event.getAction()==KeyEvent.ACTION_UP&&!event.isCanceled())moveEpisode((key==KeyEvent.KEYCODE_MEDIA_NEXT||key==KeyEvent.KEYCODE_CHANNEL_UP)?1:-1);return true;}\n        if(tvPlayer&&!liteTvPlayer&&key==KeyEvent.KEYCODE_MENU){if(event.getAction()==KeyEvent.ACTION_UP&&!event.isCanceled())showQuickMenu();return true;}\n',
    'lite skips 2.2 quick controls')

browser=replace_once(browser,
    '    private void applySmartMode(){if(!tvPlayer||mouse==null||!navigationMode.equals("smart")||web==null)return;',
    '    private void applySmartMode(){if(liteTvPlayer||!tvPlayer||mouse==null||!navigationMode.equals("smart")||web==null)return;',
    'lite skips smart mode')

browser=replace_once(browser,
    '    private void scheduleLoadTimeout(){tvUi.removeCallbacks(loadTimeout);if(getIntent().getBooleanExtra("reader",false))return;tvUi.postDelayed(loadTimeout,12000);}\n',
    '    private void scheduleLoadTimeout(){tvUi.removeCallbacks(loadTimeout);if(liteTvPlayer||getIntent().getBooleanExtra("reader",false))return;tvUi.postDelayed(loadTimeout,12000);}\n',
    'lite skips player timeout')

browser=replace_once(browser,
    '+(tvPlayer?tvOutput.toString("UTF-8"):"")+v22Output.toString("UTF-8");\n',
    '+(tvPlayer?tvOutput.toString("UTF-8"):"")+(liteTvPlayer?"":v22Output.toString("UTF-8"));\n',
    'lite skips player 22 helper')

browser_path.write_text(browser)

mouse_path=Path('app/src/main/java/com/zerostreams/app/TvMouse.java')
mouse=mouse_path.read_text()
mouse=replace_once(mouse,
    '    private void snapCursor(){\n        if(!enabled||!activity.getSharedPreferences("zero",Activity.MODE_PRIVATE).getBoolean("cursorAssist",true)||web==null||web.getWidth()<1)return;',
    '    private void snapCursor(){\n        if(BuildConfig.LITE)return;\n        if(!enabled||!activity.getSharedPreferences("zero",Activity.MODE_PRIVATE).getBoolean("cursorAssist",true)||web==null||web.getWidth()<1)return;',
    'lite skips cursor assist')
mouse_path.write_text(mouse)
