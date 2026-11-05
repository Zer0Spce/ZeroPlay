package com.zerostreams.app;

import android.content.SharedPreferences;

/** Android TV movie/series WebView navigation: Smart by default, per-provider overrides. */
final class TvSourceNavigation {
    static final String DEFAULT_KEY = "playerNavigation";
    private static final String PREFIX = "playerNavigationSource:";
    static final String SMART = "smart";
    static final String DPAD = "focus";
    static final String MOUSE = "mouse";
    static final String INHERIT = "inherit";

    private TvSourceNavigation() {}

    static String sanitize(String mode) {
        return DPAD.equals(mode) ? DPAD : MOUSE.equals(mode) ? MOUSE : SMART;
    }
    static String sourceKey(String id) {
        if(id==null || !java.util.Arrays.asList(PlaybackSources.IDS).contains(id) || "rawcast".equals(id))
            throw new IllegalArgumentException("Unsupported TV embed source");
        return PREFIX + id;
    }
    static String global(SharedPreferences prefs) {
        return sanitize(prefs.getString(DEFAULT_KEY,SMART));
    }
    static String override(SharedPreferences prefs,String source) {
        String raw=prefs.getString(sourceKey(source), INHERIT);
        return SMART.equals(raw)||DPAD.equals(raw)||MOUSE.equals(raw) ? raw : INHERIT;
    }
    static String effective(SharedPreferences prefs,String source) {
        String local=override(prefs,source);
        return INHERIT.equals(local) ? global(prefs) : local;
    }
    static void setOverride(SharedPreferences prefs,String source,String mode) {
        String key=sourceKey(source);
        if(INHERIT.equals(mode))prefs.edit().remove(key).apply();
        else if(SMART.equals(mode)||DPAD.equals(mode)||MOUSE.equals(mode))
            prefs.edit().putString(key,mode).apply();
        else throw new IllegalArgumentException("Unknown navigation mode");
    }
    static String label(String mode) {
        if(DPAD.equals(mode))return "D-pad";
        if(MOUSE.equals(mode))return "Virtual mouse";
        if(INHERIT.equals(mode))return "Inherit default";
        return "Smart / Hybrid";
    }
}
