package com.zerostreams.app;

import android.content.Context;
import org.json.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;

/** Small device-local TMDB cache used for stale-while-refresh catalog rendering. */
final class CatalogDiskCache {
    private static final long MAX_STALE=7L*24*60*60*1000;
    private static final int MAX_FILES=96;
    private CatalogDiskCache(){}

    private static File root(Context context){
        File dir=new File(context.getFilesDir(),"catalog-cache-v2");
        if(!dir.isDirectory())dir.mkdirs();
        return dir;
    }
    private static String hash(String value){
        try{
            byte[] digest=MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder out=new StringBuilder();for(byte b:digest)out.append(String.format(Locale.ROOT,"%02x",b&255));return out.toString();
        }catch(Exception e){return Integer.toHexString(value.hashCode());}
    }
    private static File file(Context context,String key){return new File(root(context),hash(key)+".json");}
    static List<Catalog.Item> load(Context context,String key){
        File source=file(context,key);if(!source.isFile()||System.currentTimeMillis()-source.lastModified()>MAX_STALE)return new ArrayList<>();
        try(InputStream in=new BufferedInputStream(new FileInputStream(source))){
            String raw=Catalog.read(in,8_000_000);JSONArray rows=new JSONArray(raw);List<Catalog.Item> items=new ArrayList<>();
            for(int i=0;i<rows.length();i++){JSONObject item=rows.optJSONObject(i);if(item!=null)items.add(new Catalog.Item(item));}
            source.setLastModified(System.currentTimeMillis());return items;
        }catch(Exception ignored){return new ArrayList<>();}
    }
    static void save(Context context,String key,List<Catalog.Item> items){
        if(items==null||items.isEmpty())return;File target=file(context,key),temp=new File(target.getAbsolutePath()+".tmp");
        try{
            JSONArray rows=new JSONArray();for(Catalog.Item item:items)rows.put(new JSONObject(item.raw.toString()));
            try(OutputStream out=new BufferedOutputStream(new FileOutputStream(temp))){out.write(rows.toString().getBytes(StandardCharsets.UTF_8));}
            if(target.exists()&&!target.delete())throw new IOException("Could not replace cache");if(!temp.renameTo(target))throw new IOException("Could not publish cache");cleanup(context);
        }catch(Exception ignored){temp.delete();}
    }
    static JSONObject loadJson(Context context,String key){
        File source=file(context,"json:"+key);if(!source.isFile()||System.currentTimeMillis()-source.lastModified()>MAX_STALE)return null;
        try(InputStream in=new BufferedInputStream(new FileInputStream(source))){JSONObject value=new JSONObject(Catalog.read(in,8_000_000));source.setLastModified(System.currentTimeMillis());return value;}catch(Exception ignored){return null;}
    }
    static void saveJson(Context context,String key,JSONObject value){
        if(value==null)return;File target=file(context,"json:"+key),temp=new File(target.getAbsolutePath()+".tmp");
        try(OutputStream out=new BufferedOutputStream(new FileOutputStream(temp))){out.write(value.toString().getBytes(StandardCharsets.UTF_8));}
        catch(Exception ignored){temp.delete();return;}
        if(target.exists())target.delete();temp.renameTo(target);cleanup(context);
    }
    static void clear(Context context){File dir=root(context);File[] files=dir.listFiles();if(files!=null)for(File f:files)f.delete();}
    private static void cleanup(Context context){
        File[] files=root(context).listFiles((dir,name)->name.endsWith(".json"));if(files==null||files.length<=MAX_FILES)return;
        Arrays.sort(files,Comparator.comparingLong(File::lastModified));for(int i=0;i<files.length-MAX_FILES;i++)files[i].delete();
    }
}
