'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const e=require('../windows/ui/fresh-recommendations.js');
const now=Date.parse('2026-11-12T12:00:00Z');
function movie(id,options={}){
  return {id,type:'movie',title:'Film '+id,date:'2026-07-01',rating:7.7,
    voteCount:900,popularity:45,poster:'/p'+id,backdrop:'/b'+id,
    genreIds:[28],...options};
}
function fixture(){
  return {
    now,seed:'one',perShelf:12,
    pools:{
      trending:Array.from({length:50},(_,i)=>movie(i+1)),
      day:Array.from({length:50},(_,i)=>movie(i+30)),
      recommended:Array.from({length:50},(_,i)=>movie(i+90)),
      popular:Array.from({length:50},(_,i)=>movie(i+150)),
      series:Array.from({length:45},(_,i)=>movie(i+200,{type:'tv'})),
      now:Array.from({length:45},(_,i)=>movie(i+260)),
      gems:Array.from({length:45},(_,i)=>movie(i+320)),
      vod:Array.from({length:24},(_,i)=>movie(i+620,{date:'2026-10-01',originalLanguage:'en',
        originCountry:['US'],voteCount:50})),
      classics:Array.from({length:45},(_,i)=>movie(i+390,{date:'2018-02-02'})),
      airing:Array.from({length:25},(_,i)=>movie(i+470,{type:'tv'}))
    }
  };
}
const flatten=r=>[...r.hero,...Object.values(r.shelves).flat()];
test('TMDB recommendations are deduplicated across all homepage shelves and hero',()=>{
  const r=e.select(fixture());
  assert.ok(r.candidateCount>300,'Expected hundreds of distinct TMDB candidates');
  assert.ok(flatten(r).length>55);
  assert.equal(new Set(flatten(r).map(e.id)).size,flatten(r).length);
});
test('recently shown titles are avoided when unseen titles exist',()=>{
  const x=fixture();
  x.seen=Object.fromEntries(Array.from({length:50},(_,i)=>['movie:'+(i+1),now-e.DAY]));
  x.pools.trending.push(...Array.from({length:20},(_,i)=>movie(850+i)));
  const hero=e.select(x).hero;
  assert.ok(hero.length>0);
  hero.forEach(item=>assert.ok(!Object.hasOwn(x.seen,e.id(item)), 'Recently shown hero repeated: '+e.id(item)));
});
test('watched, not-interested, upcoming, and media without artwork excluded from recommended shelves',()=>{
  const x=fixture();
  x.positions={'movie:1':{percent:45},'movie:2':{percent:100}};
  x.notInterested=['movie:3','tv:201'];
  x.pools.popular.push(movie(900,{poster:'',backdrop:''}),movie(901,{date:'2027-03-01'}));
  const items=flatten(e.select(x)).map(e.id);
  for(const id of ['movie:1','movie:2','movie:3','tv:201','movie:900','movie:901'])assert.ok(!items.includes(id),id);
});
test('manual refresh seed rotates selection without using fabricated titles',()=>{
  const a=fixture(),b=fixture();b.seed='two';
  const get=x=>e.select(x).hero.map(e.id);
  assert.notDeepEqual(get(a),get(b));
});
test('same seed and same source pages return stable selections',()=>{
  const a=fixture();
  assert.deepEqual(e.select(a).hero.map(e.id),e.select(a).hero.map(e.id));
});
test('30-day suppression expires and old history is pruned',()=>{
  assert.deepEqual(e.prune({'movie:7':now-e.DAY,'movie:8':now-90*e.DAY,'notAnId':now},now),{'movie:7':now-e.DAY});
});
test('watchlist and Continue Watching hero selections remain user controlled',()=>{
  const a=fixture();a.carouselSource='continue';
  assert.equal(e.select(a).hero.length,0);
  a.carouselSource='watchlist';
  assert.equal(e.select(a).hero.length,0);
});
test('Zero Crimson matches the supplied red, white and lighter-charcoal palette on Windows and Android',()=>{
  const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
  const theme=read('windows/themes.cjs'),css=read('windows/ui/sunset-palette.css');
  const android=read('app/src/main/java/com/zerostreams/app/MainActivity.java');
  const native=read('app/src/main/java/com/zerostreams/app/SmartHomeRecommendations.java');
  for(const hex of ['#DF2531','#FFFFFF','#242426']){
    assert.ok(theme.includes(hex)||css.includes(hex),'Missing brand swatch '+hex);
  }
  assert.match(theme,/Zero Crimson/);
  assert.match(css,/rgba\(223,37,49,\.45\)/);
  assert.match(css,/rgba\(223,37,49,\.65\)/);
  assert.match(android,/#DF2531/);
  assert.match(android,/#242426/);
  assert.match(native,/EXPOSE_DAYS=30/);
  assert.match(native,/Zero22\.activeProfile/);
  assert.match(read('windows/ui/app.js'),/window.ZeroFreshHome.prepare/);
  assert.match(read('windows/ui/index.html'),/src="fresh-home.js"/);
  assert.ok(!read('windows/ui/index.html').includes('figma-one'));
});
test('low-vote perfect 10 cannot dominate a quality-weighted featured carousel',()=>{
  const opts=fixture();
  opts.pools.day.unshift(movie(9822,{rating:10,voteCount:3,popularity:200}));
  const result=e.select(opts);
  assert.ok(!result.hero.some(x=>x.id===9822));
  assert.ok(e.quality(movie(9822,{rating:10,voteCount:3})) < e.quality(movie(500,{rating:8.1,voteCount:4000})));
});
test('30-day exposure suppression prioritizes fresh picks',()=>{
  const x=fixture();
  const fresh=movie(8891,{rating:8.4,voteCount:18000});
  x.pools.day=[...Array.from({length:20},(_,i)=>movie(i+1)),fresh];
  x.pools.trending=[];
  x.seen=Object.fromEntries(Array.from({length:20},(_,i)=>['movie:'+(i+1),now-29*e.DAY]));
  const picks=e.select(x).hero.map(e.id);
  assert.ok(picks.length>0 && picks.every(id=>!Object.hasOwn(x.seen,id)), 'recently shown title was selected while unseen catalog items were available');
});
test('Continue Watching uses progress, per-title de-duplication and most recent activity',()=>{
  const record=(id,percent,at)=>movie(id,{percent,at,timestamp:120,duration:300});
  const values=e.continueWatching({'tv:1':record(1,46,7),'tv:1:episode':record(1,29,11),'tv:2':record(2,100,12),
    'movie:3':record(3,0,10),'movie:4':record(4,26,6)});
  assert.equal(values.length,2);
  assert.equal(values[0].id,1);
  assert.equal(values[0].percent,29);
});
test('section rotation preserves pinned shelves and honors user-reordered panels',()=>{
  const given=['clock','featured','top10','continue','recommended','trending','hidden','now'];
  const a=e.rotatingPanels(given,'cycle-one');
  const b=e.rotatingPanels(given,'cycle-two');
  assert.equal(a[0],'featured');assert.equal(a[1],'continue');assert.equal(a[2],'top10');
  assert.notDeepEqual(a,b);
  assert.deepEqual(e.rotatingPanels(given,'cycle-three',true),given);
});
test('new four discovery categories are available on desktop and native Android',()=>{
  const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
  const app=read('windows/ui/app.js'),native=read('app/src/main/java/com/zerostreams/app/MainActivity.java');
  for(const category of ['thrillers','recent','different','classics']){
    assert.ok(app.includes(category),category+' missing in Windows');
    assert.ok(native.includes('case "'+category+'"'),category+' missing in Android');
  }
});

test('new homepage avoids old or non-Hollywood titles except a limited modern Classics shelf',()=>{
  const x=fixture();
  x.pools.popular.unshift(movie(9550,{date:'1988-10-01'}),
    movie(9551,{originalLanguage:'ko'}),movie(9552,{originCountry:['FR']}));
  const r=e.select(x);
  const general=[...r.hero,...Object.entries(r.shelves).filter(([name])=>name!=='classics')
    .flatMap(([,list])=>list)].map(e.id);
  for(const id of ['movie:9550','movie:9551','movie:9552'])assert.ok(!general.includes(id),id);
  assert.ok(r.shelves.classics.every(item=>Number(item.date.slice(0,4))>=2014));
});
test('Latest VOD Releases never substitutes theater-only or classic releases',()=>{
  const x=fixture();
  x.pools.vod=[movie(8001,{date:'2026-10-01'}),movie(8002,{date:'2025-01-01'})];
  const ids=e.select(x).shelves.vod.map(e.id);
  assert.ok(ids.includes('movie:8001'));
  assert.ok(!ids.includes('movie:8002'));
  const noDigital=fixture();delete noDigital.pools.vod;
  assert.equal(e.select(noDigital).shelves.vod.length,0);
});
test('new default home sections, VOD source and provider cards are wired on Windows and Android',()=>{
  const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
  const html=read('windows/ui/index.html'),app=read('windows/ui/app.js'),
    css=read('windows/ui/sunset-palette.css'),main=read('windows/main.cjs'),
    discovery=read('windows/ui/fresh-home.js'),
    native=read('app/src/main/java/com/zerostreams/app/MainActivity.java'),
    api=read('app/src/main/java/com/zerostreams/app/ContentApi.java');
  assert.match(html,/class="refresh-recommendations home-refresh-button" data-fresh-picks/);
  assert.match(css,/:not\(\[data-rail-expanded="true"\]\) aside \.brand/);
  assert.ok(!app.includes('zero-fresh-controls'));
  assert.match(app,/row\('Latest VOD Releases',zeroHomeDeck\.shelves\.vod/);
  assert.match(app,/data-provider-brand/);
  assert.match(main,/discoveryVODPreset2258/);
  assert.match(main,/homePanelIds=.*'thrillers','recent','different','classics'/);
  assert.match(discovery,/with_release_type:'4'/);
  assert.match(discovery,/release_date\.gte/);
  assert.match(api,/with_release_type=4/);
  assert.match(native,/Latest VOD Releases/);
  assert.match(native,/discoveryVODPreset2258/);
  assert.match(native,/providerTileBackground/);
  assert.match(native,/case "top10":/);
  assert.match(api,/trendingToday/);
  assert.match(native,/header\.addView\(refreshPicks,rp\)/);
  assert.match(native,/if\(BuildConfig\.TV&&\(googleLayout\(\)\|\|flixLayout\(\)\)\)/);
  assert.match(read('windows/ui/layouts.js'),/dataset\.nav==='Home'\?'Home'/);
});


test('Streaming providers use original wide local logos and horizontal carousel below TMDB Trending Today',()=>{
  const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
  const app=read('windows/ui/app.js'),css=read('windows/ui/sunset-palette.css');
  const visuals=read('windows/ui/home-visuals.js');
  const native=read('app/src/main/java/com/zerostreams/app/MainActivity.java');
  const workflow=read('.github/workflows/zeroplay-2258-candidate-test.yml');
  assert.ok(app.includes('function providerWordmark(row)'));
  assert.ok(app.includes('class="provider-row zero-provider-strip"'));
  assert.ok(app.includes('const cards=rows.map(row=>'));
  assert.ok(app.includes('data-provider-scroll="1"'));
  assert.ok(app.includes('rail.scrollBy({left:'));
  assert.ok(css.includes('overflow-x:auto!important'));
  assert.ok(css.includes('height:132px!important'));
  assert.ok(css.includes('flex:0 0 234px!important'));
  assert.ok(visuals.includes('function positionProvidersBelowTrending(trendingSection)'));
  assert.ok(visuals.includes("trendingSection.insertAdjacentElement('afterend',slot)"));
  const providerSection=native.slice(native.indexOf('void providerSection(int token)'),native.indexOf('GradientDrawable providerTileBackground('));
  assert.ok(providerSection.includes('HorizontalScrollView providerRail'));
  assert.ok(providerSection.includes('providerRail.addView(cards'));
  assert.ok(native.includes('String providerWordmarkAsset(String provider)'));
  assert.ok(native.includes('getAssets().open("provider-logos/"+asset)'));
  assert.ok(native.includes('dp(BuildConfig.TV?238:202)'));
  assert.ok(!native.includes('int columns=BuildConfig.TV?4:2'));
  assert.ok(workflow.includes('Render original wide streaming-provider logos for all Android APKs'));
  assert.ok(workflow.includes('scripts/render-provider-wordmarks.py'));
  assert.ok(read('scripts/render-provider-wordmarks.py').includes('cairosvg.svg2png'));
  for(const brand of ['netflix','hulu','disney','max','apple','paramount','peacock','youtube-tv']){
    const asset=read('windows/ui/provider-logos/'+brand+'.svg');
    assert.ok(asset.includes('<svg')&&asset.includes('</svg>'));
  }
});

test('Exactly eight major provider tiles in requested order, including unlisted regions',()=>{
  const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
  const app=read('windows/ui/app.js');
  const native=read('app/src/main/java/com/zerostreams/app/MainActivity.java');
  const renderer=read('scripts/render-provider-wordmarks.py');
  const expected=['Netflix','Hulu','Disney+','HBO Max','Apple TV','Paramount+','Peacock','YouTube TV'];
  const list=app.slice(app.indexOf('const MAJOR_STREAMING_PROVIDERS=Object.freeze(['),
    app.indexOf('function providerBrand(',app.indexOf('const MAJOR_STREAMING_PROVIDERS=')));
  const displayed=[...list.matchAll(/\{brand:'[^']+',name:'([^']+)'\}/g)].map(x=>x[1]);
  assert.deepEqual(displayed,expected);
  assert.ok(app.includes('return MAJOR_STREAMING_PROVIDERS.map(item=>'));
  assert.ok(app.includes('data-provider-unavailable='));
  assert.ok(read('windows/ui/provider-logos/youtube-tv.svg').includes('<svg'));
  assert.ok(native.includes('final String[] labels={"Netflix","Hulu","Disney+","HBO Max","Apple TV","Paramount+","Peacock","YouTube TV"}'));
  assert.ok(native.includes('final String[] brandKeys={"netflix","hulu","disney","max","apple","paramount","peacock","youtube-tv"}'));
  assert.ok(native.includes('for(int i=0;i<brandKeys.length;i++)'));
  assert.ok(native.includes('if(listedId<=0)'));
  assert.ok(renderer.includes('"youtube-tv"'));
  assert.ok(!renderer.includes('"prime",'));
});

test('Provider carousel hides scrollbars but keeps Top 10-style wheel, drag and keyboard scrolling',()=>{
  const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
  const css=read('windows/ui/sunset-palette.css'),app=read('windows/ui/app.js'),
    native=read('app/src/main/java/com/zerostreams/app/MainActivity.java');
  const cssStart=css.indexOf('.zero-provider-section .zero-provider-strip{'),
    cssEnd=css.indexOf('.zero-provider-section .provider{',cssStart);
  assert.ok(cssStart>=0&&cssEnd>cssStart);
  const railCSS=css.slice(cssStart,cssEnd);
  assert.ok(railCSS.includes('overflow-x:auto!important'));
  assert.ok(railCSS.includes('scrollbar-width:none!important'));
  assert.ok(railCSS.includes('::-webkit-scrollbar{display:none!important'));
  assert.ok(railCSS.includes('touch-action:pan-x!important'));
  assert.ok(railCSS.includes('cursor:grab!important'));
  assert.ok(app.includes('function installProviderRailScrolling()'));
  for(const event of ['wheel','pointerdown','pointermove','pointerup','keydown','focusin']){
    assert.ok(app.includes("rail.addEventListener('"+event+"'"),event);
  }
  assert.ok(app.includes('installProviderRailScrolling();'));
  assert.ok(native.includes('providerRail.setHorizontalScrollBarEnabled(false)'));
  assert.ok(native.includes('HorizontalScrollView providerRail'));
});
