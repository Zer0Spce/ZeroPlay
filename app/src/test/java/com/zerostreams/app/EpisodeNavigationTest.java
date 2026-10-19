package com.zerostreams.app;

import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.Test;
import static org.junit.Assert.*;

public class EpisodeNavigationTest {
    private JSONArray episodes(int... numbers) throws Exception{
        JSONArray rows=new JSONArray();
        for(int n:numbers)rows.put(new JSONObject().put("episode",n).put("title","Episode "+n));
        return rows;
    }

    @Test public void resolvesRealEpisodeNumbersInsteadOfArrayIndexes() throws Exception{
        JSONArray rows=episodes(1,2,4,7);
        assertEquals(4,EpisodeNavigation.nextEpisode(rows,2));
        assertEquals(4,EpisodeNavigation.previousEpisode(rows,7));
        assertEquals(1,EpisodeNavigation.firstEpisode(rows));
        assertEquals(7,EpisodeNavigation.lastEpisode(rows));
    }

    @Test public void acceptsTmdbStyleEpisodeNumberField() throws Exception{
        JSONArray rows=new JSONArray()
            .put(new JSONObject().put("episode_number",3))
            .put(new JSONObject().put("episode_number",5));
        assertEquals(5,EpisodeNavigation.nextEpisode(rows,3));
    }

    @Test public void skipsEmptyAndMissingSeasons() throws Exception{
        JSONArray seasons=new JSONArray()
            .put(new JSONObject().put("season_number",0).put("episode_count",2))
            .put(new JSONObject().put("season_number",1).put("episode_count",8))
            .put(new JSONObject().put("season_number",2).put("episode_count",0))
            .put(new JSONObject().put("season_number",4).put("episode_count",10));
        assertEquals(4,EpisodeNavigation.nextSeason(seasons,1));
        assertEquals(1,EpisodeNavigation.previousSeason(seasons,4));
    }
}
