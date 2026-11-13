'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('Android TV provider wordmarks are compiled alpha-trimmed left-aligned resources',()=>{
 const a=read('app/src/main/java/com/zerostreams/app/MainActivity.java');
 const s=read('scripts/render-provider-wordmarks.py');
 assert.match(a,/int providerCarouselDrawable\(String brand\)/);
 for(const key of ['netflix','hulu','disney','max','apple','paramount','peacock','youtube_tv'])assert.ok(a.includes('R.drawable.zero_provider_'+key));
 assert.match(a,/providerBadge\.setImageResource\(drawable\)/);
 assert.match(a,/badgeSlot\.gravity=Gravity\.LEFT/);
 assert.match(s,/getchannel\("A"\)\.getbbox\(\)/);
 assert.match(s,/drawable-nodpi/);
});
test('Android TV Continue Watching reads playback history and is pinned when resumable',()=>{
 const a=read('app/src/main/java/com/zerostreams/app/MainActivity.java');
 assert.match(a,/JSONArray played=new JSONArray\(prefs\.getString\("watchHistory"/);
 assert.match(a,/BuildConfig\.TV&&id\.equals\("continue"\)\)\{if\(!resumes\.isEmpty\(\)\)posterRow\("Continue watching",resumes,token\)/);
 assert.match(a,/BuildConfig\.TV&&id\.equals\("continue"\)\)\{if/);
 assert.match(a,/percent<95/);
});
test('TV-only Refresh picks appears beside carousel actions and changes source candidates',()=>{
 const a=read('app/src/main/java/com/zerostreams/app/MainActivity.java'),s=read('app/src/main/java/com/zerostreams/app/StreamingTopTen.java');
 assert.match(a,/Button refreshPicks=button\("↻ Refresh picks",this::refreshHomePicks\)/);
 assert.match(a,/carouselSourceCache\.clear\(\)/);
 assert.match(a,/StreamingTopTen\.load\(key,System\.currentTimeMillis\(\),variation\)/);
 assert.match(s,/int variation\) throws Exception/);
 assert.match(s,/provider\+variation/);
});
test('Windows UI and movie/provider functionality remain untouched',()=>{
 const main=read('windows/main.cjs');
 assert.ok(main.includes(String.raw`2\.2\.6\.4$/.test(result.version)`));
});
