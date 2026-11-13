package com.zerostreams.app;
import org.junit.Test;
import org.json.*;
import java.util.*;
import static org.junit.Assert.*;
public class StreamingTopTenTest {
    @Test public void recognizesEightProvidersWithoutRentalOrUnrelatedSites() throws Exception {
        JSONArray rows=new JSONArray();
        String[] names={"Netflix","Hulu","Disney+","HBO Max","Apple TV+","Paramount+","Peacock","YouTube TV"};
        for(int i=0;i<names.length;i++)
            rows.put(new JSONObject().put("provider_id",i+1).put("provider_name",names[i])
                .put("display_priorities",new JSONObject().put("US",1)));
        rows.put(new JSONObject().put("provider_id",900).put("provider_name","Apple TV"));
        rows.put(new JSONObject().put("provider_id",901).put("provider_name","Amazon Prime Video"));
        assertEquals(Arrays.asList(1,2,3,4,5,6,7,8),StreamingTopTen.providerIds(rows));
        assertEquals("",StreamingTopTen.brand("Apple TV"));
        assertEquals("",StreamingTopTen.brand("YouTube"));
    }
    @Test public void unavailableUSServicesAreNeverInvented() throws Exception {
        JSONArray rows=new JSONArray().put(new JSONObject().put("provider_id",8).put("provider_name","Netflix")
            .put("display_priorities",new JSONObject().put("GB",1)));
        assertTrue(StreamingTopTen.providerIds(rows).isEmpty());
    }
    @Test public void onlyRecentActualMovieEntriesCanAppear() throws Exception {
        List<Catalog.Item> rows=new ArrayList<>();
        for(int i=1;i<=22;i++)rows.add(item(i,"2026-10-01",100,"https://image.tmdb.org/1"));
        rows.add(item(500,"2027-01-01",100,"https://image.tmdb.org/1"));
        rows.add(item(501,"2024-11-10",100,"https://image.tmdb.org/1"));
        rows.add(item(502,"2026-10-01",0,"https://image.tmdb.org/1"));
        rows.add(item(503,"2026-10-01",100,""));
        long now=java.time.Instant.parse("2026-11-13T12:00:00Z").toEpochMilli();
        List<Catalog.Item> chosen=StreamingTopTen.select(rows,10,now);
        assertEquals(10,chosen.size());
        for(Catalog.Item row:chosen)assertTrue(row.raw.optString("releaseDate").compareTo("2026-11-13")<=0);
        assertEquals(chosen.get(0).id,StreamingTopTen.select(rows,10,now).get(0).id);
    }
    private static Catalog.Item item(int id,String date,int votes,String backdrop) throws Exception{
        return new Catalog.Item(new JSONObject().put("id","tmdb-movie-"+id).put("type","movie")
        .put("title","Movie "+id).put("poster","https://image.tmdb.org/2").put("backdrop",backdrop)
        .put("popularity",30).put("voteCount",votes).put("releaseDate",date));
    }
}
