package com.zerostreams.app;

import android.content.SharedPreferences;
import java.util.*;

/** Device-local provider reliability scores. No telemetry leaves the device. */
final class PlaybackHealth {
    private PlaybackHealth(){}
    static void success(SharedPreferences prefs,String provider,long loadMs){update(prefs,provider,true,loadMs);}
    static void failure(SharedPreferences prefs,String provider){update(prefs,provider,false,0);}
    private static void update(SharedPreferences prefs,String provider,boolean success,long loadMs){
        if(PlaybackSources.index(provider)<0)return;int ok=prefs.getInt("sourceOk:"+provider,0),fail=prefs.getInt("sourceFail:"+provider,0);long avg=prefs.getLong("sourceLoad:"+provider,0);if(success){ok=Math.min(500,ok+1);if(loadMs>0)avg=avg<=0?loadMs:(avg*4+loadMs)/5;}else fail=Math.min(500,fail+1);prefs.edit().putInt("sourceOk:"+provider,ok).putInt("sourceFail:"+provider,fail).putLong("sourceLoad:"+provider,avg).apply();
    }
    static int score(SharedPreferences prefs,String provider){int ok=prefs.getInt("sourceOk:"+provider,0),fail=prefs.getInt("sourceFail:"+provider,0);long load=prefs.getLong("sourceLoad:"+provider,0);int reliability=(ok+fail)==0?70:(int)Math.round(ok*100d/(ok+fail));int speed=load<=0?15:(int)Math.max(0,30-Math.min(30,load/350));return reliability+speed;}
    static String best(SharedPreferences prefs,Collection<String> allowed,String fallback){String best=fallback;int score=Integer.MIN_VALUE;for(String provider:allowed){if(provider==null||PlaybackSources.index(provider)<0)continue;int candidate=score(prefs,provider);if(candidate>score){score=candidate;best=provider;}}return best;}
    static String summary(SharedPreferences prefs,String provider){int ok=prefs.getInt("sourceOk:"+provider,0),fail=prefs.getInt("sourceFail:"+provider,0);long load=prefs.getLong("sourceLoad:"+provider,0);return PlaybackSources.NAMES[PlaybackSources.index(provider)]+" · "+(ok+fail==0?"not measured":score(prefs,provider)+" health")+(load>0?" · "+load+" ms avg":"");}
}
