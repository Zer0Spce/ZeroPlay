package com.zerostreams.app;
import java.util.*;
import org.json.*;
/** Per-season progress from saved positions; no invented episode completion. */
final class SeriesProgress2260 {
 static final class Summary{
  final int total,watched,nextEpisode,percent;final boolean resume;
  Summary(int total,int watched,int nextEpisode,boolean resume){
   this.total=total;this.watched=watched;this.nextEpisode=nextEpisode;
   this.percent=total==0?0:(int)Math.round(100.0*watched/total);this.resume=resume;
  }
 }
 static Summary analyze(JSONArray episodes,Map<Integer,Integer> saved){
  int total=0,watched=0,next=0,resume=0;
  for(int i=0;episodes!=null&&i<episodes.length();i++){
   JSONObject ep=episodes.optJSONObject(i);if(ep==null)continue;
   int id=ep.optInt("episode",ep.optInt("episode_number"));if(id<=0)continue;
   total++;
   int percent=Math.max(0,Math.min(100,saved.getOrDefault(id,0)));
   if(percent>=95)watched++;
   else if(percent>0&&resume==0)resume=id;
   else if(percent==0&&next==0)next=id;
  }
  return new Summary(total,watched,resume>0?resume:next,resume>0);
 }
}
