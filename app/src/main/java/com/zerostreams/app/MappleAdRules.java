package com.zerostreams.app;
import java.net.URI;
import java.util.Locale;
/** Only MappleTV player requests use these ad-network domain rules. */
final class MappleAdRules {
 private MappleAdRules(){}
 private static final String[] ADS={"doubleclick.net","googlesyndication.com","googleadservices.com","adsterra.com","adsterra.org","popads.net","popcash.net","propellerads.com","onclicka.com","onclicksuper.com","exoclick.com","exosrv.com","trafficjunky.net","juicyads.com","hilltopads.net","adnxs.com","adskeeper.com","mgid.com","taboola.com","outbrain.com","revcontent.com","pubmatic.com","rubiconproject.com","openx.net","smartadserver.com","criteo.com","criteo.net","casalemedia.com","contextweb.com","lijit.com","yieldmo.com","sovrn.com","inmobi.com","applovin.com","adsrvr.org","bidr.io","sharethrough.com","media.net","adform.net","popmyads.com"};
 static boolean isMapple(String url){try{URI u=URI.create(url);return "https".equalsIgnoreCase(u.getScheme())&&"mapple.fun".equalsIgnoreCase(u.getHost())&&u.getPath()!=null&&u.getPath().matches("/watch/(movie|tv)/.*");}catch(RuntimeException e){return false;}}
 static boolean blocks(String url){try{URI u=URI.create(url);String h=u.getHost();if(!"https".equalsIgnoreCase(u.getScheme())||h==null)return false;h=h.toLowerCase(Locale.ROOT);for(String d:ADS)if(h.equals(d)||h.endsWith("."+d))return true;return false;}catch(RuntimeException e){return false;}}
}
