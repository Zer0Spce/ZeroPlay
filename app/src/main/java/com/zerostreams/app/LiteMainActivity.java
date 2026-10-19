package com.zerostreams.app;

import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import java.util.*;

/** Lightweight launcher used only by the Android Lite and Android TV Lite flavors. */
public class LiteMainActivity extends PresentationMainActivity {
    private static final String LITE_DEFAULTS="liteDefaultsV3";

    @Override public void onCreate(Bundle state){
        android.content.SharedPreferences prefs=getSharedPreferences("zero",MODE_PRIVATE);
        if(!prefs.getBoolean(LITE_DEFAULTS,false)){
            Set<String> panels=new LinkedHashSet<>(Arrays.asList(
                "continue","watchlist","trending","popular","series","now"
            ));
            prefs.edit()
                .putBoolean(LITE_DEFAULTS,true)
                .putBoolean("uiAnimations",false)
                .putBoolean("focusInfo",false)
                .putBoolean("focusTrailer",false)
                .putBoolean("homepageTrailer",false)
                .putBoolean("performanceMode",true)
                .putString("artQuality","saver")
                .putStringSet("homePanels",panels)
                .putString("uiLayout","classic")
                .apply();
        }
        super.onCreate(state);
        if(BuildConfig.TV)stripUnusedTvBackdrop(getWindow().getDecorView());
    }

    /**
     * Keep Lite Home on the proven, simpler 2.1-style path. The full 2.2 Home
     * renderer calculates recommendation groups even when Lite does not display
     * them, which is wasted work on lower-end TV hardware.
     */
    @Override void renderHome22(List<Catalog.Item> rows,int token){
        List<Catalog.Item> resumes=continuing();
        List<Catalog.Item> movies=new ArrayList<>(),shows=new ArrayList<>(),upcoming=new ArrayList<>(),trending=new ArrayList<>(),recommended=new ArrayList<>(),newest=new ArrayList<>();
        for(Catalog.Item item:rows){
            if(item.type.equals("movie"))movies.add(item);
            if(item.type.equals("series"))shows.add(item);
            if(item.raw.optBoolean("upcoming"))upcoming.add(item);
            if(item.raw.optBoolean("trending"))trending.add(item);
            if(item.raw.optBoolean("recommended"))recommended.add(item);
            if(item.raw.optBoolean("nowPlaying"))newest.add(item);
        }
        if(homePanel("continue")&&!resumes.isEmpty())posterRow("Continue watching",resumes,token);
        if(homePanel("watchlist"))homeWatchlist(token);
        if(homePanel("upcoming"))posterRow("Coming soon",upcoming,token);
        if(homePanel("providers"))providerSection(token);
        if(homePanel("recommended"))posterRow("Recommended movies",recommended,token);
        if(homePanel("trending"))posterRow("Trending now",trending,token);
        if(homePanel("popular"))posterRow("Popular movies",movies,token);
        if(homePanel("series"))posterRow("Series worth watching",shows,token);
        if(homePanel("now"))posterRow("Now playing",newest,token);
        homeExtraRows(token);
    }

    /** Lite does not render the large rotating hero carousel. */
    @Override void carousel(List<Catalog.Item> all,int token){ }

    /** Keep fewer cards alive in horizontal homepage rows. */
    @Override void posterRow(String title,List<Catalog.Item> rows,int token){
        if(rows==null||rows.isEmpty())return;
        int limit=Math.min(rows.size(),8);
        super.posterRow(title,new ArrayList<>(rows.subList(0,limit)),token);
    }

    /** Disable full-screen backdrop/blur work on lower-end hardware. */
    @Override void atmosphere(Catalog.Item item,int token){ }

    /**
     * MainActivity creates a full-screen BlurArtwork layer for every TV build.
     * Lite never paints it because atmosphere() is disabled, so remove the unused
     * layer to avoid an extra full-screen composition pass on low-end devices.
     */
    private void stripUnusedTvBackdrop(View view){
        if(!(view instanceof ViewGroup))return;
        ViewGroup group=(ViewGroup)view;
        for(int i=group.getChildCount()-1;i>=0;i--){
            View child=group.getChildAt(i);
            if("BlurArtwork".equals(child.getClass().getSimpleName()))group.removeViewAt(i);
            else stripUnusedTvBackdrop(child);
        }
    }

    /** Request smaller TMDB artwork while preserving non-TMDB URLs. */
    @Override void picture(String url,ImageView view,int token){
        String liteUrl=url;
        if(url!=null&&url.startsWith("https://image.tmdb.org/t/p/")){
            liteUrl=url.replaceFirst("/t/p/(?:w[0-9]+|original)/",BuildConfig.TV?"/t/p/w500/":"/t/p/w342/");
        }
        super.picture(liteUrl,view,token);
    }
}
