from pathlib import Path

path=Path('app/src/main/java/com/zerostreams/app/BrowserPlayerActivity.java')
text=path.read_text()

old='private android.content.SharedPreferences prefs;private LinearLayout quickBar;private Runnable hideQuickBar;private long loadStarted;private boolean failoverTried,nextScheduled;private String currentAddress;private String navigationMode="smart";'
new='private android.content.SharedPreferences prefs;private LinearLayout quickBar;private Runnable hideQuickBar;private long loadStarted;private boolean failoverTried,nextScheduled;private String currentAddress;private String navigationMode="smart";private volatile int observedSeason=-1,observedEpisode=-1;'
if old not in text:
    raise SystemExit('Play Next field marker not found')
text=text.replace(old,new,1)

def replace_between(source,start_marker,end_marker,replacement):
    start=source.find(start_marker)
    if start<0: raise SystemExit('Missing start marker: '+start_marker)
    end=source.find(end_marker,start)
    if end<0: raise SystemExit('Missing end marker: '+end_marker)
    return source[:start]+replacement+source[end:]

alternate='''    private String alternateUrl(){
        String parent=getIntent().getStringExtra("parent");
        if(parent==null||!parent.matches("tmdb-(movie|series)-[0-9]+"))return "";
        String id=parent.substring(parent.lastIndexOf('-')+1),type=parent.startsWith("tmdb-series-")?"tv":"movie";
        int season=1,episode=1;
        if(type.equals("tv")){int[] pos=currentEpisodePosition();season=pos[0];episode=pos[1];}
        String current=currentProvider(),next=current.equals("vidstuck")?"zxcstream":current.equals("zxcstream")?"embedwave":current.equals("embedwave")?"vidsrc-sh":"vidstuck";
        try{return PlaybackSources.url(id,type,season,episode,next);}catch(Exception e){return "";}
    }
'''
text=replace_between(text,'    private String alternateUrl()','    private boolean loadNextSource()',alternate)

episode_helpers='''    private int[] currentEpisodePosition(){
        if(observedSeason>=0&&observedEpisode>0)return new int[]{observedSeason,observedEpisode};
        try{
            java.util.regex.Matcher url=java.util.regex.Pattern.compile("/(?:embed|player)/tv/[0-9]+/([0-9]+)/([0-9]+)").matcher(String.valueOf(currentAddress));
            if(url.find())return new int[]{Integer.parseInt(url.group(1)),Integer.parseInt(url.group(2))};
            String key=getIntent().getStringExtra("key");
            java.util.regex.Matcher saved=java.util.regex.Pattern.compile(":s([0-9]+)e([0-9]+)$").matcher(String.valueOf(key));
            if(saved.find())return new int[]{Integer.parseInt(saved.group(1)),Integer.parseInt(saved.group(2))};
        }catch(Exception ignored){}
        return new int[]{1,1};
    }
    private String tmdbKey(){String tmdb=prefs.getString("tmdbKey","").trim();return tmdb.isEmpty()?BuildConfig.DEFAULT_TMDB_KEY:tmdb;}
    private int[] adjacentEpisodePosition(int season,int episode,int delta,String tmdb) throws Exception{
        org.json.JSONArray current=ContentApi.seasonEpisodes(seriesId(),season,tmdb);
        int within=delta>0?EpisodeNavigation.nextEpisode(current,episode):EpisodeNavigation.previousEpisode(current,episode);
        if(within>0)return new int[]{season,within};
        org.json.JSONArray seasons=ContentApi.seasons(seriesId(),tmdb);
        int candidate=delta>0?EpisodeNavigation.nextSeason(seasons,season):EpisodeNavigation.previousSeason(seasons,season);
        while(candidate>=0){
            try{
                org.json.JSONArray rows=ContentApi.seasonEpisodes(seriesId(),candidate,tmdb);
                int edge=delta>0?EpisodeNavigation.firstEpisode(rows):EpisodeNavigation.lastEpisode(rows);
                if(edge>0)return new int[]{candidate,edge};
            }catch(Exception ignored){}
            candidate=delta>0?EpisodeNavigation.nextSeason(seasons,candidate):EpisodeNavigation.previousSeason(seasons,candidate);
        }
        throw new Exception("No adjacent episode");
    }
    private void loadEpisode(int season,int episode){
        if(!seriesPlayback()||season<0||episode<1)return;
        try{
            String url=PlaybackSources.url(seriesId(),"tv",season,episode,currentProvider());
            observedSeason=season;observedEpisode=episode;currentAddress=url;nextScheduled=false;failoverTried=false;loadStarted=android.os.SystemClock.elapsedRealtime();
            status.setText("Opening S"+season+" E"+episode+"…");web.loadUrl(url);scheduleLoadTimeout();
        }catch(Exception e){nextScheduled=false;Toast.makeText(this,"Episode unavailable",Toast.LENGTH_SHORT).show();}
    }
    private void moveEpisode(int delta){
        if(!seriesPlayback()||delta==0)return;int[] pos=currentEpisodePosition();
        new Thread(()->{try{int[] target=adjacentEpisodePosition(pos[0],pos[1],delta,tmdbKey());tvUi.post(()->loadEpisode(target[0],target[1]));}catch(Exception e){tvUi.post(()->Toast.makeText(this,delta>0?"No next episode":"No previous episode",Toast.LENGTH_SHORT).show());}},"ZeroPlay-EpisodeNav").start();
    }
    private void showEpisodeMenu(){
        if(!seriesPlayback())return;int[] pos=currentEpisodePosition();
        new Thread(()->{try{
            org.json.JSONArray episodes=ContentApi.seasonEpisodes(seriesId(),pos[0],tmdbKey());java.util.ArrayList<String> labels=new java.util.ArrayList<>();labels.add("← Previous episode");labels.add("Next episode →");java.util.ArrayList<Integer> numbers=new java.util.ArrayList<>();
            for(int i=0;i<episodes.length();i++){org.json.JSONObject ep=episodes.optJSONObject(i);if(ep==null)continue;int number=EpisodeNavigation.episodeNumber(ep,i+1);if(number<1)continue;numbers.add(number);labels.add((number==pos[1]?"▶ ":"")+"E"+number+" · "+ep.optString("title","Episode "+number));}
            tvUi.post(()->new android.app.AlertDialog.Builder(this).setTitle("Season "+pos[0]+" episodes").setItems(labels.toArray(new String[0]),(d,n)->{if(n==0)moveEpisode(-1);else if(n==1)moveEpisode(1);else{int index=n-2;if(index>=0&&index<numbers.size())loadEpisode(pos[0],numbers.get(index));}}).setNegativeButton("Close",null).show());
        }catch(Exception e){tvUi.post(()->Toast.makeText(this,"Episodes unavailable",Toast.LENGTH_SHORT).show());}},"ZeroPlay-EpisodeMenu").start();
    }
'''
text=replace_between(text,'    private int[] currentEpisodePosition()','    private void showQuickMenu()',episode_helpers)

schedule='''    private void scheduleNextEpisode(String parent,int season,int episode){
        if(nextScheduled||!seriesPlayback()||season<0||episode<1)return;
        nextScheduled=true;
        final int fromSeason=season,fromEpisode=episode;
        new Thread(()->{try{
            int[] target=adjacentEpisodePosition(fromSeason,fromEpisode,1,tmdbKey());
            tvUi.post(()->{
                if(isFinishing()||web==null){nextScheduled=false;return;}
                int[] now=currentEpisodePosition();if(now[0]!=fromSeason||now[1]!=fromEpisode){nextScheduled=false;return;}
                Toast.makeText(this,"Next episode starts in 10 seconds · press Back/Menu to cancel by leaving playback",Toast.LENGTH_LONG).show();
                tvUi.postDelayed(()->{
                    if(isFinishing()||web==null){nextScheduled=false;return;}
                    int[] still=currentEpisodePosition();if(still[0]!=fromSeason||still[1]!=fromEpisode){nextScheduled=false;return;}
                    loadEpisode(target[0],target[1]);
                },10000);
            });
        }catch(Exception e){nextScheduled=false;}},"ZeroPlay-AutoplayNext").start();
    }
'''
text=replace_between(text,'    private void scheduleNextEpisode(','    private void installPlayerExitListener()',schedule)

old_progress='history.progress(parent,type,event);if(type.equals("tv")&&prefs.getBoolean("autoplayNext",true)&&event.optDouble("duration",0)>30&&event.optDouble("timestamp",0)/event.optDouble("duration",1)>=.985)scheduleNextEpisode(parent,event.optInt("season",1),event.optInt("episode",1));'
new_progress='history.progress(parent,type,event);if(type.equals("tv")){int season=event.optInt("season",-1),episode=event.optInt("episode",-1);if(season>=0&&episode>0){observedSeason=season;observedEpisode=episode;if(prefs.getBoolean("autoplayNext",true)&&event.optDouble("duration",0)>30&&event.optDouble("timestamp",0)/event.optDouble("duration",1)>=.985)scheduleNextEpisode(parent,season,episode);}}'
if old_progress not in text:
    raise SystemExit('Progress autoplay marker not found')
text=text.replace(old_progress,new_progress,1)

path.write_text(text)
