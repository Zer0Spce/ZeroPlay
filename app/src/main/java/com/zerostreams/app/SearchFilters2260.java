package com.zerostreams.app;

import java.util.*;
import org.json.*;

/** v2.2.6 TEST. Filters loaded search-result pages without claiming global coverage. */
final class SearchFilters2260 {
  static final String[] BRANDS={"netflix","hulu","disney","max","apple","paramount","peacock","youtube-tv"};
  static final class Options {
    String media="all",provider="",sort="relevance";int year=0,genre=0;double rating=0;
    Options copy(){Options c=new Options();c.media=media;c.provider=provider;c.sort=sort;c.year=year;c.genre=genre;c.rating=rating;return c;}
  }
  interface ProviderVerifier {boolean isListed(Catalog.Item item) throws Exception;}
  static final class Result{
    final List<Catalog.Item> rows;final int unverified;
    Result(List<Catalog.Item> rows,int unverified){this.rows=rows;this.unverified=unverified;}
  }
  static boolean approved(String name){for(String s:BRANDS)if(s.equals(name))return true;return false;}
  static List<Catalog.Item> filter(List<Catalog.Item> input,Options o){
    List<Catalog.Item> result=new ArrayList<>();
    for(Catalog.Item item:input){
      if(!item.type.equals("movie")&&!item.type.equals("series"))continue;
      if(!o.media.equals("all")&&!o.media.equals(item.type))continue;
      if(o.year>0&&item.year!=o.year)continue;
      if(o.rating>0&&item.raw.optDouble("rating",0)<o.rating)continue;
      if(o.genre>0){
        JSONArray genres=item.raw.optJSONArray("genreIds");boolean found=false;
        for(int i=0;genres!=null&&i<genres.length();i++)if(genres.optInt(i)==o.genre){found=true;break;}
        if(!found)continue;
      }
      result.add(item);
    }
    Comparator<Catalog.Item> sort=null;
    switch(o.sort){
      case "popular":sort=(a,b)->Double.compare(b.raw.optDouble("popularity",0),a.raw.optDouble("popularity",0));break;
      case "rating":sort=(a,b)->Double.compare(b.raw.optDouble("rating",0),a.raw.optDouble("rating",0));break;
      case "newest":sort=(a,b)->b.raw.optString("releaseDate","").compareTo(a.raw.optString("releaseDate",""));break;
      case "az":sort=Comparator.comparing(a->a.title.toLowerCase(Locale.ROOT));break;
    }
    if(sort!=null)Collections.sort(result,sort);
    return result;
  }
  static boolean usFlatRate(JSONObject response,int providerId){
    if(providerId<=0)return false;
    JSONObject all=response==null?null:response.optJSONObject("results");
    JSONObject us=all==null?null:all.optJSONObject("US");
    JSONArray flat=us==null?null:us.optJSONArray("flatrate");
    for(int i=0;flat!=null&&i<flat.length();i++){
      JSONObject row=flat.optJSONObject(i);
      if(row!=null&&row.optInt("provider_id")==providerId)return true;
    }
    return false;
  }
  static Result verify(List<Catalog.Item> rows,ProviderVerifier checker){
    List<Catalog.Item> matching=new ArrayList<>();int unknown=0;
    for(Catalog.Item row:rows)try{if(checker.isListed(row))matching.add(row);}
    catch(Exception e){unknown++;}
    return new Result(matching,unknown);
  }
}
