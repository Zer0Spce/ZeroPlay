package com.zerostreams.app;
import org.junit.Test;
import org.json.*;
import java.util.*;
import static org.junit.Assert.*;
public class SearchFilters2260Test {
  private Catalog.Item item(int id,String type,int year,double rating,int genre) throws Exception {
    return new Catalog.Item(new JSONObject().put("id","tmdb-"+type+"-"+id).put("title","Title "+id)
      .put("type",type).put("year",year).put("rating",rating)
      .put("genreIds",new JSONArray().put(genre)).put("popularity",rating*10)
      .put("releaseDate",year+"-04-01"));
  }
  @Test public void filtersReleaseYearMediaRatingAndGenre() throws Exception {
    List<Catalog.Item> rows=Arrays.asList(item(1,"movie",2026,7.5,18),item(2,"series",2025,8,18),item(3,"movie",2026,4,35));
    SearchFilters2260.Options opts=new SearchFilters2260.Options();
    opts.media="movie";opts.year=2026;opts.rating=7;opts.genre=18;
    assertEquals(1,SearchFilters2260.filter(rows,opts).size());
    assertEquals("tmdb-movie-1",SearchFilters2260.filter(rows,opts).get(0).id);
  }
  @Test public void subscriptionCheckExcludesRentAndOtherRegions() throws Exception{
    JSONObject all=new JSONObject().put("results",new JSONObject().put("US",new JSONObject()
      .put("flatrate",new JSONArray().put(new JSONObject().put("provider_id",8)))
      .put("rent",new JSONArray().put(new JSONObject().put("provider_id",15))))
      .put("GB",new JSONObject().put("flatrate",new JSONArray().put(new JSONObject().put("provider_id",15)))));
    assertTrue(SearchFilters2260.usFlatRate(all,8));
    assertFalse(SearchFilters2260.usFlatRate(all,15));
  }
  @Test public void failedProviderLookupDoesNotClaimAvailability() throws Exception{
    List<Catalog.Item> rows=Arrays.asList(item(1,"movie",2026,7,18),item(2,"movie",2026,7,18));
    SearchFilters2260.Result got=SearchFilters2260.verify(rows,row->{
      if(row.id.endsWith("2"))throw new Exception("Network unavailable");
      return true;
    });
    assertEquals(1,got.rows.size());assertEquals(1,got.unverified);
  }
}
