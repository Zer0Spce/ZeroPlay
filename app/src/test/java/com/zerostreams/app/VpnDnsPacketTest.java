package com.zerostreams.app;
import org.junit.Test;
import java.util.*;
import static org.junit.Assert.*;
public class VpnDnsPacketTest {
 static byte[] query(String domain) {
  java.io.ByteArrayOutputStream dns=new java.io.ByteArrayOutputStream();
  for(byte b:new byte[]{0x12,0x34,1,0,0,1,0,0,0,0,0,0})dns.write(b);
  for(String part:domain.split("\\.")){dns.write(part.length());for(char c:part.toCharArray())dns.write((byte)c);}
  for(byte b:new byte[]{0,0,1,0,1})dns.write(b);
  byte[] body=dns.toByteArray(),pkt=new byte[28+body.length];
  pkt[0]=0x45;pkt[2]=(byte)(pkt.length>>8);pkt[3]=(byte)pkt.length;pkt[8]=64;pkt[9]=17;
  pkt[12]=10;pkt[13]=119;pkt[14]=0;pkt[15]=2;
  pkt[16]=10;pkt[17]=119;pkt[18]=0;pkt[19]=1;
  pkt[20]=(byte)0xea;pkt[21]=0x60;pkt[23]=53;
  int l=8+body.length;pkt[24]=(byte)(l>>8);pkt[25]=(byte)l;
  System.arraycopy(body,0,pkt,28,body.length);return pkt;
 }
 @Test public void parseAndBlockResponse(){byte[] bytes=query("ads.doubleclick.net");
  VpnDnsPacket.Query q=VpnDnsPacket.parse(bytes,bytes.length);
  assertNotNull(q);assertEquals("ads.doubleclick.net",q.domain);
  assertEquals(60000,q.sourcePort);
  byte[] denied=VpnDnsPacket.error(q,3);
  assertEquals(3,denied[3]&15);
  byte[] response=VpnDnsPacket.reply(q,denied);
  assertNotNull(response);assertEquals(53,VpnDnsPacket.u16(response,20));
  assertEquals(60000,VpnDnsPacket.u16(response,22));
  assertEquals(10,response[12]);assertEquals(10,response[16]);
 }
 @Test public void malformedAndNonDnsPacketsIgnored(){
  byte[] q=query("mapple.fun");q[9]=6;
  assertNull(VpnDnsPacket.parse(q,q.length));
  q=query("mapple.fun");q[23]=80;
  assertNull(VpnDnsPacket.parse(q,q.length));
 }
 @Test public void protectedVideoHostsRemainAllowed(){
  for(String h:new String[]{"mapple.fun","x.mapple.fun","vidstuck.cc","cdn.akamaized.net","edge.cloudflarestream.com"})
   assertTrue(ZeroVpnAdblockService.allowed(h));
  assertFalse(ZeroVpnAdblockService.allowed("doubleclick.net"));
 }
}
