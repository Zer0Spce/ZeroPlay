from pathlib import Path
import re


def read(path):
    return Path(path).read_text(encoding="utf-8")


def write(path, text):
    Path(path).write_text(text, encoding="utf-8")


def replace_once(path, old, new, already=None):
    text = read(path)
    if already and already in text:
        return False
    if old not in text:
        raise SystemExit(f"Anchor not found in {path}: {old[:120]!r}")
    if text.count(old) != 1:
        raise SystemExit(f"Expected one anchor in {path}, found {text.count(old)}")
    write(path, text.replace(old, new, 1))
    return True


def replace_regex(path, pattern, replacement, already=None):
    text = read(path)
    if already and already in text:
        return False
    updated, count = re.subn(pattern, replacement, text, count=1, flags=re.S)
    if count != 1:
        raise SystemExit(f"Regex anchor not found exactly once in {path}: {pattern[:120]!r}")
    write(path, updated)
    return True


# Android: make Tonight's Picks a rotating quality mix rather than a rating-sort of
# the same popular/latest pool, and make Hidden Gems intentionally older + lower popularity.
android = "app/src/main/java/com/zerostreams/app/Zero22.java"
replace_regex(
    android,
    r'''    static List<Catalog\.Item> hiddenGems\(SharedPreferences prefs,List<Catalog\.Item> items\)\{.*?\n    \}\n    static List<Catalog\.Item> tonight\(SharedPreferences prefs,List<Catalog\.Item> items\)\{.*?\n    \}\n''',
    '''    static List<Catalog.Item> hiddenGems(SharedPreferences prefs,List<Catalog.Item> items){
        List<Catalog.Item> strict=new ArrayList<>(),fallback=new ArrayList<>();int cutoff=Calendar.getInstance().get(Calendar.YEAR)-2;
        for(Catalog.Item item:items){if(notInterested(prefs,item.id)||!item.type.equals("movie")||prefs.getInt("percent:"+item.id,0)>0)continue;double rating=item.raw.optDouble("rating",0),pop=item.raw.optDouble("popularity",0);int votes=item.raw.optInt("voteCount",0),year=item.year;if(rating<7.0||votes<100||(year>0&&year>cutoff))continue;if(pop<140&&votes<=12000)strict.add(item);else if(pop<280&&votes<=20000)fallback.add(item);}
        Comparator<Catalog.Item> order=(a,b)->Double.compare(hiddenScore(b),hiddenScore(a));strict.sort(order);fallback.sort(order);LinkedHashMap<String,Catalog.Item> picked=new LinkedHashMap<>();for(Catalog.Item item:strict){picked.put(item.id,item);if(picked.size()>=18)break;}if(picked.size()<18)for(Catalog.Item item:fallback){picked.put(item.id,item);if(picked.size()>=18)break;}return new ArrayList<>(picked.values());
    }
    static List<Catalog.Item> tonight(SharedPreferences prefs,List<Catalog.Item> items){
        List<Catalog.Item> out=new ArrayList<>();int currentYear=Calendar.getInstance().get(Calendar.YEAR);for(Catalog.Item item:items){if(notInterested(prefs,item.id)||!item.type.equals("movie")||prefs.getInt("percent:"+item.id,0)>0)continue;double rating=item.raw.optDouble("rating",0);int votes=item.raw.optInt("voteCount",0);if(rating>=6.8&&votes>=150&&(item.year==0||item.year<=currentYear))out.add(item);}out.sort((a,b)->Double.compare(tonightScore(b),tonightScore(a)));return trim(out,18);
    }
    private static double tonightScore(Catalog.Item item){long day=System.currentTimeMillis()/86400000L;return item.raw.optDouble("rating",0)*2.8+Math.min(9,Math.log1p(Math.max(0,item.raw.optInt("voteCount",0))))*.65+curationNoise(item,day)*5.0;}
    private static double hiddenScore(Catalog.Item item){long week=System.currentTimeMillis()/(86400000L*7L);return item.raw.optDouble("rating",0)*4.0+Math.log1p(Math.max(0,item.raw.optInt("voteCount",0)))*.55-Math.log1p(Math.max(0,item.raw.optDouble("popularity",0)))*.85+curationNoise(item,week)*1.4;}
    private static double curationNoise(Catalog.Item item,long bucket){long hash=1469598103934665603L;String value=item.id+":"+bucket;for(int i=0;i<value.length();i++){hash^=value.charAt(i);hash*=1099511628211L;}return (double)(hash&Long.MAX_VALUE)/(double)Long.MAX_VALUE;}
''',
    already="private static double curationNoise(Catalog.Item item,long bucket)"
)

# Android TV Top 10: same numeral scale for 1..10, a condensed bold face, and enough
# horizontal room so 10 is not forced smaller than the single-digit ranks.
presentation = "app/src/main/java/com/zerostreams/app/PresentationMainActivity.java"
replace_once(
    presentation,
    'for(int i=0;i<Math.min(10,rows.size());i++){Catalog.Item item=rows.get(i);View tile=rankedPoster(item,i+1,token);LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(BuildConfig.TV?dp(245):dp(176),BuildConfig.TV?dp(290):dp(220));p.setMargins(0,0,dp(BuildConfig.TV?18:12),0);cards.addView(tile,p);}',
    'for(int i=0;i<Math.min(10,rows.size());i++){Catalog.Item item=rows.get(i);View tile=rankedPoster(item,i+1,token);LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(BuildConfig.TV?dp(284):dp(176),BuildConfig.TV?dp(290):dp(220));p.setMargins(0,0,dp(BuildConfig.TV?18:12),0);cards.addView(tile,p);}',
    already='BuildConfig.TV?dp(284):dp(176)'
)
replace_once(
    presentation,
    'int rankWidth=BuildConfig.TV?100:70,posterWidth=BuildConfig.TV?160:116,posterHeight=Math.round(posterWidth*1.5f),overlap=BuildConfig.TV?84:58;',
    'int rankWidth=BuildConfig.TV?178:70,posterWidth=BuildConfig.TV?160:116,posterHeight=Math.round(posterWidth*1.5f),overlap=BuildConfig.TV?116:58;',
    already='int rankWidth=BuildConfig.TV?178:70'
)
replace_regex(
    presentation,
    r'''    private static final class RankView extends View \{\n        private final Paint stroke=new Paint\(Paint\.ANTI_ALIAS_FLAG\);private final String rank;\n        RankView\(android\.content\.Context context,String rank\)\{.*?\n        @Override protected void onDraw\(Canvas canvas\)\{.*?\n    \}\n''',
    '''    private static final class RankView extends View {
        private final Paint fill=new Paint(Paint.ANTI_ALIAS_FLAG),stroke=new Paint(Paint.ANTI_ALIAS_FLAG);private final String rank;
        RankView(android.content.Context context,String rank){super(context);this.rank=rank;Typeface face=Typeface.create("sans-serif-condensed",Typeface.BOLD);for(Paint paint:new Paint[]{fill,stroke}){paint.setTypeface(face);paint.setTextAlign(Paint.Align.RIGHT);}fill.setStyle(Paint.Style.FILL);fill.setColor(Color.argb(238,16,18,24));stroke.setStyle(Paint.Style.STROKE);stroke.setStrokeJoin(Paint.Join.ROUND);stroke.setColor(Color.argb(235,235,238,240));}
        @Override protected void onDraw(Canvas canvas){super.onDraw(canvas);float density=getResources().getDisplayMetrics().density;float preferred=getHeight()*(BuildConfig.TV?.66f:(rank.length()>1?.56f:.72f));fill.setTextSize(preferred);stroke.setTextSize(preferred);stroke.setStrokeWidth(Math.max(1.35f*density,2f));float available=Math.max(1f,getWidth()-4f*density),measured=fill.measureText(rank);if(measured>available){float size=preferred*(available/measured);fill.setTextSize(size);stroke.setTextSize(size);}Paint.FontMetrics fm=fill.getFontMetrics();float baseline=getHeight()-Math.max(0,-fm.descent*.18f),x=getWidth()-2f*density;canvas.drawText(rank,x,baseline,fill);canvas.drawText(rank,x,baseline,stroke);}
    }
''',
    already='Typeface face=Typeface.create("sans-serif-condensed",Typeface.BOLD)'
)

# Windows: derive both rows from a deduplicated mix of top-rated, trending, popular and
# now-playing titles. Neither row should simply mirror /movie/popular anymore.
windows = "windows/ui/app.js"
windows_helpers = '''function zeroCurationMovies(){const pool=[...(homeData.recommended||[]),...(homeData.trending||[]),...(homeData.popular||[]),...(homeData.now||[])],unique=new Map();for(const item of pool)if(item?.type==='movie'&&!unique.has(key(item)))unique.set(key(item),item);return [...unique.values()];}\nfunction zeroCurationNoise(item,bucket){const input=key(item)+':'+bucket;let hash=2166136261;for(let i=0;i<input.length;i++){hash^=input.charCodeAt(i);hash=Math.imul(hash,16777619);}return (hash>>>0)/4294967295;}\nfunction zeroTonight(items){const day=Math.floor(Date.now()/86400000),year=new Date().getFullYear(),score=item=>Number(item.rating||0)*2.8+Math.min(9,Math.log1p(Math.max(0,Number(item.voteCount)||0)))*.65+zeroCurationNoise(item,day)*5;return items.filter(item=>Number(item.rating)>=6.8&&Number(item.voteCount)>=150&&!state.positions[key(item)]&&(!item.date||Number(item.date.slice(0,4))<=year)).sort((a,b)=>score(b)-score(a)).slice(0,20);}\nfunction zeroHiddenGems(items){const week=Math.floor(Date.now()/(86400000*7)),cutoff=new Date().getFullYear()-2,year=item=>Number(String(item.date||'').slice(0,4))||0,eligible=(item,pop,votes)=>Number(item.rating)>=7&&Number(item.voteCount)>=100&&Number(item.voteCount)<=votes&&Number(item.popularity)<pop&&!state.positions[key(item)]&&(!year(item)||year(item)<=cutoff),score=item=>Number(item.rating||0)*4+Math.log1p(Math.max(0,Number(item.voteCount)||0))*.55-Math.log1p(Math.max(0,Number(item.popularity)||0))*.85+zeroCurationNoise(item,week)*1.4,strict=items.filter(item=>eligible(item,140,12000)).sort((a,b)=>score(b)-score(a)),fallback=items.filter(item=>eligible(item,280,20000)).sort((a,b)=>score(b)-score(a)),out=new Map();for(const item of [...strict,...fallback]){out.set(key(item),item);if(out.size>=20)break;}return [...out.values()];}\n'''
text = read(windows)
if 'function zeroCurationMovies()' not in text:
    marker='async function renderHome(fresh=false)'
    if marker not in text: raise SystemExit('Windows renderHome anchor missing')
    text=text.replace(marker,windows_helpers+marker,1)
old='hidden=(homeData.popular||[]).filter(x=>x.rating>=7.2&&x.voteCount>=80&&x.popularity<350).slice(0,20),tonight=(homeData.popular||[]).filter(x=>x.type===\'movie\'&&x.rating>=7&&!state.positions[key(x)]).slice(0,20),upnext=upNextItems();'
new='curatedMovies=zeroCurationMovies(),hidden=zeroHiddenGems(curatedMovies),tonight=zeroTonight(curatedMovies),upnext=upNextItems();'
if old in text:text=text.replace(old,new,1)
elif new not in text:raise SystemExit('Windows Tonight/Hidden anchor missing')
write(windows,text)

# Website: same curation rules and same broad source pool as Windows/Android.
web = "web/public/zero22.js"
web_helpers = '''  function zeroCurationMovies(){const pool=[...(homeData.recommended||[]),...(homeData.trending||[]),...(homeData.popular||[]),...(homeData.now||[])],unique=new Map();for(const item of pool)if(item?.type==='movie'&&!unique.has(key(item)))unique.set(key(item),item);return [...unique.values()];}\n  function zeroCurationNoise(item,bucket){const input=key(item)+':'+bucket;let hash=2166136261;for(let i=0;i<input.length;i++){hash^=input.charCodeAt(i);hash=Math.imul(hash,16777619);}return (hash>>>0)/4294967295;}\n  function zeroTonight(items){const day=Math.floor(Date.now()/86400000),year=new Date().getFullYear(),score=item=>Number(item.rating||0)*2.8+Math.min(9,Math.log1p(Math.max(0,Number(item.voteCount)||0)))*.65+zeroCurationNoise(item,day)*5;return items.filter(item=>Number(item.rating)>=6.8&&Number(item.voteCount)>=150&&!state.positions[key(item)]&&(!item.date||Number(item.date.slice(0,4))<=year)).sort((a,b)=>score(b)-score(a)).slice(0,20);}\n  function zeroHiddenGems(items){const week=Math.floor(Date.now()/(86400000*7)),cutoff=new Date().getFullYear()-2,year=item=>Number(String(item.date||'').slice(0,4))||0,eligible=(item,pop,votes)=>Number(item.rating)>=7&&Number(item.voteCount)>=100&&Number(item.voteCount)<=votes&&Number(item.popularity)<pop&&!state.positions[key(item)]&&(!year(item)||year(item)<=cutoff),score=item=>Number(item.rating||0)*4+Math.log1p(Math.max(0,Number(item.voteCount)||0))*.55-Math.log1p(Math.max(0,Number(item.popularity)||0))*.85+zeroCurationNoise(item,week)*1.4,strict=items.filter(item=>eligible(item,140,12000)).sort((a,b)=>score(b)-score(a)),fallback=items.filter(item=>eligible(item,280,20000)).sort((a,b)=>score(b)-score(a)),out=new Map();for(const item of [...strict,...fallback]){out.set(key(item),item);if(out.size>=20)break;}return [...out.values()];}\n'''
text = read(web)
if 'function zeroCurationMovies()' not in text:
    marker='  renderHome=async function(fresh=false){'
    if marker not in text: raise SystemExit('Web renderHome anchor missing')
    text=text.replace(marker,web_helpers+marker,1)
old='hidden=(homeData.popular||[]).filter(x=>x.rating>=7.2&&x.voteCount>=80&&x.popularity<350).slice(0,20),tonight=(homeData.popular||[]).filter(x=>x.rating>=7&&!state.positions[key(x)]).slice(0,20),panels='
new='curatedMovies=zeroCurationMovies(),hidden=zeroHiddenGems(curatedMovies),tonight=zeroTonight(curatedMovies),panels='
if old in text:text=text.replace(old,new,1)
elif new not in text:raise SystemExit('Web Tonight/Hidden anchor missing')
write(web,text)

print("Homepage curation and Android TV Top 10 rank patch applied.")
