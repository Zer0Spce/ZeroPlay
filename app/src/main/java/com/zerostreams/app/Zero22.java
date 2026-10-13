package com.zerostreams.app;

import android.content.SharedPreferences;
import org.json.*;
import java.util.*;

/** ZeroPlay 2.2 additive helpers. Keeps 2.1.2 storage keys as the live compatibility layer. */
final class Zero22 {
    private Zero22(){}

    static boolean notInterested(SharedPreferences prefs,String id){return prefs.getStringSet("notInterested",Collections.emptySet()).contains(id);}
    static void setNotInterested(SharedPreferences prefs,String id,boolean hidden){Set<String> ids=new HashSet<>(prefs.getStringSet("notInterested",Collections.emptySet()));if(hidden)ids.add(id);else ids.remove(id);prefs.edit().putStringSet("notInterested",ids).apply();}
    static List<Catalog.Item> visible(SharedPreferences prefs,List<Catalog.Item> items){List<Catalog.Item> out=new ArrayList<>();for(Catalog.Item item:items)if(!notInterested(prefs,item.id))out.add(item);return out;}

    static List<Catalog.Item> hiddenGems(SharedPreferences prefs,List<Catalog.Item> items){
        List<Catalog.Item> out=new ArrayList<>();for(Catalog.Item item:items){if(notInterested(prefs,item.id))continue;double rating=item.raw.optDouble("rating",0),pop=item.raw.optDouble("popularity",0);int votes=item.raw.optInt("voteCount",0);if(rating>=7.2&&votes>=80&&pop<350)out.add(item);}out.sort((a,b)->Double.compare(b.raw.optDouble("rating"),a.raw.optDouble("rating")));return trim(out,18);
    }
    static List<Catalog.Item> tonight(SharedPreferences prefs,List<Catalog.Item> items){
        List<Catalog.Item> out=new ArrayList<>();for(Catalog.Item item:items){if(notInterested(prefs,item.id)||!item.type.equals("movie"))continue;int percent=prefs.getInt("percent:"+item.id,0);if(percent>=95)continue;double rating=item.raw.optDouble("rating",0);if(rating>=7.0)out.add(item);}out.sort((a,b)->Double.compare(b.raw.optDouble("rating"),a.raw.optDouble("rating")));return trim(out,18);
    }
    static List<Catalog.Item> becauseYouWatched(SharedPreferences prefs,List<Catalog.Item> items){
        JSONArray history;try{history=new JSONArray(prefs.getString("watchHistory","[]"));}catch(Exception e){return new ArrayList<>();}
        Set<Integer> genres=new LinkedHashSet<>();String seed="";
        for(int i=0;i<history.length()&&genres.size()<4;i++){JSONObject row=history.optJSONObject(i),raw=row==null?null:row.optJSONObject("item");if(raw==null)continue;if(seed.isEmpty())seed=raw.optString("title");JSONArray ids=raw.optJSONArray("genreIds");if(ids!=null)for(int g=0;g<ids.length()&&genres.size()<4;g++)genres.add(ids.optInt(g));}
        if(genres.isEmpty())return new ArrayList<>();List<Catalog.Item> out=new ArrayList<>();
        for(Catalog.Item item:items){if(notInterested(prefs,item.id)||prefs.getInt("percent:"+item.id,0)>=95)continue;JSONArray ids=item.raw.optJSONArray("genreIds");boolean hit=false;if(ids!=null)for(int i=0;i<ids.length();i++)if(genres.contains(ids.optInt(i))){hit=true;break;}if(hit)out.add(item);}
        out.sort((a,b)->Double.compare(score(b),score(a)));for(Catalog.Item item:out)item.raw.remove("becauseSeed");if(!seed.isEmpty())for(Catalog.Item item:trim(out,18))try{item.raw.put("becauseSeed",seed);}catch(Exception ignored){}return trim(out,18);
    }
    static List<Catalog.Item> upNext(SharedPreferences prefs,List<Catalog.Item> items){
        List<Catalog.Item> out=new ArrayList<>();for(Catalog.Item item:items){if(!item.type.equals("series")||notInterested(prefs,item.id))continue;int season=prefs.getInt("resumeSeason:"+item.id,0),episode=prefs.getInt("resumeEpisode:"+item.id,0),percent=prefs.getInt("percent:"+item.id,0);if(season<0||episode<1)continue;Catalog.Item copy=copy(item);if(copy==null)continue;try{copy.raw.put("upNextSeason",season).put("upNextEpisode",percent>=95?episode+1:episode).put("upNextResume",percent>0&&percent<95);}catch(Exception ignored){}out.add(copy);}out.sort((a,b)->Long.compare(prefs.getLong("watchedAt:"+b.id,0),prefs.getLong("watchedAt:"+a.id,0)));return trim(out,18);
    }
    static String becauseLabel(List<Catalog.Item> rows){if(rows.isEmpty())return "Because you watched";String seed=rows.get(0).raw.optString("becauseSeed");return seed.isEmpty()?"Because you watched":"Because you watched "+seed;}
    private static double score(Catalog.Item item){return item.raw.optDouble("rating",0)*12+Math.log1p(Math.max(0,item.raw.optDouble("popularity",0)))*4;}
    private static Catalog.Item copy(Catalog.Item item){try{return new Catalog.Item(new JSONObject(item.raw.toString()));}catch(Exception e){return null;}}
    private static List<Catalog.Item> trim(List<Catalog.Item> rows,int max){return rows.size()<=max?rows:new ArrayList<>(rows.subList(0,max));}

    static List<String> homeOrder(SharedPreferences prefs){
        String raw=prefs.getString("homePanelOrder","");List<String> out=new ArrayList<>();if(!raw.isEmpty())for(String id:raw.split(","))if(Arrays.asList(HomePanels.IDS).contains(id)&&!out.contains(id))out.add(id);for(String id:HomePanels.IDS)if(!out.contains(id))out.add(id);return out;
    }
    static void moveHomePanel(SharedPreferences prefs,String id,int delta){List<String> order=homeOrder(prefs);int at=order.indexOf(id),to=Math.max(0,Math.min(order.size()-1,at+delta));if(at<0||at==to)return;order.remove(at);order.add(to,id);prefs.edit().putString("homePanelOrder",android.text.TextUtils.join(",",order)).apply();}

    static String activeProfile(SharedPreferences prefs){String value=prefs.getString("activeProfile","Default").trim();return value.isEmpty()?"Default":value;}
    static Set<String> profiles(SharedPreferences prefs){Set<String> names=new TreeSet<>(prefs.getStringSet("profiles",Collections.singleton("Default")));names.add("Default");return names;}
    static boolean validProfile(String name){return name!=null&&name.trim().matches("[A-Za-z0-9 _-]{1,24}");}
    static void addProfile(SharedPreferences prefs,String name){name=name.trim();if(!validProfile(name))return;Set<String> names=new HashSet<>(profiles(prefs));names.add(name);prefs.edit().putStringSet("profiles",names).apply();}
    static void removeProfile(SharedPreferences prefs,String name){if(name.equals("Default")||name.equals(activeProfile(prefs)))return;Set<String> names=new HashSet<>(profiles(prefs));names.remove(name);prefs.edit().putStringSet("profiles",names).remove("profileData:"+name).apply();}
    static void switchProfile(SharedPreferences prefs,String target){
        target=target.trim();if(!profiles(prefs).contains(target))return;String current=activeProfile(prefs);if(current.equals(target))return;savePersonalSnapshot(prefs,current);clearPersonal(prefs);restorePersonalSnapshot(prefs,target);prefs.edit().putString("activeProfile",target).apply();
    }
    private static boolean personalKey(String key){return key.equals("favorites")||key.equals("planned")||key.equals("collections")||key.equals("watchHistory")||key.equals("searchHistory")||key.equals("notInterested")||key.startsWith("collection:")||key.startsWith("saved:")||key.startsWith("position:")||key.startsWith("duration:")||key.startsWith("percent:")||key.startsWith("watchedAt:")||key.startsWith("resumeSeason:")||key.startsWith("resumeEpisode:")||key.startsWith("playbackSourceFor:");}
    private static void savePersonalSnapshot(SharedPreferences prefs,String profile){
        JSONObject data=new JSONObject();for(Map.Entry<String,?> entry:prefs.getAll().entrySet()){String key=entry.getKey();if(!personalKey(key))continue;Object value=entry.getValue();try{JSONObject row=new JSONObject();if(value instanceof String)row.put("t","s").put("v",value);else if(value instanceof Integer)row.put("t","i").put("v",value);else if(value instanceof Long)row.put("t","l").put("v",value);else if(value instanceof Float)row.put("t","f").put("v",value);else if(value instanceof Boolean)row.put("t","b").put("v",value);else if(value instanceof Set){JSONArray values=new JSONArray();for(Object item:(Set<?>)value)values.put(String.valueOf(item));row.put("t","set").put("v",values);}else continue;data.put(key,row);}catch(Exception ignored){}}
        prefs.edit().putString("profileData:"+profile,data.toString()).apply();
    }
    private static void clearPersonal(SharedPreferences prefs){SharedPreferences.Editor edit=prefs.edit();for(String key:prefs.getAll().keySet())if(personalKey(key))edit.remove(key);edit.commit();}
    private static void restorePersonalSnapshot(SharedPreferences prefs,String profile){
        String raw=prefs.getString("profileData:"+profile,"{}");try{JSONObject data=new JSONObject(raw);SharedPreferences.Editor edit=prefs.edit();Iterator<String> keys=data.keys();while(keys.hasNext()){String key=keys.next();JSONObject row=data.optJSONObject(key);if(row==null)continue;String type=row.optString("t");switch(type){case "s":edit.putString(key,row.optString("v"));break;case "i":edit.putInt(key,row.optInt("v"));break;case "l":edit.putLong(key,row.optLong("v"));break;case "f":edit.putFloat(key,(float)row.optDouble("v"));break;case "b":edit.putBoolean(key,row.optBoolean("v"));break;case "set":JSONArray values=row.optJSONArray("v");Set<String> set=new HashSet<>();if(values!=null)for(int i=0;i<values.length();i++)set.add(values.optString(i));edit.putStringSet(key,set);break;}}edit.commit();}catch(Exception ignored){}
    }
}
