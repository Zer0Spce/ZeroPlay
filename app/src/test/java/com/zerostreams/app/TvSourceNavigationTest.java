package com.zerostreams.app;

import android.content.SharedPreferences;
import org.junit.Test;
import java.lang.reflect.Proxy;
import java.util.HashMap;
import java.util.Map;
import static org.junit.Assert.*;

public class TvSourceNavigationTest {
    private static final class Fake {
        final Map<String,String> data=new HashMap<>();
        final SharedPreferences prefs=(SharedPreferences)Proxy.newProxyInstance(
            SharedPreferences.class.getClassLoader(),new Class[]{SharedPreferences.class},
            (proxy,method,args)->{
                if("getString".equals(method.getName()))
                    return data.getOrDefault(String.valueOf(args[0]),(String)args[1]);
                if("edit".equals(method.getName())) {
                    Map<String,String> writes=new HashMap<>();
                    java.util.Set<String> removals=new java.util.HashSet<>();
                    return Proxy.newProxyInstance(SharedPreferences.Editor.class.getClassLoader(),
                            new Class[]{SharedPreferences.Editor.class},(editor,action,params)->{
                                switch(action.getName()){
                                    case "putString":writes.put((String)params[0],(String)params[1]);return editor;
                                    case "remove":removals.add((String)params[0]);return editor;
                                    case "apply":
                                    case "commit":
                                        for(String key:removals)data.remove(key);
                                        data.putAll(writes);
                                        return "commit".equals(action.getName())?true:null;
                                    default:throw new UnsupportedOperationException(action.getName());
                                }
                            });
                }
                throw new UnsupportedOperationException(method.getName());
            });
    }
    @Test public void everySourceInheritsSmartByDefault(){
        Fake fake=new Fake();
        assertEquals("smart",TvSourceNavigation.global(fake.prefs));
        for(String provider:PlaybackSources.IDS){
            if("rawcast".equals(provider))continue;
            assertEquals("inherit",TvSourceNavigation.override(fake.prefs,provider));
            assertEquals("smart",TvSourceNavigation.effective(fake.prefs,provider));
        }
    }
    @Test public void perSourceOverrideIsolatedAndInheritRestoresGlobal(){
        Fake fake=new Fake();
        fake.data.put("playerNavigation","focus");
        TvSourceNavigation.setOverride(fake.prefs,"vidstuck","mouse");
        assertEquals("mouse",TvSourceNavigation.effective(fake.prefs,"vidstuck"));
        assertEquals("smart",TvSourceNavigation.effective(fake.prefs,"vidnest"));
        TvSourceNavigation.setOverride(fake.prefs,"vidstuck","inherit");
        assertEquals("smart",TvSourceNavigation.effective(fake.prefs,"vidstuck"));
    }
    @Test public void invalidModeIsSafeAndUnsupportedSourceIsRejected(){
        Fake fake=new Fake();
        fake.data.put("playerNavigation","bad-mode");
        fake.data.put("playerNavigationSource:vidnest","invalid");
        assertEquals("smart",TvSourceNavigation.effective(fake.prefs,"vidnest"));
        assertEquals("D-pad",TvSourceNavigation.label("focus"));
        assertEquals("Virtual mouse",TvSourceNavigation.label("mouse"));
        try{TvSourceNavigation.setOverride(fake.prefs,"rawcast","mouse");fail("rawcast has no WebView player");}
        catch(IllegalArgumentException expected){}
    }
}
