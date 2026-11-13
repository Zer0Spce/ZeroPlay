package com.zerostreams.app;
import org.junit.Test;
import org.json.*;
import static org.junit.Assert.*;
public class SportsGuide2260Test {
 @Test public void phtMidnightCrossesAt1600Utc() throws Exception{
  long now=java.time.Instant.parse("2026-11-13T15:30:00Z").getEpochSecond();
  JSONObject fri=new JSONObject().put("starts_at",now+1200);
  JSONObject sat=new JSONObject().put("starts_at",now+2400);
  assertTrue(SportsGuide2260.eligible(fri,"today",now));
  assertFalse(SportsGuide2260.eligible(sat,"today",now));
  assertTrue(SportsGuide2260.eligible(sat,"tomorrow",now));
  assertTrue(SportsGuide2260.time(sat.optLong("starts_at")).endsWith("PHT"));
 }
 @Test public void unknownEventsAndExpiredStatusesNeverGuess() throws Exception {
  long now=1000000L;
  assertEquals("Schedule unavailable",SportsGuide2260.countdown(new JSONObject(),now));
  assertEquals("LIVE · 24/7",SportsGuide2260.countdown(new JSONObject().put("always_live",1),now));
  assertEquals("Ended",SportsGuide2260.countdown(new JSONObject().put("starts_at",now-200).put("ends_at",now-100),now));
  assertFalse(SportsGuide2260.eligible(new JSONObject(),"today",now));
  assertTrue(SportsGuide2260.eligible(new JSONObject(),"all",now));
 }
}
