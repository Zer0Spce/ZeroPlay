package com.zerostreams.app;

import android.content.SharedPreferences;
import java.util.*;
import org.json.*;

/** Discovery 2.0, Android Mobile/TV/Lite.
 * Only the homepage: does not touch playback, stream sources or user watchlist.
 */
final class SmartHomeRecommendations {
    static final long SIX_HOURS=21600000L,DAY=86400000L;
    static final int EXPOSE_DAYS=30;
    private SmartHomeRecommendations(){}

    static final class Session {
        final String profile, seed;
        final long now;
        final JSONObject seen;
        final Map<Integer,Double> genres;
        final LinkedHashSet<String> used=new LinkedHashSet<>();
        Session(String profile,String seed,long now,JSONObject seen,Map<Integer,Double> genres) {
            this.profile=profile;this.seed=seed;this.now=now;this.seen=seen;this.genres=genres;
        }
        void reserve(Collection<Catalog.Item> items) {
            if(items!=null)for(Catalog.Item x:items)if(x!=null)used.add(x.id);
        }
        void reserveIds(Collection<String> ids) {if(ids!=null)used.addAll(ids);}
        private double quality(Catalog.Item item) {
            double votes=Math.max(0,item.raw.optDouble("voteCount",0));
            double rating=Math.max(0,Math.min(10,item.raw.optDouble("rating",0)));
            return (votes*rating+450*6.4)/(votes+450);
        }
        private int mainGenre(Catalog.Item x) {
            JSONArray list=x.raw.optJSONArray("genreIds");
            return list==null?0:list.optInt(0);
        }
        private boolean released(Catalog.Item x) {
            String date=x.raw.optString("releaseDate","");
            return date.isEmpty()||date.compareTo(new java.text.SimpleDateFormat("yyyy-MM-dd",Locale.ROOT).format(new Date(now)))<=0;
        }
        private boolean strong(Catalog.Item x) {
            if(!released(x)||!recentHollywood(x)||x.raw.optString("backdrop","").isEmpty())return false;
            double votes=x.raw.optDouble("voteCount",0);
            return votes>=(x.type.equals("movie")?250:150)&&quality(x)>=6.6&&x.raw.optDouble("popularity",0)>=8;
        }
        private boolean recentHollywood(Catalog.Item x){
            if(!x.type.equals("movie"))return true;
            if(!"en".equals(x.raw.optString("originalLanguage","en")))return false;
            JSONArray origins=x.raw.optJSONArray("originCountry");
            if(origins!=null&&origins.length()>0){
                boolean american=false;
                for(int i=0;i<origins.length();i++)if("US".equals(origins.optString(i)))american=true;
                if(!american)return false;
            }
            String date=x.raw.optString("releaseDate","");
            Calendar oldest=Calendar.getInstance(TimeZone.getTimeZone("UTC"),Locale.ROOT);
            oldest.add(Calendar.YEAR,-3);
            String cutoff=new java.text.SimpleDateFormat("yyyy-MM-dd",Locale.ROOT).format(oldest.getTime());
            return !date.isEmpty()&&date.compareTo(cutoff)>=0;
        }
        private double score(Catalog.Item x,String shelf) {
            long h=2166136261L;String s=seed+":"+shelf+":"+x.id;
            for(int i=0;i<s.length();i++){h^=s.charAt(i);h=(h*16777619L)&0xffffffffL;}
            double matches=0;JSONArray ids=x.raw.optJSONArray("genreIds");
            if(ids!=null)for(int i=0;i<ids.length();i++)matches+=genres.containsKey(ids.optInt(i))?genres.get(ids.optInt(i)):0;
            double votes=Math.max(0,x.raw.optDouble("voteCount",0));
            double popularity=Math.max(0,x.raw.optDouble("popularity",0));
            return h/4294967295.0*.65 + quality(x)*.115 + Math.min(1,Math.log1p(votes)/9)*.13
                +Math.min(1,popularity/150)*.08+Math.min(3,matches)*.065;
        }
        private List<Catalog.Item> pool(String shelf,Collection<Catalog.Item> candidates,boolean isHero,boolean allowUnrated) {
            LinkedHashMap<String,Catalog.Item> distinct=new LinkedHashMap<>();
            if(candidates!=null)for(Catalog.Item item:candidates) {
                if(item==null||item.id==null||item.id.isEmpty()||
                   item.poster.isEmpty()||used.contains(item.id))continue;
                if(item.type.equals("live")||item.type.equals("manga"))continue;
                if(!shelf.equals("upcoming")&&!released(item))continue;
                if(item.type.equals("movie")){
                    if(!"en".equals(item.raw.optString("originalLanguage","en")))continue;
                    JSONArray origin=item.raw.optJSONArray("originCountry");
                    boolean hasOrigins=origin!=null&&origin.length()>0,american=false;
                    if(origin!=null)for(int i=0;i<origin.length();i++)if("US".equals(origin.optString(i)))american=true;
                    if(hasOrigins&&!american)continue;
                    if(shelf.equals("classics")){
                        int year=Calendar.getInstance().get(Calendar.YEAR);
                        if(item.year<year-12||item.year>year-5)continue;
                    }else if(!shelf.equals("upcoming")&&!recentHollywood(item))continue;
                }
                if(shelf.equals("vod")&&!item.raw.optBoolean("digitalVOD",false))continue;
                if(isHero&&!strong(item))continue;
                if(!isHero&&!allowUnrated&&!shelf.equals("upcoming")&&
                   !(shelf.equals("vod")&&item.raw.optDouble("voteCount",0)>=10)&&
                   (item.raw.optDouble("voteCount",0)<70||quality(item)<6.25))continue;
                distinct.put(item.id,item);
            }
            List<Catalog.Item> ranked=new ArrayList<>(distinct.values());
            ranked.sort((a,b)->Double.compare(score(b,shelf),score(a,shelf)));
            return ranked;
        }
        private List<Catalog.Item> select(String shelf,List<Catalog.Item> ranked,int max) {
            List<Catalog.Item> candidates=new ArrayList<>(),fresh=new ArrayList<>(),old=new ArrayList<>();
            long cutoff=now-EXPOSE_DAYS*DAY;
            for(Catalog.Item x:ranked) {
                if(seen.optLong(x.id,0)>=cutoff)old.add(x);else fresh.add(x);
            }
            Map<Integer,Integer> counts=new HashMap<>();
            for(int pass=0;pass<4&&candidates.size()<max;pass++) {
                List<Catalog.Item> source=pass<2?fresh:old;boolean genreCap=pass%2==0;
                for(Catalog.Item x:source) {
                    if(candidates.size()>=max)break;
                    if(candidates.contains(x))continue;
                    int g=mainGenre(x);
                    if(genreCap&&g>0&&counts.getOrDefault(g,0)>=Math.max(2,(int)Math.ceil(max/3.0)))continue;
                    candidates.add(x);counts.put(g,counts.getOrDefault(g,0)+1);
                }
            }
            reserve(candidates);return candidates;
        }
        List<Catalog.Item> claim(String shelf,Collection<Catalog.Item> candidates,int max) {
            List<Catalog.Item> ranked=pool(shelf,candidates,false,false);
            return select(shelf,ranked,max);
        }
        List<Catalog.Item> featured(Collection<Catalog.Item> candidates,int max) {
            List<Catalog.Item> ranked=pool("featured",candidates,true,false);
            if(ranked.isEmpty())ranked=pool("featured-fallback",candidates,false,false);
            return select("featured",ranked,max);
        }
        void commit(SharedPreferences prefs) {
            String prefix="zeroSmartHome:"+profile+":";
            JSONObject saved=new JSONObject();long cutoff=now-45*DAY;
            Iterator<String> it=seen.keys();
            while(it.hasNext()){
                String key=it.next();long time=seen.optLong(key,0);
                if(key.matches("tmdb-(movie|series)-[0-9]+")&&time>cutoff&&time<=now+DAY)
                    try{saved.put(key,time);}catch(JSONException ignored){}
            }
            JSONArray current=new JSONArray();
            for(String key:used) {
                if(!key.matches("tmdb-(movie|series)-[0-9]+"))continue;
                try{saved.put(key,now);}catch(JSONException ignored){}
                current.put(key);
            }
            prefs.edit().putString(prefix+"seen",saved.toString())
                .putString(prefix+"lastCycle",seed)
                .putString(prefix+"lastIds",current.toString()).apply();
        }
    }

    private static Map<Integer,Double> genreWeights(SharedPreferences prefs) {
        Map<Integer,Double> weights=new HashMap<>();
        try {
            JSONArray rows=new JSONArray(prefs.getString("watchHistory","[]"));
            for(int i=0;i<Math.min(25,rows.length());i++){
                JSONObject row=rows.optJSONObject(i),item=row==null?null:row.optJSONObject("item");
                JSONArray genres=item==null?null:item.optJSONArray("genreIds");
                if(genres==null)continue;
                for(int g=0;g<genres.length();g++) {
                    int id=genres.optInt(g);if(id>0)weights.put(id,weights.getOrDefault(id,0.0)+Math.max(.15,1-i/35.0));
                }
            }
        }catch(Exception ignored){}
        return weights;
    }
    static Session begin(SharedPreferences prefs,long now) {
        String profile=Zero22.activeProfile(prefs).replaceAll("[^A-Za-z0-9_-]","_");
        String prefix="zeroSmartHome:"+profile+":";
        long base=now/SIX_HOURS,oldBase=prefs.getLong(prefix+"base",-1);
        int bump=oldBase==base?prefs.getInt(prefix+"bump",0):0;
        if(oldBase!=base)prefs.edit().putLong(prefix+"base",base).putInt(prefix+"bump",0).apply();
        String seed=base+":"+bump+":"+profile;
        JSONObject seen;
        try{seen=new JSONObject(prefs.getString(prefix+"seen","{}"));}catch(Exception e){seen=new JSONObject();}
        if(seed.equals(prefs.getString(prefix+"lastCycle",""))) {
            try {
                JSONArray values=new JSONArray(prefs.getString(prefix+"lastIds","[]"));
                for(int i=0;i<values.length();i++)seen.remove(values.optString(i));
            }catch(Exception ignored){}
        }
        return new Session(profile,seed,now,seen,genreWeights(prefs));
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
    static List<String> panelOrder(SharedPreferences prefs,List<String> panels,String seed) {
        List<String> order=new ArrayList<>(panels);
        if(prefs.getString("homePanelOrder","").isEmpty()){
            List<String> pinned=Arrays.asList("featured","continue","upnext","watchlist","top10");
            List<String> rotating=Arrays.asList("because","tonight","hidden","recommended","thrillers",
                "recent","different","classics","trending","popular","series","now","airing");
            order.clear();
            for(String id:pinned)if(panels.contains(id))order.add(id);
            List<String> dynamic=new ArrayList<>();
            for(String id:rotating)if(panels.contains(id))dynamic.add(id);
            dynamic.sort((a,b)->Integer.compare((seed+":"+a).hashCode(),(seed+":"+b).hashCode()));
            order.addAll(dynamic);
            for(String id:panels)if(!order.contains(id))order.add(id);
        }
        if(order.remove("providers")){
            int anchor=order.indexOf("top10");
            if(anchor<0)anchor=order.indexOf("featured");
            order.add(anchor<0?0:anchor+1,"providers");
        }
        return order;
    }
}
