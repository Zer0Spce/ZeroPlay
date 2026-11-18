package com.zerostreams.app;

import android.app.*;
import android.content.*;
import android.net.VpnService;
import android.os.*;
import android.util.Log;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;
import org.json.*;

/**
 * Test-only ZeroPlay integration of the REAL BlockAds Go tunnel library.
 * Upstream: https://github.com/pass-with-high-score/blockads-android
 * tunnel.aar 2026.11.17.35069308, GPL-3.0.
 *
 * This is a native in-app VPN, NOT a separate BlockAds installation.
 * DNS-only routing avoids tunneling video content or interfering with 4K playback.
 * The upstream Go tunnel performs DNS parsing, forwarding and block decisions.
 */
public final class ZeroVpnAdblockService extends VpnService {
    static final String START="com.zerostreams.app.VPN_START";
    static final String STOP="com.zerostreams.app.VPN_STOP";
    static volatile boolean running=false;
    private static volatile ZeroVpnAdblockService current;
    // Go blocklists also protect WebView subresources, without tunneling video.
    static boolean blocksPlayerHost(String host){
        ZeroVpnAdblockService service=current;
        return service!=null&&service.active&&service.shouldBlock(host);
    }
    private static final String TAG="ZeroPlayBlockAds",CHANNEL="zeroplay_native_blockads";
    private static final int NOTICE=2691;
    private static final String DEFAULT_HOSTS="https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts";
    private static final String UPSTREAM_INDEX="https://complier.pwhs.app/api/filters/default";
    private static final String[] BUILTIN={"doubleclick.net","googlesyndication.com","googleadservices.com",
        "adsterra.com","adsterra.org","popads.net","popcash.net","exoclick.com","exosrv.com",
        "onclicka.com","onclicksuper.com","propellerads.com","trafficjunky.net","juicyads.com",
        "hilltopads.net","histats.com","histats.net","gurlleviter.cyou",
        "mgid.com","taboola.com","outbrain.com","adnxs.com",
        "criteo.com","pubmatic.com","rubiconproject.com","openx.net","adskeeper.com"};
    private static final String[] SAFE={"mapple.fun","vidstuck.cc","zxcstream.cc",
        "cloudflarestream.com","videodelivery.net","cloudfront.net","akamaized.net",
        "akamaihd.net","fastly.net","b-cdn.net","cdn77.org","googlevideo.com","r2.dev"};
    private final Set<String> blockedDomains=ConcurrentHashMap.newKeySet();
    private final AtomicLong queries=new AtomicLong(),blocked=new AtomicLong();
    private volatile boolean active;
    private ParcelFileDescriptor tun;
    private tunnel.Engine engine;
    private Thread worker;
    private final Object stateLock=new Object();
    static boolean isRunning(){return running;}
    private static boolean matches(String host,String domain){return host.equals(domain)||host.endsWith("."+domain);}
    private static boolean valid(String host){return host.length()>3&&host.length()<=253&&host.matches("[a-z0-9][a-z0-9.-]*[a-z0-9]")&&!host.contains("..");}
    // Keep the previously tested playback safety allowlist contract stable.
    static boolean allowed(String host){
        if(host==null)return false;
        for(String safe:SAFE)if(matches(host.toLowerCase(Locale.ROOT),safe))return true;
        return false;
    }
    private boolean shouldBlock(String name){
        if(name==null)return false;
        String d=name.toLowerCase(Locale.ROOT);
        for(String safe:SAFE)if(matches(d,safe))return false;
        String p=d;
        while(true){
            if(blockedDomains.contains(p))return true;
            int dot=p.indexOf('.');
            if(dot<0)return false;
            p=p.substring(dot+1);
        }
    }
    @Override public void onCreate(){
        super.onCreate();
        Collections.addAll(blockedDomains,BUILTIN);
        File f=new File(getFilesDir(),"blockads-hosts.txt");
        if(f.isFile())try(BufferedReader r=new BufferedReader(new FileReader(f))){
            String line;int count=0;
            while((line=r.readLine())!=null&&count<350000){
                if(valid(line)){blockedDomains.add(line);count++;}
            }
        }catch(IOException e){Log.w(TAG,"Cached hosts unavailable",e);}
    }
    @Override public int onStartCommand(Intent intent,int flags,int startId){
        if(intent!=null&&STOP.equals(intent.getAction())){stopSelf();return START_NOT_STICKY;}
        synchronized(stateLock){
            if(active)return START_STICKY;
            if(VpnService.prepare(this)!=null){restoreOriginal();stopSelf();return START_NOT_STICKY;}
            ensureNotification();startForeground(NOTICE,notification());
            try{
                // DNS-only split route matching the actual upstream TvVpnService configuration.
                Builder builder=new Builder().setSession("ZeroPlay BlockAds")
                    .setMtu(1350).addAddress("100.64.100.2",32)
                    .addDnsServer("100.64.100.1").addRoute("100.64.100.1",32)
                    // Match the original BlockAds TV IPv6 synthetic DNS route.
                    .addAddress("fd00::2",128).addDnsServer("fd00::1").addRoute("fd00::1",128);
                if(Build.VERSION.SDK_INT>=29)builder.setMetered(false);
                // Do NOT disallow ZeroPlay: its player DNS must also be filtered.
                tun=builder.establish();
                if(tun==null)throw new IOException("VPN was not established");
                engine=tunnel.Tunnel.newEngine();
                engine.setDNS("PLAIN","9.9.9.9","94.140.14.14","https://dns.quad9.net/dns-query");
                // Go ParseResponseType is case-sensitive: lowercase silently selects CUSTOM_IP.
                engine.setBlockResponseType("NXDOMAIN");
                engine.setDomainChecker(new tunnel.DomainChecker(){
                    @Override public boolean isBlocked(String domain){return shouldBlock(domain);}
                    @Override public String getBlockReason(String domain){return shouldBlock(domain)?"ZeroPlay BlockAds hosts":"";}
                    @Override public long hasCustomRule(String domain){
                        // Upstream Go DNS pipeline checks custom overrides before native tries.
                        // 1 = block, 0 = allow, -1 = defer to binary trie filters.
                        if(allowed(domain))return 0L;
                        return shouldBlock(domain)?1L:-1L;
                    }
                });
                engine.setLogCallback(new tunnel.LogCallback(){
                    @Override public void onDNSQuery(String domain,boolean denied,long type,long ms,String app,String ip,String reason){
                        long n=queries.incrementAndGet();long b=denied?blocked.incrementAndGet():blocked.get();
                        if(n<=5||n%20==0||denied){
                            getSharedPreferences("zero",MODE_PRIVATE).edit()
                                .putLong("vpnDnsQueryCount",n).putLong("vpnDnsBlockedCount",b).apply();
                        }
                    }
                });
                running=true;active=true;current=this;
                getSharedPreferences("zero",MODE_PRIVATE).edit()
                    .putString("vpnDnsSelfTestStatus","checking").putBoolean("blockAds",true)
                    .putString("adBlockingMode","blockads").putBoolean("vpnAdblockActive",true)
                    .putLong("vpnDnsQueryCount",0).putLong("vpnDnsBlockedCount",0).apply();
                // gomobile start() blocks; must run off Android UI thread.
                worker=new Thread(()->{
                    try{engine.start(tun.getFd(),fd->protect((int)fd),"");}
                    catch(Throwable error){if(active)Log.e(TAG,"Upstream Go tunnel exited",error);}
                    finally{if(active)stopSelf();}
                },"ZeroPlay-Upstream-BlockAds-Go");
                worker.setDaemon(true);worker.start();
                // A visible VPN icon is not evidence that DNS is intercepted. Exercise the
                // synthetic resolver and require a blocked result from the real Go engine.
                Thread probe=new Thread(this::verifyNativeDnsBlocking,"ZeroPlay-BlockAds-DNS-Verify");
                probe.setDaemon(true);probe.start();
                Thread filters=new Thread(this::refreshUpstreamFilters,"ZeroPlay-BlockAds-Filters");
                filters.setDaemon(true);filters.start();
                return START_STICKY;
            }catch(Throwable e){Log.e(TAG,"Native BlockAds VPN initialization failed",e);
                restoreOriginal();stopSelf();return START_NOT_STICKY;}
        }
    }
    private void verifyNativeDnsBlocking(){
        String result="failed";
        try{
            Thread.sleep(900);
            if(!active)return;
            long before=queries.get();
            ByteArrayOutputStream q=new ByteArrayOutputStream();
            for(int b:new int[]{0x53,0x21,0x01,0x00,0x00,0x01,0,0,0,0,0,0})q.write(b);
            for(String label:"doubleclick.net".split("\\.")){
                byte[] part=label.getBytes(StandardCharsets.US_ASCII);
                q.write(part.length);q.write(part,0,part.length);
            }
            for(int b:new int[]{0,0,1,0,1})q.write(b);
            byte[] payload=q.toByteArray();
            // This UDP packet uses the VPN's synthetic DNS server, not a public server.
            try(DatagramSocket socket=new DatagramSocket()){
                socket.setSoTimeout(3000);
                socket.send(new DatagramPacket(payload,payload.length,
                    InetAddress.getByAddress(new byte[]{100,64,100,1}),53));
                byte[] answer=new byte[512];
                DatagramPacket reply=new DatagramPacket(answer,answer.length);
                socket.receive(reply);
                boolean nxdomain=reply.getLength()>=12&&(answer[0]&255)==0x53&&
                    (answer[1]&255)==0x21&&(answer[2]&0x80)!=0&&(answer[3]&15)==3;
                // The native engine must also have logged the intercepted query.
                Thread.sleep(120);
                result=nxdomain&&queries.get()>before&&blocked.get()>0?"passed":"failed";
            }
        }catch(Exception e){
            Log.w(TAG,"VPN DNS verification failed (the original player filter remains active)",e);
        }finally{
            if(active){
                getSharedPreferences("zero",MODE_PRIVATE).edit()
                    .putString("vpnDnsSelfTestStatus",result).apply();
                Log.i(TAG,"Built-in BlockAds DNS self-check: "+result);
            }
        }
    }
    private void refreshUpstreamFilters(){
        getSharedPreferences("zero",MODE_PRIVATE).edit().putString("vpnBlocklistStatus","loading").apply();
        // Original BlockAds publishes binary trie + bloom filters. Use those
        // with the ORIGINAL Go Engine.SetTries rather than a copied DNS engine.
        try{
            File dir=new File(getFilesDir(),"upstream-blockads-filters");
            if(!dir.exists()&&!dir.mkdirs())return;
            JSONArray entries=readUpstreamJson(UPSTREAM_INDEX);
            ArrayList<String> adTries=new ArrayList<>(),secTries=new ArrayList<>(),
                adBlooms=new ArrayList<>(),secBlooms=new ArrayList<>();
            for(int i=0;i<entries.length()&&i<16;i++){
                JSONObject entry=entries.optJSONObject(i);
                if(entry==null||!entry.optBoolean("isEnabled",false))continue;
                String trieUrl=entry.optString("trieUrl"),bloomUrl=entry.optString("bloomUrl");
                if(!trieUrl.startsWith("https://")||!bloomUrl.startsWith("https://"))continue;
                File tf=new File(dir,"blockads-"+i+".trie"),bf=new File(dir,"blockads-"+i+".bloom");
                downloadFilter(trieUrl,tf);downloadFilter(bloomUrl,bf);
                if(!tf.isFile()||!bf.isFile())continue;
                if("security".equals(entry.optString("category"))){secTries.add(tf.getAbsolutePath());secBlooms.add(bf.getAbsolutePath());}
                else{adTries.add(tf.getAbsolutePath());adBlooms.add(bf.getAbsolutePath());}
            }
            if(active&&(!adTries.isEmpty()||!secTries.isEmpty())){
                engine.setTries(String.join(",",adTries),String.join(",",secTries),
                    String.join(",",adBlooms),String.join(",",secBlooms));
                getSharedPreferences("zero",MODE_PRIVATE).edit().putString("vpnBlocklistStatus","native trie filters ready").apply();
                Log.i(TAG,"Loaded upstream BlockAds binary filter tries");
            }
        }catch(Exception e){
            getSharedPreferences("zero",MODE_PRIVATE).edit().putString("vpnBlocklistStatus","upstream failed; using hosts").apply();
            Log.w(TAG,"Upstream binary filters unavailable; using cached hosts",e);
        }
        refreshHosts();
        if(active&&"loading".equals(getSharedPreferences("zero",MODE_PRIVATE).getString("vpnBlocklistStatus",""))){
            getSharedPreferences("zero",MODE_PRIVATE).edit().putString("vpnBlocklistStatus","hosts + built-in rules").apply();
        }
    }
    private JSONArray readUpstreamJson(String url)throws Exception{
        HttpURLConnection c=(HttpURLConnection)new URL(url).openConnection();
        c.setConnectTimeout(6500);c.setReadTimeout(8500);
        try(InputStream in=c.getInputStream()){
            byte[] b=new byte[1024*1024];int size=0,n;
            while(size<b.length&&(n=in.read(b,size,b.length-size))>0)size+=n;
            return new JSONArray(new String(b,0,size,StandardCharsets.UTF_8));
        }finally{c.disconnect();}
    }
    private void downloadFilter(String url,File target)throws IOException{
        if(target.exists()&&target.length()>128&&System.currentTimeMillis()-target.lastModified()<86400000L)return;
        File tmp=new File(target.getPath()+".tmp");
        HttpURLConnection c=(HttpURLConnection)new URL(url).openConnection();
        c.setConnectTimeout(6500);c.setReadTimeout(12000);
        try(InputStream in=c.getInputStream();OutputStream out=new FileOutputStream(tmp)){
            byte[] buf=new byte[16384];int n;long total=0;
            while((n=in.read(buf))>=0){total+=n;if(total>32L*1024*1024)throw new IOException("Filter too large");out.write(buf,0,n);}
            if(total<128)throw new IOException("Filter truncated");
        }finally{c.disconnect();}
        if(!tmp.renameTo(target))throw new IOException("Filter replace failed");
    }
    private void refreshHosts(){
        File target=new File(getFilesDir(),"blockads-hosts.txt");
        if(target.isFile()&&System.currentTimeMillis()-target.lastModified()<86400000L)return;
        File tmp=new File(getFilesDir(),"blockads-hosts.tmp");
        HttpURLConnection c=null;
        try{
            c=(HttpURLConnection)new URL(DEFAULT_HOSTS).openConnection();
            c.setConnectTimeout(6500);c.setReadTimeout(10000);
            HashSet<String> fetched=new HashSet<>();
            try(BufferedReader r=new BufferedReader(new InputStreamReader(c.getInputStream(),StandardCharsets.UTF_8))){
                String line;int n=0;
                while((line=r.readLine())!=null&&++n<350000){
                    if(!line.startsWith("0.0.0.0 ")&&!line.startsWith("127.0.0.1 "))continue;
                    String[] parts=line.split("\\s+");
                    for(int i=1;i<parts.length;i++){String d=parts[i].toLowerCase(Locale.ROOT);if(valid(d))fetched.add(d);}
                }
            }
            if(fetched.size()<1000)return;
            try(BufferedWriter w=new BufferedWriter(new FileWriter(tmp))){
                for(String domain:fetched){w.write(domain);w.newLine();}
            }
            if(!tmp.renameTo(target))throw new IOException("Failed committing blocklist");
            blockedDomains.addAll(fetched);
        }catch(Exception e){Log.w(TAG,"Keeping cached filtering hosts",e);tmp.delete();}
        finally{if(c!=null)c.disconnect();}
    }
    private void ensureNotification(){
        if(Build.VERSION.SDK_INT>=26)getSystemService(NotificationManager.class).createNotificationChannel(
            new NotificationChannel(CHANNEL,"ZeroPlay BlockAds VPN",NotificationManager.IMPORTANCE_LOW));
    }
    private Notification notification(){
        PendingIntent open=PendingIntent.getActivity(this,NOTICE,new Intent(this,PresentationMainActivity.class),
            PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
        Notification.Builder b=Build.VERSION.SDK_INT>=26?
            new Notification.Builder(this,CHANNEL):new Notification.Builder(this);
        return b.setSmallIcon(android.R.drawable.ic_lock_lock).setContentTitle("ZeroPlay BlockAds")
            .setContentText("Real Go tunnel ad filtering active").setOngoing(true).setContentIntent(open).build();
    }
    private void restoreOriginal(){
        running=false;
        getSharedPreferences("zero",MODE_PRIVATE).edit().putString("adBlockingMode","original")
            .putBoolean("blockAds",true).putBoolean("vpnAdblockActive",false)
            .putString("vpnDnsSelfTestStatus","idle").apply();
    }
    @Override public void onRevoke(){stopSelf();super.onRevoke();}
    @Override public void onDestroy(){
        active=false;running=false;
        if(current==this)current=null;
        try{if(tun!=null)tun.close();}catch(IOException ignored){}
        try{if(engine!=null)engine.stop();}catch(Throwable e){Log.w(TAG,"Native engine stop failed",e);}
        if(worker!=null)worker.interrupt();
        restoreOriginal();
        super.onDestroy();
    }
}
