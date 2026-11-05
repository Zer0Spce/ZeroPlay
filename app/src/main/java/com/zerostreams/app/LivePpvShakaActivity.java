package com.zerostreams.app;

import android.app.Activity;
import android.app.AlertDialog;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.HorizontalScrollView;
import android.widget.LinearLayout;
import android.widget.TextView;
import androidx.webkit.WebViewAssetLoader;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.json.JSONObject;

/**
 * Live PPV on Android and Android TV only.
 * A bundled Shaka Player page runs inside a secure, app-owned WebView origin.
 * No provider iframe, no DRM bypass, no network/CORS access-control override.
 * All non-PPV channels continue using the original LivePlayerActivity.
 */
public final class LivePpvShakaActivity extends Activity {
    private static final String PAGE = "https://appassets.androidplatform.net/assets/ppv-shaka.html";
    private static final int ACCENT = 0xFF65E6CC;
    private static final long CONTROLS_HIDE_DELAY_MS = 4500L;
    private final Handler ui = new Handler(Looper.getMainLooper());
    private final ExecutorService io = Executors.newSingleThreadExecutor();
    private List<M3uPlaylist.Channel> channels = Collections.emptyList();
    private WebView browser;
    private FrameLayout root;
    private LinearLayout topBar;
    private HorizontalScrollView controlsContainer;
    private TextView title, status;
    private Button play, backButton;
    private Button[] playerButtons;
    private int focusedControlIndex = 0;
    private boolean pageLoaded, destroyed, ready, paused, playbackRunning, channelDialogOpen;
    private final Runnable hideControls = () -> {
        if(destroyed || !playbackRunning || channelDialogOpen || topBar==null || controlsContainer==null) return;
        topBar.setVisibility(View.GONE);
        controlsContainer.setVisibility(View.GONE);
        // Retain a focus anchor when the TV remote buttons disappear.
        if(root!=null)root.requestFocus();
    };

    /** Controls hide only during active playback, and stay open while paused or in an error state. */
    private void wakeControls() {
        if(destroyed || topBar==null || controlsContainer==null)return;
        topBar.setVisibility(View.VISIBLE);
        controlsContainer.setVisibility(View.VISIBLE);
        ui.removeCallbacks(hideControls);
        if(playbackRunning && !channelDialogOpen)ui.postDelayed(hideControls,CONTROLS_HIDE_DELAY_MS);
    }
    private int index;
    private String requested;

    private int dp(int value) {return (int)(getResources().getDisplayMetrics().density*value+0.5f);}
    private Button control(String label, Runnable action) {
        Button button=new Button(this);
        button.setText(label);
        button.setId(View.generateViewId());
        button.setAllCaps(false);
        button.setFocusable(true);
        button.setOnFocusChangeListener((view,focused)->{
            // TV buttons must show which option the remote will activate.
            button.setTextColor(focused ? Color.BLACK : Color.WHITE);
            button.setBackgroundColor(focused ? ACCENT : 0xFF242733);
            if(focused) {
                if(playerButtons!=null)for(int i=0;i<playerButtons.length;i++)
                    if(playerButtons[i]==button) {focusedControlIndex=i;break;}
                wakeControls();
            }
        });
        button.setTextColor(Color.WHITE);
        button.setTextSize(14);
        button.setBackgroundColor(0xFF242733);
        button.setOnClickListener(v->{action.run();wakeControls();});
        return button;
    }
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        if(!getIntent().getBooleanExtra("liveList",false)) {finish();return;}
        requested=state==null?getIntent().getStringExtra("channelUrl"):state.getString("channelUrl",getIntent().getStringExtra("channelUrl"));
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_FULLSCREEN|View.SYSTEM_UI_FLAG_HIDE_NAVIGATION|View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
        root=new FrameLayout(this);
        root.setBackgroundColor(Color.BLACK);
        root.setFocusable(true);
        root.setFocusableInTouchMode(true);
        browser=new WebView(this);
        browser.setBackgroundColor(Color.BLACK);
        // Keep DPAD navigation on the native TV playback controls, not the video canvas.
        browser.setFocusable(false);
        browser.setFocusableInTouchMode(false);
        // On touch devices a tap on the video brings the controls back.
        browser.setOnTouchListener((view,event)->{
            if(event.getActionMasked()==MotionEvent.ACTION_DOWN)wakeControls();
            return false;
        });
        WebSettings webSettings=browser.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(false);
        webSettings.setMediaPlaybackRequiresUserGesture(false);
        webSettings.setAllowFileAccess(false);
        webSettings.setAllowContentAccess(false);
        webSettings.setJavaScriptCanOpenWindowsAutomatically(false);
        webSettings.setSupportMultipleWindows(false);
        webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        android.webkit.CookieManager.getInstance().setAcceptThirdPartyCookies(browser,false);
        final WebViewAssetLoader assets = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/",new WebViewAssetLoader.AssetsPathHandler(this))
                .build();
        browser.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view,WebResourceRequest req) {
                if("appassets.androidplatform.net".equals(req.getUrl().getHost())) return assets.shouldInterceptRequest(req.getUrl());
                return null;
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest req) {return true;}
            @Override public void onPageFinished(WebView view,String url) {
                if(!PAGE.equals(url)||destroyed) return;
                pageLoaded=true;
                openChannel();
            }
            @Override public void onReceivedError(WebView view,WebResourceRequest req,WebResourceError error) {
                if(req.isForMainFrame()&&!destroyed)status.setText("Shaka player page failed to load");
            }
        });
        browser.addJavascriptInterface(new Bridge(),"ZeroPpvBridge");
        root.addView(browser,new FrameLayout.LayoutParams(-1,-1));
        LinearLayout top=new LinearLayout(this);
        top.setBackgroundColor(0xDB090D16);
        top.setGravity(Gravity.CENTER_VERTICAL);
        top.setPadding(dp(12),dp(8),dp(12),dp(8));
        backButton=control("‹ Back",this::finish);
        top.addView(backButton);
        topBar=top;
        LinearLayout labels=new LinearLayout(this);
        labels.setPadding(dp(16),0,dp(8),0);
        labels.setOrientation(LinearLayout.VERTICAL);
        title=new TextView(this);
        title.setTextColor(Color.WHITE);
        title.setTextSize(19);
        title.setTypeface(null,Typeface.BOLD);
        title.setSingleLine(true);
        title.setEllipsize(android.text.TextUtils.TruncateAt.END);
        title.setText("ZeroPlay Live PPV · Shaka");
        labels.addView(title);
        status=new TextView(this);
        status.setTextColor(ACCENT);
        status.setTextSize(13);
        status.setText("Opening Shaka Player…");
        labels.addView(status);
        top.addView(labels,new LinearLayout.LayoutParams(0,-2,1));
        root.addView(top,new FrameLayout.LayoutParams(-1,-2,Gravity.TOP));
        LinearLayout row=new LinearLayout(this);
        row.setGravity(Gravity.CENTER_VERTICAL);
        row.setFocusable(false);
        row.setPadding(dp(6),dp(5),dp(6),dp(5));
        row.setBackgroundColor(0xDB090D16);
        play=control("Pause",()->{script(paused?"window.ZeroPpv.play()":"window.ZeroPpv.pause()");paused=!paused;play.setText(paused?"Play":"Pause");});
        Button liveButton=control("● Live",()->script("window.ZeroPpv.live()"));
        Button retryButton=control("Retry",this::openChannel);
        Button channelsButton=control("Channels",this::showChannels);
        Button audioButton=control("Audio",()->script("window.ZeroPpv.tracks('audio')"));
        Button subtitlesButton=control("Subtitles",()->script("window.ZeroPpv.tracks('text')"));
        Button fitButton=control("Fit",()->script("window.ZeroPpv.fit()"));
        Button[] buttons={play,liveButton,retryButton,channelsButton,audioButton,subtitlesButton,fitButton};
        playerButtons=buttons;
        for(int i=0;i<buttons.length;i++) {
            Button button=buttons[i];
            row.addView(button);
            // Explicit focus neighbors keep D-pad navigation working inside HorizontalScrollView.
            button.setNextFocusLeftId(buttons[Math.max(0,i-1)].getId());
            button.setNextFocusRightId(buttons[Math.min(buttons.length-1,i+1)].getId());
            button.setNextFocusUpId(backButton.getId());
        }
        backButton.setNextFocusDownId(play.getId());
        HorizontalScrollView scrolling=new HorizontalScrollView(this);
        scrolling.setHorizontalScrollBarEnabled(false);
        scrolling.setFocusable(false);
        scrolling.addView(row);
        controlsContainer=scrolling;
        root.addView(scrolling,new FrameLayout.LayoutParams(-1,-2,Gravity.BOTTOM));
        setContentView(root);
        play.requestFocus();
        browser.loadUrl(PAGE);
        io.execute(()->{
            try {
                List<M3uPlaylist.Channel> list=PlaylistStore.cached(getApplicationContext(),true).channels;
                int found=-1;
                for(int i=0;i<list.size();i++)if(list.get(i).url.equals(requested)){found=i;break;}
                final int selected=found;
                ui.post(()->{
                    if(destroyed)return;
                    if(selected<0){status.setText("Channel missing. Return to Live PPV and refresh.");return;}
                    channels=list;index=selected;openChannel();
                });
            } catch(Exception failure) {
                ui.post(()->{if(!destroyed)status.setText("Playlist unavailable. Refresh Live PPV.");});
            }
        });
    }
    private void script(String command) {
        if(browser!=null&&pageLoaded&&!destroyed)browser.evaluateJavascript(command,null);
    }
    private void openChannel() {
        if(!pageLoaded||channels.isEmpty()||destroyed)return;
        M3uPlaylist.Channel channel=channels.get(index);
        // Unlike the native player, browser networking cannot set forbidden
        // Referer/Origin headers or override the server's CORS response.
        String agent=channel.headers.get("User-Agent");
        if(agent!=null&&!agent.isEmpty())browser.getSettings().setUserAgentString(agent);
        title.setText(channel.name);
        status.setText("Connecting via Shaka WebView…");
        playbackRunning=false;
        wakeControls();
        paused=false;
        play.setText("Pause");
        script("window.ZeroPpv.load("+JSONObject.quote(channel.url)+","+JSONObject.quote(channel.mime)+")");
    }
    private void showChannels() {
        if(channels.isEmpty())return;
        channelDialogOpen=true;
        wakeControls();
        String[] names=new String[channels.size()];
        for(int i=0;i<names.length;i++)names[i]=channels.get(i).name;
        new AlertDialog.Builder(this).setTitle("Live PPV channels")
                .setSingleChoiceItems(names,index,(d,selected)->{index=selected;openChannel();d.dismiss();})
                .setNegativeButton("Close",null)
                .setOnDismissListener(d->{channelDialogOpen=false;wakeControls();}).show();
    }
    public final class Bridge {
        @JavascriptInterface public void state(String state,String detail) {
            // Runs on WebView bridge thread, so all view updates move to UI thread.
            ui.post(()->{
                if(destroyed||status==null)return;
                switch(state) {
                    case "ready": ready=true;break;
                    case "playing":
                        status.setText("● LIVE · Shaka");
                        paused=false;play.setText("Pause");playbackRunning=true;wakeControls();
                        break;
                    case "buffering":
                        status.setText("Buffering · Shaka WebView");playbackRunning=false;wakeControls();
                        break;
                    case "paused":
                        status.setText("Paused · Shaka");paused=true;play.setText("Play");
                        playbackRunning=false;wakeControls();
                        break;
                    case "error":
                        playbackRunning=false;wakeControls();
                        String safe=detail.replaceAll("[^A-Za-z0-9 .·_-]","").trim();
                        status.setText("Stream unavailable · "+(safe.isEmpty()?"browser playback error":safe));
                        break;
                    case "tracks":status.setText("Available tracks: "+detail.replaceAll("[^A-Za-z0-9 .|_-]","").trim());break;
                    default: break;
                }
            });
        }
    }
    @Override protected void onPause(){
        playbackRunning=false;
        ui.removeCallbacks(hideControls);
        script("window.ZeroPpv.pause()");
        super.onPause();
    }
    @Override protected void onResume(){super.onResume();if(browser!=null)browser.onResume();}
    @Override protected void onStop(){
        ui.removeCallbacks(hideControls);
        if(browser!=null)browser.onPause();
        super.onStop();
    }
    @Override protected void onDestroy(){
        destroyed=true;
        ui.removeCallbacks(hideControls);
        if(browser!=null) {
            script("window.ZeroPpv.stop()");
            browser.removeJavascriptInterface("ZeroPpvBridge");
            browser.stopLoading();
            browser.loadUrl("about:blank");
            browser.destroy();
            browser=null;
        }
        io.shutdownNow();
        super.onDestroy();
    }
    @Override protected void onSaveInstanceState(Bundle saved) {
        if(!channels.isEmpty())saved.putString("channelUrl",channels.get(index).url);
        super.onSaveInstanceState(saved);
    }
    /**
     * Use an explicit DPAD command map: WebView and immersive Android TV shells may not
     * reliably deliver focus traversal or KEYCODE_DPAD_CENTER clicks to native buttons.
     * Consume both DOWN and UP so a stray UP does not activate a second control.
     */
    private void focusControl(int next) {
        if(playerButtons==null||controlsContainer==null)return;
        focusedControlIndex=Math.max(0,Math.min(playerButtons.length-1,next));
        wakeControls();
        Button target=playerButtons[focusedControlIndex];
        target.requestFocus();
        controlsContainer.post(()->{
            if(destroyed||controlsContainer==null)return;
            int centered=target.getLeft()-(controlsContainer.getWidth()-target.getWidth())/2;
            controlsContainer.smoothScrollTo(Math.max(0,centered),0);
        });
    }
    @Override public boolean dispatchKeyEvent(KeyEvent event) {
        if(channelDialogOpen)return super.dispatchKeyEvent(event); // Picker must keep its own DPAD/OK handling.
        int key=event.getKeyCode();
        boolean dpad=key==KeyEvent.KEYCODE_DPAD_LEFT||key==KeyEvent.KEYCODE_DPAD_RIGHT
                ||key==KeyEvent.KEYCODE_DPAD_UP||key==KeyEvent.KEYCODE_DPAD_DOWN
                ||key==KeyEvent.KEYCODE_DPAD_CENTER||key==KeyEvent.KEYCODE_ENTER
                ||key==KeyEvent.KEYCODE_NUMPAD_ENTER||key==KeyEvent.KEYCODE_MENU;
        boolean media=key==KeyEvent.KEYCODE_MEDIA_PLAY||key==KeyEvent.KEYCODE_MEDIA_PAUSE
                ||key==KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE;
        if(!dpad&&!media)return super.dispatchKeyEvent(event);
        if(event.getAction()!=KeyEvent.ACTION_DOWN)return true;
        if(event.getRepeatCount()>0&&(key==KeyEvent.KEYCODE_DPAD_CENTER
                ||key==KeyEvent.KEYCODE_ENTER||key==KeyEvent.KEYCODE_NUMPAD_ENTER))return true;
        if(key==KeyEvent.KEYCODE_MEDIA_PLAY){script("window.ZeroPpv.play()");wakeControls();return true;}
        if(key==KeyEvent.KEYCODE_MEDIA_PAUSE){script("window.ZeroPpv.pause()");wakeControls();return true;}
        if(key==KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE){play.performClick();wakeControls();return true;}
        boolean hidden=controlsContainer!=null&&controlsContainer.getVisibility()!=View.VISIBLE;
        if(hidden) {
            // The first press ONLY reveals the bar. The next OK press clicks the highlighted item.
            focusControl(focusedControlIndex);
            return true;
        }
        View active=getCurrentFocus();
        if(key==KeyEvent.KEYCODE_DPAD_RIGHT) {
            focusControl(active==backButton?0:focusedControlIndex+1);
            return true;
        }
        if(key==KeyEvent.KEYCODE_DPAD_LEFT) {
            focusControl(active==backButton?0:focusedControlIndex-1);
            return true;
        }
        if(key==KeyEvent.KEYCODE_DPAD_UP) {
            wakeControls();
            if(backButton!=null)backButton.requestFocus();
            return true;
        }
        if(key==KeyEvent.KEYCODE_DPAD_DOWN||key==KeyEvent.KEYCODE_MENU) {
            focusControl(focusedControlIndex);
            return true;
        }
        if(key==KeyEvent.KEYCODE_DPAD_CENTER||key==KeyEvent.KEYCODE_ENTER
                ||key==KeyEvent.KEYCODE_NUMPAD_ENTER) {
            wakeControls();
            if(active==backButton)backButton.performClick();
            else if(playerButtons!=null) {
                Button target=playerButtons[focusedControlIndex];
                target.requestFocus();
                target.performClick();
            }
            return true;
        }
        return super.dispatchKeyEvent(event);
    }
}
