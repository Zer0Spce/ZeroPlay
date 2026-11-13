package com.zerostreams.app;

import org.junit.Test;
import java.util.*;
import static org.junit.Assert.*;

public class LivePpvPlaybackTest {
    private M3uPlaylist.Channel feed(String name, String group, String url) {
        return new M3uPlaylist.Channel("test", name, group, "", url,
                "application/x-mpegURL", "", "", Collections.emptyMap());
    }

    @Test public void originalNativeHeadersArePreservedOnFirstAttempt() {
        Map<String,String> original = new LinkedHashMap<>();
        original.put("Referer", "https://roxiestreams.info/nba-streams-1");
        original.put("User-Agent", "Mozilla/5.0 (compatible; LivePlaylist/1.0)");
        Map<String,String> first = LivePpvPlayback.headers(original, 0);
        assertEquals(original, first);
        assertFalse(first.containsKey("Origin"));
    }

    @Test public void addsCompatibleOriginsWithoutDiscardingReferrer() {
        Map<String,String> original = new LinkedHashMap<>();
        original.put("Referer", "https://roxiestreams.info/nba-streams-1?a=1");
        original.put("User-Agent", "Mozilla/5.0 (compatible; LivePlaylist/1.0)");
        Map<String,String> pageOrigin = LivePpvPlayback.headers(original, 1);
        assertEquals("https://roxiestreams.info", pageOrigin.get("Origin"));
        assertEquals(original.get("User-Agent"), pageOrigin.get("User-Agent"));
        Map<String,String> opaqueOrigin = LivePpvPlayback.headers(original, 2);
        assertEquals("null", opaqueOrigin.get("Origin"));
        Map<String,String> browser = LivePpvPlayback.headers(original, 3);
        assertTrue(browser.get("User-Agent").contains("Chrome"));
        assertEquals(original.get("Referer"), browser.get("Referer"));
        assertEquals(original.get("User-Agent"), LivePpvPlayback.headers(original,0).get("User-Agent"));
        assertFalse(original.containsKey("Origin"));
    }

    @Test public void explicitOriginIsNeverOverridden() {
        Map<String,String> original = new LinkedHashMap<>();
        original.put("Origin", "https://trusted.example");
        original.put("Referer", "https://roxiestreams.info/nba");
        assertEquals("https://trusted.example", LivePpvPlayback.headers(original,2).get("Origin"));
        assertEquals("https://trusted.example", LivePpvPlayback.headers(original,3).get("Origin"));
    }

    @Test public void rejectsInvalidReferrerBeforeOriginDerivation() {
        assertEquals("",LivePpvPlayback.origin("javascript:alert(1)"));
        assertEquals("",LivePpvPlayback.origin("https://username:pass@example.com/secret"));
        assertEquals("https://roxiestreams.info:8443",LivePpvPlayback.origin("https://roxiestreams.info:8443/nba"));
    }

    @Test public void switchesOnlyToUntriedFeedForSameEvent() {
        List<M3uPlaylist.Channel> channels=Arrays.asList(
            feed("NBA | Team A vs Team B — Nov 5, 2026, 8:00 AM PHT — Feed 1","NBA","https://cdn.example/1.m3u8"),
            feed("NBA | Team C vs Team D — Nov 5, 2026, 8:00 AM PHT","NBA","https://cdn.example/other.m3u8"),
            feed("NBA | Team A vs Team B — Nov 5, 2026, 8:00 AM PHT — Feed 2","NBA","https://cdn.example/2.m3u8"),
            feed("NBA | Team A vs Team B — Nov 5, 2026, 8:00 AM PHT — Feed 3","NHL","https://cdn.example/wrong-group.m3u8"));
        Set<String> tried=new HashSet<>();
        tried.add(channels.get(0).url);
        assertEquals(2,LivePpvPlayback.nextSameEvent(channels,0,tried));
        tried.add(channels.get(2).url);
        assertEquals(-1,LivePpvPlayback.nextSameEvent(channels,0,tried));
    }

    @Test public void noAlternativeForUnrelatedEvents() {
        List<M3uPlaylist.Channel> channels=Arrays.asList(
            feed("NBA | Knicks vs Celtics", "NBA","https://cdn.example/a.m3u8"),
            feed("NBA | Lakers vs Clippers","NBA","https://cdn.example/b.m3u8"));
        assertEquals(-1,LivePpvPlayback.nextSameEvent(channels,0,Collections.emptySet()));
    }

    @Test public void unverifiedWweFeedsAreRecognizedAsSameEvent() {
        List<M3uPlaylist.Channel> channels=Arrays.asList(
            feed("WWE RAW — Feed 1 — Unverified", "WWE", "https://cdn.example/wwe.m3u8"),
            feed("WWE RAW — Feed 2 — Unverified", "WWE", "https://cdn.example/wwealt.m3u8"),
            feed("WWE SmackDown — Feed 1 — Unverified", "WWE", "https://cdn.example/smackdown.m3u8"));
        Set<String> attempted=new HashSet<>(Collections.singleton(channels.get(0).url));
        assertEquals("wwe raw", LivePpvPlayback.eventKey(channels.get(0).name));
        assertEquals(1,LivePpvPlayback.nextSameEvent(channels,0,attempted));
        attempted.add(channels.get(1).url);
        assertEquals(-1,LivePpvPlayback.nextSameEvent(channels,0,attempted));
    }

    @Test public void malformedManifestCanTryBoundedRequestProfiles() {
        int malformed=androidx.media3.common.PlaybackException.ERROR_CODE_PARSING_MANIFEST_MALFORMED;
        int unsupported=androidx.media3.common.PlaybackException.ERROR_CODE_PARSING_MANIFEST_UNSUPPORTED;
        assertTrue(LivePpvPlayback.isMalformedManifest(malformed));
        assertTrue(LivePpvPlayback.shouldTryBrowserHeaders(malformed));
        assertFalse(LivePpvPlayback.shouldTryBrowserHeaders(unsupported));
        assertTrue(LivePpvPlayback.shouldTryBrowserHeaders(
                androidx.media3.common.PlaybackException.ERROR_CODE_IO_BAD_HTTP_STATUS));
        assertEquals(4,LivePpvPlayback.PROFILE_COUNT);
    }

    @Test public void profileCountIsBounded() {
        assertEquals(4,LivePpvPlayback.PROFILE_COUNT);
    }
}
