package com.zerostreams.app;

import android.graphics.*;
import android.graphics.drawable.GradientDrawable;
import android.os.*;
import android.view.*;
import android.widget.*;
import java.lang.reflect.Field;
import java.util.*;
import java.util.concurrent.*;
import org.json.*;

/** Final release-test activity: supplies the corrected 15-second featured carousel. */
public class ReleaseMainActivity extends FinalMainActivity {
    private final Handler carouselUi=new Handler(Looper.getMainLooper());
    private final ExecutorService providerIo=Executors.newSingleThreadExecutor();
    private final Map<String,String> verifiedProviderCache=new ConcurrentHashMap<>();
    private final Set<String> pendingProviderChecks=ConcurrentHashMap.newKeySet();

    private LinearLayout contentHost(){try{Field f=MainActivity.class.getDeclaredField("content");f.setAccessible(true);return (LinearLayout)f.get(this);}catch(Exception e){return null;}}

    @Override void carousel(List<Catalog.Item> all,int token){
        final LinearLayout host=contentHost();if(host==null||all.isEmpty()){super.carousel(all,token);return;}
        final List<Catalog.Item> picks=carouselSourceItems(all);if(picks.isEmpty())return;
        final int[] index={0};final FrameLayout hero=new FrameLayout(this);hero.setBackground(shape(SURFACE,0));hero.setClipToOutline(!flixLayout());
        final ImageView art=new ImageView(this);art.setScaleType(ImageView.ScaleType.CENTER_CROP);hero.addView(art,new FrameLayout.LayoutParams(-1,-1));
        View shade=new View(this);shade.setBackground(new GradientDrawable(GradientDrawable.Orientation.LEFT_RIGHT,flixLayout()?new int[]{Color.argb(245,0,0,0),Color.argb(190,0,0,0),Color.argb(40,0,0,0)}:new int[]{tint(0xF5),tint(0xB8),tint(0x68)}));hero.addView(shade,new FrameLayout.LayoutParams(-1,-1));
        View bottom=new View(this);bottom.setBackground(new GradientDrawable(GradientDrawable.Orientation.TOP_BOTTOM,new int[]{tint(0),tint(flixLayout()?0xFA:0xEE)}));hero.addView(bottom,new FrameLayout.LayoutParams(-1,-1));
        LinearLayout info=column();info.setPadding(dp(googleLayout()?36:24),dp(googleLayout()?34:24),dp(googleLayout()?30:20),dp(googleLayout()?34:20));FrameLayout.LayoutParams ip=new FrameLayout.LayoutParams(BuildConfig.TV?dp(googleLayout()?620:520):-1,-2,Gravity.START|Gravity.BOTTOM);hero.addView(info,ip);
        TextView eyebrow=text(carouselEyebrow(),11,googleLayout()?INK:ACCENT);eyebrow.setLetterSpacing(.12f);info.addView(eyebrow);space(info,10);
        final TextView title=text("",BuildConfig.TV?(flixLayout()?58:googleLayout()?50:37):flixLayout()?40:googleLayout()?36:29,INK);bold(title);title.setMaxLines(2);info.addView(title);space(info,8);
        final TextView facts=text("",13,INK);info.addView(facts);space(info,6);
        // This is the actual carousel used by the TV launcher. The old MainActivity.carousel
        // is overridden, and edits there never reached users.
        LinearLayout sourceRow=new LinearLayout(this);
        sourceRow.setOrientation(LinearLayout.HORIZONTAL);
        sourceRow.setGravity(Gravity.CENTER_VERTICAL|Gravity.LEFT);
        sourceRow.setMinimumHeight(dp(44));
        sourceRow.setContentDescription("Streaming provider");
        ImageView sourceLogo=new ImageView(this);
        sourceLogo.setScaleType(ImageView.ScaleType.FIT_START);
        sourceLogo.setVisibility(View.GONE);
        sourceRow.addView(sourceLogo,new LinearLayout.LayoutParams(dp(BuildConfig.TV?150:120),dp(40)));
        TextView sourceLabel=text("Checking streaming source…",BuildConfig.TV?17:14,INK);
        bold(sourceLabel);
        sourceLabel.setSingleLine(true);
        sourceRow.addView(sourceLabel,new LinearLayout.LayoutParams(-2,dp(42)));
        info.addView(sourceRow,new LinearLayout.LayoutParams(-1,dp(44)));
        space(info,7);
        final TextView description=text("",flixLayout()?16:googleLayout()?15:14,flixLayout()?Color.rgb(235,235,235):MUTED);description.setMaxLines(googleLayout()?2:3);description.setEllipsize(android.text.TextUtils.TruncateAt.END);info.addView(description);space(info,16);
        LinearLayout actions=new LinearLayout(this);Button play=button("Watch now",()->resume(picks.get(index[0])));play.setTextColor(BG);play.setBackground(shape(ACCENT,0));actions.addView(play);Button more=button("More info",()->details(picks.get(index[0])));LinearLayout.LayoutParams mp=new LinearLayout.LayoutParams(-2,dp(44));mp.setMargins(dp(10),0,0,0);actions.addView(more,mp);info.addView(actions);space(info,12);
        LinearLayout nav=new LinearLayout(this);final List<Button> dots=new ArrayList<>();final Runnable[] paint=new Runnable[1],next=new Runnable[1],prev=new Runnable[1];Button previous=button("‹",()->prev[0].run());nav.addView(previous,new LinearLayout.LayoutParams(dp(38),dp(32)));for(int i=0;i<picks.size();i++){final int n=i;Button dot=button("•",()->{if(n==index[0])return;boolean forward=(n-index[0]+picks.size())%picks.size()<=picks.size()/2;Runnable change=()->{index[0]=n;paint[0].run();};animateHero(hero,forward,change);});dot.setContentDescription("Featured title "+(i+1)+": "+picks.get(i).title);dots.add(dot);nav.addView(dot,new LinearLayout.LayoutParams(dp(30),dp(32)));}Button following=button("›",()->next[0].run());nav.addView(following,new LinearLayout.LayoutParams(dp(38),dp(32)));info.addView(nav);
        Button refreshPicks=button("↻ Refresh picks",this::refreshHomePicks);
        refreshPicks.setTag("zeroplay-2264-test2-refresh");
        refreshPicks.setContentDescription("Refresh carousel picks");
        refreshPicks.setAllCaps(false);
        refreshPicks.setTextColor(Color.WHITE);
        refreshPicks.setTextSize(16);
        refreshPicks.setTypeface(null,Typeface.BOLD);
        refreshPicks.setPadding(dp(20),0,dp(20),0);
        refreshPicks.setBackground(shape(Color.rgb(226,29,47),Color.WHITE));
        refreshPicks.setFocusable(true);
        refreshPicks.setClickable(true);
        refreshPicks.setOnFocusChangeListener((v,focused)->{
            refreshPicks.setTextColor(Color.WHITE);
            refreshPicks.setBackground(shape(focused?Color.rgb(255,67,77):Color.rgb(226,29,47),Color.WHITE));
        });
        FrameLayout.LayoutParams refreshAtTopRight=new FrameLayout.LayoutParams(-2,dp(49),Gravity.TOP|Gravity.RIGHT);
        refreshAtTopRight.topMargin=dp(18);
        refreshAtTopRight.rightMargin=dp(18);
        hero.addView(refreshPicks,refreshAtTopRight);
        refreshPicks.setElevation(dp(32));
        refreshPicks.bringToFront();
        TextView testMarker=text("2.2.6.4 TEST2",10,Color.WHITE);
        testMarker.setPadding(dp(10),dp(3),dp(10),dp(3));
        testMarker.setBackground(shape(Color.argb(215,44,44,49),0));
        FrameLayout.LayoutParams markerAtTopLeft=new FrameLayout.LayoutParams(-2,dp(27),Gravity.TOP|Gravity.LEFT);
        markerAtTopLeft.leftMargin=dp(15);
        markerAtTopLeft.topMargin=dp(15);
        hero.addView(testMarker,markerAtTopLeft);
        testMarker.setElevation(dp(31));
        paint[0]=()->{Catalog.Item item=picks.get(index[0]);atmosphere(item,token);title.setText(item.title);facts.setText(meta(item));showVerifiedStreamingSource(item,title,sourceLogo,sourceLabel);description.setText(item.description);String url=item.raw.optString("backdrop");if(url.isEmpty())url=item.poster;if(!url.isEmpty())picture(url,art,token);homepagePreview(item,hero);for(int i=0;i<dots.size();i++){dots.get(i).setText(i==index[0]?"━":"•");dots.get(i).setTextColor(i==index[0]?ACCENT:MUTED);}};
        next[0]=()->animateHero(hero,true,()->{index[0]=(index[0]+1)%picks.size();paint[0].run();});prev[0]=()->animateHero(hero,false,()->{index[0]=(index[0]+picks.size()-1)%picks.size();paint[0].run();});
        paint[0].run();refreshPicks.bringToFront();float[] touch=new float[2];hero.setOnTouchListener((v,e)->{if(e.getActionMasked()==MotionEvent.ACTION_DOWN){touch[0]=e.getX();touch[1]=e.getY();return true;}if(e.getActionMasked()==MotionEvent.ACTION_UP){float dx=e.getX()-touch[0],dy=e.getY()-touch[1];if(Math.abs(dx)>dp(60)&&Math.abs(dx)>Math.abs(dy)*2){if(dx<0)next[0].run();else prev[0].run();return true;}v.performClick();}return false;});
        int height=flixLayout()&&BuildConfig.TV?Math.max(dp(520),getResources().getDisplayMetrics().heightPixels-dp(56)):googleLayout()?dp(BuildConfig.TV?570:470):dp(440);host.addView(hero,new LinearLayout.LayoutParams(-1,height));space(host,(googleLayout()||flixLayout())?8:24);
        final Runnable ticker=new Runnable(){public void run(){if(isFinishing()||isDestroyed()||!hero.isAttachedToWindow())return;if(!hero.hasFocus())next[0].run();carouselUi.postDelayed(this,15000);}};carouselUi.postDelayed(ticker,15000);
    }


    private String streamingServiceLabel(String brand){
        switch(brand){
            case "netflix":return "Netflix";
            case "hulu":return "Hulu";
            case "disney":return "Disney+";
            case "max":return "HBO Max";
            case "apple":return "Apple TV+";
            case "paramount":return "Paramount+";
            case "peacock":return "Peacock";
            case "youtube-tv":return "YouTube TV";
            default:return "Streaming provider not verified";
        }
    }
    private void paintVerifiedStreamingSource(String brand,ImageView logo,TextView label){
        int resource=providerCarouselDrawable(brand);
        if(resource!=0){
            logo.setImageResource(resource);
            logo.setVisibility(View.VISIBLE);
            logo.setContentDescription(streamingServiceLabel(brand)+" streaming logo");
            label.setText(streamingServiceLabel(brand));
            label.setTextColor(INK);
        }else{
            logo.setVisibility(View.GONE);
            logo.setImageDrawable(null);
            label.setText("Streaming provider not verified");
            label.setTextColor(MUTED);
        }
    }
    private void showVerifiedStreamingSource(Catalog.Item item,TextView title,ImageView logo,TextView label){
        String brand=providerBrandKey(item.raw.optString("providerBrand"));
        if(brand.isEmpty())brand=providerBrandKey(item.raw.optString("provider_name",item.raw.optString("providerName")));
        if(brand.isEmpty())brand=verifiedProviderCache.getOrDefault(item.id,"");
        paintVerifiedStreamingSource(brand,logo,label);
        if(!brand.isEmpty()||verifiedProviderCache.containsKey(item.id)||!item.id.matches("tmdb-(movie|series)-[0-9]+"))return;
        label.setText("Checking streaming source…");
        if(!pendingProviderChecks.add(item.id))return;
        final String itemId=item.id,itemTitle=item.title,apiKey=tmdbKey(),media=item.type.equals("series")?"tv":"movie";
        providerIo.execute(()->{
            String matched="";
            try{
                JSONObject response=ContentApi.tmdb("/"+media+"/"+itemId.substring(itemId.lastIndexOf('-')+1)+"/watch/providers",apiKey,"");
                JSONObject regions=response.optJSONObject("results"),us=regions==null?null:regions.optJSONObject("US");
                JSONArray flatrate=us==null?null:us.optJSONArray("flatrate");
                for(int i=0;flatrate!=null&&i<flatrate.length();i++){
                    JSONObject service=flatrate.optJSONObject(i);
                    if(service==null)continue;
                    matched=providerBrandKey(service.optString("provider_name"));
                    if(!matched.isEmpty())break;
                }
            }catch(Exception ignored){}
            final String result=matched;
            verifiedProviderCache.put(itemId,result);
            pendingProviderChecks.remove(itemId);
            carouselUi.post(()->{
                if(!isDestroyed()&&itemTitle.equals(String.valueOf(title.getText())))
                    paintVerifiedStreamingSource(result,logo,label);
            });
        });
    }

    private void animateHero(FrameLayout hero,boolean next,Runnable change){
        if(!getSharedPreferences("zero",MODE_PRIVATE).getBoolean("uiAnimations",true)){change.run();return;}
        float distance=Math.max(dp(120),hero.getWidth()*.16f),out=next?-distance:distance,in=next?distance:-distance;hero.animate().cancel();hero.animate().translationX(out).alpha(.35f).setDuration(220).withEndAction(()->{change.run();hero.setTranslationX(in);hero.setAlpha(.35f);hero.animate().translationX(0).alpha(1).setDuration(300).start();}).start();
    }

    @Override protected void onDestroy(){carouselUi.removeCallbacksAndMessages(null);providerIo.shutdownNow();super.onDestroy();}
}
