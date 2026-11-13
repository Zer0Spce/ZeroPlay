const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const top=require('../ui/streaming-carousel.js');
const movie=(id,extra={})=>({id,type:'movie',title:'Movie '+id,date:'2026-10-10',backdrop:'/sample.jpg',poster:'/poster.jpg',voteCount:130,popularity:45,...extra});
test('only the eight selected US subscription services are matched, not other/rental services',()=>{
 const p=[
 {provider_id:8,provider_name:'Netflix'}, {provider_id:15,provider_name:'Hulu'},
 {provider_id:337,provider_name:'Disney+'}, {provider_id:1899,provider_name:'HBO Max'},
 {provider_id:350,provider_name:'Apple TV+'}, {provider_id:531,provider_name:'Paramount+'},
 {provider_id:386,provider_name:'Peacock'}, {provider_id:999,provider_name:'YouTube TV'},
 {provider_id:2,provider_name:'Apple TV'}, {provider_id:3,provider_name:'Amazon Prime Video'},
 {provider_id:4,provider_name:'YouTube'}
 ];
 const resolved=top.providers(p);
 assert.deepEqual(resolved.map(x=>x.brand),top.SERVICES);
 assert.equal(resolved.length,8);
 assert.equal(top.brand('Apple TV'),null);
 assert.equal(top.brand('YouTube'),null);
 assert.equal(top.brand('Amazon Prime Video'),null);
});
test('when YouTube TV is not in TMDB, no provider is fabricated',()=>{
 const found=top.providers([{provider_name:'Netflix',provider_id:8}]);
 assert.deepEqual(found,[{brand:'netflix',provider_id:8}]);
});
test('Top 10 is recent, deduplicated, released, has backdrops and rotates with seed',()=>{
 const all=Array.from({length:50},(_,i)=>movie(100+i));
 all.push(all[0],movie(500,{date:'2027-01-01'}),movie(501,{date:'2025-01-01'}),
   movie(502,{backdrop:''}),movie(503,{type:'tv'}),movie(504,{voteCount:0}));
 const a=top.topTen(all,'cycle-a','2026-11-13');
 const b=top.topTen(all,'cycle-b','2026-11-13');
 assert.equal(a.length,10);
 assert.equal(new Set(a.map(x=>x.id)).size,10);
 assert.ok(a.every(x=>x.type==='movie'&&x.date<='2026-11-13'&&x.date>='2025-09-19'&&x.backdrop));
 assert.deepEqual(top.topTen(all,'cycle-a','2026-11-13').map(x=>x.id),a.map(x=>x.id));
 assert.notDeepEqual(a.map(x=>x.id),b.map(x=>x.id));
});
test('app launcher and Windows player use new streaming-only carousel and Crimson branding',()=>{
 const root=path.join(__dirname,'../..');
 const read=p=>fs.readFileSync(path.join(root,p),'utf8');
 const html=read('windows/ui/index.html'),main=read('windows/main.cjs'),api=read('windows/playback-sources.cjs');
 const native=read('app/src/main/java/com/zerostreams/app/MainActivity.java');
 const sources=read('app/src/main/java/com/zerostreams/app/PlaybackSources.java');
 assert.match(html,/streaming-carousel\.js/);
 assert.match(html,/Top 10 New Streaming Movies/);
 assert.ok(!html.includes('<option value="watchlist">Watchlist</option>'));
 assert.match(main,/carouselSource:'streaming'/);
 assert.match(native,/String carouselSource\(\)\{return "streaming";\}/);
 assert.ok(!native.includes('This Week Top Picks - Default'));
 assert.match(api,/color:'DF2531'/);
 assert.match(sources,/color=DF2531/);
});

test('balanced top ten represents distinct verified US providers when catalog supplies them',()=>{
 const films=[];
 for(const [brand,seed] of [['netflix',100],['hulu',200],['max',300],['disney',400]])
  for(let i=0;i<12;i++)films.push(movie(seed+i,{providerBrand:brand}));
 const picks=top.topTen(films,'cycle-2','2026-11-13');
 assert.equal(picks.length,10);
 const brands=new Set(picks.flatMap(p=>p.providerBrands));
 for(const brand of ['netflix','hulu','max','disney'])assert.ok(brands.has(brand),brand);
 assert.equal(new Set(picks.map(p=>p.id)).size,10);
});
test('duplicate films merge verified provider tags without inventing unavailable services',()=>{
 const rows=[movie(10,{providerBrand:'netflix'}),movie(10,{providerBrand:'hulu'}),movie(11,{providerBrand:'not-a-provider'})];
 const res=top.topTen(rows,'six-hours','2026-11-13');
 assert.deepEqual(new Set(res.find(x=>x.id===10).providerBrands),new Set(['netflix','hulu']));
 assert.deepEqual(res.find(x=>x.id===11).providerBrands,[]);
});

test('featured carousel provider SVG appears below metadata above synopsis, with no full-width text banner',()=>{
 const source=fs.readFileSync(path.join(__dirname,'..','ui','app.js'),'utf8');
 const style=fs.readFileSync(path.join(__dirname,'..','ui','sunset-palette.css'),'utf8');
 const hero=source.slice(source.indexOf('function hero(){'),source.indexOf('function watchlistHome()'));
 assert.ok(hero.includes('class="hero-title-line"'));
 assert.ok(hero.includes('class="hero-provider-logo"'));
 assert.ok(hero.includes('provider-logos/${service}.svg'));
 assert.ok(!hero.includes('US subscription listing ·'));
 assert.ok(!hero.includes('<span class="badge">US subscription listing'));
 assert.match(style,/\.hero \.hero-provider-logo/);
 assert.match(style,/max-width:140px/);
 const metadata=hero.indexOf('${badge(item)}'),logo=hero.indexOf('class="hero-provider-logo"'),synopsis=hero.indexOf('<p>${escape(item.overview');
 assert.ok(metadata>=0&&metadata<logo&&logo<synopsis,'Provider logo must sit under metadata before synopsis');
});
