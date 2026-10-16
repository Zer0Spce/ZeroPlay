package com.zerostreams.app;

import android.content.*;
import android.util.Base64;
import org.json.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

final class Zero23Store {
    static final String VERSION="2.3-test";
    static final String[] FEATURES={
        "For You","Taste Profile","Adaptive Home","Contextual Because You Watched","Household Profiles","Continue Watching cleanup","Finish It","Series Hub","Episode notifications","Release Radar",
        "Follow people/directors/franchises","Franchise progress","Collection timelines","Watchlist organization","Watchlist Roulette","Watchlist Voting","Calendar","Newly Added catalog","Decades","Awards & acclaim",
        "Seasonal Home","Philippines Trends","Critics vs Audience lens","Advanced Search","Aliases & typo tolerance","Universal Search","TV voice search","Habit-based suggestions","TV quick panel","Remote shortcuts",
        "Focus memory","Per-profile UI","Kids/Guest profiles","Avatars","Ambient artwork","Poster density","Accessibility","Quick presets","Storage dashboard","Smart cache",
        "Network-aware artwork","Offline catalog","Profile import/export","LAN sync packet","Backup scheduler","Unified Home state","What Changed","Feature Tips","Diagnostics health page","Profile backup foundations"
    };
    private final SharedPreferences core,own;
    Zero23Store(Context context){core=context.getSharedPreferences("zero",Context.MODE_PRIVATE);own=context.getSharedPreferences("zero23",Context.MODE_PRIVATE);ensure();}
    private JSONObject defaultProfile(){try{return new JSONObject().put("avatar","🎬").put("mode","adult").put("density","balanced").put("preset","balanced").put("highContrast",false).put("largeText",false).put("reducedMotion",false).put("dataSaver",false).put("seasonal",true).put("philippines",true).put("featureTips",true);}catch(JSONException e){return new JSONObject();}}
    private JSONObject defaults(){try{return new JSONObject().put("schema",1).put("version",VERSION).put("activeProfile","Default").put("profiles",new JSONObject().put("Default",defaultProfile())).put("follows",new JSONObject().put("people",new JSONArray()).put("series",new JSONArray()).put("franchises",new JSONArray())).put("votes",new JSONObject()).put("calendar",new JSONArray()).put("hiddenContinue",new JSONArray()).put("focusKey","").put("cache",new JSONObject()).put("offline",new JSONObject()).put("backups",new JSONArray()).put("lastBackup",0).put("changedSeen",false).put("tip",0);}catch(JSONException e){return new JSONObject();}}
    private synchronized JSONObject read(){try{return new JSONObject(own.getString("state",defaults().toString()));}catch(Exception e){return defaults();}}
    private synchronized void write(JSONObject data){try{data.put("version",VERSION);own.edit().putString("state",data.toString()).apply();}catch(Exception ignored){}}
    private void ensure(){JSONObject d=read();JSONObject profiles=d.optJSONObject("profiles");if(profiles==null){profiles=new JSONObject();try{d.put("profiles",profiles);}catch(Exception ignored){}}if(profiles.optJSONObject("Default")==null)try{profiles.put("Default",defaultProfile());}catch(Exception ignored){}if(profiles.optJSONObject(d.optString("activeProfile","Default"))==null)try{d.put("activeProfile","Default");}catch(Exception ignored){}write(d);scheduledBackup();}
    synchronized JSONObject snapshot(){return read();}
    synchronized String active(){return read().optString("activeProfile","Default");}
    synchronized JSONObject profile(){JSONObject d=read(),profiles=d.optJSONObject("profiles");JSONObject p=profiles==null?null:profiles.optJSONObject(d.optString("activeProfile","Default"));return p==null?defaultProfile():p;}
    synchronized void setProfileValue(String key,Object value){JSONObject d=read();try{JSONObject p=d.getJSONObject("profiles").getJSONObject(d.getString("activeProfile"));p.put(key,value);write(d);}catch(Exception ignored){}}
    synchronized void addProfile(String name,String mode){name=name==null?"":name.trim();if(!name.matches("[A-Za-z0-9 _-]{1,24}"))return;JSONObject d=read();try{JSONObject p=defaultProfile();p.put("mode",mode);d.getJSONObject("profiles").put(name,p);d.put("activeProfile",name);write(d);}catch(Exception ignored){}}
    synchronized void switchProfile(String name){JSONObject d=read();if(d.optJSONObject("profiles")!=null&&d.optJSONObject("profiles").optJSONObject(name)!=null)try{d.put("activeProfile",name);write(d);}catch(Exception ignored){}}
    synchronized List<String> profiles(){ArrayList<String> rows=new ArrayList<>();JSONObject profiles=read().optJSONObject("profiles");if(profiles!=null){Iterator<String> it=profiles.keys();while(it.hasNext())rows.add(it.next());}Collections.sort(rows,String.CASE_INSENSITIVE_ORDER);return rows;}
    synchronized void setPreset(String preset){JSONObject p=profile();try{p.put("preset",preset);if(preset.equals("beautiful")){p.put("density","comfortable").put("dataSaver",false).put("reducedMotion",false);}else if(preset.equals("fast")||preset.equals("data-saver")||preset.equals("tv-performance")){p.put("density",preset.equals("tv-performance")?"balanced":"compact").put("dataSaver",true).put("reducedMotion",true);}else p.put("density","balanced").put("dataSaver",false).put("reducedMotion",false);JSONObject d=read();d.getJSONObject("profiles").put(active(),p);write(d);}catch(Exception ignored){}}
    synchronized void follow(String kind,int id,String name){JSONObject d=read();try{JSONArray rows=d.getJSONObject("follows").getJSONArray(kind);for(int i=0;i<rows.length();i++){JSONObject row=rows.optJSONObject(i);if(row!=null&&row.optInt("id")==id)return;}rows.put(new JSONObject().put("id",id).put("name",name));write(d);}catch(Exception ignored){}}
    synchronized JSONArray follows(String kind){JSONObject f=read().optJSONObject("follows");JSONArray a=f==null?null:f.optJSONArray(kind);return a==null?new JSONArray():a;}
    synchronized void vote(String key,int delta){JSONObject d=read();try{JSONObject votes=d.getJSONObject("votes");votes.put(key,votes.optInt(key)+delta);write(d);}catch(Exception ignored){}}
    synchronized int vote(String key){JSONObject votes=read().optJSONObject("votes");return votes==null?0:votes.optInt(key);}
    synchronized void calendarAdd(String title,String date){JSONObject d=read();try{JSONArray rows=d.getJSONArray("calendar");rows.put(new JSONObject().put("title",title).put("date",date));write(d);}catch(Exception ignored){}}
    synchronized JSONArray calendar(){JSONArray rows=read().optJSONArray("calendar");return rows==null?new JSONArray():rows;}
    synchronized void hideContinue(String key){JSONObject d=read();try{JSONArray rows=d.getJSONArray("hiddenContinue");for(int i=0;i<rows.length();i++)if(rows.optString(i).equals(key))return;rows.put(key);write(d);}catch(Exception ignored){}}
    synchronized Set<String> hiddenContinue(){HashSet<String> out=new HashSet<>();JSONArray a=read().optJSONArray("hiddenContinue");if(a!=null)for(int i=0;i<a.length();i++)out.add(a.optString(i));return out;}
    JSONArray history(){try{return new JSONArray(core.getString("watchHistory","[]"));}catch(Exception e){return new JSONArray();}}
    Set<String> watchlist(){return new LinkedHashSet<>(core.getStringSet("favorites",Collections.emptySet()));}
    List<JSONObject> savedItems(){ArrayList<JSONObject> rows=new ArrayList<>();for(Map.Entry<String,?> e:core.getAll().entrySet())if(e.getKey().startsWith("saved:")&&e.getValue() instanceof String)try{rows.add(new JSONObject((String)e.getValue()));}catch(Exception ignored){}return rows;}
    JSONObject taste(){Map<Integer,Integer> genres=new HashMap<>();Map<Integer,Integer> decades=new HashMap<>();Map<String,Integer> languages=new HashMap<>();for(JSONObject item:savedItems()){JSONArray g=item.optJSONArray("genreIds");if(g!=null)for(int i=0;i<g.length();i++){int id=g.optInt(i);genres.put(id,genres.getOrDefault(id,0)+1);}int y=item.optInt("year");if(y>1900){int d=y/10*10;decades.put(d,decades.getOrDefault(d,0)+1);}String lang=item.optString("originalLanguage");if(!lang.isEmpty())languages.put(lang,languages.getOrDefault(lang,0)+1);}try{return new JSONObject().put("genres",rankInt(genres)).put("decades",rankInt(decades)).put("languages",rankString(languages));}catch(Exception e){return new JSONObject();}}
    private JSONArray rankInt(Map<Integer,Integer> map){List<Map.Entry<Integer,Integer>> all=new ArrayList<>(map.entrySet());all.sort((a,b)->b.getValue()-a.getValue());JSONArray out=new JSONArray();for(Map.Entry<Integer,Integer> e:all)out.put(new JSONArray().put(e.getKey()).put(e.getValue()));return out;}
    private JSONArray rankString(Map<String,Integer> map){List<Map.Entry<String,Integer>> all=new ArrayList<>(map.entrySet());all.sort((a,b)->b.getValue()-a.getValue());JSONArray out=new JSONArray();for(Map.Entry<String,Integer> e:all)out.put(new JSONArray().put(e.getKey()).put(e.getValue()));return out;}
    List<JSONObject> finishItems(){ArrayList<JSONObject> out=new ArrayList<>();for(JSONObject item:savedItems()){String id=item.optString("id");int p=core.getInt("percent:"+id,0);if(p>=65&&p<95)out.add(item);}return out;}
    List<JSONObject> continueItems(){ArrayList<JSONObject> out=new ArrayList<>();Set<String> hidden=hiddenContinue();for(JSONObject item:savedItems()){String id=item.optString("id");int p=core.getInt("percent:"+id,0);if(p>0&&p<95&&!hidden.contains(id))out.add(item);}return out;}
    synchronized String backup(){try{return new JSONObject().put("product","ZeroPlay").put("schema",1).put("createdAt",System.currentTimeMillis()).put("store",read()).toString(2);}catch(Exception e){return "{}";}}
    synchronized boolean restore(String json){try{JSONObject root=new JSONObject(json);if(!root.optString("product").equals("ZeroPlay")||root.optInt("schema")!=1||root.optJSONObject("store")==null)return false;write(root.getJSONObject("store"));ensure();return true;}catch(Exception e){return false;}}
    synchronized String syncPacket(){return Base64.encodeToString(backup().getBytes(StandardCharsets.UTF_8),Base64.NO_WRAP);}
    synchronized boolean importPacket(String packet){try{return restore(new String(Base64.decode(packet.trim(),Base64.DEFAULT),StandardCharsets.UTF_8));}catch(Exception e){return false;}}
    synchronized void scheduledBackup(){JSONObject d=read();long now=System.currentTimeMillis();if(now-d.optLong("lastBackup")<86_400_000L)return;try{JSONArray backups=d.getJSONArray("backups");JSONObject p=d.getJSONObject("profiles").getJSONObject(d.optString("activeProfile","Default"));JSONArray next=new JSONArray().put(new JSONObject().put("at",now).put("profile",d.optString("activeProfile")).put("data",new JSONObject(p.toString())));for(int i=0;i<backups.length()&&next.length()<7;i++)next.put(backups.get(i));d.put("backups",next).put("lastBackup",now);write(d);}catch(Exception ignored){}}
    synchronized long ownBytes(){String s=own.getString("state","");return s.length()*2L;}
    SharedPreferences core(){return core;}
}
