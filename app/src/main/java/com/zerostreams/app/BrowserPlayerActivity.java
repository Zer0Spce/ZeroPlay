package com.zerostreams.app;

import android.app.Activity;
import android.os.Bundle;
import android.view.*;
import android.webkit.*;
import android.widget.*;
import android.graphics.Color;
import android.net.Uri;

public class BrowserPlayerActivity extends Activity {
    private WebView web;
    private boolean tvPlayer;
    private String playerGuard;
    private TvMouse mouse;
    private PlayerAdScan adScan;
    private long lastProgressSaved;
    private long lastPlayerGesture;
    private volatile boolean blockAds;
    private TextView status;
    private FrameLayout screen;
    private View fullscreen;
    private WebChromeClient.CustomViewCallback fullscreenCallback;
    private boolean tvBackRequesting;
    private int tvBackToken;
    private final android.os.Handler tvUi=new android.os.Handler(android.os.Looper.getMainLooper());
    // ZERO22_PLAYER
    private android.content.SharedPreferences prefs;private LinearLayout quickBar;private Runnable hideQuickBar;private long loadStarted;private boolean failoverTried,nextScheduled;private String currentAddress;private String navigationMode="smart";

    @Override public void onCreate(Bundle saved) {
        super.onCreate(saved);
        boolean reader=getIntent().getBooleanExtra("reader",false);
        if(reader)setRequestedOrientation(android.content.pm.ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
        String address=getIntent().getStringExtra("url");
        if(address==null||!address.startsWith("https://")){finish();return;}
        tvPlayer=BuildConfig.TV&&!reader;prefs=getSharedPreferences("zero",MODE_PRIVATE);currentAddress=address;navigationMode=prefs.getString("playerNavigation","smart");
        blockAds=!reader&&prefs.getBoolean("blockAds",true);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        LinearLayout root=new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.BLACK);
        LinearLayout controls=new LinearLayout(this);
        Button back=new Button(this);
        back.setText("Back");
        back.setOnClickListener(v->{if(reader)finish();else confirmExit();});
        controls.addView(back);
        Button reload=new Button(this);
        reload.setText(reader?"Reload reader":"Reload player");
        reload.setOnClickListener(v->{status.setText(reader?"Loading reader…":"Loading player…");web.reload();});
        controls.addView(reload);
        if(PlaybackSources.trusted(address)){
            Button browser=new Button(this);
            browser.setText("Open browser");
            browser.setOnClickListener(v->{
                try{startActivity(new android.content.Intent(android.content.Intent.ACTION_VIEW,Uri.parse(address)));}
                catch(android.content.ActivityNotFoundException e){Toast.makeText(this,"No browser installed",Toast.LENGTH_LONG).show();}
            });
            controls.addView(browser);
        }
        if(!reader){
            Button ads=new Button(this);
            ads.setText(blockAds?"Ads blocked":"Blocking off");
            ads.setOnClickListener(v->{
                blockAds=!blockAds;
                getSharedPreferences("zero",MODE_PRIVATE).edit().putBoolean("blockAds",blockAds).apply();
                ads.setText(blockAds?"Ads blocked":"Blocking off");
                web.reload();
            });
            controls.addView(ads);
        }
        status=new TextView(this);
        status.setText(reader?"Loading reader…":"Loading player…");
        status.setTextColor(Color.WHITE);
        status.setTextSize(14);
        controls.addView(status,new LinearLayout.LayoutParams(0,-2,1));
        if(reader)root.addView(controls);

        web=new WebView(this);
        web.setBackgroundColor(Color.BLACK);
        web.setFocusable(true);
        web.setFocusableInTouchMode(true);
        web.setOnTouchListener((v,event)->{
            if(event.getActionMasked()==MotionEvent.ACTION_DOWN){
                lastPlayerGesture=android.os.SystemClock.elapsedRealtime();
                wakeControls();
            }
            return false;
        });
        CookieManager cookies=CookieManager.getInstance();
        cookies.setAcceptCookie(true);
        cookies.setAcceptThirdPartyCookies(web,PlaybackSources.trusted(address));
        WebSettings settings=web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setSupportMultipleWindows(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);

        if(!reader&&PlaybackSources.trusted(address)){
            blockAds=true;
            installProgressListener();
            installPlayerExitListener();
            installPlayerGuard();
            adScan=new PlayerAdScan(this,web);
        }

        web.setWebViewClient(new WebViewClient(){
            @Override public boolean shouldOverrideUrlLoading(WebView v,WebResourceRequest request){
                if(tvPlayer&&request.isForMainFrame()&&request.hasGesture()&&java.util.Arrays.asList("vidstuck.xyz","embedwave.cc","vidsrc.sh").contains(request.getUrl().getHost())&&!String.valueOf(request.getUrl().getPath()).startsWith("/embed/")){confirmExit();return true;}
                return (blockAds&&AdBlockRules.blocks(request.getUrl().getHost())) || !"https".equals(request.getUrl().getScheme()) || (request.isForMainFrame()&&!PlaybackSources.trusted(request.getUrl().toString()));
            }
            @Override public WebResourceResponse shouldInterceptRequest(WebView v,WebResourceRequest request){
                if(blockAds&&!request.isForMainFrame()&&AdBlockRules.blocks(request.getUrl().getHost()))return new WebResourceResponse("text/plain","UTF-8",new java.io.ByteArrayInputStream(new byte[0]));
                return null;
            }
            @Override public void onPageFinished(WebView v,String url){
                CookieManager.getInstance().flush();currentAddress=url;
                if(playerGuard!=null)v.evaluateJavascript(playerGuard,null);
                if(!reader){long elapsed=Math.max(1,android.os.SystemClock.elapsedRealtime()-loadStarted);PlaybackHealth.success(prefs,currentProvider(),elapsed);failoverTried=false;applySmartMode();scheduleLoadTimeout();}
                status.setText(reader?"Publisher reader · use Back to return":"External player · use Menu for ZeroPlay controls");
            }
            @Override public void onReceivedError(WebView v,WebResourceRequest request,WebResourceError error){
                if(request.isForMainFrame()){
                    status.setText("Player unavailable. Retry, change source, or use the next source.");
                    if(!reader)handlePlayerFailure("Player load error");
                }
            }
        });

        web.setWebChromeClient(new WebChromeClient(){
            @Override public boolean onCreateWindow(WebView view,boolean dialog,boolean gesture,android.os.Message message){return false;}
            @Override public void onShowCustomView(View view,CustomViewCallback callback){
                if(tvPlayer||android.os.SystemClock.elapsedRealtime()-lastPlayerGesture>1500||fullscreen!=null){callback.onCustomViewHidden();return;}
                fullscreen=view;
                fullscreenCallback=callback;
                root.setVisibility(View.GONE);
                screen.addView(view,new FrameLayout.LayoutParams(-1,-1));
            }
            @Override public void onHideCustomView(){closeFullscreen();}
        });

        root.addView(web,new LinearLayout.LayoutParams(-1,0,1));
        screen=new FrameLayout(this);
        screen.setBackgroundColor(Color.BLACK);
        screen.addView(root,new FrameLayout.LayoutParams(-1,-1));
        if(tvPlayer){
            mouse=new TvMouse(this,web,screen,this::wakeControls);applyNavigationMode(navigationMode);
            Toast.makeText(this,"Movie player · "+navigationModeLabel(),Toast.LENGTH_LONG).show();
        }
        if(!reader)buildQuickBar();
        setContentView(screen);
        if(!reader)hideSystemBars();
        loadStarted=android.os.SystemClock.elapsedRealtime();web.loadUrl(address);scheduleLoadTimeout();
        web.requestFocus();
    }

    private void hideSystemBars(){
        getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_FULLSCREEN|View.SYSTEM_UI_FLAG_HIDE_NAVIGATION|View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY|View.SYSTEM_UI_FLAG_LAYOUT_STABLE|View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN|View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
    }
    @Override public void onWindowFocusChanged(boolean focused){super.onWindowFocusChanged(focused);if(focused&&!getIntent().getBooleanExtra("reader",false))hideSystemBars();}
    private void closeFullscreen(){
        if(fullscreen==null)return;
        screen.removeView(fullscreen);
        fullscreen=null;
        screen.getChildAt(0).setVisibility(View.VISIBLE);
        if(fullscreenCallback!=null){fullscreenCallback.onCustomViewHidden();fullscreenCallback=null;}
    }

    private boolean isBackKey(int key){return key==KeyEvent.KEYCODE_BACK||key==KeyEvent.KEYCODE_ESCAPE||key==KeyEvent.KEYCODE_BUTTON_B;}
    private boolean tvNavKey(int key){return key==KeyEvent.KEYCODE_DPAD_LEFT||key==KeyEvent.KEYCODE_DPAD_RIGHT||key==KeyEvent.KEYCODE_DPAD_UP||key==KeyEvent.KEYCODE_DPAD_DOWN||key==KeyEvent.KEYCODE_DPAD_CENTER||key==KeyEvent.KEYCODE_ENTER;}
    private String tvDirection(int key){
        switch(key){
            case KeyEvent.KEYCODE_DPAD_LEFT:return "left";
            case KeyEvent.KEYCODE_DPAD_RIGHT:return "right";
            case KeyEvent.KEYCODE_DPAD_UP:return "up";
            case KeyEvent.KEYCODE_DPAD_DOWN:return "down";
            case KeyEvent.KEYCODE_DPAD_CENTER:
            case KeyEvent.KEYCODE_ENTER:return "ok";
            default:return null;
        }
    }

    private void sendTvNavigation(String direction){
        if(web==null||direction==null)return;
        web.evaluateJavascript("if(window.__zeroTvNavigate)window.__zeroTvNavigate('"+direction+"');",null);
    }

    private void wakeDpadControls(){
        wakeControls();
        if(web==null||web.getWidth()<=0||web.getHeight()<=0)return;
        long now=android.os.SystemClock.uptimeMillis();
        float x=web.getWidth()/2f;
        float y=Math.max(2f,web.getHeight()*.72f);
        MotionEvent hover=MotionEvent.obtain(now,now,MotionEvent.ACTION_HOVER_MOVE,x,y,0);
        hover.setSource(InputDevice.SOURCE_MOUSE);
        web.dispatchGenericMotionEvent(hover);
        hover.recycle();
    }

    @Override public boolean dispatchKeyEvent(KeyEvent event){
        int key=event.getKeyCode();
        if(isBackKey(key)&&!getIntent().getBooleanExtra("reader",false)){
            if(event.getAction()==KeyEvent.ACTION_UP&&!event.isCanceled())onBackPressed();
            return true;
        }
        if(tvPlayer&&key==KeyEvent.KEYCODE_MENU){if(event.getAction()==KeyEvent.ACTION_UP&&!event.isCanceled())showQuickMenu();return true;}
        if(tvPlayer){
            if(mouse!=null&&mouse.isMouseEnabled()){
                if(mouse.handle(event))return true;
            }else if(tvNavKey(key)){
                String direction=tvDirection(key);
                boolean activate="ok".equals(direction);
                if(event.getAction()==KeyEvent.ACTION_DOWN&&event.getRepeatCount()==0)wakeDpadControls();
                boolean fire=(activate&&event.getAction()==KeyEvent.ACTION_UP)||(!activate&&event.getAction()==KeyEvent.ACTION_DOWN&&event.getRepeatCount()==0);
                if(fire&&direction!=null){
                    if(activate)lastPlayerGesture=android.os.SystemClock.elapsedRealtime();
                    sendTvNavigation(direction);
                }
                return true;
            }
        }
        return super.dispatchKeyEvent(event);
    }

    private void wakeControls(){
        if(web==null)return;showQuickBar();
        web.evaluateJavascript("if(window.__zeroTvWake)window.__zeroTvWake();else if(window.__zeroRemoteActivity)window.__zeroRemoteActivity();",null);
    }

    private void confirmExit(){ExitConfirmation.show(this,"Exit playback?","Leave this movie or episode and return to ZeroPlay?",this::finish);}
    private String jsValue(String value){if(value==null)return "";return value.replace("\"","").trim();}
    private void resolveTvBack(String stage){
        tvBackRequesting=false;
        if(isFinishing()||web==null)return;
        if("menu".equals(stage)||"controls".equals(stage)){
            if(mouse!=null&&"controls".equals(stage))mouse.stop();
            return;
        }
        if("exit".equals(stage)){
            if(mouse!=null)mouse.stop();
            confirmExit();
        }
    }
    private void pollTvBackResult(int token,int attempt){
        if(web==null||isFinishing()){tvBackRequesting=false;return;}
        String script="(function(){try{var r=window.__zeroBackResult;if(!r||r.token!=="+token+")return 'pending';return r.stage||'pending';}catch(e){return 'pending';}})();";
        web.evaluateJavascript(script,value->{
            String result=jsValue(value);
            if("menu".equals(result)||"controls".equals(result)||"exit".equals(result)){resolveTvBack(result);return;}
            if(attempt>=14){
                tvBackRequesting=false;
                wakeControls();
                return;
            }
            tvUi.postDelayed(()->pollTvBackResult(token,attempt+1),60);
        });
    }
    private void requestTvBackStep(){
        if(tvBackRequesting||web==null)return;
        tvBackRequesting=true;
        int token=++tvBackToken;
        String script="(function(){try{window.__zeroBackResult=null;if(typeof window.__zeroTvBackRequest!=='function')return 'missing';window.__zeroTvBackRequest("+token+");return 'started';}catch(e){return 'missing';}})();";
        web.evaluateJavascript(script,value->{
            if("missing".equals(jsValue(value))){
                tvBackRequesting=false;
                wakeControls();
                return;
            }
            tvUi.postDelayed(()->pollTvBackResult(token,0),60);
        });
    }

    private String currentProvider(){try{String host=Uri.parse(currentAddress).getHost();return "embedwave.cc".equals(host)?"embedwave":"vidsrc.sh".equals(host)?"vidsrc-sh":"vidstuck";}catch(Exception e){return "vidstuck";}}
    private String navigationModeLabel(){return navigationMode.equals("mouse")?"Mouse":navigationMode.equals("focus")?"D-pad navigation":"Smart / Hybrid";}
    private void applyNavigationMode(String mode){navigationMode=mode;prefs.edit().putString("playerNavigation",mode).putBoolean("playerMouse",mode.equals("mouse")).apply();if(mouse!=null)mouse.setEnabled(mode.equals("mouse"));if(mode.equals("smart"))applySmartMode();}
    private void applySmartMode(){if(!tvPlayer||mouse==null||!navigationMode.equals("smart")||web==null)return;web.evaluateJavascript("(typeof window.__zeroTvCanFocus==='function'&&window.__zeroTvCanFocus())",value->{boolean focus="true".equals(String.valueOf(value));mouse.setEnabled(!focus);});}
    private void scheduleLoadTimeout(){tvUi.removeCallbacks(loadTimeout);if(getIntent().getBooleanExtra("reader",false))return;tvUi.postDelayed(loadTimeout,12000);}
    private final Runnable loadTimeout=()->{if(web==null||isFinishing())return;web.evaluateJavascript("(function(){var v=document.querySelector('video');return !!(v&&v.readyState>=2);})()",value->{if(!"true".equals(String.valueOf(value)))handlePlayerFailure("Player timeout");});};
    private void handlePlayerFailure(String reason){PlaybackHealth.failure(prefs,currentProvider());if(prefs.getBoolean("autoSourceRecovery",true)&&!failoverTried){failoverTried=true;if(loadNextSource())return;}Toast.makeText(this,reason+" · use Menu for Retry / Next Source",Toast.LENGTH_LONG).show();showQuickBar();}
    private String alternateUrl(){String parent=getIntent().getStringExtra("parent"),key=getIntent().getStringExtra("key");if(parent==null||!parent.matches("tmdb-(movie|series)-[0-9]+"))return "";String id=parent.substring(parent.lastIndexOf('-')+1),type=parent.startsWith("tmdb-series-")?"tv":"movie";int season=1,episode=1;if(type.equals("tv")&&key!=null){java.util.regex.Matcher m=java.util.regex.Pattern.compile(":s([0-9]+)e([0-9]+)$").matcher(key);if(m.find()){season=Integer.parseInt(m.group(1));episode=Integer.parseInt(m.group(2));}}String current=currentProvider(),next=current.equals("vidstuck")?"embedwave":current.equals("embedwave")?"vidsrc-sh":"vidstuck";try{return PlaybackSources.url(id,type,season,episode,next);}catch(Exception e){return "";}}
    private boolean loadNextSource(){String next=alternateUrl();if(next.isEmpty())return false;currentAddress=next;loadStarted=android.os.SystemClock.elapsedRealtime();status.setText("Trying next source…");web.loadUrl(next);scheduleLoadTimeout();return true;}
    private void runPlayer(String script){if(web!=null)web.evaluateJavascript(script,null);}
    private void buildQuickBar(){quickBar=new LinearLayout(this);quickBar.setGravity(Gravity.CENTER_VERTICAL);quickBar.setPadding(8,5,8,5);quickBar.setBackgroundColor(0xDD101621);String[] labels={"←","−10","▶/Ⅱ","+10","Intro","Menu"};for(String label:labels){Button b=new Button(this);b.setText(label);b.setAllCaps(false);b.setTextColor(Color.WHITE);b.setBackgroundColor(Color.TRANSPARENT);if(label.equals("←"))b.setOnClickListener(v->confirmExit());else if(label.equals("−10"))b.setOnClickListener(v->runPlayer("window.__zeroSeekBy&&window.__zeroSeekBy(-10)"));else if(label.equals("▶/Ⅱ"))b.setOnClickListener(v->runPlayer("window.__zeroTogglePlayback&&window.__zeroTogglePlayback()"));else if(label.equals("+10"))b.setOnClickListener(v->runPlayer("window.__zeroSeekBy&&window.__zeroSeekBy(10)"));else if(label.equals("Intro"))b.setOnClickListener(v->runPlayer("window.__zeroSeekBy&&window.__zeroSeekBy("+prefs.getInt("skipIntroSeconds",90)+")"));else b.setOnClickListener(v->showQuickMenu());quickBar.addView(b,new LinearLayout.LayoutParams(0,-2,1));}FrameLayout.LayoutParams lp=new FrameLayout.LayoutParams(-1,-2,Gravity.BOTTOM);screen.addView(quickBar,lp);hideQuickBar=()->{if(quickBar!=null)quickBar.setVisibility(View.GONE);};showQuickBar();}
    private void showQuickBar(){if(quickBar==null)return;quickBar.setVisibility(View.VISIBLE);tvUi.removeCallbacks(hideQuickBar);tvUi.postDelayed(hideQuickBar,4500);}
    private void showQuickMenu(){java.util.List<String> items=new java.util.ArrayList<>();items.add("Navigation · Smart / Hybrid");items.add("Navigation · D-pad");items.add("Navigation · Mouse");items.add("Retry player");items.add("Next source");items.add("Skip intro · "+prefs.getInt("skipIntroSeconds",90)+" sec");items.add("Skip recap · "+prefs.getInt("skipRecapSeconds",45)+" sec");items.add("Player diagnostics");items.add("Exit playback");new android.app.AlertDialog.Builder(this).setTitle("ZeroPlay player").setItems(items.toArray(new String[0]),(d,n)->{if(n==0)applyNavigationMode("smart");else if(n==1)applyNavigationMode("focus");else if(n==2)applyNavigationMode("mouse");else if(n==3){failoverTried=false;loadStarted=android.os.SystemClock.elapsedRealtime();web.reload();scheduleLoadTimeout();}else if(n==4)loadNextSource();else if(n==5)runPlayer("window.__zeroSeekBy&&window.__zeroSeekBy("+prefs.getInt("skipIntroSeconds",90)+")");else if(n==6)runPlayer("window.__zeroSeekBy&&window.__zeroSeekBy("+prefs.getInt("skipRecapSeconds",45)+")");else if(n==7)showDiagnostics();else confirmExit();}).setNegativeButton("Close",null).show();}
    private void showDiagnostics(){web.evaluateJavascript("JSON.stringify(window.__zeroPlayerDiagnostics?window.__zeroPlayerDiagnostics():{})",value->{String details=String.valueOf(value);new android.app.AlertDialog.Builder(this).setTitle("Player diagnostics").setMessage("Provider: "+currentProvider()+"\nNavigation: "+navigationModeLabel()+"\n"+PlaybackHealth.summary(prefs,currentProvider())+"\n\n"+details).setPositiveButton("Close",null).show();});}
    private void scheduleNextEpisode(String parent,int season,int episode){if(nextScheduled)return;nextScheduled=true;Toast.makeText(this,"Next episode starts in 10 seconds · press Back/Menu to cancel by leaving playback",Toast.LENGTH_LONG).show();new Thread(()->{try{String id=parent.substring(parent.lastIndexOf('-')+1),tmdb=prefs.getString("tmdbKey","").trim();if(tmdb.isEmpty())tmdb=BuildConfig.DEFAULT_TMDB_KEY;org.json.JSONArray eps=ContentApi.seasonEpisodes(id,season,tmdb);int next=episode+1,nextSeason=season;if(next>eps.length()){nextSeason=season+1;next=1;}String url=PlaybackSources.url(id,"tv",nextSeason,next,currentProvider());String finalUrl=url;tvUi.postDelayed(()->{if(isFinishing()||web==null)return;currentAddress=finalUrl;loadStarted=android.os.SystemClock.elapsedRealtime();web.loadUrl(finalUrl);nextScheduled=false;},10000);}catch(Exception e){nextScheduled=false;}}).start();}
    private void installPlayerExitListener(){
        if(!androidx.webkit.WebViewFeature.isFeatureSupported(androidx.webkit.WebViewFeature.WEB_MESSAGE_LISTENER))return;
        androidx.webkit.WebViewCompat.addWebMessageListener(web,"ZeroPlayer",new java.util.HashSet<>(java.util.Arrays.asList(PlaybackSources.ORIGINS)),(view,message,origin,mainFrame,reply)->{
            if(mainFrame&&PlaybackSources.trusted(origin.toString())&&"back".equals(message.getData()))confirmExit();
        });
    }

    private void installProgressListener(){
        String parent=getIntent().getStringExtra("parent");
        if(parent==null||!parent.matches("tmdb-(movie|series)-[0-9]+"))return;
        if(!androidx.webkit.WebViewFeature.isFeatureSupported(androidx.webkit.WebViewFeature.WEB_MESSAGE_LISTENER))return;
        HistoryStore history=new HistoryStore(getSharedPreferences("zero",MODE_PRIVATE));
        String type=parent.startsWith("tmdb-series-")?"tv":"movie";
        androidx.webkit.WebViewCompat.addWebMessageListener(web,"ZeroProgress",new java.util.HashSet<>(java.util.Arrays.asList(PlaybackSources.ORIGINS)),(view,message,origin,mainFrame,reply)->{
            if(!PlaybackSources.trusted(origin.toString()))return;
            String data=message.getData();
            if(data==null||data.length()>4096)return;
            long now=android.os.SystemClock.elapsedRealtime();
            if(now-lastProgressSaved<2500)return;
            try{
                org.json.JSONObject event=new org.json.JSONObject(data);
                history.progress(parent,type,event);if(type.equals("tv")&&prefs.getBoolean("autoplayNext",true)&&event.optDouble("duration",0)>30&&event.optDouble("timestamp",0)/event.optDouble("duration",1)>=.985)scheduleNextEpisode(parent,event.optInt("season",1),event.optInt("episode",1));
                lastProgressSaved=now;
            }catch(org.json.JSONException ignored){}
        });
    }

    private void installPlayerGuard(){
        try(java.io.InputStream guardInput=getAssets().open("player-guard.js");
            java.io.InputStream tvInput=getAssets().open("tv-player-input.js");
            java.io.InputStream v22Input=getAssets().open("player-22.js");
            java.io.ByteArrayOutputStream guardOutput=new java.io.ByteArrayOutputStream();
            java.io.ByteArrayOutputStream tvOutput=new java.io.ByteArrayOutputStream();java.io.ByteArrayOutputStream v22Output=new java.io.ByteArrayOutputStream()){
            byte[] buffer=new byte[4096];int count;
            while((count=guardInput.read(buffer))!=-1)guardOutput.write(buffer,0,count);
            while((count=tvInput.read(buffer))!=-1)tvOutput.write(buffer,0,count);while((count=v22Input.read(buffer))!=-1)v22Output.write(buffer,0,count);
            playerGuard="window.__zeroTv="+tvPlayer+";window.__zeroBlockAds="+blockAds+";window.__zeroGain="+prefs.getFloat("audioBoost",1f)+";"+guardOutput.toString("UTF-8")+(tvPlayer?tvOutput.toString("UTF-8"):"")+v22Output.toString("UTF-8");
            if(androidx.webkit.WebViewFeature.isFeatureSupported(androidx.webkit.WebViewFeature.DOCUMENT_START_SCRIPT)){
                androidx.webkit.WebViewCompat.addDocumentStartJavaScript(web,playerGuard,java.util.Collections.singleton("*"));
            }else{
                Toast.makeText(this,"Update Android System WebView for filtering inside player frames.",Toast.LENGTH_LONG).show();
            }
        }catch(java.io.IOException error){
            android.util.Log.e("ZeroPlay","Player guard could not load",error);
        }
    }

    @Override public void onBackPressed(){
        if(getIntent().getBooleanExtra("reader",false)||playerGuard==null||web==null){
            if(fullscreen!=null)closeFullscreen();
            else super.onBackPressed();
            return;
        }
        if(fullscreen!=null){closeFullscreen();return;}
        if(tvPlayer){requestTvBackStep();return;}
        if(mouse!=null)mouse.stop();
        confirmExit();
    }

    @Override protected void onPause(){
        if(mouse!=null)mouse.stop();
        if(adScan!=null)adScan.stop();
        if(web!=null){CookieManager.getInstance().flush();web.onPause();}
        super.onPause();
    }
    @Override protected void onResume(){
        super.onResume();
        if(web!=null)web.onResume();
        if(adScan!=null)adScan.start();
    }
    @Override protected void onDestroy(){
        tvUi.removeCallbacksAndMessages(null);
        if(mouse!=null)mouse.stop();
        if(adScan!=null)adScan.destroy();
        if(web!=null){web.stopLoading();web.destroy();}
        super.onDestroy();
    }
}
