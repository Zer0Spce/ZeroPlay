package com.zerostreams.app;
import java.util.*;
/** IPv4 UDP DNS packet parser/writer for the protected, DNS-only VPN route. */
final class VpnDnsPacket {
 static final class Query {
  byte[] source=new byte[4],destination=new byte[4],dns;
  String domain;int sourcePort,id,questionEnd;
 }
 static int u(byte[] a,int i){return a[i]&255;}
 static int u16(byte[] a,int i){return (u(a,i)<<8)|u(a,i+1);}
 static void p16(byte[] a,int i,int v){a[i]=(byte)(v>>>8);a[i+1]=(byte)v;}
 static Query parse(byte[] packet,int length){
  if(packet==null||length<40||u(packet,0)>>4!=4)return null;
  int ihl=(u(packet,0)&15)*4;
  if(ihl<20||ihl+20>length||u(packet,9)!=17)return null;
  int total=u16(packet,2),udplen=u16(packet,ihl+4);
  if(total>length||total<ihl+20||ihl+udplen>total||udplen<20||u16(packet,ihl+2)!=53|| (u16(packet,6)&0x3fff)!=0)return null;
  int dns=ihl+8;
  if(u16(packet,dns+4)!=1)return null;
  int pos=dns+12,stop=ihl+udplen;StringBuilder name=new StringBuilder();
  int labels=0;
  while(pos<stop){
   int n=u(packet,pos++);
   if(n==0)break;
   if(n>63||pos+n>stop||++labels>50)return null;
   if(name.length()>0)name.append('.');
   for(int i=0;i<n;i++){int c=u(packet,pos+i);if(c<33||c>126)return null;name.append((char)c);}
   pos+=n;
  }
  if(pos+4>stop||name.length()==0||name.length()>253)return null;
  Query q=new Query();System.arraycopy(packet,12,q.source,0,4);System.arraycopy(packet,16,q.destination,0,4);
  q.sourcePort=u16(packet,ihl);q.id=u16(packet,4);q.questionEnd=pos+4-dns;
  q.dns=Arrays.copyOfRange(packet,dns,stop);q.domain=name.toString().toLowerCase(Locale.ROOT);
  return q;
 }
 static byte[] error(Query q,int code){
  byte[] a=Arrays.copyOf(q.dns,q.questionEnd);a[2]=(byte)0x81;a[3]=(byte)((q.dns[3]&0x10)|0x80|(code&15));
  for(int i=6;i<12;i++)a[i]=0;return a;
 }
 static byte[] reply(Query q,byte[] dns){
  if(q==null||dns==null||dns.length<12||dns.length>1400)return null;
  byte[] a=new byte[28+dns.length];a[0]=0x45;p16(a,2,a.length);p16(a,4,q.id);
  a[8]=64;a[9]=17;System.arraycopy(q.destination,0,a,12,4);System.arraycopy(q.source,0,a,16,4);
  p16(a,20,53);p16(a,22,q.sourcePort);p16(a,24,8+dns.length);
  System.arraycopy(dns,0,a,28,dns.length);p16(a,10,ipChecksum(a));return a;
 }
 static int ipChecksum(byte[] a){
  int sum=0;for(int i=0;i<20;i+=2)sum+=(u(a,i)<<8)|u(a,i+1);
  while((sum>>>16)>0)sum=(sum&65535)+(sum>>>16);
  return (~sum)&65535;
 }
}
