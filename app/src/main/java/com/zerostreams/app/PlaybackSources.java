package com.zerostreams.app;
import java.net.URI;
final class PlaybackSources {
    static final String[] IDS={"vidstuck","zxcstream","embedwave","vidsrc-sh","vidrock","vidnest","vidrift","nexstream","embedmaster","vidfast","vidapi","mappletv","vidly","vidcore","chillflix","rawcast"};
    static final String[] NAMES={"VidStuck","ZXCStream (Beta)","Embedwave (BETA)","VidSrc [Offline]","Vidrock.to [Offline]","VidNest","VidRift","NexStream","EmbedMaster","VidFast","VidAPI","MappleTV (4K HDR)","Vidly (4K)","Vidcore (4K)","Chillflix (4K)","RawCast · Limited API quota"};
    static final String[] ORIGINS={"https://vidstuck.cc","https://zxcstream.cc","https://embedwave.cc","https://vidsrc.sh","https://vidrock.to","https://vidnest.fun","https://embed.vidrift.net","https://api.codespecters.com","https://embedmaster.link","https://vidfast.vc","https://vaplayer.ru","https://mapple.fun","https://vidly.pro","https://vidcore.org","https://www.chillflix.pw"};
    static int index(String id){for(int i=0;i<IDS.length;i++)if(IDS[i].equals(id))return i;return 0;}
    static boolean trusted(String address){try{URI u=new URI(address);if(!"https".equals(u.getScheme())||u.getPort()!=-1&&u.getPort()!=443)return false;for(String origin:ORIGINS)if(new URI(origin).getHost().equals(u.getHost()))return true;}catch(Exception ignored){}return false;}
    static String url(String id,String type,int season,int episode,String provider){
        if(!id.matches("[1-9][0-9]*")||!type.equals("movie")&&!type.equals("tv")||season<0||episode<1)throw new IllegalArgumentException("Invalid title or episode");
        provider=IDS[index(provider)];if(provider.equals("rawcast"))throw new IllegalArgumentException("RawCast requires secure API resolution");
        String host=provider.equals("nexstream")?"api.codespecters.com":provider.equals("embedmaster")?"embedmaster.link":provider.equals("mappletv")?"mapple.fun":provider.equals("vidly")?"vidly.pro":provider.equals("vidcore")?"vidcore.org":provider.equals("chillflix")?"www.chillflix.pw":provider.equals("vidsrc-sh")?"vidsrc.sh":provider.equals("vidrock")?"vidrock.to":provider.equals("vidnest")?"vidnest.fun":provider.equals("vidrift")?"embed.vidrift.net":provider.equals("vidfast")?"vidfast.vc":provider.equals("vidapi")?"vaplayer.ru":provider.equals("embedwave")?"embedwave.cc":provider.equals("zxcstream")?"zxcstream.cc":"vidstuck.cc";
        String value=provider.equals("mappletv")
            ?"https://"+host+"/watch/"+type+"/"+id+(type.equals("tv")?"-"+season+"-"+episode:"")
            :provider.equals("vidrift")||provider.equals("vidapi")||provider.equals("vidcore")||provider.equals("chillflix")
            ?"https://"+host+"/embed/"+type+"/"+id+(type.equals("tv")?"/"+season+"/"+episode:"")
            :provider.equals("vidrock")||provider.equals("vidnest")||provider.equals("vidfast")||provider.equals("vidly")
            ?"https://"+host+"/"+type+"/"+id+(type.equals("tv")?"/"+season+"/"+episode:"")
            :provider.equals("zxcstream")
            ?"https://"+host+"/player/"+type+"/"+id+(type.equals("tv")?"/"+season+"/"+episode:"")+"?domainAd=zeroplay&color=DF2531&autoplay=true"
            :"https://"+host+"/embed/"+type+"/"+id+(type.equals("tv")?"/"+season+"/"+episode:"");
        // ZeroPlay owns automatic next-episode switching on Android. Keep the provider's
        // episode selector/next button, but do not let the embed auto-advance at the same
        // time or both systems can race and land on an invalid/double-advanced episode.
        if(provider.equals("nexstream")){String token=BuildConfig.NEXSTREAM_API_KEY;if(token==null||!token.matches("nx_[A-Za-z0-9]+"))throw new IllegalStateException("NexStream API key is not configured");return value+"?apikey="+token;}
        if(provider.equals("embedmaster"))return value+"?skin=onyx&welcome_page=off";
        if(provider.equals("vidstuck"))return value+"?branding=ZeroPlay&color=DF2531&subtitle=english&overlay=true"+(type.equals("tv")?"&nextEpisode=true&episodeSelector=true":"");
        if(provider.equals("vidsrc-sh"))return value+"?ds_lang=en";
        if(provider.equals("chillflix"))return value+"?prefer4k=1&watchparty=false"+(type.equals("tv")?"&autonext=false":"");
        if(provider.equals("vidly")&&type.equals("tv"))return value+"?nextEpisode=0";
        return value;
    }
}
