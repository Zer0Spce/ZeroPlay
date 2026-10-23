'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const file=rel=>path.join(root,rel);
function patch(rel,fn){const target=file(rel),before=fs.readFileSync(target,'utf8'),after=fn(before);if(after===before)throw new Error('Patch made no change: '+rel);fs.writeFileSync(target,after);console.log('Patched',rel);}

patch('app/build.gradle',text=>{
  if(!text.includes('versionCode 50')||!text.includes("versionName '2.2.4.1'"))throw new Error('Expected 2.2.4.1 Android markers');
  return text.replace('versionCode 50','versionCode 51').replace("versionName '2.2.4.1'","versionName '2.2.5-test1'");
});

const store=`package com.zerostreams.app;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.AtomicFile;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

/** Each playlist has an independent, atomic last-good cache in app-private storage. */
final class PlaylistStore {
    static final class Snapshot {
        final List<M3uPlaylist.Channel> channels; final long updated;
        Snapshot(List<M3uPlaylist.Channel> c,long t){channels=c;updated=t;}
    }
    private static final String PREF_MODE="customLiveTvMode", PREF_URL="customLiveTvUrl";
    private static File file(Context context,boolean live){return new File(context.getFilesDir(),live?"livetv.m3u":"iptv.m3u");}
    private static File customFile(Context context){return new File(context.getFilesDir(),"iptv-custom.m3u");}
    static String sourceMode(Context context){return context.getSharedPreferences("zero",Context.MODE_PRIVATE).getString(PREF_MODE,"original");}
    static String sourceLabel(Context context){String mode=sourceMode(context);if(mode.equals("file"))return "Custom file";if(mode.equals("url")){String url=context.getSharedPreferences("zero",Context.MODE_PRIVATE).getString(PREF_URL,"");try{String host=new URI(url).getHost();return host==null?"Custom URL":host;}catch(Exception ignored){return "Custom URL";}}return "Original playlist";}
    private static List<M3uPlaylist.Channel> visible(Context context,boolean live,List<M3uPlaylist.Channel> channels){
        if(live)return channels;
        SharedPreferences prefs=context.getSharedPreferences("zero",Context.MODE_PRIVATE);boolean cignal=prefs.getBoolean("liveCignal",true),converge=prefs.getBoolean("liveConverge",true);List<M3uPlaylist.Channel> out=new ArrayList<>();
        for(M3uPlaylist.Channel channel:channels){String vendor=(channel.name+" "+channel.group).toLowerCase(Locale.ROOT);if(vendor.contains("cignal")&&!cignal)continue;if(vendor.contains("converge")&&!converge)continue;out.add(channel);}return out;
    }
    static Snapshot cached(Context context,boolean live) throws IOException {
        File f=file(context,live);try(InputStream in=new AtomicFile(f).openRead()){return new Snapshot(visible(context,live,M3uPlaylist.parse(read(in))),f.lastModified());}
    }
    static Snapshot fetch(Context context,boolean live) throws IOException {
        if(live)return fetchUrl(context,true,M3uPlaylist.LIVE_URL);
        String mode=sourceMode(context);
        if(mode.equals("file")){
            File custom=customFile(context);if(!custom.isFile())throw new IOException("Custom playlist file is missing");
            String body;try(InputStream in=new FileInputStream(custom)){body=read(in);}List<M3uPlaylist.Channel> channels=M3uPlaylist.parse(body);save(file(context,false),body);return new Snapshot(visible(context,false,channels),System.currentTimeMillis());
        }
        if(mode.equals("url")){
            String url=context.getSharedPreferences("zero",Context.MODE_PRIVATE).getString(PREF_URL,"");if(!M3uPlaylist.httpUrl(url))throw new IOException("Custom playlist URL is invalid");return fetchUrl(context,false,url);
        }
        return fetchUrl(context,false,M3uPlaylist.IPTV_URL);
    }
    static Snapshot useCustomFile(Context context,InputStream input) throws IOException {
        String body=read(input);List<M3uPlaylist.Channel> channels=M3uPlaylist.parse(body);save(customFile(context),body);save(file(context,false),body);context.getSharedPreferences("zero",Context.MODE_PRIVATE).edit().putString(PREF_MODE,"file").remove(PREF_URL).apply();return new Snapshot(visible(context,false,channels),System.currentTimeMillis());
    }
    static Snapshot useCustomUrl(Context context,String url) throws IOException {
        if(!M3uPlaylist.httpUrl(url))throw new IOException("Enter a valid http:// or https:// M3U URL");Snapshot snapshot=fetchUrl(context,false,url);context.getSharedPreferences("zero",Context.MODE_PRIVATE).edit().putString(PREF_MODE,"url").putString(PREF_URL,url).apply();return snapshot;
    }
    static void restoreOriginal(Context context){context.getSharedPreferences("zero",Context.MODE_PRIVATE).edit().remove(PREF_MODE).remove(PREF_URL).apply();customFile(context).delete();file(context,false).delete();}
    private static Snapshot fetchUrl(Context context,boolean live,String url) throws IOException {
        HttpURLConnection c=(HttpURLConnection)new URL(url).openConnection();c.setConnectTimeout(12000);c.setReadTimeout(20000);c.setUseCaches(false);c.setInstanceFollowRedirects(false);c.setRequestProperty("Cache-Control","no-cache");c.setRequestProperty("Accept","application/vnd.apple.mpegurl, audio/x-mpegurl, text/plain");
        try{int code=c.getResponseCode();if(code!=200)throw new IOException("Playlist HTTP "+code);String body;try(InputStream in=c.getInputStream()){body=read(in);}List<M3uPlaylist.Channel> channels=M3uPlaylist.parse(body);save(file(context,live),body);return new Snapshot(visible(context,live,channels),System.currentTimeMillis());}finally{c.disconnect();}
    }
    private static void save(File target,String body) throws IOException {AtomicFile cache=new AtomicFile(target);FileOutputStream out=null;try{out=cache.startWrite();out.write(body.getBytes(StandardCharsets.UTF_8));cache.finishWrite(out);}catch(IOException e){if(out!=null)cache.failWrite(out);throw e;}}
    private static String read(InputStream in) throws IOException {ByteArrayOutputStream out=new ByteArrayOutputStream();byte[] b=new byte[8192];int n;while((n=in.read(b))!=-1){if(out.size()+n>5_000_000)throw new IOException("Playlist too large");out.write(b,0,n);}return new String(out.toByteArray(),StandardCharsets.UTF_8);}
}
`;
fs.writeFileSync(file('app/src/main/java/com/zerostreams/app/PlaylistStore.java'),store);
console.log('Patched PlaylistStore.java');

patch('app/src/main/java/com/zerostreams/app/MainActivity.java',text=>{
  const field='    private final Map<String,Button> navigation=new LinkedHashMap<>();';
  if(!text.includes(field))throw new Error('navigation field marker missing');
  text=text.replace(field,field+'\n    private static final int REQUEST_CUSTOM_LIVE_TV_M3U=22401;');

  const resume='    @Override protected void onResume(){super.onResume();';
  if(!text.includes(resume))throw new Error('onResume marker missing');
  const methods=`    void liveTvPlaylistMenu(){
        String current=PlaylistStore.sourceLabel(this);String[] choices={"Load M3U from file","Load M3U from URL","Restore original playlist"};
        new AlertDialog.Builder(this).setTitle("Live TV playlist · "+current).setItems(choices,(d,n)->{if(n==0)pickLiveTvPlaylist();else if(n==1)promptLiveTvPlaylistUrl();else restoreOriginalLiveTvPlaylist();}).setNegativeButton("Close",null).show();
    }
    void pickLiveTvPlaylist(){try{Intent intent=new Intent(Intent.ACTION_OPEN_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType("*/*");startActivityForResult(intent,REQUEST_CUSTOM_LIVE_TV_M3U);}catch(Exception e){message("No file manager is available on this device.");}}
    void promptLiveTvPlaylistUrl(){EditText input=new EditText(this);input.setSingleLine(true);input.setHint("https://example.com/playlist.m3u");input.setText(prefs.getString("customLiveTvUrl",""));input.setSelection(input.length());new AlertDialog.Builder(this).setTitle("Custom Live TV M3U URL").setView(input).setPositiveButton("Load",(d,n)->loadCustomLiveTvUrl(input.getText().toString().trim())).setNegativeButton("Cancel",null).show();}
    void loadCustomLiveTvUrl(String url){if(!M3uPlaylist.httpUrl(url)){message("Enter a valid http:// or https:// M3U URL.");return;}status.setText("Loading custom Live TV playlist…");io.execute(()->{try{PlaylistStore.Snapshot result=PlaylistStore.useCustomUrl(getApplicationContext(),url);ui.post(()->applyCustomLiveTvSnapshot(result,"Custom M3U URL loaded"));}catch(Exception e){ui.post(()->message("Could not load that M3U URL: "+e.getMessage()));}});}
    void restoreOriginalLiveTvPlaylist(){PlaylistStore.restoreOriginal(getApplicationContext());playlists.remove("IPTV");playlistErrors.remove("IPTV");channelGroup="All";if(category.equals("IPTV")){status.setText("Restoring original Live TV playlist…");loadPlaylist(true);}message("Restored original Live TV playlist.");}
    void applyCustomLiveTvSnapshot(PlaylistStore.Snapshot result,String notice){playlists.put("IPTV",result);playlistErrors.remove("IPTV");channelGroup="All";if(category.equals("IPTV")){renderPlaylistPreservingPosition();status.setText(result.channels.size()+" channels · "+PlaylistStore.sourceLabel(this));}message(notice);}
    @Override protected void onActivityResult(int requestCode,int resultCode,Intent data){super.onActivityResult(requestCode,resultCode,data);if(requestCode!=REQUEST_CUSTOM_LIVE_TV_M3U||resultCode!=RESULT_OK||data==null||data.getData()==null)return;android.net.Uri uri=data.getData();try{int flags=data.getFlags()&(Intent.FLAG_GRANT_READ_URI_PERMISSION|Intent.FLAG_GRANT_WRITE_URI_PERMISSION);getContentResolver().takePersistableUriPermission(uri,flags);}catch(Exception ignored){}status.setText("Importing custom Live TV playlist…");io.execute(()->{try(InputStream in=getContentResolver().openInputStream(uri)){if(in==null)throw new IOException("Could not open file");PlaylistStore.Snapshot result=PlaylistStore.useCustomFile(getApplicationContext(),in);ui.post(()->applyCustomLiveTvSnapshot(result,"Custom M3U file loaded"));}catch(Exception e){ui.post(()->message("Could not import that M3U file: "+e.getMessage()));}});}
`;
  text=text.replace(resume,methods+resume);

  const heading='        Button refresh=button(live?"↻ Refresh sports":"↻ Refresh TV",()->loadPlaylist(true));int color=live?Color.rgb(183,59,80):Color.rgb(10,113,94);refresh.setTextColor(Color.WHITE);refresh.setBackground(shape(color,0));refresh.setOnFocusChangeListener((v,f)->v.setBackground(shape(color,f?INK:0)));refresh.setEnabled(!playlistLoading.contains(section));refresh.setEnabled(!sportsLoading);if(sportsLoading)refresh.setText("↻ Refreshing…");heading.addView(refresh,new LinearLayout.LayoutParams(-2,dp(46)));content.addView(heading);space(content,12);';
  if(!text.includes(heading))throw new Error('playlist heading marker missing');
  const headingNext='        Button refresh=button(live?"↻ Refresh sports":"↻ Refresh TV",()->loadPlaylist(true));int color=live?Color.rgb(183,59,80):Color.rgb(10,113,94);refresh.setTextColor(Color.WHITE);refresh.setBackground(shape(color,0));refresh.setOnFocusChangeListener((v,f)->v.setBackground(shape(color,f?INK:0)));refresh.setEnabled(!playlistLoading.contains(section));refresh.setEnabled(!sportsLoading);if(sportsLoading)refresh.setText("↻ Refreshing…");heading.addView(refresh,new LinearLayout.LayoutParams(-2,dp(46)));if(!live){LinearLayout.LayoutParams sourceLp=new LinearLayout.LayoutParams(-2,dp(46));sourceLp.setMargins(dp(8),0,0,0);heading.addView(button("Playlist · "+PlaylistStore.sourceLabel(this),this::liveTvPlaylistMenu),sourceLp);}content.addView(heading);space(content,12);';
  text=text.replace(heading,headingNext);

  const auto='        if(pageable()){updatePagingFooter();scroll.post(this::maybeLoadNextPage);}';
  if(!text.includes(auto))throw new Error('auto pagination marker missing');
  text=text.replace(auto,'        if(pageable()){updatePagingFooter();if(!(BuildConfig.TV&&(category.equals("Movies")||category.equals("Series"))))scroll.post(this::maybeLoadNextPage);}');

  const maybe='    void maybeLoadNextPage(){\n        if(!foreground||!ready||detailsOpen||!pageable()||pageLoading||!pageHasMore||pageFailed||catalog.isEmpty()||content.getHeight()==0)return;';
  if(!text.includes(maybe))throw new Error('maybeLoadNextPage marker missing');
  text=text.replace(maybe,'    void maybeLoadNextPage(){\n        if(!foreground||!ready||detailsOpen||!pageable()||pageLoading||!pageHasMore||pageFailed||catalog.isEmpty()||content.getHeight()==0)return;\n        if(BuildConfig.TV&&(category.equals("Movies")||category.equals("Series"))){View focus=getCurrentFocus();if(focus==null||!descendant(content,focus))return;}');
  return text;
});

console.log('Custom Live TV + Android TV paging test patch applied.');
