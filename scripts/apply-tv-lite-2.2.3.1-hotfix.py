from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    file = Path(path)
    text = file.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"Expected exactly one match in {path}, found {count}: {old[:100]!r}")
    file.write_text(text.replace(old, new, 1), encoding="utf-8")


# This transform is intentionally applied only inside the Android TV Lite 2.2.3.1
# release workflow. The committed 2.2.3 sources and all other platform releases stay
# unchanged.
replace_once(
    "app/build.gradle",
    """        liteTv {\n            dimension 'device'\n            applicationIdSuffix '.lite.tv'\n            buildConfigField 'boolean', 'TV', 'true'\n            buildConfigField 'boolean', 'LITE', 'true'\n        }""",
    """        liteTv {\n            dimension 'device'\n            applicationIdSuffix '.lite.tv'\n            versionCode 48\n            versionName '2.2.3.1'\n            buildConfigField 'boolean', 'TV', 'true'\n            buildConfigField 'boolean', 'LITE', 'true'\n        }""",
)

replace_once(
    "app/src/main/java/com/zerostreams/app/PlayerAdScan.java",
    """    private final ExecutorService decoder=Executors.newSingleThreadExecutor();private boolean active,busy;private long startedAt,confirmedAt;\n    PlayerAdScan(Activity a,WebView w){activity=a;web=w;PlayerAdBlockState.init(a);}\n    private final Runnable tick=new Runnable(){public void run(){if(!active)return;capture();handler.postDelayed(this,(SystemClock.elapsedRealtime()-startedAt<18000||SystemClock.elapsedRealtime()-confirmedAt<5000)?1000:3500);}};\n    void start(){if(active)return;active=true;startedAt=SystemClock.elapsedRealtime();handler.postDelayed(tick,300);}""",
    """    private final ExecutorService decoder=Executors.newSingleThreadExecutor();private boolean active,busy;private long startedAt,confirmedAt;\n    private static final boolean LITE_TV=BuildConfig.TV&&BuildConfig.LITE;\n    PlayerAdScan(Activity a,WebView w){activity=a;web=w;PlayerAdBlockState.init(a);}\n    private long nextDelay(){long now=SystemClock.elapsedRealtime();if(LITE_TV)return(now-startedAt<18000||now-confirmedAt<5000)?2500:12000;return(now-startedAt<18000||now-confirmedAt<5000)?1000:3500;}\n    private final Runnable tick=new Runnable(){public void run(){if(!active)return;capture();handler.postDelayed(this,nextDelay());}};\n    void start(){if(active)return;active=true;startedAt=SystemClock.elapsedRealtime();handler.postDelayed(tick,LITE_TV?700:300);}""",
)

replace_once(
    "app/src/main/java/com/zerostreams/app/PlayerAdScan.java",
    """        int width=Math.min(1280,Math.max(1,activity.getWindow().getDecorView().getWidth())),height=Math.max(1,(int)(width*(float)activity.getWindow().getDecorView().getHeight()/Math.max(1,activity.getWindow().getDecorView().getWidth())));""",
    """        int captureLimit=LITE_TV?640:1280;int width=Math.min(captureLimit,Math.max(1,activity.getWindow().getDecorView().getWidth())),height=Math.max(1,(int)(width*(float)activity.getWindow().getDecorView().getHeight()/Math.max(1,activity.getWindow().getDecorView().getWidth())));""",
)

# VidStuck .cc is heavier on low-end TV hardware. Keep the guard, but stop doing a
# near-continuous whole-DOM/shadow-tree ad scan in the Lite TV hotfix.
replace_once(
    "app/src/main/assets/player-guard.js",
    """  new MutationObserver(() => {\n    if (pending) return;\n    pending = true;\n    setTimeout(() => { pending = false; scan(); }, 400);\n  }).observe(document, {subtree: true, childList: true, characterData: true});\n  document.addEventListener('DOMContentLoaded', scan);\n  setInterval(scan,1500); // Includes late creatives inside open shadow roots.""",
    """  new MutationObserver(() => {\n    if (pending) return;\n    pending = true;\n    setTimeout(() => { pending = false; scan(); }, 1800);\n  }).observe(document, {subtree: true, childList: true});\n  document.addEventListener('DOMContentLoaded', scan);\n  setInterval(scan,5000); // Android TV Lite 2.2.3.1: reduce continuous DOM pressure during video playback.""",
)

# The 2.2 TV mouse reads SharedPreferences on every animation frame. Keep those
# settings for normal TV builds, but use the proven 2.1-style fixed calculation for
# Lite so D-pad cursor movement cannot compete with video decode/rendering.
replace_once(
    "app/src/main/java/com/zerostreams/app/TvMouse.java",
    """float density=getResources().getDisplayMetrics().density;android.content.SharedPreferences prefs=activity.getSharedPreferences(\"zero\",Activity.MODE_PRIVATE);float multiplier=Math.max(.5f,Math.min(2.5f,prefs.getFloat(\"mouseSpeed\",1f)));boolean acceleration=prefs.getBoolean(\"mouseAcceleration\",true);float ramp=acceleration?Math.min(700,(now-heldAt)*.6f):180;float speed=(260+ramp)*density*multiplier;float dx=""",
    """float density=getResources().getDisplayMetrics().density;float speed;if(BuildConfig.LITE){speed=(260+Math.min(700,(now-heldAt)*.6f))*density;}else{android.content.SharedPreferences prefs=activity.getSharedPreferences(\"zero\",Activity.MODE_PRIVATE);float multiplier=Math.max(.5f,Math.min(2.5f,prefs.getFloat(\"mouseSpeed\",1f)));boolean acceleration=prefs.getBoolean(\"mouseAcceleration\",true);float ramp=acceleration?Math.min(700,(now-heldAt)*.6f):180;speed=(260+ramp)*density*multiplier;}float dx=""",
)

print("Applied ZeroPlay 2.2.3.1 Android TV Lite playback hotfix")
