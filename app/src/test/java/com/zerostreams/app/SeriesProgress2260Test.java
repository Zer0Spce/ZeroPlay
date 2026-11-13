package com.zerostreams.app;
import org.junit.Test;
import org.json.*;
import java.util.*;
import static org.junit.Assert.*;
public class SeriesProgress2260Test {
 @Test public void resumesInterruptedEpisodeBeforeNewOne() throws Exception{
  JSONArray episodes=new JSONArray().put(new JSONObject().put("episode",1)).put(new JSONObject().put("episode",2)).put(new JSONObject().put("episode",3));
  Map<Integer,Integer> progress=new HashMap<>();progress.put(1,100);progress.put(2,45);
  SeriesProgress2260.Summary r=SeriesProgress2260.analyze(episodes,progress);
  assertEquals(3,r.total);assertEquals(1,r.watched);assertEquals(2,r.nextEpisode);assertTrue(r.resume);
 }
 @Test public void allWatchedNeverInventsNextEpisode() throws Exception{
  JSONArray eps=new JSONArray().put(new JSONObject().put("episode",1)).put(new JSONObject().put("episode",2));
  Map<Integer,Integer> saved=new HashMap<>();saved.put(1,100);saved.put(2,100);
  SeriesProgress2260.Summary r=SeriesProgress2260.analyze(eps,saved);
  assertEquals(2,r.watched);assertEquals(100,r.percent);assertEquals(0,r.nextEpisode);
 }
}
