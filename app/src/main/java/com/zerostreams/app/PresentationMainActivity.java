package com.zerostreams.app;

import android.graphics.*;
import android.os.Bundle;
import android.text.*;
import android.view.*;
import android.widget.*;
import java.util.*;
import java.util.concurrent.*;
import org.json.*;

/** Final card presentation layer shared by Android phone, tablet and TV. */
public class PresentationMainActivity extends CategoryMainActivity {
    private final ExecutorService presentationIo=Executors.newFixedThreadPool(2);
    private final Map<String,String> heroLogoCache=new ConcurrentHashMap<>();
    private final Set<String> heroLogoLoading=ConcurrentHashMap.newKeySet();
    private final Map<String,List<Catalog.Item>> topTodayCache=new ConcurrentHashMap<>();
    private final Set<String> topTodayLoading=ConcurrentHashMap.newKeySet();

    @Override public void onCreate(Bundle state){
        android.content.SharedPreferences prefs=getSharedPreferences("zero",MODE_PRIVATE);
        android.content.SharedPreferences.Editor editor=prefs.edit();boolean changed=false;
        if(!prefs.contains("uiLayout")){editor.putString("uiLayout","google");changed=true;}
        if(!prefs.contains("liveCignal")){editor.putBoolean("liveCignal",true);changed=true;}
        if(!prefs.contains("liveConverge")){editor.putBoolean("liveConverge",true);changed=true;}
        if(changed)editor.commit();
        super.onCreate(state);
    }

    @Override protected void onDestroy(){
        presentationIo.shutdownNow();
        super.onDestroy();
    }

    /** 2.0.1: Modern UI calls the landing page Home and exposes Categories on TV. */
    @Override void addGoogleNavigation(LinearLayout body){
        super.addGoogleNavigation(body);
        Button downloads=null;
        for(Map.Entry<Button,String> entry:new ArrayList<>(modernTabs.entrySet())){
            Button button=entry.getKey();String tab=entry.getValue();
            if("Home".equals(tab))button.setText("Home");
            if(BuildConfig.TV&&"Downloads".equals(tab))downloads=button;
        }
        if(downloads!=null){
            modernTabs.remove(downloads);
            downloads.setText("Categories");
            downloads.setContentDescription("Categories");
            downloads.setOnClickListener(v->layoutOpen("Categories"));
            Button categories=downloads;
            downloads.setOnFocusChangeListener((v,f)->styleModernTab(categories,"Categories",f));
            modernTabs.put(downloads,"Categories");
            styleModernTab(downloads,"Categories",false);
        }
    }

    @Override void sportsPage(int token){
        super.sportsPage(token);
        LinearLayout host=contentHost();if(host!=null)replaceSportsRefreshCopy(host);
    }

    private void replaceSportsRefreshCopy(View view){
        if(view instanceof TextView){TextView label=(TextView)view;String value=String.valueOf(label.getText());if(value.contains("catalogue refreshes every minute"))label.setText(value.replace("catalogue refreshes every minute","catalogue refreshes every hour"));}
        if(view instanceof ViewGroup){ViewGroup group=(ViewGroup)view;for(int i=0;i<group.getChildCount();i++)replaceSportsRefreshCopy(group.getChildAt(i));}
    }

    /**
     * Preserve the proven v1.5 Android TV navigation path.
     * Main/home navigation is handled by Android's normal focus dispatch with no
     * custom interception, throttling, row confinement or spatial remapping.
     */
    @Override public boolean dispatchKeyEvent(KeyEvent event){
        return super.dispatchKeyEvent(event);
    }

    @Override public void onBackPressed(){
        ExitConfirmation.show(this,"Exit ZeroPlay?","Are you sure you want to close ZeroPlay?",this::exitZeroPlay);
    }

    private void exitZeroPlay(){
        super.onBackPressed();
    }

    /** Modern UI Movies/Shows use the same compact TV scale as the fixed home rows. */
    @Override void grid(List<Catalog.Item> rows,int token){
        if(!BuildConfig.TV||!googleLayout()){super.grid(rows,token);return;}
        LinearLayout host=contentHost();
        if(host==null){super.grid(rows,token);return;}
        final int columns=5;
        for(int i=0;i<rows.size();i+=columns){
            LinearLayout line=new LinearLayout(this);
            for(int c=0;c<columns;c++){
                LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(0,-2,1);
                p.setMargins(0,0,dp(c==columns-1?0:12),dp(18));
                line.addView(i+c<rows.size()?card(rows.get(i+c),token):new View(this),p);
            }
            host.addView(line);
        }
    }

    private LinearLayout contentHost(){
        try{
            java.lang.reflect.Field field=MainActivity.class.getDeclaredField("content");
            field.setAccessible(true);
            Object value=field.get(this);
            return value instanceof LinearLayout?(LinearLayout)value:null;
        }catch(Exception ignored){return null;}
    }

    /** Keep the Top 10 row directly beneath the featured hero on phone and TV. */
    @Override void renderHome22(List<Catalog.Item> rows,int token){
        super.renderHome22(rows,token);
        if(!homePanel("top10"))return;
        LinearLayout host=contentHost();if(host==null)return;
        String region=getSharedPreferences("zero",MODE_PRIVATE).getString("providerRegion","PH");
        List<Catalog.Item> cached=topTodayCache.get(region);
        List<Catalog.Item> visible=cached==null?topFallback(rows):cached;
        if(!visible.isEmpty())insertTopTen(host,visible,token,region);
        if(cached==null)loadTopToday(region,host,token);
    }

    @Override void carousel(List<Catalog.Item> all,int token){
        super.carousel(all,token);
        attachHeroTitleArtwork(all,token);
        if(flixLayout()&&BuildConfig.TV){View root=getWindow().getDecorView();root.post(this::compactFlixRightPanel);root.postDelayed(this::compactFlixRightPanel,350);}
    }

    private void attachHeroTitleArtwork(List<Catalog.Item> all,int token){
        LinearLayout host=contentHost();if(host==null)return;
        FrameLayout hero=findHero(host);if(hero==null)return;
        List<Catalog.Item> picks=carouselSourceItems(all);if(picks.isEmpty())return;
        Set<String> names=new HashSet<>();for(Catalog.Item item:picks)names.add(item.title);
        TextView title=findLargestMatchingTitle(hero,names,null);if(title==null||!(title.getParent() instanceof LinearLayout))return;
        LinearLayout parent=(LinearLayout)title.getParent();
        ImageView logo=new ImageView(this);logo.setScaleType(ImageView.ScaleType.FIT_START);logo.setAdjustViewBounds(true);logo.setVisibility(View.GONE);logo.setImportantForAccessibility(View.IMPORTANT_FOR_ACCESSIBILITY_YES);
        int index=parent.indexOfChild(title);LinearLayout.LayoutParams lp=new LinearLayout.LayoutParams(-1,dp(BuildConfig.TV?112:82));
        parent.addView(logo,Math.max(0,index),lp);
        Runnable refresh=()->showHeroArtwork(String.valueOf(title.getText()),picks,logo,title,token);
        title.addTextChangedListener(new TextWatcher(){public void beforeTextChanged(CharSequence s,int start,int count,int after){}public void onTextChanged(CharSequence s,int start,int before,int count){}public void afterTextChanged(Editable e){refresh.run();}});
        refresh.run();
    }

    private TextView findLargestMatchingTitle(View view,Set<String> names,TextView best){
        if(view instanceof TextView&&names.contains(String.valueOf(((TextView)view).getText()))){TextView candidate=(TextView)view;if(best==null||candidate.getTextSize()>best.getTextSize())best=candidate;}
        if(view instanceof ViewGroup){ViewGroup group=(ViewGroup)view;for(int i=0;i<group.getChildCount();i++)best=findLargestMatchingTitle(group.getChildAt(i),names,best);}
        return best;
    }

    private void showHeroArtwork(String name,List<Catalog.Item> picks,ImageView logo,TextView textTitle,int token){
        Catalog.Item item=null;for(Catalog.Item candidate:picks)if(candidate.title.equals(name)){item=candidate;break;}
        if(item==null){logo.setVisibility(View.GONE);textTitle.setVisibility(View.VISIBLE);return;}
        final Catalog.Item selected=item;String cached=heroLogoCache.get(item.id);
        if(cached!=null){applyHeroLogo(selected,cached,logo,textTitle,token);return;}
        logo.setVisibility(View.GONE);textTitle.setVisibility(View.VISIBLE);
        if(!item.id.matches("tmdb-(movie|series)-[0-9]+")||!heroLogoLoading.add(item.id))return;
        presentationIo.execute(()->{
            String address="";
            try{
                String media=selected.type.equals("series")?"tv":"movie",id=selected.id.substring(selected.id.lastIndexOf('-')+1);
                JSONObject data=ContentApi.tmdb("/"+media+"/"+id,tmdbKey(),"&append_to_response=images&include_image_language=en,null");
                address=bestLogo(data.optJSONObject("images"));
            }catch(Exception ignored){}
            heroLogoCache.put(selected.id,address);heroLogoLoading.remove(selected.id);final String ready=address;
            runOnUiThread(()->{if(!isDestroyed()&&selected.title.equals(String.valueOf(textTitle.getText())))applyHeroLogo(selected,ready,logo,textTitle,token);});
        });
    }

    private String bestLogo(JSONObject images){
        JSONArray logos=images==null?null:images.optJSONArray("logos");if(logos==null)return "";JSONObject best=null;int bestScore=-1;
        for(int i=0;i<logos.length();i++){JSONObject row=logos.optJSONObject(i);if(row==null)continue;String path=row.optString("file_path"),language=row.optString("iso_639_1","");if(!path.matches("/[A-Za-z0-9_.-]+"))continue;int score=(language.equals("en")?100:language.isEmpty()||row.isNull("iso_639_1")?60:10)+Math.min(25,row.optInt("vote_count"));if(score>bestScore){best=row;bestScore=score;}}
        return best==null?"":ContentApi.image(best.optString("file_path"),"w500");
    }

    private void applyHeroLogo(Catalog.Item item,String address,ImageView logo,TextView textTitle,int token){
        if(address==null||address.isEmpty()){logo.setVisibility(View.GONE);textTitle.setVisibility(View.VISIBLE);return;}
        logo.setContentDescription(item.title);logo.setVisibility(View.VISIBLE);textTitle.setVisibility(View.GONE);picture(address,logo,token);
    }

    private FrameLayout findHero(LinearLayout host){
        FrameLayout best=null;int bestHeight=0;
        for(int i=0;i<host.getChildCount();i++)if(host.getChildAt(i) instanceof FrameLayout){View child=host.getChildAt(i);int height=child.getLayoutParams()==null?0:child.getLayoutParams().height;if(height>bestHeight){best=(FrameLayout)child;bestHeight=height;}}
        return bestHeight>=dp(280)?best:null;
    }

    private List<Catalog.Item> topFallback(List<Catalog.Item> rows){
        LinkedHashMap<String,Catalog.Item> ranked=new LinkedHashMap<>();
        for(Catalog.Item item:rows)if(item.raw.optBoolean("trending")&&!item.poster.isEmpty()){ranked.put(item.id,item);if(ranked.size()>=10)break;}
        if(ranked.size()<10)for(Catalog.Item item:rows)if((item.type.equals("movie")||item.type.equals("series"))&&!item.poster.isEmpty()){ranked.put(item.id,item);if(ranked.size()>=10)break;}
        return new ArrayList<>(ranked.values());
    }

    private void loadTopToday(String region,LinearLayout host,int token){
        if(tmdbKey().isEmpty()||!topTodayLoading.add(region))return;
        presentationIo.execute(()->{
            List<Catalog.Item> result=new ArrayList<>();
            try{JSONObject data=ContentApi.tmdb("/trending/all/day",tmdbKey(),"&page=1");for(Catalog.Item item:ContentApi.tmdbRows(data.optJSONArray("results"),"",false))if(!item.poster.isEmpty()){result.add(item);if(result.size()>=10)break;}}catch(Exception ignored){}
            topTodayLoading.remove(region);if(result.isEmpty())return;topTodayCache.put(region,result);List<Catalog.Item> ready=result;
            runOnUiThread(()->{if(isDestroyed()||!host.isAttachedToWindow())return;replaceTopTen(host,ready,token,region);});
        });
    }

    private void replaceTopTen(LinearLayout host,List<Catalog.Item> rows,int token,String region){
        View old=host.findViewWithTag("zeroplay-top10");int index=old==null?topTenInsertIndex(host):host.indexOfChild(old);if(old!=null)host.removeView(old);host.addView(topTenSection(rows,token,region),Math.max(0,Math.min(index,host.getChildCount())));
    }

    private void insertTopTen(LinearLayout host,List<Catalog.Item> rows,int token,String region){
        if(host.findViewWithTag("zeroplay-top10")!=null)return;int index=topTenInsertIndex(host);host.addView(topTenSection(rows,token,region),Math.max(0,Math.min(index,host.getChildCount())));
    }

    private int topTenInsertIndex(LinearLayout host){
        FrameLayout hero=findHero(host);if(hero!=null){int index=host.indexOfChild(hero);return Math.min(host.getChildCount(),index+1);}return Math.min(host.getChildCount(),2);
    }

    private LinearLayout topTenSection(List<Catalog.Item> rows,int token,String region){
        LinearLayout section=new LinearLayout(this);section.setOrientation(LinearLayout.VERTICAL);section.setTag("zeroplay-top10");section.setPadding(0,dp(BuildConfig.TV?18:14),0,dp(BuildConfig.TV?22:18));
        sectionLabel(section,"TOP 10 TODAY IN "+regionName(region));
        HorizontalScrollView rail=new HorizontalScrollView(this);rail.setHorizontalScrollBarEnabled(false);rail.setClipToPadding(false);
        LinearLayout cards=new LinearLayout(this);cards.setGravity(Gravity.BOTTOM);
        for(int i=0;i<Math.min(10,rows.size());i++){Catalog.Item item=rows.get(i);View tile=rankedPoster(item,i+1,token);LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(BuildConfig.TV?dp(300):dp(176),BuildConfig.TV?dp(290):dp(220));p.setMargins(0,0,dp(BuildConfig.TV?18:12),0);cards.addView(tile,p);}
        rail.addView(cards);section.addView(rail,new LinearLayout.LayoutParams(-1,-2));return section;
    }

    private View rankedPoster(Catalog.Item item,int rank,int token){
        FrameLayout tile=new FrameLayout(this);tile.setFocusable(true);tile.setClickable(true);tile.setContentDescription("Number "+rank+", "+item.title);tile.setBackground(shape(Color.TRANSPARENT,0));tile.setOnClickListener(v->details(item));tile.setOnFocusChangeListener((v,f)->{v.setBackground(shape(Color.TRANSPARENT,f?ACCENT:0));if(getSharedPreferences("zero",MODE_PRIVATE).getBoolean("uiAnimations",true))v.animate().scaleX(f?1.035f:1f).scaleY(f?1.035f:1f).setDuration(130).start();});
        int rankWidth=BuildConfig.TV?156:70,posterWidth=BuildConfig.TV?160:116,posterHeight=Math.round(posterWidth*1.5f),overlap=BuildConfig.TV?132:58;
        RankView number=new RankView(this,String.valueOf(rank));FrameLayout.LayoutParams np=new FrameLayout.LayoutParams(dp(rankWidth),dp(posterHeight),Gravity.BOTTOM|Gravity.START);
        ImageView poster=new ImageView(this);poster.setScaleType(ImageView.ScaleType.CENTER_CROP);poster.setImageResource(R.drawable.ic_zero);poster.setBackground(shape(SURFACE,0));poster.setClipToOutline(true);FrameLayout.LayoutParams pp=new FrameLayout.LayoutParams(dp(posterWidth),dp(posterHeight),Gravity.BOTTOM|Gravity.START);pp.leftMargin=dp(overlap);if(BuildConfig.TV){tile.addView(poster,pp);tile.addView(number,np);}else{tile.addView(number,np);tile.addView(poster,pp);}if(!item.poster.isEmpty()){String quickPoster=item.poster.replace("/w1280/","/w342/").replace("/w780/","/w342/").replace("/w500/","/w342/");poster.setTag(quickPoster);fetchPicture(quickPoster,poster,token);}return tile;
    }

    private String regionName(String code){
        switch(code){case "US":return "UNITED STATES";case "GB":return "UNITED KINGDOM";case "CA":return "CANADA";case "AU":return "AUSTRALIA";case "IN":return "INDIA";case "JP":return "JAPAN";default:return "PHILIPPINES";}
    }

    private static final class RankView extends View {
        private final Paint fill=new Paint(Paint.ANTI_ALIAS_FLAG),stroke=new Paint(Paint.ANTI_ALIAS_FLAG);private final String rank;
        RankView(android.content.Context context,String rank){super(context);this.rank=rank;Typeface face=Typeface.create("sans-serif-condensed",Typeface.BOLD);for(Paint paint:new Paint[]{fill,stroke}){paint.setTypeface(face);paint.setTextAlign(Paint.Align.RIGHT);paint.setTextScaleX(BuildConfig.TV?.88f:1f);}fill.setStyle(Paint.Style.FILL);fill.setColor(Color.rgb(238,240,243));stroke.setStyle(Paint.Style.STROKE);stroke.setStrokeJoin(Paint.Join.ROUND);stroke.setColor(Color.rgb(9,11,16));}
        @Override protected void onDraw(Canvas canvas){super.onDraw(canvas);float density=getResources().getDisplayMetrics().density;float preferred=getHeight()*(BuildConfig.TV?.62f:(rank.length()>1?.56f:.72f));fill.setTextSize(preferred);stroke.setTextSize(preferred);stroke.setStrokeWidth(Math.max(1.05f*density,1.5f));float available=Math.max(1f,getWidth()-4f*density),measured=fill.measureText(rank);if(measured>available){float size=preferred*(available/measured);fill.setTextSize(size);stroke.setTextSize(size);}Paint.FontMetrics fm=fill.getFontMetrics();float baseline=getHeight()-Math.max(0,-fm.descent*.18f),x=getWidth()-2f*density;canvas.drawText(rank,x,baseline,stroke);canvas.drawText(rank,x,baseline,fill);}
    }

    private void compactFlixRightPanel(){
        if(!flixLayout()||!BuildConfig.TV)return;View root=getWindow().getDecorView();int width=getResources().getDisplayMetrics().widthPixels;compactFlixRightPanel(root,width);
    }
    private void compactFlixRightPanel(View view,int width){
        if(view instanceof ViewGroup){
            ViewGroup group=(ViewGroup)view;Rect bounds=new Rect();boolean rightEntry=group.isFocusable()&&group.getGlobalVisibleRect(bounds)&&bounds.left>width*.66&&bounds.height()<=dp(100)&&bounds.width()>dp(120);
            if(rightEntry)compactFlixLabels(group);
            for(int i=0;i<group.getChildCount();i++)compactFlixRightPanel(group.getChildAt(i),width);
        }
    }
    private void compactFlixLabels(View view){
        if(view instanceof TextView){TextView label=(TextView)view;String value=String.valueOf(label.getText()).trim();label.setIncludeFontPadding(false);label.setMaxLines(1);label.setEllipsize(TextUtils.TruncateAt.END);label.setLineSpacing(0,1f);if(value.matches("\\d{1,2}"))label.setTextSize(16);else if(value.contains("★"))label.setTextSize(10.5f);else label.setTextSize(12.5f);}
        if(view instanceof ViewGroup){ViewGroup group=(ViewGroup)view;for(int i=0;i<group.getChildCount();i++)compactFlixLabels(group.getChildAt(i));}
    }

    @Override LinearLayout card(Catalog.Item item,int token){
        LinearLayout card=super.card(item,token);
        boolean portrait=classicLayout()||flixLayout()||googleLayout();
        MainActivity.PosterFrame frame=null;
        for(int i=0;i<card.getChildCount();i++)if(card.getChildAt(i) instanceof MainActivity.PosterFrame){frame=(MainActivity.PosterFrame)card.getChildAt(i);break;}
        if(frame==null)return card;
        if(portrait){
            for(int i=frame.getChildCount()-1;i>=0;i--)if(frame.getChildAt(i) instanceof LinearLayout)frame.removeViewAt(i);
            boolean hasTopLevelText=false;for(int i=0;i<card.getChildCount();i++)if(card.getChildAt(i) instanceof TextView){hasTopLevelText=true;break;}
            if(!hasTopLevelText){
                space(card,8);
                TextView title=text(item.title,BuildConfig.TV?16:15,INK);bold(title);title.setMaxLines(2);title.setEllipsize(TextUtils.TruncateAt.END);card.addView(title);
                double rating=item.raw.optDouble("rating",0);String meta=(item.year>0?String.valueOf(item.year):item.type.toUpperCase(Locale.ROOT))+(rating>0?"  ·  ★ "+String.format(Locale.ROOT,"%.1f",rating):"");
                TextView details=text(meta,BuildConfig.TV?14:13,rating>0?ACCENT:MUTED);details.setMaxLines(1);card.addView(details);
            }
        }else{
            for(int i=0;i<frame.getChildCount();i++)if(frame.getChildAt(i) instanceof LinearLayout){
                LinearLayout overlay=(LinearLayout)frame.getChildAt(i);int index=0;
                for(int j=0;j<overlay.getChildCount();j++)if(overlay.getChildAt(j) instanceof TextView){TextView label=(TextView)overlay.getChildAt(j);label.setTextSize(index==0?(BuildConfig.TV?18:16):(BuildConfig.TV?15:13));if(index==0)bold(label);index++;}
            }
        }
        return card;
    }
}
