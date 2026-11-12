/* ZeroPlay — Figma One UI Home.
 * Reference: Figma Disney-plus website concept / Home node 3:2 (1440x1024).
 * Dynamic movie assets come from TMDB, all routes use existing ZeroPlay playback.
 */
(() => {
  'use strict';
  const engine = window.ZeroFigmaOneDiscovery;
  const PREFIX = 'zero-figma-one-v1:';
  const SIX_HOURS = 21600000;
  const genreTiles=[
    { label:'MOVIES', kicker:'DISCOVER', nav:'Movies', className:'one-cat-movies' },
    { label:'TV SERIES', kicker:'WATCH MORE', nav:'Series', className:'one-cat-series' },
    { label:'ANIME', kicker:'EXPLORE', action:'anime', className:'one-cat-anime' },
    { label:'ACTION', kicker:'ADVENTURE', genre:28, className:'one-cat-action' },
    { label:'MYSTERY', kicker:'THRILLERS', genre:9648, className:'one-cat-mystery' }
  ];
  let generation=0,heroItem=null,visibleRows={},activeProfile='Default';

  function currentProfile() {
    return String(state?.activeProfile||'Default').replace(/[^a-z0-9_-]/gi,'_').slice(0,80);
  }
  function read(k,fallback) {
    try {return JSON.parse(localStorage.getItem(k))??fallback;}catch{return fallback;}
  }
  function save(k,data) {try {localStorage.setItem(k,JSON.stringify(data));}catch{}}
  function cycle(manual=false) {
    const key=PREFIX+activeProfile+':cycle',base=Math.floor(Date.now()/SIX_HOURS);
    const previous=read(key,{base,bump:0});
    const bump=previous.base===base ? (Number(previous.bump)||0)+(manual?1:0) : 0;
    save(key,{base,bump});
    return {base,bump,seed:[base,bump,activeProfile].join(':')};
  }
  function seenFor(seed) {
    const seen=engine.cleanSeen(read(PREFIX+activeProfile+':seen',{}));
    const last=read(PREFIX+activeProfile+':current',{});
    // Reopening Home during the same six-hour cycle should keep the same selection.
    if(last.seed===seed)for(const k of last.keys||[])delete seen[k];
    return seen;
  }
  function recordShown(seed,selected) {
    const seen=engine.cleanSeen(read(PREFIX+activeProfile+':seen',{}));
    const keys=[selected.hero,...Object.values(selected.rails).flat()].filter(Boolean).map(engine.id);
    for(const k of keys)seen[k]=Date.now();
    save(PREFIX+activeProfile+':seen',seen);
    save(PREFIX+activeProfile+':current',{seed,keys});
  }
  function img(item,portrait=false){return portrait ? item.poster||item.backdrop : item.backdrop||item.poster;}
  function safe(text){return escape(String(text??''));}
  function card(item,kind='wide',opts={}) {
    const ident=engine.id(item),image=img(item,kind==='poster'),pct=Number(opts.percent)||0;
    return '<button class="one-card one-card-'+kind+'" type="button" data-detail="'+safe(ident)+
      '" aria-label="Details for '+safe(item.title)+'">' +
      '<img loading="lazy" decoding="async" src="'+safe(image)+'" alt="">' +
      '<span class="one-card-shade"></span>' +
      '<span class="one-card-title">'+safe(item.title)+'</span>'+
      (pct>0&&pct<95?'<span class="one-progress"><span style="width:'+Math.min(100,Math.max(0,pct))+
      '%"></span></span>':'')+
      '</button>';
  }
  function shelf(label,items,kind='wide',refresh=false){
    if(!items?.length)return '';
    return '<section class="one-shelf" aria-label="'+safe(label)+'">'+
      '<div class="one-shelf-head"><h2>'+safe(label)+'</h2><div class="one-shelf-actions">'+
      (refresh?'<button class="one-refresh" type="button" data-one-refresh aria-label="Refresh recommendations">↻ Refresh Picks</button>':'')+
      '<span class="one-carousel-indicator" aria-hidden="true"><b></b><i></i><i></i><i></i></span></div></div>'+
      '<div class="one-carousel one-carousel-'+kind+'">'+items.map(x=>card(x,kind)).join('')+
      '</div></section>';
  }
  function continueWatching(){
    const entries=Object.values(state.positions||{}).filter(x=>x&&
      (x.type==='movie'||x.type==='tv') && Number(x.id)>0 &&
      Number(x.timestamp)>0 && Number(x.percent)<95 && Number(x.percent)>0);
    const byId=new Map();
    for(const x of entries){const id=engine.id(x);if(!byId.has(id)||(x.at||0)>(byId.get(id).at||0))byId.set(id,x);}
    return [...byId.values()].sort((a,b)=>(b.at||0)-(a.at||0)).slice(0,16);
  }
  function continueShelf(){
    const items=continueWatching();if(!items.length)return '';
    return '<section class="one-shelf one-shelf-continue"><div class="one-shelf-head"><h2>Continue Watching</h2>'+
      '<span class="one-carousel-indicator"><b></b><i></i><i></i></span></div>'+
      '<div class="one-carousel one-carousel-wide">'+items.map(x=>card(x,'wide',{percent:x.percent})).join('')+'</div></section>';
  }
  function categories(){
    return '<section class="one-categories" aria-label="Explore by category">'+genreTiles.map(t=>{
      const target=t.nav?'data-nav="'+t.nav+'"':t.action?'data-action="'+t.action+'"':
        'data-genre="'+Number(t.genre)+'" data-name="'+t.label+'"';
      return '<button class="one-category '+t.className+'" '+target+
        ' type="button" aria-label="Explore '+t.label+'"><span class="one-category-kicker">'+
        t.kicker+'</span><strong>'+t.label+'</strong><span class="one-category-glow"></span></button>';
    }).join('')+'</section>';
  }
  function hero(item){
    const id=engine.id(item);
    const year=item.date?.slice(0,4)||'Featured';
    return '<section id="hero" class="one-hero" data-featured="'+safe(id)+'" aria-label="Featured: '+safe(item.title)+'">'+
      (item.backdrop?'<img class="one-hero-image" src="'+safe(item.backdrop)+'" alt="">':'')+
      '<div class="one-hero-overlay"></div>'+
      '<div class="one-hero-body"><div class="one-hero-brandline">ZEROPLAY <span>· FEATURED</span></div>'+
      '<div class="detail-heading one-title"><h2>'+safe(item.title)+'</h2></div>'+
      '<div class="one-film-meta">'+safe(year)+
      '<span class="one-metadata-dot"></span>'+
      (item.type==='tv'?'TV Series':'Movie')+
      (item.rating?'<span class="one-metadata-dot"></span>★ '+Number(item.rating).toFixed(1):'')+'</div>'+
      '<p class="one-description">'+safe(item.overview||'Discover a great movie or series on ZeroPlay.')+'</p>'+
      '<div class="one-actions"><button class="one-watch" data-play="'+safe(id)+'">▶ <span>WATCH NOW</span></button>'+
      '<button class="one-more" data-detail="'+safe(id)+'">ⓘ <span>MORE INFO</span></button>'+
      '</div></div>'+
      categories()+'</section>';
  }

  function updateWatchlist() {
    if(document.documentElement.dataset.layout!=='figma-one')return;
    // There is no static stateful favorite control on the featured hero.
    // Favorites continue to work in the native detail dialog / library.
  }

  async function render({fresh=false,token}={}){
    const own=++generation;
    activeProfile=currentProfile();
    const rotation=cycle();
    const page=(base,range)=>base+(rotation.base+rotation.bump)%range;
    const recent=state.history||[];
    const genre=recent.find(x=>(x.genreIds||[]).length)?.genreIds?.[0];
    const yearsAgo=new Date().getFullYear()-8;
    const queries=[
      ['day','/trending/all/day',{page:1},null],
      ['day','/trending/all/day',{page:2},null],
      ['week','/trending/all/week',{page:page(1,5)},null],
      ['week','/trending/all/week',{page:1},null],
      ['movies','/movie/popular',{page:page(1,6)},'movie'],
      ['movies','/movie/popular',{page:1},'movie'],
      ['tv','/tv/popular',{page:page(1,4)},'tv'],
      ['tv','/tv/popular',{page:1},'tv'],
      ['now','/movie/now_playing',{page:page(1,3)},'movie'],
      ['top','/movie/top_rated',{page:page(1,5)},'movie'],
      ['top','/movie/top_rated',{page:1},'movie'],
      ['gems','/discover/movie',{sort_by:'vote_average.desc','vote_count.gte':180,'vote_average.gte':6.8,page:page(1,4)},'movie'],
      ['classics','/discover/movie',{sort_by:'vote_count.desc','primary_release_date.lte':yearsAgo+'-12-31',page:page(1,4)},'movie']
    ];
    if(genre)queries.push(['similar','/discover/movie',{
      with_genres:String(genre),sort_by:'popularity.desc',page:page(1,4)},'movie']);
    const answers=await Promise.allSettled(queries.map(async ([bucket,path,params,type])=>({
      bucket,items:list(await api(path,params,fresh),type)
    })));
    if(token!==request || own!==generation || category!=='Home' ||
      state.settings.uiLayout!=='figma-one')return;
    const pools={};
    for(const answer of answers)if(answer.status==='fulfilled'){
      const {bucket,items}=answer.value;(pools[bucket] ||= []).push(...items);
    }
    if(!Object.keys(pools).length){
      $('#content').innerHTML=empty('Movie recommendations are unavailable','Check your TMDB connection and try Refresh.');
      status('Unable to load TMDB discovery');return;
    }
    const selected=engine.select({
      pools,positions:state.positions||{},history:state.history||[],
      hidden:state.notInterested||[],seen:seenFor(rotation.seed),seed:rotation.seed,
      now:Date.now(),limit:16
    });
    if(!selected.hero){
      $('#content').innerHTML=empty('No titles to recommend','Try refreshing or adjusting your catalogue settings.');
      status('No eligible featured titles');return;
    }
    heroItem=selected.hero;
    visibleRows=selected.rails;
    $('#content').innerHTML='<div class="one-home">'+hero(heroItem)+
      '<div class="one-home-shelves">'+continueShelf()+
      shelf('Recommended For You',selected.rails['Recommended For You'],'wide',true)+
      shelf('Trending Now',selected.rails['Trending Now'])+
      shelf('New & Noteworthy',selected.rails['New & Noteworthy'],'poster')+
      shelf('Top Rated Movies',selected.rails['Top Rated Movies'])+
      shelf('Hidden Gems',selected.rails['Hidden Gems'],'wide')+
      shelf('Rediscover the Classics',selected.rails['Rediscover the Classics'],'poster')+
      '</div></div>';
    recordShown(rotation.seed,selected);
    clearInterval(heroTimer);
    status('Figma One UI • '+selected.uniqueCount+' distinct titles considered');
  }

  document.addEventListener('click',e=>{
    const btn=e.target.closest?.('[data-one-refresh]');
    if(!btn)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if(document.documentElement.dataset.layout!=='figma-one')return;
    cycle(true);
    busy();
    render({fresh:true,token:++request}).catch(error=>{
      $('#content').innerHTML=empty('Unable to refresh',error?.message||'Try again.');
    });
  },true);
  window.zeroFigmaOne={render,updateWatchlist};
})();
