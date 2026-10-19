package com.zerostreams.app;
import org.junit.Test;
import static org.junit.Assert.*;
public class PlaybackSourcesTest {
    @Test public void allSourcesUseTmdbMovieAndEpisodeIds(){
        for(String provider:PlaybackSources.IDS){if(provider.equals("rawcast"))continue;String movie=PlaybackSources.url("299534","movie",1,1,provider),tv=PlaybackSources.url("1399","tv",0,2,provider);assertTrue(PlaybackSources.trusted(movie));assertTrue(movie.contains("299534"));assertTrue(tv.contains("1399"));assertTrue(tv.contains("/tv/1399/0/2"));}
        assertTrue(PlaybackSources.url("299534","movie",1,1,"vidstuck").contains("vidstuck.cc/embed/movie/299534"));
        assertTrue(PlaybackSources.url("299534","movie",1,1,"embedwave").contains("embedwave.cc/embed/movie/299534"));
        String zxc=PlaybackSources.url("299534","movie",1,1,"zxcstream");
        assertTrue(zxc.contains("zxcstream.cc/player/movie/299534"));
        assertTrue(zxc.contains("autoplay=true"));
    }
    @Test public void androidOwnsAutomaticNextEpisodeSwitching(){
        String vidstuck=PlaybackSources.url("1399","tv",1,2,"vidstuck");
        assertTrue(vidstuck.contains("nextEpisode=true"));
        assertTrue(vidstuck.contains("episodeSelector=true"));
        assertFalse(vidstuck.contains("autoplayNextEpisode=true"));
        String vidsrc=PlaybackSources.url("1399","tv",1,2,"vidsrc-sh");
        assertFalse(vidsrc.contains("autonext=1"));
    }
    @Test public void originsAreExactAndUnknownSourcesFallBack(){assertFalse(PlaybackSources.trusted("https://vidsrc.sh.attacker.example/embed/movie/1"));assertFalse(PlaybackSources.trusted("http://vidsrc.sh/embed/movie/1"));assertFalse(PlaybackSources.trusted("https://vidsrc.sh:8443/embed/movie/1"));assertTrue(PlaybackSources.trusted("https://embedwave.cc/embed/movie/1"));assertTrue(PlaybackSources.trusted("https://zxcstream.cc/player/movie/1"));assertEquals(5,PlaybackSources.IDS.length);assertEquals(0,PlaybackSources.index("unknown"));}
    @Test(expected=IllegalArgumentException.class) public void rawcastRequiresSecureApi(){PlaybackSources.url("550","movie",1,1,"rawcast");}
    @Test(expected=IllegalArgumentException.class) public void rejectsMalformedIds(){PlaybackSources.url("../private","movie",1,1,"vidstuck");}
}
