package com.zerostreams.app;

import org.json.*;
import java.util.*;
import java.text.SimpleDateFormat;

/** ZeroPlay 2.2.5.9: a US subscription-provider carousel, not a generic movie feed. */
final class StreamingTopTen {
    private StreamingTopTen(){}
    static String brand(String source){
        String name=source==null?"":source.toLowerCase(Locale.ROOT).trim().replaceAll("\\s+"," ");
        if(name.equals("netflix")||name.startsWith("netflix "))return "netflix";
        if(name.equals("hulu")||name.startsWith("hulu "))return "hulu";
        if(name.equals("disney+")||name.equals("disney plus"))return "disney";
        if(name.equals("max")||name.equals("hbo max"))return "max";
        // Apple TV Store rental listings are not Apple TV+ subscriptions.
        if(name.equals("apple tv+")||name.equals("apple tv plus"))return "apple";
        if(name.equals("paramount+")||name.equals("paramount plus"))return "paramount";
        if(name.equals("peacock")||name.equals("peacock premium"))return "peacock";
        if(name.equals("youtube tv"))return "youtube-tv";
        return "";
    }
    static List<Integer> providerIds(JSONArray rows){
        String[] names={"netflix","hulu","disney","max","apple","paramount","peacock","youtube-tv"};
        Map<String,Integer> found=new HashMap<>();
        for(int i=0;rows!=null&&i<rows.length();i++){
            JSONObject row=rows.optJSONObject(i);if(row==null)continue;
            String name=brand(row.optString("provider_name"));int id=row.optInt("provider_id");
            if(name.isEmpty()||id<=0)continue;
            JSONObject countries=row.optJSONObject("display_priorities");
            if(countries!=null&&!countries.has("US"))continue;
            if(!found.containsKey(name))found.put(name,id);
        }
        List<Integer> ids=new ArrayList<>();for(String name:names)if(found.containsKey(name))ids.add(found.get(name));
        return ids;
    }
    static String date(long millis){
        SimpleDateFormat date=new SimpleDateFormat("yyyy-MM-dd",Locale.ROOT);
        date.setTimeZone(TimeZone.getTimeZone("UTC"));return date.format(new Date(millis));
    }
    static List<Catalog.Item> select(List<Catalog.Item> candidates,long seed,long now){
        String today=date(now),cutoff=date(now-420L*86400000L);
        Map<String,Catalog.Item> unique=new LinkedHashMap<>();
        for(Catalog.Item item:candidates){
            if(item==null||!item.type.equals("movie")||item.raw.optString("backdrop").isEmpty())continue;
            String released=item.raw.optString("releaseDate");
            if(released.isEmpty()||released.compareTo(today)>0||released.compareTo(cutoff)<0)continue;
            if(item.raw.optInt("voteCount",0)<10||item.raw.optDouble("popularity",0)<2)continue;
            unique.put(item.id,item);
        }
        List<Catalog.Item> result=new ArrayList<>(unique.values());
        result.sort((a,b)->Double.compare(score(b,seed,cutoff),score(a,seed,cutoff)));
        if(result.size()>10)return new ArrayList<>(result.subList(0,10));
        return result;
    }
    private static double score(Catalog.Item x,long seed,String cutoff){
        double days=Math.max(0,(x.raw.optString("releaseDate").compareTo(cutoff)));// replaced by parsed date below
        try{
            SimpleDateFormat f=new SimpleDateFormat("yyyy-MM-dd",Locale.ROOT);f.setTimeZone(TimeZone.getTimeZone("UTC"));
            days=Math.max(0,(f.parse(x.raw.optString("releaseDate")).getTime()-f.parse(cutoff).getTime())/86400000.0);
        }catch(Exception ignored){days=0;}
        double freshness=Math.min(1,days/420);
        double popularity=Math.min(1,Math.log1p(Math.max(0,x.raw.optDouble("popularity")))/7);
        double confidence=Math.min(1,Math.log1p(Math.max(0,x.raw.optInt("voteCount")))/7);
        long noise=Integer.toUnsignedLong((x.id+":"+seed).hashCode());
        return freshness*.30+popularity*.28+confidence*.12+(noise/4294967295.0)*.30;
    }
    static List<Catalog.Item> load(String key,long time) throws Exception {
        JSONObject catalog=ContentApi.tmdb("/watch/providers/movie",key,"&watch_region=US");
        List<Integer> services=providerIds(catalog.optJSONArray("results"));
        if(services.isEmpty())return new ArrayList<>();
        List<String> ids=new ArrayList<>();for(int id:services)ids.add(String.valueOf(id));
        String providers=java.net.URLEncoder.encode(String.join("|",ids),"UTF-8");
        String today=date(time),cutoff=date(time-420L*86400000L);
        String filters="&include_adult=false&watch_region=US&with_watch_providers="+providers
            +"&with_watch_monetization_types=flatrate&primary_release_date.gte="+cutoff
            +"&primary_release_date.lte="+today+"&sort_by=primary_release_date.desc&vote_count.gte=10&page=";
        int[] pages={1,2,3+Math.floorMod((int)(time/21600000L),3)};
        List<Catalog.Item> movies=new ArrayList<>();Exception error=null;
        for(int page:pages)try {
            JSONArray rows=ContentApi.tmdb("/discover/movie",key,filters+page).optJSONArray("results");
            if(rows!=null)movies.addAll(ContentApi.tmdbRows(rows,"movie",false));
        }catch(Exception failure){error=failure;}
        if(movies.isEmpty()&&error!=null)throw error;
        return select(movies,time/21600000L,time);
    }
}
