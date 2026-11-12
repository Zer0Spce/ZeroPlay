package com.zerostreams.app;

import android.content.SharedPreferences;
import java.util.*;
import org.json.*;

/** v2.2.5.8 TEST: local-profile homepage rotation and within-page de-duplication.
 * No changes to media playback or source validation.
 */
final class SmartHomeRecommendations {
    static final long SIX_HOURS=21600000L;
    static final long DAY=86400000L;
    private SmartHomeRecommendations(){}

    static final class Session {
        final String profile, seed;
        final long now;
        final JSONObject seen;
        final LinkedHashSet<String> used=new LinkedHashSet<>();
        Session(String profile,String seed,long now,JSONObject seen) {
            this.profile=profile;this.seed=seed;this.now=now;this.seen=seen;
        }
        void reserve(Collection<Catalog.Item> items) {
            if(items==null)return;
            for(Catalog.Item item:items)if(item!=null)used.add(item.id);
        }
        void reserveIds(Collection<String> ids) {
            if(ids!=null)used.addAll(ids);
        }
        List<Catalog.Item> claim(String label,Collection<Catalog.Item> candidates,int max) {
            if(candidates==null||candidates.isEmpty())return Collections.emptyList();
            LinkedHashMap<String,Catalog.Item> distinct=new LinkedHashMap<>();
            for(Catalog.Item item:candidates) {
                if(item==null||item.id==null||item.poster.isEmpty()||used.contains(item.id))continue;
                if(item.type.equals("live")||item.type.equals("manga"))continue;
                if(!distinct.containsKey(item.id))distinct.put(item.id,item);
            }
            List<Catalog.Item> ranked=new ArrayList<>(distinct.values());
            ranked.sort((a,b)->Double.compare(score(b,label),score(a,label)));
            ArrayList<Catalog.Item> fresh=new ArrayList<>(),old=new ArrayList<>();
            long cutoff=now-14*DAY;
            for(Catalog.Item item:ranked) {
                if(seen.optLong(item.id,0)>=cutoff)old.add(item);else fresh.add(item);
            }
            ArrayList<Catalog.Item> result=new ArrayList<>();
            for(Catalog.Item item:fresh){result.add(item);if(result.size()>=max)break;}
            if(result.size()<max)for(Catalog.Item item:old){result.add(item);if(result.size()>=max)break;}
            reserve(result);return result;
        }
        private double score(Catalog.Item item,String shelf) {
            long h=2166136261L;
            String s=seed+":"+shelf+":"+item.id;
            for(int i=0;i<s.length();i++){h^=s.charAt(i);h=(h*16777619L)&0xffffffffL;}
            double r=item.raw.optDouble("rating",0);
            return (h/4294967295.0)+Math.min(.10,Math.max(0,r-6)*.015);
        }
        void commit(SharedPreferences prefs) {
            final String prefix="zeroSmartHome:"+profile+":";
            JSONObject saved=new JSONObject();long cutoff=now-30*DAY;
            Iterator<String> it=seen.keys();
            while(it.hasNext()){
                String k=it.next();long time=seen.optLong(k,0);
                if(k.matches("tmdb-(movie|series)-[0-9]+")&&time>cutoff&&time<=now+DAY)
                    try{saved.put(k,time);}catch(JSONException ignored){}
            }
            JSONArray current=new JSONArray();
            for(String k:used){
                if(!k.matches("tmdb-(movie|series)-[0-9]+"))continue;
                try{saved.put(k,now);}catch(JSONException ignored){}
                current.put(k);
            }
            prefs.edit().putString(prefix+"seen",saved.toString())
                .putString(prefix+"lastCycle",seed)
                .putString(prefix+"lastIds",current.toString()).apply();
        }
    }

    static Session begin(SharedPreferences prefs,long now) {
        String profile=Zero22.activeProfile(prefs).replaceAll("[^A-Za-z0-9_-]","_");
        final String prefix="zeroSmartHome:"+profile+":";
        long base=now/SIX_HOURS;
        long oldBase=prefs.getLong(prefix+"base",-1);
        int bump=oldBase==base?prefs.getInt(prefix+"bump",0):0;
        if(oldBase!=base)prefs.edit().putLong(prefix+"base",base).putInt(prefix+"bump",0).apply();
        String seed=base+":"+bump+":"+profile;
        JSONObject seen;
        try{seen=new JSONObject(prefs.getString(prefix+"seen","{}"));}catch(Exception e){seen=new JSONObject();}
        if(seed.equals(prefs.getString(prefix+"lastCycle",""))) {
            try{
                JSONArray saved=new JSONArray(prefs.getString(prefix+"lastIds","[]"));
                for(int i=0;i<saved.length();i++)seen.remove(saved.optString(i));
            }catch(Exception ignored){}
        }
        return new Session(profile,seed,now,seen);
    }
    static void refresh(SharedPreferences prefs,long now) {
        String profile=Zero22.activeProfile(prefs).replaceAll("[^A-Za-z0-9_-]","_");
        String prefix="zeroSmartHome:"+profile+":";
        long base=now/SIX_HOURS;
        int bump=prefs.getLong(prefix+"base",-1)==base?prefs.getInt(prefix+"bump",0):0;
        prefs.edit().putLong(prefix+"base",base).putInt(prefix+"bump",bump+1).apply();
    }
    static int rotatingPage(long now,int extra,int count) {
        return 1+Math.floorMod((int)(now/SIX_HOURS)+extra,count);
    }
}
