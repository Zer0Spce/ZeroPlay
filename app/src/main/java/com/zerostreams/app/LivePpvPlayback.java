package com.zerostreams.app;

import androidx.media3.common.PlaybackException;
import androidx.media3.datasource.HttpDataSource;
import java.net.ConnectException;
import java.net.SocketTimeoutException;
import java.net.URI;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import javax.net.ssl.SSLException;

/** Android Live PPV only: browser-compatible HTTP retry profiles and event-safe feed recovery. */
@androidx.annotation.OptIn(markerClass=androidx.media3.common.util.UnstableApi.class)
final class LivePpvPlayback {
    static final int PROFILE_COUNT = 4;
    private static final String CHROME_UA =
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

    private LivePpvPlayback() {}

    /**
     * Profile 0 preserves current native player behavior.
     * Profile 1 includes the publicly advertised source-page Origin.
     * Profile 2 mirrors an opaque-origin Chromium media request.
     * Profile 3 uses a desktop-compatible browser UA and the source-page Origin.
     * The same headers are used by Media3 on HLS manifests, variants, segments and keys.
     */
    static Map<String,String> headers(Map<String,String> playlist, int profile) {
        Map<String,String> result = new LinkedHashMap<>(playlist);
        if (profile <= 0) return result;
        if (profile == 2) {
            if (!result.containsKey("Origin")) result.put("Origin", "null");
            return result;
        }
        String origin = origin(playlist.get("Referer"));
        if (profile >= 3) {
            result.put("User-Agent", CHROME_UA);
            result.put("Accept", "*/*");
            result.put("Accept-Language", "en-US,en;q=0.9");
        }
        if (!result.containsKey("Origin") && !origin.isEmpty()) result.put("Origin", origin);
        return result;
    }

    static String origin(String referer) {
        if (referer == null) return "";
        try {
            URI uri = new URI(referer);
            String scheme = uri.getScheme();
            String host = uri.getHost();
            if (scheme == null || host == null ||
                (!scheme.equalsIgnoreCase("https") && !scheme.equalsIgnoreCase("http")) ||
                uri.getUserInfo() != null) return "";
            int port = uri.getPort();
            return scheme.toLowerCase(Locale.ROOT) + "://" + host +
                (port >= 0 ? ":" + port : "");
        } catch (Exception invalid) {
            return "";
        }
    }

    static boolean shouldTryBrowserHeaders(PlaybackException error) {
        if (error == null) return false;
        String name = error.getErrorCodeName();
        return name != null && name.contains("IO_");
    }

    static String failure(PlaybackException error) {
        if (error == null) return "Unknown playback error";
        int depth = 0;
        for (Throwable cause = error; cause != null && depth++ < 12; cause = cause.getCause()) {
            if (cause instanceof HttpDataSource.InvalidResponseCodeException) {
                int code = ((HttpDataSource.InvalidResponseCodeException)cause).responseCode;
                return "HTTP " + code;
            }
            if (cause instanceof UnknownHostException) return "DNS lookup failed";
            if (cause instanceof SocketTimeoutException) return "Network timeout";
            if (cause instanceof ConnectException) return "Connection refused";
            if (cause instanceof SSLException) return "TLS connection failed";
        }
        return error.getErrorCodeName();
    }

    static String eventKey(String name) {
        if (name == null) return "";
        return name.replaceFirst("(?i)\s+[—–-]\s+Feed\s+\d+(?:\s*·.*)?$", "")
                   .trim().toLowerCase(Locale.ROOT);
    }

    static int nextSameEvent(List<M3uPlaylist.Channel> channels, int selected, Set<String> attemptedUrls) {
        if (channels == null || selected < 0 || selected >= channels.size()) return -1;
        M3uPlaylist.Channel current = channels.get(selected);
        String event = eventKey(current.name);
        if (event.isEmpty()) return -1;
        for (int i = 0; i < channels.size(); i++) {
            M3uPlaylist.Channel candidate = channels.get(i);
            if (i == selected || attemptedUrls.contains(candidate.url)) continue;
            if (!current.group.equalsIgnoreCase(candidate.group)) continue;
            if (!event.equals(eventKey(candidate.name))) continue;
            if (current.url.equals(candidate.url)) continue;
            return i;
        }
        return -1;
    }
}
