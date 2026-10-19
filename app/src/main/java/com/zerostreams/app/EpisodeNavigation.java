package com.zerostreams.app;

import org.json.JSONArray;
import org.json.JSONObject;

/** Pure episode/season navigation helpers shared by the embedded-player controls. */
final class EpisodeNavigation {
    private EpisodeNavigation(){}

    static int episodeNumber(JSONObject episode,int fallback){
        if(episode==null)return -1;
        int number=episode.optInt("episode",0);
        if(number<=0)number=episode.optInt("episode_number",fallback);
        return number>0?number:-1;
    }

    static int firstEpisode(JSONArray episodes){
        int best=Integer.MAX_VALUE;
        if(episodes!=null)for(int i=0;i<episodes.length();i++){
            int number=episodeNumber(episodes.optJSONObject(i),i+1);
            if(number>0&&number<best)best=number;
        }
        return best==Integer.MAX_VALUE?-1:best;
    }

    static int lastEpisode(JSONArray episodes){
        int best=-1;
        if(episodes!=null)for(int i=0;i<episodes.length();i++){
            int number=episodeNumber(episodes.optJSONObject(i),i+1);
            if(number>best)best=number;
        }
        return best;
    }

    static int nextEpisode(JSONArray episodes,int current){
        int best=Integer.MAX_VALUE;
        if(episodes!=null)for(int i=0;i<episodes.length();i++){
            int number=episodeNumber(episodes.optJSONObject(i),i+1);
            if(number>current&&number<best)best=number;
        }
        return best==Integer.MAX_VALUE?-1:best;
    }

    static int previousEpisode(JSONArray episodes,int current){
        int best=-1;
        if(episodes!=null)for(int i=0;i<episodes.length();i++){
            int number=episodeNumber(episodes.optJSONObject(i),i+1);
            if(number>0&&number<current&&number>best)best=number;
        }
        return best;
    }

    static int nextSeason(JSONArray seasons,int current){return adjacentSeason(seasons,current,true);}
    static int previousSeason(JSONArray seasons,int current){return adjacentSeason(seasons,current,false);}

    private static int adjacentSeason(JSONArray seasons,int current,boolean forward){
        int best=forward?Integer.MAX_VALUE:-1;
        if(seasons!=null)for(int i=0;i<seasons.length();i++){
            JSONObject row=seasons.optJSONObject(i);if(row==null)continue;
            int number=row.optInt("season_number",-1);
            if(number<0||row.has("episode_count")&&row.optInt("episode_count",0)<1)continue;
            if(forward&&number>current&&number<best)best=number;
            if(!forward&&number<current&&number>best)best=number;
        }
        return forward&&best==Integer.MAX_VALUE?-1:best;
    }
}
