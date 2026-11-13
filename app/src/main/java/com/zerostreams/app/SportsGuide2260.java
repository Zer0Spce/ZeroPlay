package com.zerostreams.app;
import org.json.*;
import java.text.*;
import java.util.*;
/** PHT-aware calendar and honest event states; no guessed source or schedule data. */
final class SportsGuide2260 {
 static final long DAY=86400L,OFFSET=8*3600L;
 static long calendarDay(long unix){return Math.floorDiv(unix+OFFSET,DAY);}
 static boolean eligible(JSONObject event,String window,long now){
  if("all".equals(window))return true;
  if(event.optInt("always_live")==1)return "today".equals(window);
  long start=event.optLong("starts_at",0);
  if(start<=0)return false;
  long delta=calendarDay(start)-calendarDay(now);
  if("today".equals(window))return delta==0;
  if("tomorrow".equals(window))return delta==1;
  if("week".equals(window))return delta>=0&&delta<7;
  return false;
 }
 static String time(long unix){
  if(unix<=0)return "Schedule unavailable";
  SimpleDateFormat fmt=new SimpleDateFormat("EEE, MMM d h:mm a",Locale.US);
  fmt.setTimeZone(TimeZone.getTimeZone("Asia/Manila"));
  return fmt.format(new Date(unix*1000L))+" PHT";
 }
 static String countdown(JSONObject event,long now){
  if(event.optInt("always_live")==1)return "LIVE · 24/7";
  long start=event.optLong("starts_at",0),end=event.optLong("ends_at",0);
  if(start<=0)return "Schedule unavailable";
  if(end>0&&now>=end)return "Ended";
  if(now>=start)return end>0?"LIVE":"Started";
  long left=Math.max(1,(start-now+59)/60);
  return left<60?"Starts in "+left+"m":"Starts in "+(left/60)+"h"+(left%60==0?"":" "+(left%60)+"m");
 }
 private SportsGuide2260(){}
}
