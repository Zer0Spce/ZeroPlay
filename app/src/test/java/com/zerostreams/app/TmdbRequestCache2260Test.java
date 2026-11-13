package com.zerostreams.app;
import org.junit.Test;
import org.json.*;
import java.util.concurrent.atomic.*;
import static org.junit.Assert.*;
public class TmdbRequestCache2260Test {
 @Test public void reusesCachedJsonWithoutSharingMutations() throws Exception{
  TmdbRequestCache2260.clear();AtomicInteger calls=new AtomicInteger();
  JSONObject first=TmdbRequestCache2260.load("one-2260",()->{calls.incrementAndGet();return new JSONObject().put("title","A");});
  first.put("title","Changed");
  JSONObject again=TmdbRequestCache2260.load("one-2260",()->{calls.incrementAndGet();return new JSONObject().put("title","B");});
  assertEquals(1,calls.get());assertEquals("A",again.optString("title"));
 }
 @Test public void failedRequestsRemainRetryable() throws Exception{
  TmdbRequestCache2260.clear();AtomicInteger calls=new AtomicInteger();
  try{TmdbRequestCache2260.load("failed-2260",()->{calls.incrementAndGet();throw new Exception("offline");});fail();}
  catch(Exception e){assertTrue(e.getMessage().contains("offline"));}
  JSONObject good=TmdbRequestCache2260.load("failed-2260",()->{calls.incrementAndGet();return new JSONObject().put("ok",true);});
  assertEquals(2,calls.get());assertTrue(good.optBoolean("ok"));
 }
}
