package com.zerostreams.app;
import org.junit.Test;
import java.util.*;
import static org.junit.Assert.*;
public class PlaybackHealth2260Test {
 @Test public void excludesOfflineAndQuotaSourcesFromAutomaticSourceSelection(){
  for(String bad:new String[]{"rawcast","vidsrc-sh","vidrock","someprovider"})
   assertFalse(PlaybackHealth.automatic(bad));
  assertTrue(PlaybackHealth.automatic("vidstuck"));
  assertEquals(7,PlaybackHealth.AUTOMATIC.size());
 }
 @Test public void repeatedFailureTriggersCooldownNotPermanentBlock(){
  long now=2000000;
  int blocked=PlaybackHealth.scoreEvidence(20,3,3,now-1000,800,now);
  int recovered=PlaybackHealth.scoreEvidence(20,3,3,now-PlaybackHealth.COOLDOWN-1000,800,now);
  assertTrue(recovered>blocked);
  assertTrue(PlaybackHealth.scoreEvidence(20,3,0,now-1000,800,now)>blocked);
 }
}
