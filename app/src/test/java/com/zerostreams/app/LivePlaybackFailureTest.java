package com.zerostreams.app;

import org.junit.Test;
import static org.junit.Assert.*;
import java.io.IOException;
import java.net.ConnectException;
import java.net.SocketTimeoutException;
import java.net.UnknownHostException;
import javax.net.ssl.SSLException;

public class LivePlaybackFailureTest {
    @Test public void reportsDnsFailureInNestedCause() {
        Throwable nested=new IOException("network",new UnknownHostException("private-stream-host"));
        assertEquals("DNS lookup failed",LivePlaybackFailure.describe("ERROR_CODE_IO_NETWORK_CONNECTION_FAILED",nested));
    }
    @Test public void reportsTimeoutWithoutSensitiveDetails() {
        Throwable nested=new IOException("https://stream.example/live.m3u8?token=secret",new SocketTimeoutException());
        String message=LivePlaybackFailure.describe("ERROR_CODE_IO_NETWORK_CONNECTION_TIMEOUT",nested);
        assertEquals("Network timeout",message);
        assertFalse(message.contains("token"));
    }
    @Test public void reportsSecureConnectionError() {
        assertEquals("Secure connection failed",LivePlaybackFailure.describe("IO",new SSLException("handshake")));
    }
    @Test public void reportsConnectionRefused() {
        assertEquals("Connection refused",LivePlaybackFailure.describe("IO",new ConnectException()));
    }
    @Test public void reportsCodecAndParserErrors() {
        assertTrue(LivePlaybackFailure.describe("ERROR_CODE_DECODING_FAILED",null).contains("decoder"));
        assertTrue(LivePlaybackFailure.describe("ERROR_CODE_PARSING_MANIFEST_MALFORMED",null).contains("parsed"));
    }
    @Test public void retainsUnknownErrorCode() {
        assertEquals("ERROR_CODE_IO_UNSPECIFIED",LivePlaybackFailure.describe("ERROR_CODE_IO_UNSPECIFIED",new IOException("no details")));
    }
}
