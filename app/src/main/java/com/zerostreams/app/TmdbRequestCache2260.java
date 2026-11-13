package com.zerostreams.app;
import java.util.*;
import java.util.concurrent.*;
import org.json.*;
/** 2.2.6 TEST: memory bounded five-minute TMDB cache and per-key request deduplication. */
final class TmdbRequestCache2260 {
 private static final long TTL=300000L;
 private static final Map<String,Entry> CACHE=Collections.synchronizedMap(
  new LinkedHashMap<String,TmdbRequestCache2260.Entry>(128,.75f,true){
   protected boolean removeEldestEntry(Map.Entry<String,TmdbRequestCache2260.Entry> eldest){return size()>80;}
  });
 private static final ConcurrentHashMap<String,FutureTask<String>> PENDING=new ConcurrentHashMap<>();
 static final class Entry{final String json;final long expires;Entry(String s,long e){json=s;expires=e;}}
 static JSONObject load(String key,Callable<JSONObject> loader) throws Exception {
  Entry cached; synchronized(CACHE){cached=CACHE.get(key);}
  if(cached!=null&&System.currentTimeMillis()<cached.expires)return new JSONObject(cached.json);
  FutureTask<String> own=new FutureTask<>(()->loader.call().toString());
  FutureTask<String> previous=PENDING.putIfAbsent(key,own);
  FutureTask<String> job=previous==null?own:previous;
  if(previous==null)own.run();
  try{
   String json=job.get();
   if(previous==null)synchronized(CACHE){CACHE.put(key,new Entry(json,System.currentTimeMillis()+TTL));}
   return new JSONObject(json);
  }catch(ExecutionException e){
   Throwable cause=e.getCause();if(cause instanceof Exception)throw (Exception)cause;
   throw new RuntimeException(cause);
  }finally{if(previous==null)PENDING.remove(key,own);}
 }
 static void clear(){synchronized(CACHE){CACHE.clear();}}
 private TmdbRequestCache2260(){}
}
