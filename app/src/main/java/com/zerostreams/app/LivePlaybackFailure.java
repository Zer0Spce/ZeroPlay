package com.zerostreams.app;

import androidx.media3.datasource.HttpDataSource;
import java.net.ConnectException;
import java.net.SocketTimeoutException;
import java.net.UnknownHostException;
import javax.net.ssl.SSLException;

/** Safe, short playback diagnostics; never display signed URLs, headers, or tokens. */
@androidx.annotation.OptIn(markerClass=androidx.media3.common.util.UnstableApi.class)
final class LivePlaybackFailure {
    private LivePlaybackFailure() {}

    static String describe(String errorCodeName, Throwable failure) {
        int depth=0;
        for (Throwable cause=failure; cause!=null && depth++<12; cause=cause.getCause()) {
            if (cause instanceof HttpDataSource.InvalidResponseCodeException) {
                int code=((HttpDataSource.InvalidResponseCodeException)cause).responseCode;
                if (code==401 || code==403) return "HTTP "+code+" · server refused access";
                if (code==404 || code==410) return "HTTP "+code+" · stream URL unavailable";
                if (code==429) return "HTTP 429 · server rate limit";
                if (code>=500) return "HTTP "+code+" · server error";
                return "HTTP "+code+" · request failed";
            }
            if (cause instanceof UnknownHostException) return "DNS lookup failed";
            if (cause instanceof SocketTimeoutException) return "Network timeout";
            if (cause instanceof ConnectException) return "Connection refused";
            if (cause instanceof SSLException) return "Secure connection failed";
        }
        String code=errorCodeName==null?"":errorCodeName.trim();
        if (code.contains("DECODING") || code.contains("FORMAT_UNSUPPORTED"))
            return code+" · unsupported format or decoder";
        if (code.contains("PARSING")) return code+" · stream manifest could not be parsed";
        return code.isEmpty()?"Unknown playback failure":code;
    }
}
