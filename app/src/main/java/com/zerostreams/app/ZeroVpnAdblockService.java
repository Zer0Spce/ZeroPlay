package com.zerostreams.app;
import android.app.*;
import android.content.*;
import android.net.VpnService;
import android.os.*;
import android.util.Log;
import java.io.*;
import java.net.*;
import java.util.*;
import java.util.concurrent.*;

/** DNS-only split-tunnel Android VpnService, independent implementation.
 * Inspired by BlockAds VPN architecture, NOT a copy of the GPL BlockAds engine.
 * Does not intercept HTTPS or video traffic. */
public final class ZeroVpnAdblockService extends VpnService {
 static final String START="com.zerostreams.app.VPN_START",STOP="com.zerostreams.app.VPN_STOP";
 static final String MODE="adBlockingMode",ACTIVE="vpnAdblockActive";
 static volatile boolean running;
 private static final String TAG="ZeroPlayVpn",CHANNEL="zeroplay_vpn_dns";
 private static final String DNS="10.119.0.1",LIST="https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts";
 private static final String[] BLOCK={"doubleclick.net","googlesyndication.com","googleadservices.com","adsterra.com","popads.net","popcash.net","propellerads.com","exoclick.com","exosrv.com","onclicka.com","mgid.com","taboola.com","outbrain.com","adnxs.com","criteo.com","pubmatic.com","rubiconproject.com","openx.net","adskeeper.com","trafficjunky.net","juicyads.com"};
 private static final String[] ALLOW={"mapple.fun","vidstuck.cc","zxcstream.cc","embedwave.cc","vidsrc.sh","vidrock.to","vidnest.fun","vidrift.net","vidfast.vc","vaplayer.ru","vidly.pro","vidcore.org","chillflix.pw","cloudflarestream.com","videodelivery.net","cloudfront.net","akamaized.net","akamaihd.net","fastly.net","b-cdn.net","cdn77.org","googlevideo.com","r2.dev","challenges.cloudflare.com"};
 private final Set<String> hosts=ConcurrentHashMap.newKeySet();private volatile boolean live;
 private ParcelFileDescriptor tunnel;private InputStream input;private OutputStream output;private Thread reader;private ExecutorService workers;
 private final Object writeLock=new Object();
 private final java.util.concurrent.atomic.AtomicLong queryCount=new java.util.concurrent.atomic.AtomicLong();
 private final java.util.concurrent.atomic.AtomicLong blockedCount=new java.util.concurrent.atomic.AtomicLong();
 static boolean isRunning(){return running;}
 static boolean suffix(String h,String d){return h.equals(d)||h.endsWith("."+d);}
 static boolean allowed(String host){for(String d:ALLOW)if(suffix(host,d))return true;return false;}
 private boolean blocked(String host){
  if(allowed(host))return false;
  for(String d:BLOCK)if(suffix(host,d))return true;
  String x=host;while(true){if(hosts.contains(x))return true;int i=x.indexOf('.');if(i<0)return false;x=x.substring(i+1);}
 }
 @Override public void onCreate(){
  super.onCreate();for(String d:BLOCK)hosts.add(d);loadCached();
  getSharedPreferences("zero",MODE_PRIVATE).edit().putLong("vpnDnsQueryCount",0).putLong("vpnDnsBlockedCount",0).apply();
 }
 @Override public int onStartCommand(Intent intent,int flags,int startId){
  if(intent!=null&&STOP.equals(intent.getAction())){stopSelf();return START_NOT_STICKY;}
  if(live)return START_STICKY;
  if(VpnService.prepare(this)!=null){revert();stopSelf();return START_NOT_STICKY;}
  notificationChannel();startForeground(2691,notification());
  try{
   tunnel=new Builder().setSession("ZeroPlay VPN Ad Blocking").setMtu(1500)
    .addAddress("10.119.0.2",32).addDnsServer(DNS).addRoute(DNS,32).establish();
   if(tunnel==null)throw new IOException("Tunnel was not established");
   input=new FileInputStream(tunnel.getFileDescriptor());output=new FileOutputStream(tunnel.getFileDescriptor());
   workers=Executors.newFixedThreadPool(4);live=true;running=true;
   getSharedPreferences("zero",MODE_PRIVATE).edit().putString(MODE,"vpn").putBoolean(ACTIVE,true).putBoolean("vpnAdblockStarting",false).putBoolean("blockAds",true).apply();
   reader=new Thread(this::readLoop,"ZeroPlay-VPN-DNS");reader.setDaemon(true);reader.start();
   Thread update=new Thread(this::refreshList,"ZeroPlay-DNS-Rules");update.setDaemon(true);update.start();
   return START_STICKY;
  }catch(Exception e){Log.e(TAG,"VPN startup failed",e);revert();stopSelf();return START_NOT_STICKY;}
 }
 private void readLoop(){
  byte[] buf=new byte[4096];
  try{while(live){int n=input.read(buf);if(n<=0)continue;VpnDnsPacket.Query q=VpnDnsPacket.parse(buf,n);if(q!=null&&workers!=null)workers.execute(()->answer(q));}}
  catch(Exception e){if(live)Log.w(TAG,"VPN DNS reader exited",e);}
  finally{if(live)stopSelf();}
 }
 private void answer(VpnDnsPacket.Query q){
  try{
   boolean deny=blocked(q.domain);
   long seen=queryCount.incrementAndGet(),rejected=deny?blockedCount.incrementAndGet():blockedCount.get();
   if(seen<=5||seen%20==0||deny){
    getSharedPreferences("zero",MODE_PRIVATE).edit()
      .putLong("vpnDnsQueryCount",seen).putLong("vpnDnsBlockedCount",rejected).apply();
   }
   byte[] response=deny?VpnDnsPacket.error(q,3):forward(q.dns);
   if(response==null)response=VpnDnsPacket.error(q,2);
   byte[] ip=VpnDnsPacket.reply(q,response);
   if(ip!=null&&live) synchronized(writeLock){if(live)output.write(ip);}
  }catch(Exception e){Log.w(TAG,"DNS failure",e);}
 }
 private byte[] forward(byte[] query){
  for(String dns:new String[]{"1.1.1.1","8.8.8.8"}){
   try(DatagramSocket socket=new DatagramSocket()){
    if(!protect(socket))continue;
    socket.setSoTimeout(1600);
    socket.send(new DatagramPacket(query,query.length,InetAddress.getByName(dns),53));
    byte[] result=new byte[1600];DatagramPacket pkt=new DatagramPacket(result,result.length);socket.receive(pkt);
    if(pkt.getLength()<12||query[0]!=result[0]||query[1]!=result[1])continue;
    return Arrays.copyOf(result,pkt.getLength());
   }catch(Exception ignored){}
  }
  return null;
 }
 private static boolean valid(String s){return s.length()>3&&s.length()<254&&s.indexOf('.')>0&&s.matches("[a-z0-9][a-z0-9.-]*[a-z0-9]")&&!s.contains("..");}
 private void loadCached(){
  File file=new File(getFilesDir(),"vpn-dns-hosts.txt");if(!file.exists())return;
  try(BufferedReader r=new BufferedReader(new FileReader(file))){String s;int count=0;
   while((s=r.readLine())!=null&&count<250000)if(valid(s)){hosts.add(s);count++;}
  }catch(IOException e){Log.w(TAG,"Rules cache unavailable",e);}
 }
 private void refreshList(){
  File file=new File(getFilesDir(),"vpn-dns-hosts.txt");
  if(file.exists()&&System.currentTimeMillis()-file.lastModified()<86400000L)return;
  HttpURLConnection conn=null;File tmp=new File(getFilesDir(),"vpn-dns-hosts.tmp");
  try{
   conn=(HttpURLConnection)new URL(LIST).openConnection();conn.setConnectTimeout(6500);conn.setReadTimeout(9000);
   if(conn.getResponseCode()!=200)return;Set<String> incoming=new HashSet<>();
   try(BufferedReader r=new BufferedReader(new InputStreamReader(conn.getInputStream(),"UTF-8"))){
    String line;int n=0;
    while((line=r.readLine())!=null&&++n<350000){
     if(!line.startsWith("0.0.0.0 ")&&!line.startsWith("127.0.0.1 "))continue;
     String[] parts=line.trim().split("\\s+");
     for(int i=1;i<parts.length;i++){String d=parts[i].toLowerCase(Locale.ROOT);if(valid(d)&&!allowed(d))incoming.add(d);}
     if(incoming.size()>=250000)break;
    }
   }
   if(incoming.size()<1000)return;try(BufferedWriter out=new BufferedWriter(new FileWriter(tmp))){
    for(String domain:incoming){out.write(domain);out.newLine();}
   }
   if(!tmp.renameTo(file))throw new IOException("Rule cache commit failed");
   hosts.addAll(incoming);Log.i(TAG,"Loaded "+incoming.size()+" ad domains");
  }catch(Exception e){tmp.delete();Log.w(TAG,"Could not update blocklist; keeping cached filters",e);}
  finally{if(conn!=null)conn.disconnect();}
 }
 private void notificationChannel(){
  if(Build.VERSION.SDK_INT>=26)getSystemService(NotificationManager.class).createNotificationChannel(
   new NotificationChannel(CHANNEL,"ZeroPlay VPN DNS",NotificationManager.IMPORTANCE_LOW));
 }
 private Notification notification(){
  PendingIntent pending=PendingIntent.getActivity(this,2691,new Intent(this,MainActivity.class),
   PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
  Notification.Builder b=Build.VERSION.SDK_INT>=26?new Notification.Builder(this,CHANNEL):new Notification.Builder(this);
  return b.setSmallIcon(android.R.drawable.ic_lock_lock).setContentTitle("ZeroPlay VPN ad blocker")
   .setContentText("DNS ad blocking active").setContentIntent(pending).setOngoing(true).build();
 }
 private void revert(){running=false;getSharedPreferences("zero",MODE_PRIVATE).edit()
  .putString(MODE,"original").putBoolean(ACTIVE,false).putBoolean("vpnAdblockStarting",false).putBoolean("blockAds",true).apply();}
 @Override public void onRevoke(){stopSelf();super.onRevoke();}
 @Override public void onDestroy(){
  live=false;running=false;
  try{if(tunnel!=null)tunnel.close();}catch(IOException ignored){}
  try{if(input!=null)input.close();}catch(IOException ignored){}
  try{if(output!=null)output.close();}catch(IOException ignored){}
  if(workers!=null)workers.shutdownNow();if(reader!=null)reader.interrupt();
  revert();super.onDestroy();
 }
}
