from pathlib import Path

PATH = Path("app/src/main/java/com/zerostreams/app/PresentationMainActivity.java")
text = PATH.read_text(encoding="utf-8")

old_tile = 'for(int i=0;i<Math.min(10,rows.size());i++){Catalog.Item item=rows.get(i);View tile=rankedPoster(item,i+1,token);LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(BuildConfig.TV?dp(284):dp(176),BuildConfig.TV?dp(290):dp(220));p.setMargins(0,0,dp(BuildConfig.TV?18:12),0);cards.addView(tile,p);}'
new_tile = 'for(int i=0;i<Math.min(10,rows.size());i++){Catalog.Item item=rows.get(i);View tile=rankedPoster(item,i+1,token);LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(BuildConfig.TV?dp(300):dp(176),BuildConfig.TV?dp(290):dp(220));p.setMargins(0,0,dp(BuildConfig.TV?18:12),0);cards.addView(tile,p);}'
if old_tile in text:
    text = text.replace(old_tile, new_tile, 1)
elif new_tile not in text:
    raise SystemExit("Top 10 tile width anchor missing")

old_sizes = 'int rankWidth=BuildConfig.TV?178:70,posterWidth=BuildConfig.TV?160:116,posterHeight=Math.round(posterWidth*1.5f),overlap=BuildConfig.TV?116:58;'
new_sizes = 'int rankWidth=BuildConfig.TV?156:70,posterWidth=BuildConfig.TV?160:116,posterHeight=Math.round(posterWidth*1.5f),overlap=BuildConfig.TV?132:58;'
if old_sizes in text:
    text = text.replace(old_sizes, new_sizes, 1)
elif new_sizes not in text:
    raise SystemExit("Top 10 rank geometry anchor missing")

old_order = '''        RankView number=new RankView(this,String.valueOf(rank));FrameLayout.LayoutParams np=new FrameLayout.LayoutParams(dp(rankWidth),dp(posterHeight),Gravity.BOTTOM|Gravity.START);tile.addView(number,np);
        ImageView poster=new ImageView(this);poster.setScaleType(ImageView.ScaleType.CENTER_CROP);poster.setImageResource(R.drawable.ic_zero);poster.setBackground(shape(SURFACE,0));poster.setClipToOutline(true);FrameLayout.LayoutParams pp=new FrameLayout.LayoutParams(dp(posterWidth),dp(posterHeight),Gravity.BOTTOM|Gravity.START);pp.leftMargin=dp(overlap);tile.addView(poster,pp);if(!item.poster.isEmpty()){'''
new_order = '''        RankView number=new RankView(this,String.valueOf(rank));FrameLayout.LayoutParams np=new FrameLayout.LayoutParams(dp(rankWidth),dp(posterHeight),Gravity.BOTTOM|Gravity.START);
        ImageView poster=new ImageView(this);poster.setScaleType(ImageView.ScaleType.CENTER_CROP);poster.setImageResource(R.drawable.ic_zero);poster.setBackground(shape(SURFACE,0));poster.setClipToOutline(true);FrameLayout.LayoutParams pp=new FrameLayout.LayoutParams(dp(posterWidth),dp(posterHeight),Gravity.BOTTOM|Gravity.START);pp.leftMargin=dp(overlap);if(BuildConfig.TV){tile.addView(poster,pp);tile.addView(number,np);}else{tile.addView(number,np);tile.addView(poster,pp);}if(!item.poster.isEmpty()){'''
if old_order in text:
    text = text.replace(old_order, new_order, 1)
elif new_order not in text:
    raise SystemExit("Top 10 draw-order anchor missing")

old_rank = '''        RankView(android.content.Context context,String rank){super(context);this.rank=rank;Typeface face=Typeface.create("sans-serif-condensed",Typeface.BOLD);for(Paint paint:new Paint[]{fill,stroke}){paint.setTypeface(face);paint.setTextAlign(Paint.Align.RIGHT);}fill.setStyle(Paint.Style.FILL);fill.setColor(Color.argb(238,16,18,24));stroke.setStyle(Paint.Style.STROKE);stroke.setStrokeJoin(Paint.Join.ROUND);stroke.setColor(Color.argb(235,235,238,240));}
        @Override protected void onDraw(Canvas canvas){super.onDraw(canvas);float density=getResources().getDisplayMetrics().density;float preferred=getHeight()*(BuildConfig.TV?.66f:(rank.length()>1?.56f:.72f));fill.setTextSize(preferred);stroke.setTextSize(preferred);stroke.setStrokeWidth(Math.max(1.35f*density,2f));float available=Math.max(1f,getWidth()-4f*density),measured=fill.measureText(rank);if(measured>available){float size=preferred*(available/measured);fill.setTextSize(size);stroke.setTextSize(size);}Paint.FontMetrics fm=fill.getFontMetrics();float baseline=getHeight()-Math.max(0,-fm.descent*.18f),x=getWidth()-2f*density;canvas.drawText(rank,x,baseline,fill);canvas.drawText(rank,x,baseline,stroke);}'''
new_rank = '''        RankView(android.content.Context context,String rank){super(context);this.rank=rank;Typeface face=Typeface.create("sans-serif-condensed",Typeface.BOLD);for(Paint paint:new Paint[]{fill,stroke}){paint.setTypeface(face);paint.setTextAlign(Paint.Align.RIGHT);paint.setTextScaleX(BuildConfig.TV?.88f:1f);}fill.setStyle(Paint.Style.FILL);fill.setColor(Color.rgb(238,240,243));stroke.setStyle(Paint.Style.STROKE);stroke.setStrokeJoin(Paint.Join.ROUND);stroke.setColor(Color.rgb(9,11,16));}
        @Override protected void onDraw(Canvas canvas){super.onDraw(canvas);float density=getResources().getDisplayMetrics().density;float preferred=getHeight()*(BuildConfig.TV?.62f:(rank.length()>1?.56f:.72f));fill.setTextSize(preferred);stroke.setTextSize(preferred);stroke.setStrokeWidth(Math.max(1.05f*density,1.5f));float available=Math.max(1f,getWidth()-4f*density),measured=fill.measureText(rank);if(measured>available){float size=preferred*(available/measured);fill.setTextSize(size);stroke.setTextSize(size);}Paint.FontMetrics fm=fill.getFontMetrics();float baseline=getHeight()-Math.max(0,-fm.descent*.18f),x=getWidth()-2f*density;canvas.drawText(rank,x,baseline,stroke);canvas.drawText(rank,x,baseline,fill);}'''
if old_rank in text:
    text = text.replace(old_rank, new_rank, 1)
elif new_rank not in text:
    raise SystemExit("Top 10 rank paint anchor missing")

PATH.write_text(text, encoding="utf-8")
print("Android TV Top 10 ranks moved in front with a small poster overlap and solid condensed styling.")
