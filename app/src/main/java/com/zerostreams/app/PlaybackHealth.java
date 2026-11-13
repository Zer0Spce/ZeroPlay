package com.zerostreams.app;

import android.content.SharedPreferences;
import java.util.*;

/** Device-local media evidence, never page-load guesses or external telemetry. */
final class PlaybackHealth {
    private PlaybackHealth(){}
    static final List<String> AUTOMATIC=Collections.unmodifiableList(Arrays.asList(
        "vidstuck","zxcstream","embedwave","vidnest","vidrift","vidfast","vidapi"));
    static final long COOLDOWN=30*60*1000L;
    static boolean automatic(String provider){return AUTOMATIC.contains(provider);}
    static void loaded(SharedPreferences prefs,String provider,long elapsed){
        if(!automatic(provider))return;
        long prior=prefs.getLong("sourceLoad:"+provider,0),ms=Math.max(1,Math.min(30000,elapsed));
        prefs.edit().putLong("sourceLoad:"+provider,prior>0?(prior*3+ms)/4:ms).apply();
    }
    static void success(SharedPreferences prefs,String provider,long ignoredLoadMs){
        if(!automatic(provider))return;
        int ok=prefs.getInt("sourceOk:"+provider,0);
        prefs.edit().putInt("sourceOk:"+provider,Math.min(500,ok+1))
             .putInt("sourceFailStreak:"+provider,0)
             .putLong("sourceLastGood:"+provider,System.currentTimeMillis()).apply();
    }
    static void failure(SharedPreferences prefs,String provider){
        if(!automatic(provider))return;
        int failures=prefs.getInt("sourceFail:"+provider,0),streak=prefs.getInt("sourceFailStreak:"+provider,0);
        prefs.edit().putInt("sourceFail:"+provider,Math.min(500,failures+1))
            .putInt("sourceFailStreak:"+provider,Math.min(20,streak+1))
            .putLong("sourceLastFail:"+provider,System.currentTimeMillis()).apply();
    }
    static int scoreEvidence(int ok,int failures,int streak,long lastFailure,long avgLoad,long now){
        double confidence=(Math.max(0,ok)+2.0)/(Math.max(0,ok)+Math.max(0,failures)+4.0);
        double speed=avgLoad>0?Math.max(-.1,.07-Math.min(.17,avgLoad/60000.0)):.01;
        double cooldown=streak>=2&&now-lastFailure<COOLDOWN?-.9:0;
        return (int)Math.round((confidence+speed+cooldown)*1000);
    }
    static int score(SharedPreferences prefs,String provider){
        return scoreEvidence(prefs.getInt("sourceOk:"+provider,0),prefs.getInt("sourceFail:"+provider,0),
            prefs.getInt("sourceFailStreak:"+provider,0),prefs.getLong("sourceLastFail:"+provider,0),
            prefs.getLong("sourceLoad:"+provider,0),System.currentTimeMillis());
    }
    static String best(SharedPreferences prefs,Collection<String> allowed,String fallback){
        String preferred=automatic(fallback)?fallback:"vidstuck",best=preferred;
        int value=Integer.MIN_VALUE;
        for(String provider:allowed){
            if(!automatic(provider))continue;
            int score=score(prefs,provider)+(provider.equals(preferred)?120:0);
            if(score>value){value=score;best=provider;}
        }
        return best;
    }
    static String next(SharedPreferences prefs,String current){
        List<String> options=new ArrayList<>(AUTOMATIC);options.remove(current);
        if(options.isEmpty())return null;
        return best(prefs,options,"vidstuck");
    }
    static String summary(SharedPreferences prefs,String provider){
        int index=PlaybackSources.index(provider);
        return PlaybackSources.NAMES[index]+" · "+
            (prefs.getInt("sourceOk:"+provider,0)+prefs.getInt("sourceFail:"+provider,0)==0?
              "not measured":"verified playback health "+score(prefs,provider))+
            (prefs.getLong("sourceLoad:"+provider,0)>0?
              " · "+prefs.getLong("sourceLoad:"+provider,0)+" ms page load":"");
    }
}
