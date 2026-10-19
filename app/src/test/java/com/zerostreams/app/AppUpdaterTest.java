package com.zerostreams.app;
import org.junit.Test;
import static org.junit.Assert.*;
public class AppUpdaterTest {
    @Test public void comparesReleaseVersionsCorrectly(){
        assertTrue(AppUpdater.newer("v2.0","1.9.0"));
        assertTrue(AppUpdater.newer("1.9.1","1.9"));
        assertFalse(AppUpdater.newer("1.9","1.9.0"));
        assertFalse(AppUpdater.newer("1.8.2","1.9.0"));
        assertTrue(AppUpdater.newer("2.0.0-beta","1.9.9"));
    }
    @Test public void ignoresUpdaterDemoTags(){
        assertTrue(AppUpdater.testRelease("v9.9.9-TEST"));
        assertTrue(AppUpdater.testRelease("v2.0-DEMO"));
        assertTrue(AppUpdater.testRelease("v2.0-placeholder"));
        assertFalse(AppUpdater.testRelease("v2.0"));
        assertFalse(AppUpdater.testRelease("v2.0.1"));
    }
    @Test public void routesEveryAndroidVariantToItsOwnReleaseAsset(){
        String v="2.2.3";
        assertEquals("ZeroPlay-2.2.3-Android.apk",AppUpdater.assetName(v,false,false));
        assertEquals("ZeroPlay-2.2.3-Android-TV.apk",AppUpdater.assetName(v,true,false));
        assertEquals("ZeroPlay-2.2.3-Android-Lite.apk",AppUpdater.assetName(v,false,true));
        assertEquals("ZeroPlay-2.2.3-Android-TV-Lite.apk",AppUpdater.assetName(v,true,true));
        assertEquals("Android TV Lite",AppUpdater.platformName(true,true));
    }
}
