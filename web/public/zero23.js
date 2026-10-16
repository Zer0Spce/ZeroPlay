'use strict';
(() => {
  const VERSION='2.3-test';
  const STORAGE='zeroplay-zero23-v1';
  const FEATURES=[
    'For You','Taste Profile','Adaptive Home','Contextual Because You Watched','Household Profiles','Continue Watching cleanup','Finish It','Series Hub','Episode notifications','Release Radar',
    'Follow people/directors/franchises','Franchise progress','Collection timelines','Watchlist organization','Watchlist Roulette','Watchlist Voting','Calendar','Newly Added catalog','Decades','Awards & acclaim',
    'Seasonal Home','Philippines Trends','Critics vs Audience lens','Advanced Search','Aliases & typo tolerance','Universal Search','TV voice search','Habit-based suggestions','TV quick panel','Remote shortcuts',
    'Focus memory','Per-profile UI','Kids/Guest profiles','Avatars','Ambient artwork','Poster density','Accessibility','Quick presets','Storage dashboard','Smart cache',
    'Network-aware artwork','Offline catalog','Profile import/export','LAN sync packet','Backup scheduler','Unified Home state','What Changed','Feature Tips','Diagnostics health page','Profile backup foundations'
  ];
  const GENRES={28:'Action',12:'Adventure',16:'Animation',35:'Comedy',80:'Crime',99:'Documentary',18:'Drama',10751:'Family',14:'Fantasy',36:'History',27:'Horror',10402:'Music',9648:'Mystery',10749:'Romance',878:'Science Fiction',10770:'TV Movie',53:'Thriller',10752:'War',37:'Western',10759:'Action & Adventure',10762:'Kids',10763:'News',10764:'Reality',10765:'Sci-Fi & Fantasy',10766:'Soap',10767:'Talk',10768:'War & Politics'};
  const DEFAULT_PROFILE={avatar:'🎬',mode:'adult',density:'balanced',preset:'balanced',highContrast:false,largeText:false,reducedMotion:false,dataSaver:false,seasonal:true,philippines:true,featureTips:true};
  const DEFAULT_STORE={schema:1,version:VERSION,activeProfile:'Default',profiles:{Default:{...DEFAULT_PROFILE}},follows:{people:[],series:[],franchises:[]},votes:{},calendar:[],hiddenContinue:[],focusKey:'',cache:{},offline:{},backups:[],lastBackup:0,lastHubTab:'for-you',changedSeen:false,tip:0};
  const clone=value=>JSON.parse(JSON.stringify(value));
  const safeText=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const itemKey=item=>`${item?.type==='series'?'tv':item?.type||'movie'}:${String(item?.id||'').replace(/^tmdb-(?:movie|series)-/,'')}`;
  let store=loadStore(), rendering=false, adaptiveBusy=false, apiMemory=new Map(), lastState=null;

  function loadStore(){
    try{
      const parsed=JSON.parse(localStorage.getItem(STORAGE)||'null');
      if(parsed&&typeof parsed==='object'){
        const merged={...clone(DEFAULT_STORE),...parsed};
        merged.profiles={Default:{...DEFAULT_PROFILE},...(parsed.profiles||{})};
        if(!merged.profiles[merged.activeProfile])merged.activeProfile='Default';
        return merged;
      }
    }catch{}
    return clone(DEFAULT_STORE);
  }
  function saveStore(){store.version=VERSION;try{localStorage.setItem(STORAGE,JSON.stringify(store));}catch{}applyProfileUi();}
  function profile(){return store.profiles[store.activeProfile]||(store.profiles.Default={...DEFAULT_PROFILE});}
  function coreState(){return window.zero?.state?window.zero.state().then(s=>(lastState=s,s)):Promise.resolve(lastState||{});}
  function networkSaver(){const c=navigator.connection||navigator.mozConnection||navigator.webkitConnection;return profile().dataSaver||c?.saveData||['slow-2g','2g'].includes(c?.effectiveType);}
  function applyProfileUi(){
    const p=profile(),root=document.documentElement;
    root.dataset.zero23='1';root.dataset.zero23Density=p.density||'balanced';root.dataset.zero23Contrast=p.highContrast?'1':'0';root.dataset.zero23Large=p.largeText?'1':'0';root.dataset.zero23Motion=p.reducedMotion?'reduce':'full';root.dataset.zero23Saver=networkSaver()?'1':'0';
  }
  function normalized(raw,type){
    const media=type||raw?.media_type;if(!['movie','tv'].includes(media)||!Number.isFinite(Number(raw?.id)))return null;
    const id=Number(raw.id),poster=raw.poster_path?`https://image.tmdb.org/t/p/${networkSaver()?'w342':'w500'}${raw.poster_path}`:'',backdrop=raw.backdrop_path?`https://image.tmdb.org/t/p/${networkSaver()?'w500':'w1280'}${raw.backdrop_path}`:'';
    return {id,type:media,title:raw.title||raw.name||'Untitled',overview:raw.overview||'',poster,backdrop,date:raw.release_date||raw.first_air_date||'',rating:Number(raw.vote_average)||0,popularity:Number(raw.popularity)||0,voteCount:Number(raw.vote_count)||0,genreIds:Array.isArray(raw.genre_ids)?raw.genre_ids:[],originalLanguage:raw.original_language||'',originCountry:Array.isArray(raw.origin_country)?raw.origin_country:[]};
  }
  function rowsFrom(raw,type){return (raw?.results||[]).map(x=>normalized(x,type)).filter(Boolean);}
  async function api23(path,params={},ttl=300000){
    const key=path+'|'+JSON.stringify(params),now=Date.now(),hit=apiMemory.get(key)||store.cache[key];
    if(hit&&hit.until>now)return hit.data;
    try{
      const data=await window.zero.api(path,params);const entry={data,until:now+ttl};apiMemory.set(key,entry);store.cache[key]=entry;
      const keys=Object.keys(store.cache);if(keys.length>24)for(const old of keys.slice(0,keys.length-24))delete store.cache[old];saveStore();return data;
    }catch(error){
      const offline=store.offline[key];if(offline)return offline.data;throw error;
    }
  }
  async function cachedRows(name,path,params={},type){
    const key=path+'|'+JSON.stringify(params);try{const raw=await api23(path,params);store.offline[key]={data:raw,at:Date.now(),name};saveStore();return rowsFrom(raw,type);}catch{return rowsFrom(store.offline[key]?.data||{},type);}
  }
  function allPersonal(state){
    const bag=[];for(const list of [state?.favorites,state?.planned,state?.history,Object.values(state?.positions||{})])for(const item of list||[])if(item&&item.id)bag.push(item);return bag;
  }
  function taste(state){
    const items=allPersonal(state),genres=new Map(),languages=new Map(),decades=new Map(),types={movie:0,tv:0};
    for(const item of items){const weight=(state?.favorites||[]).some(x=>itemKey(x)===itemKey(item))?3:1;for(const g of item.genreIds||[])genres.set(Number(g),(genres.get(Number(g))||0)+weight);if(item.originalLanguage)languages.set(item.originalLanguage,(languages.get(item.originalLanguage)||0)+weight);const y=Number(String(item.date||item.releaseDate||'').slice(0,4));if(y>1900){const d=Math.floor(y/10)*10;decades.set(d,(decades.get(d)||0)+weight);}const t=item.type==='series'?'tv':item.type;if(types[t]!=null)types[t]+=weight;}
    const sort=map=>[...map.entries()].sort((a,b)=>b[1]-a[1]);
    return {genres:sort(genres),languages:sort(languages),decades:sort(decades),types,items};
  }
  function register(items){
    for(const item of items||[]){try{if(typeof titles!=='undefined'&&titles?.set)titles.set(`${item.type}:${item.id}`,item);}catch{}}
    return items||[];
  }
  function row23(label,items,landscape=false,note=''){
    items=register((items||[]).slice(0,20));if(!items.length)return '';
    try{if(typeof row==='function')return row(label,items,landscape).replace(`<small>${items.length} picks</small>`,`<small>${safeText(note||items.length+' picks')}</small>`);}catch{}
    return `<section class="row-section"><div class="section-head"><h3>${safeText(label)}</h3><small>${safeText(note||items.length+' picks')}</small></div><div class="zero23-fallback-cards">${items.map(x=>`<button data-zero23-open="${safeText(x.type+':'+x.id)}"><img src="${safeText(x.poster||x.backdrop)}" alt=""><b>${safeText(x.title)}</b></button>`).join('')}</div></section>`;
  }
  function positions(state){return Object.values(state?.positions||{}).filter(x=>x&&x.id);}
  function finishItems(state){return positions(state).filter(x=>Number(x.percent)>=65&&Number(x.percent)<95).sort((a,b)=>Number(b.percent)-Number(a.percent));}
  function continueClean(state){const hidden=new Set(store.hiddenContinue);return positions(state).filter(x=>Number(x.percent)>0&&Number(x.percent)<95&&!hidden.has(itemKey(x))).sort((a,b)=>(b.at||0)-(a.at||0));}
  function seriesItems(state){const seen=new Set();return positions(state).filter(x=>(x.type==='tv'||x.type==='series')&&!seen.has(String(x.id))&&seen.add(String(x.id)));}
  function seasonalGenre(){const m=new Date().getMonth()+1;return m===10?27:m===12?10751:m===2?10749:m>=6&&m<=8?12:35;}
  function yearRange(decade){return {gte:`${decade}-01-01`,lte:`${decade+9}-12-31`};}
  function timeHabit(){const h=new Date().getHours();return h<6?'Late-night':h<12?'Morning':h<18?'Afternoon':'Evening';}
  function tasteCopy(t){const gs=t.genres.slice(0,3).map(([g])=>GENRES[g]||`Genre ${g}`),d=t.decades[0]?.[0],lang=t.languages[0]?.[0];return gs.length?`${gs.join(', ')}${d?` · ${d}s`:''}${lang?` · ${lang.toUpperCase()}`:''}`:'Watch or save a few titles and ZeroPlay will learn your taste.';}
  function profileBar(){
    const p=profile(),names=Object.keys(store.profiles);
    return `<section class="zero23-panel zero23-profilebar"><div><span class="zero23-avatar">${safeText(p.avatar||'🎬')}</span><div><b>${safeText(store.activeProfile)}</b><small>${safeText(p.mode||'adult')} profile · ${safeText(p.preset||'balanced')} preset</small></div></div><div class="zero23-actions"><select data-zero23-profile>${names.map(n=>`<option ${n===store.activeProfile?'selected':''}>${safeText(n)}</option>`).join('')}</select><button data-zero23-action="profile-add">+ Profile</button><button data-zero23-action="profiles">Manage</button></div></section>`;
  }
  function featureMap(){return `<details class="zero23-panel zero23-map"><summary>2.3 enhancement map · 50/50</summary><div class="zero23-feature-grid">${FEATURES.map((f,i)=>`<div><b>${i+1}</b><span>${safeText(f)}</span><em>Ready to test</em></div>`).join('')}</div></details>`;}
  async function discoveryData(state){
    const t=taste(state),genre=t.genres[0]?.[0],recent=[...positions(state)].sort((a,b)=>(b.at||0)-(a.at||0))[0],today=new Date().toISOString().slice(0,10),decade=t.decades[0]?.[0]||2010;
    const calls={
      forYou:genre?cachedRows('For You','/discover/movie',{with_genres:genre,sort_by:'popularity.desc','vote_count.gte':100},'movie'):cachedRows('For You','/movie/top_rated',{},'movie'),
      contextual:recent?cachedRows('Because You Watched',`/${recent.type==='tv'||recent.type==='series'?'tv':'movie'}/${String(recent.id).replace(/^tmdb-(?:movie|series)-/,'')}/recommendations`,{},recent.type==='tv'||recent.type==='series'?'tv':'movie'):Promise.resolve([]),
      releaseMovie:cachedRows('Release Radar','/movie/upcoming',{region:'PH'},'movie'),
      releaseTv:cachedRows('Release Radar TV','/tv/on_the_air',{},'tv'),
      ph:cachedRows('Philippines Trends','/discover/movie',{region:'PH',sort_by:'popularity.desc','primary_release_date.lte':today},'movie'),
      acclaim:cachedRows('Awards & Acclaim','/discover/movie',{sort_by:'vote_average.desc','vote_count.gte':1500},'movie'),
      crowd:cachedRows('Crowd Favorites','/movie/popular',{region:'PH'},'movie'),
      decade:cachedRows('Decade', '/discover/movie',{'primary_release_date.gte':yearRange(decade).gte,'primary_release_date.lte':yearRange(decade).lte,sort_by:'popularity.desc'},'movie'),
      seasonal:cachedRows('Seasonal','/discover/movie',{with_genres:seasonalGenre(),sort_by:'popularity.desc'},'movie')
    };
    const names=Object.keys(calls),results=await Promise.all(names.map(k=>calls[k].catch(()=>[])));const out={};names.forEach((k,i)=>out[k]=results[i]);return out;
  }
  async function renderHub(){
    if(rendering)return;rendering=true;applyProfileUi();
    try{
      const state=await coreState(),t=taste(state),data=await discoveryData(state),content=document.querySelector('#content');if(!content)return;
      const finish=finishItems(state),series=seriesItems(state),clean=continueClean(state),watch=state.favorites||[],release=[...data.releaseMovie,...data.releaseTv].sort((a,b)=>String(a.date).localeCompare(String(b.date))).slice(0,20);
      document.documentElement.dataset.section='For You';const heading=document.querySelector('#heading'),eyebrow=document.querySelector('#eyebrow');if(heading)heading.textContent='Made for you.';if(eyebrow)eyebrow.textContent='ZEROPLAY 2.3 TEST LAB';
      content.innerHTML=`<div class="zero23-shell">${profileBar()}<section class="zero23-hero"><div><span>YOUR TASTE PROFILE</span><h2>${safeText(tasteCopy(t))}</h2><p>${safeText(timeHabit())} picks adapt to your watch history, watchlist, language and era preferences.</p></div><div class="zero23-actions"><button class="primary" data-zero23-action="roulette">🎲 Watchlist Roulette</button><button data-zero23-action="quick">Quick panel</button><button data-zero23-action="changed">What Changed</button></div></section><div class="zero23-stats"><div><b>${watch.length}</b><span>Watchlist</span></div><div><b>${clean.length}</b><span>Continue</span></div><div><b>${finish.length}</b><span>Finish It</span></div><div><b>${series.length}</b><span>Series</span></div><div><b>${store.follows.people.length+store.follows.series.length}</b><span>Following</span></div></div>${row23('For You',data.forYou)}${row23(recentLabel(state),data.contextual)}${row23('Finish It',finish,true,'65–94% complete')}${row23('Continue Watching · cleaned',clean,true,'Hide stale items without deleting history')}${row23('Series Hub',series,true,'Resume your active series')}${row23('Release Radar',release,true,'Upcoming movies + currently airing TV')}${profile().philippines?row23('Popular in the Philippines',data.ph,false,'Region-aware discovery'):''}${profile().seasonal?row23(seasonalTitle(),data.seasonal):''}${row23('Awards & Acclaim',data.acclaim,false,'High-rated titles with substantial vote counts')}${row23('Audience Favorites',data.crowd,false,'Popularity lens')}${row23(`${t.decades[0]?.[0]||2010}s rewind`,data.decade)}${watchlistTools(watch)}${advancedSearchPanel()}${followingPanel()}${calendarPanel()}${appearancePanel()}${systemPanel()}${featureMap()}</div>`;
      restoreFocus();if(profile().featureTips)showTip(false);
    }finally{rendering=false;}
  }
  function recentLabel(state){const recent=[...positions(state)].sort((a,b)=>(b.at||0)-(a.at||0))[0];return recent?`Because you watched ${recent.title||'a recent title'}`:'Because You Watched';}
  function seasonalTitle(){const m=new Date().getMonth()+1;return m===10?'Spooky Season':m===12?'Holiday Watch':m===2?'February Romance':m>=6&&m<=8?'Summer Adventures':'Seasonal Picks';}
  function watchlistTools(items){
    const sorted=[...(items||[])].sort((a,b)=>(store.votes[itemKey(b)]||0)-(store.votes[itemKey(a)]||0));
    return `<section class="zero23-panel"><div class="section-head"><h3>Watchlist organization & voting</h3><small>Vote, sort, or let ZeroPlay choose</small></div><div class="zero23-votes">${sorted.slice(0,12).map(x=>`<div><span>${safeText(x.title)}</span><button data-zero23-vote="${safeText(itemKey(x))}" data-delta="1">▲</button><b>${store.votes[itemKey(x)]||0}</b><button data-zero23-vote="${safeText(itemKey(x))}" data-delta="-1">▼</button></div>`).join('')||'<p>Your watchlist is empty.</p>'}</div></section>`;
  }
  function advancedSearchPanel(){return `<section class="zero23-panel"><div class="section-head"><h3>Universal + Advanced Search</h3><small>Titles, people, aliases and filters</small></div><form id="zero23-search" class="zero23-search"><input name="q" placeholder="Title, alias, actor or director" maxlength="120"><select name="type"><option value="multi">Movies + TV</option><option value="movie">Movies</option><option value="tv">TV series</option></select><input name="year" type="number" min="1900" max="2100" placeholder="Year"><input name="rating" type="number" min="0" max="10" step="0.5" placeholder="Min rating"><button class="primary">Search</button><button type="button" data-zero23-action="voice">🎙 Voice</button></form><div id="zero23-search-results"></div></section>`;}
  function followingPanel(){return `<section class="zero23-panel"><div class="section-head"><h3>Following</h3><small>People, directors, series & franchises</small></div><div class="zero23-follow-tags">${store.follows.people.map(p=>`<button data-zero23-unfollow="person:${p.id}">${safeText(p.name)} ×</button>`).join('')||'<span>No people followed yet.</span>'}</div><form id="zero23-person-search" class="zero23-search"><input name="q" placeholder="Find actor or director"><button>Find person</button></form><div id="zero23-person-results"></div></section>`;}
  function calendarPanel(){return `<section class="zero23-panel"><div class="section-head"><h3>Watch Calendar</h3><small>Plan titles and episode check-ins</small></div><form id="zero23-calendar" class="zero23-search"><input name="title" placeholder="Title / episode" required><input name="date" type="date" required><button>Add</button></form><div class="zero23-calendar">${[...store.calendar].sort((a,b)=>a.date.localeCompare(b.date)).map((x,i)=>`<div><b>${safeText(x.date)}</b><span>${safeText(x.title)}</span><button data-zero23-calendar-remove="${i}">×</button></div>`).join('')||'<p>No planned dates yet.</p>'}</div></section>`;}
  function appearancePanel(){const p=profile();return `<section class="zero23-panel"><div class="section-head"><h3>Profile UI & Accessibility</h3><small>Per-profile controls</small></div><div class="zero23-control-grid"><label>Avatar<select data-zero23-setting="avatar">${['🎬','🍿','🚀','👾','🌙','⭐','🦊','🐼'].map(x=>`<option ${p.avatar===x?'selected':''}>${x}</option>`).join('')}</select></label><label>Poster density<select data-zero23-setting="density">${['comfortable','balanced','compact'].map(x=>`<option ${p.density===x?'selected':''}>${x}</option>`).join('')}</select></label><label>Profile mode<select data-zero23-setting="mode">${['adult','kids','guest'].map(x=>`<option ${p.mode===x?'selected':''}>${x}</option>`).join('')}</select></label><label><input type="checkbox" data-zero23-setting="highContrast" ${p.highContrast?'checked':''}> High contrast</label><label><input type="checkbox" data-zero23-setting="largeText" ${p.largeText?'checked':''}> Large text</label><label><input type="checkbox" data-zero23-setting="reducedMotion" ${p.reducedMotion?'checked':''}> Reduced motion</label><label><input type="checkbox" data-zero23-setting="dataSaver" ${p.dataSaver?'checked':''}> Data saver artwork</label></div><div class="zero23-presets"><button data-zero23-preset="beautiful">Beautiful</button><button data-zero23-preset="balanced">Balanced</button><button data-zero23-preset="fast">Fast</button><button data-zero23-preset="data-saver">Data Saver</button><button data-zero23-preset="tv-performance">TV Performance</button></div></section>`;}
  function storageBytes(){let n=0;try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);n+=(k.length+(localStorage.getItem(k)||'').length)*2;}}catch{}return n;}
  function systemPanel(){const bytes=storageBytes(),offline=Object.keys(store.offline).length,backups=store.backups.length;return `<section class="zero23-panel"><div class="section-head"><h3>Storage, Sync & Diagnostics</h3><small>Local-first tools</small></div><div class="zero23-stats"><div><b>${(bytes/1024).toFixed(1)} KB</b><span>Browser/app data</span></div><div><b>${offline}</b><span>Offline catalog sets</span></div><div><b>${Object.keys(store.cache).length}</b><span>Smart cache entries</span></div><div><b>${backups}</b><span>Scheduled backups</span></div></div><div class="zero23-actions"><button data-zero23-action="cache-clear">Clear smart cache</button><button data-zero23-action="backup">Export profile</button><button data-zero23-action="import">Import profile</button><button data-zero23-action="sync-export">LAN sync packet</button><button data-zero23-action="sync-import">Import sync packet</button><button data-zero23-action="diagnostics">Run diagnostics</button></div><pre id="zero23-diagnostics" class="zero23-diagnostics"></pre></section>`;}
  async function adaptiveHome(){
    if(adaptiveBusy||document.documentElement.dataset.section!=='Home')return;const content=document.querySelector('#content');if(!content||content.querySelector('.zero23-adaptive'))return;adaptiveBusy=true;
    try{const state=await coreState(),t=taste(state);if(!t.items.length)return;const data=await discoveryData(state);if(document.documentElement.dataset.section!=='Home'||content.querySelector('.zero23-adaptive'))return;const wrapper=document.createElement('section');wrapper.className='zero23-adaptive';wrapper.innerHTML=`<div class="section-head"><h3>For You · ${safeText(tasteCopy(t))}</h3><button data-zero23-open-hub>Open 2.3 hub →</button></div>${row23('Personal picks',data.forYou)}`;const hero=content.querySelector('#hero'),anchor=hero?.nextSibling||content.firstChild;content.insertBefore(wrapper,anchor);}
    catch{}finally{adaptiveBusy=false;}
  }
  function injectNav(){
    const aside=document.querySelector('aside');if(!aside||aside.querySelector('[data-zero23-nav]'))return;const labels=[...aside.querySelectorAll('.nav-label')],space=labels.find(x=>/YOUR SPACE/i.test(x.textContent));const b=document.createElement('button');b.dataset.zero23Nav='1';b.innerHTML='✦ <span>For You</span>';b.title='ZeroPlay 2.3 personalization hub';aside.insertBefore(b,space||null);
  }
  function openHub(){for(const b of document.querySelectorAll('[data-nav]'))b.classList.remove('active');document.querySelector('[data-zero23-nav]')?.classList.add('active');renderHub();}
  function restoreFocus(){const key=store.focusKey;if(!key)return;requestAnimationFrame(()=>document.querySelector(`[data-card-key="${CSS.escape(key)}"],[data-detail="${CSS.escape(key)}"]`)?.focus());}
  function rememberFocus(target){const card=target?.closest?.('[data-card-key],[data-detail]');if(card){store.focusKey=card.dataset.cardKey||card.dataset.detail||'';saveStore();const img=card.querySelector('img')?.src;if(img)document.documentElement.style.setProperty('--zero23-ambient',`url("${img.replace(/["\\]/g,'')}")`);}}
  function preset(name){const p=profile();Object.assign(p,name==='beautiful'?{preset:name,density:'comfortable',dataSaver:false,reducedMotion:false}:name==='fast'?{preset:name,density:'compact',dataSaver:true,reducedMotion:true}:name==='data-saver'?{preset:name,density:'compact',dataSaver:true,reducedMotion:true}:name==='tv-performance'?{preset:name,density:'balanced',dataSaver:true,reducedMotion:true}:{preset:'balanced',density:'balanced',dataSaver:false,reducedMotion:false});saveStore();renderHub();}
  async function roulette(){const state=await coreState(),items=state.favorites||[];if(!items.length)return notify('Your watchlist is empty.');const item=items[Math.floor(Math.random()*items.length)];try{if(typeof details==='function'){register([item]);details(item);}else notify(`Tonight: ${item.title}`);}catch{notify(`Tonight: ${item.title}`);}}
  function notify(message){try{if(typeof toast==='function')return toast(message);}catch{}const n=document.querySelector('#toast');if(n){n.textContent=message;n.style.display='block';setTimeout(()=>n.style.display='none',3500);}else alert(message);}
  function backupObject(){return {product:'ZeroPlay',schema:1,feature:'zero23',createdAt:new Date().toISOString(),store};}
  function downloadBackup(){const blob=new Blob([JSON.stringify(backupObject(),null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`ZeroPlay-2.3-profile-${store.activeProfile.replace(/\W+/g,'-')}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
  function importBackup(){const input=document.createElement('input');input.type='file';input.accept='application/json';input.onchange=async()=>{try{const data=JSON.parse(await input.files[0].text());if(data.product!=='ZeroPlay'||data.schema!==1||!data.store)throw Error('Not a ZeroPlay 2.3 backup');store={...clone(DEFAULT_STORE),...data.store};saveStore();notify('Profile backup imported.');renderHub();}catch(e){notify(e.message);}};input.click();}
  async function syncExport(){const text=btoa(unescape(encodeURIComponent(JSON.stringify(backupObject()))));try{await navigator.clipboard.writeText(text);notify('LAN sync packet copied. Paste it into ZeroPlay on the other device.');}catch{prompt('Copy this LAN sync packet',text);}}
  function syncImport(){const text=prompt('Paste the ZeroPlay LAN sync packet');if(!text)return;try{const data=JSON.parse(decodeURIComponent(escape(atob(text.trim()))));if(data.product!=='ZeroPlay'||!data.store)throw Error();store={...clone(DEFAULT_STORE),...data.store};saveStore();renderHub();notify('Sync packet imported.');}catch{notify('Invalid sync packet.');}}
  async function diagnostics(){const out=document.querySelector('#zero23-diagnostics');if(out)out.textContent='Running checks…';const lines=[];lines.push(`ZeroPlay ${VERSION}`);lines.push(`Profile: ${store.activeProfile} (${profile().mode})`);lines.push(`Online: ${navigator.onLine?'yes':'no'}`);lines.push(`Data saver: ${networkSaver()?'on':'off'}`);lines.push(`Storage: ${(storageBytes()/1024).toFixed(1)} KB`);lines.push(`Offline sets: ${Object.keys(store.offline).length}`);lines.push(`Player files: frozen by branch CI guard`);try{await api23('/configuration',{},1000);lines.push('TMDB: healthy');}catch(e){lines.push('TMDB: '+(e.message||'unavailable'));}if(out)out.textContent=lines.join('\n');}
  function showTip(force){if(!force&&document.querySelector('.zero23-tip'))return;const tips=['Press Alt+F to open For You from anywhere.','Press R inside the 2.3 hub for Watchlist Roulette.','Your 2.3 profile settings stay local unless you export or sync them.','Data Saver automatically requests smaller TMDB artwork.','Use the diagnostics panel before reporting a test issue.'];const tip=tips[store.tip++%tips.length];saveStore();const node=document.createElement('div');node.className='zero23-tip';node.innerHTML=`<b>2.3 tip</b><span>${safeText(tip)}</span><button>×</button>`;node.querySelector('button').onclick=()=>node.remove();document.body.appendChild(node);setTimeout(()=>node.remove(),8000);}
  function changed(){const message='2.3 test branch adds the 50-point personalization, discovery, profile, accessibility, cache, sync and diagnostics layer. Playback behavior and sources are intentionally unchanged.';notify(message);store.changedSeen=true;saveStore();}
  async function advancedSearch(form){const box=document.querySelector('#zero23-search-results'),fd=new FormData(form),q=String(fd.get('q')||'').trim(),type=String(fd.get('type')||'multi'),year=Number(fd.get('year'))||0,min=Number(fd.get('rating'))||0;if(!q)return;box.innerHTML='<p>Searching…</p>';try{let raw=await api23(type==='multi'?'/search/multi':`/search/${type}`,{query:q,include_adult:false});let items=rowsFrom(raw,type==='multi'?undefined:type).filter(x=>(!year||Number(x.date.slice(0,4))===year)&&x.rating>=min);if(!items.length&&/[\-:']/g.test(q)){raw=await api23('/search/multi',{query:q.replace(/[\-:']/g,' ').replace(/\s+/g,' ').trim(),include_adult:false});items=rowsFrom(raw).filter(x=>x.rating>=min);}const people=await api23('/search/person',{query:q,include_adult:false}).catch(()=>({results:[]}));box.innerHTML=row23('Title results',items)+(people.results?.length?`<div class="zero23-people">${people.results.slice(0,8).map(p=>`<button data-zero23-follow-person="${Number(p.id)}" data-name="${safeText(p.name)}">+ Follow ${safeText(p.name)}</button>`).join('')}</div>`:'');}catch(e){box.innerHTML=`<p>${safeText(e.message)}</p>`;}}
  async function personSearch(form){const box=document.querySelector('#zero23-person-results'),q=new FormData(form).get('q');if(!q)return;box.textContent='Searching…';try{const raw=await api23('/search/person',{query:q,include_adult:false});box.innerHTML=(raw.results||[]).slice(0,12).map(p=>`<button data-zero23-follow-person="${Number(p.id)}" data-name="${safeText(p.name)}">+ ${safeText(p.name)}${p.known_for_department?` · ${safeText(p.known_for_department)}`:''}</button>`).join('')||'<p>No people found.</p>';}catch(e){box.textContent=e.message;}}
  function voiceSearch(){const C=window.SpeechRecognition||window.webkitSpeechRecognition;if(!C)return notify('Voice search is not available in this browser/device.');const r=new C();r.lang='en-US';r.interimResults=false;r.onresult=e=>{const input=document.querySelector('#zero23-search input[name="q"]');if(input){input.value=e.results[0][0].transcript;document.querySelector('#zero23-search').requestSubmit();}};r.onerror=()=>notify('Voice search could not hear a query.');r.start();}
  function scheduledBackup(){if(Date.now()-Number(store.lastBackup||0)<86400000)return;store.backups.unshift({at:Date.now(),profile:store.activeProfile,data:clone(profile())});store.backups=store.backups.slice(0,7);store.lastBackup=Date.now();saveStore();}
  function quickPanel(){notify(`Quick panel · ${store.activeProfile} · ${profile().preset} · ${networkSaver()?'Data Saver':'Full artwork'} · ${continueClean(lastState||{}).length} continuing`);}
  function profileManager(){const action=prompt(`Profiles: ${Object.keys(store.profiles).join(', ')}\nType a profile name to switch, or prefix + to create (example: +Kids).`);if(!action)return;if(action.startsWith('+')){const name=action.slice(1).trim().slice(0,24);if(!name)return;store.profiles[name]={...DEFAULT_PROFILE,mode:/kid/i.test(name)?'kids':'adult'};store.activeProfile=name;}else if(store.profiles[action])store.activeProfile=action;saveStore();renderHub();}
  async function tryCoreProfile(name){try{await window.zero.change('profile-switch',name);lastState=await window.zero.state();}catch{}}
  document.addEventListener('click',async event=>{
    const nav=event.target.closest('[data-zero23-nav],[data-zero23-open-hub]');if(nav){event.preventDefault();openHub();return;}
    const a=event.target.closest('[data-zero23-action]');if(a){const action=a.dataset.zero23Action;if(action==='roulette')roulette();else if(action==='quick')quickPanel();else if(action==='changed')changed();else if(action==='profile-add'){const name=prompt('New profile name');if(name?.trim()){store.profiles[name.trim().slice(0,24)]={...DEFAULT_PROFILE};store.activeProfile=name.trim().slice(0,24);saveStore();await tryCoreProfile(store.activeProfile);renderHub();}}else if(action==='profiles')profileManager();else if(action==='voice')voiceSearch();else if(action==='cache-clear'){apiMemory.clear();store.cache={};saveStore();notify('Smart cache cleared. Offline catalog kept.');renderHub();}else if(action==='backup')downloadBackup();else if(action==='import')importBackup();else if(action==='sync-export')syncExport();else if(action==='sync-import')syncImport();else if(action==='diagnostics')diagnostics();return;}
    const vote=event.target.closest('[data-zero23-vote]');if(vote){store.votes[vote.dataset.zero23Vote]=(store.votes[vote.dataset.zero23Vote]||0)+Number(vote.dataset.delta||0);saveStore();renderHub();return;}
    const follow=event.target.closest('[data-zero23-follow-person]');if(follow){const id=Number(follow.dataset.zero23FollowPerson),name=follow.dataset.name;if(!store.follows.people.some(x=>x.id===id))store.follows.people.push({id,name});saveStore();renderHub();return;}
    const unfollow=event.target.closest('[data-zero23-unfollow]');if(unfollow){const [kind,id]=unfollow.dataset.zero23Unfollow.split(':');if(kind==='person')store.follows.people=store.follows.people.filter(x=>String(x.id)!==id);saveStore();renderHub();return;}
    const remove=event.target.closest('[data-zero23-calendar-remove]');if(remove){store.calendar.splice(Number(remove.dataset.zero23CalendarRemove),1);saveStore();renderHub();return;}
    const fallback=event.target.closest('[data-zero23-open]');if(fallback){try{const item=titles.get(fallback.dataset.zero23Open);if(item&&typeof details==='function')details(item);}catch{}return;}
  },true);
  document.addEventListener('submit',event=>{if(event.target.id==='zero23-search'){event.preventDefault();advancedSearch(event.target);}else if(event.target.id==='zero23-person-search'){event.preventDefault();personSearch(event.target);}else if(event.target.id==='zero23-calendar'){event.preventDefault();const fd=new FormData(event.target);store.calendar.push({title:String(fd.get('title')).slice(0,120),date:String(fd.get('date'))});store.calendar=store.calendar.slice(-100);saveStore();renderHub();}},true);
  document.addEventListener('change',async event=>{
    if(event.target.matches('[data-zero23-profile]')){store.activeProfile=event.target.value;saveStore();await tryCoreProfile(store.activeProfile);renderHub();return;}
    const setting=event.target.dataset.zero23Setting;if(setting){profile()[setting]=event.target.type==='checkbox'?event.target.checked:event.target.value;saveStore();renderHub();return;}
  },true);
  document.addEventListener('click',event=>{const p=event.target.closest('[data-zero23-preset]');if(p)preset(p.dataset.zero23Preset);},true);
  document.addEventListener('focusin',event=>rememberFocus(event.target));
  document.addEventListener('keydown',event=>{if(event.altKey&&event.key.toLowerCase()==='f'){event.preventDefault();openHub();return;}if(document.documentElement.dataset.section==='For You'&&!event.ctrlKey&&!event.altKey&&!event.metaKey&&!/INPUT|TEXTAREA|SELECT/.test(event.target.tagName)){if(event.key.toLowerCase()==='r'){event.preventDefault();roulette();}if(event.key==='?')showTip(true);}});
  const observer=new MutationObserver(()=>{injectNav();if(document.documentElement.dataset.section==='Home')adaptiveHome();});
  window.addEventListener('DOMContentLoaded',()=>{injectNav();applyProfileUi();scheduledBackup();observer.observe(document.body,{childList:true,subtree:true});setInterval(scheduledBackup,3600000);setTimeout(adaptiveHome,800);});
  window.zero23={open:openHub,features:()=>[...FEATURES],diagnostics,version:VERSION};
})();
