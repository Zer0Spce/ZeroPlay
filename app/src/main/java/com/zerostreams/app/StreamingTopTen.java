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
        List<Catalog.Item> scored=new ArrayList<>(unique.values());
        scored.sort((a,b)->Double.compare(score(b,seed,cutoff),score(a,seed,cutoff)));
        LinkedHashMap<String,Catalog.Item> balanced=new LinkedHashMap<>();
        String[] names={"netflix","hulu","disney","max","apple","paramount","peacock","youtube-tv"};
        int offset=Math.floorMod((int)seed,names.length);
        for(int i=0;i<names.length;i++){
            String provider=names[(i+offset)%names.length];
            for(Catalog.Item movie:scored)
                if(provider.equals(movie.raw.optString("providerBrand"))&&!balanced.containsKey(movie.id)){
                    balanced.put(movie.id,movie);break;
                }
        }
        for(Catalog.Item movie:scored){
            if(balanced.size()>=10)break;
            balanced.putIfAbsent(movie.id,movie);
        }
        return new ArrayList<>(balanced.values());
    }
    private static double score(Catalog.Item x,long seed,String cutoff){
        double days=0;
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
    static List<Catalog.Item> withProvider(List<Catalog.Item> movies,String provider,String logoPath){
        String logo=logoPath.matches("/[A-Za-z0-9_.-]+")?
            "https://image.tmdb.org/t/p/w92"+logoPath:"";
        for(Catalog.Item item:movies)try{
            item.raw.put("providerBrand",provider);
            if(!logo.isEmpty())item.raw.put("providerLogo",logo);
        }catch(JSONException ignored){}
        return movies;
    }
    static List<Catalog.Item> load(String key,long time) throws Exception {return load(key,time,0);}
    static List<Catalog.Item> load(String key,long time,int variation) throws Exception {
        JSONObject catalog=ContentApi.tmdb("/watch/providers/movie",key,"&watch_region=US");
        JSONArray providers=catalog.optJSONArray("results");
        String[] serviceNames={"netflix","hulu","disney","max","apple","paramount","peacock","youtube-tv"};
        Map<String,Integer> serviceIds=new LinkedHashMap<>();
        Map<String,String> serviceLogos=new HashMap<>();
        for(int n=0;n<(providers==null?0:providers.length());n++){
            JSONObject row=providers.optJSONObject(n);if(row==null)continue;
            String name=brand(row.optString("provider_name"));int id=row.optInt("provider_id");
            if(name.isEmpty()||id<=0||serviceIds.containsKey(name))continue;
            JSONObject country=row.optJSONObject("display_priorities");
            if(country!=null&&!country.has("US"))continue;
            serviceIds.put(name,id);
            serviceLogos.put(name,row.optString("logo_path",""));
        }
        if(serviceIds.isEmpty())return new ArrayList<>();
        String today=date(time),cutoff=date(time-420L*86400000L);
        String filters="&include_adult=false&watch_region=US"+
            "&with_watch_monetization_types=flatrate&primary_release_date.gte="+cutoff+
            "&primary_release_date.lte="+today+"&sort_by=primary_release_date.desc&vote_count.gte=10";
        List<Catalog.Item> movies=new ArrayList<>();Exception error=null;
        for(String name:serviceNames){
            Integer provider=serviceIds.get(name);if(provider==null)continue;
            int page=1+Math.floorMod((int)(time/21600000L+provider+variation),2);
            try{
                JSONArray rows=ContentApi.tmdb("/discover/movie",key,filters+"&with_watch_providers="+provider+"&page="+page)
                    .optJSONArray("results");
                if(rows!=null)movies.addAll(withProvider(ContentApi.tmdbRows(rows,"movie",false),name,serviceLogos.getOrDefault(name,"")));
            }catch(Exception failed){error=failed;}
        }
        if(movies.isEmpty()&&error!=null)throw error;
        return select(movies,time/21600000L+variation,time);
    }
}
