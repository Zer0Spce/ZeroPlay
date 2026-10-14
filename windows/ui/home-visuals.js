'use strict';
(() => {
  if(window.__zeroHomeVisuals)return;
  window.__zeroHomeVisuals=true;

  const OLD_DEFAULT=['clock','featured','continue','upnext','because','watchlist','tonight','hidden','upcoming','providers','recommended','trending','popular','series','now','airing'];
  const REGION_NAMES={PH:'PHILIPPINES',US:'UNITED STATES',GB:'UNITED KINGDOM',CA:'CANADA',AU:'AUSTRALIA',IN:'INDIA',JP:'JAPAN'};
  const logoCache=new Map(),topCache=new Map();
  let scheduled=false,stateCache=null,stateAt=0;

  const tmdbImage=(path,size='w500')=>/^\/[A-Za-z\d_.-]+$/.test(path||'')?`https://image.tmdb.org/t/p/${size}${path}`:'';
  const refFor=item=>`${item.type}:${item.id}`;

  async function snapshot(force=false){
    if(!force&&stateCache&&Date.now()-stateAt<2500)return stateCache;
    try{stateCache=await window.zero.state();stateAt=Date.now();return stateCache;}catch{return null;}
  }

  function isImplicitOldDefault(panels){
    return !Array.isArray(panels)||(panels.length===OLD_DEFAULT.length&&OLD_DEFAULT.every(id=>panels.includes(id)));
  }

  function normalize(raw){
    const type=raw?.media_type;
    if(!['movie','tv'].includes(type)||raw.adult||!Number.isSafeInteger(Number(raw.id))||Number(raw.id)<1)return null;
    return {id:Number(raw.id),type,title:String(raw.title||raw.name||'Untitled').slice(0,300),overview:String(raw.overview||'').slice(0,10000),poster:tmdbImage(raw.poster_path),backdrop:tmdbImage(raw.backdrop_path,'w1280'),date:String(raw.release_date||raw.first_air_date||''),rating:Number(raw.vote_average)||0,popularity:Number(raw.popularity)||0,voteCount:Number(raw.vote_count)||0,genreIds:Array.isArray(raw.genre_ids)?raw.genre_ids:[],originalLanguage:raw.original_language||'',originCountry:Array.isArray(raw.origin_country)?raw.origin_country:[]};
  }

  function chooseLogo(data){
    const rows=Array.isArray(data?.images?.logos)?data.images.logos:[];
    let best=null,bestScore=-1;
    for(const row of rows){
      if(!/^\/[A-Za-z\d_.-]+$/.test(row?.file_path||''))continue;
      const language=row.iso_639_1;
      const score=(language==='en'?100:language==null?60:10)+Math.min(25,Number(row.vote_count)||0);
      if(score>bestScore){best=row;bestScore=score;}
    }
    return best?tmdbImage(best.file_path):'';
  }

  async function decorateHero(){
    const hero=document.querySelector('#hero');
    if(!hero)return;
    const match=/^(movie|tv):(\d+)$/.exec(hero.dataset.featured||'');
    if(!match)return;
    const id=match[1]+':'+match[2];
    let image=hero.querySelector('.zero-hero-title-art');
    const title=hero.querySelector('.detail-heading h2');
    if(!title)return;
    if(!image){
      image=document.createElement('img');image.className='zero-hero-title-art';image.alt='';image.hidden=true;title.insertAdjacentElement('beforebegin',image);
    }
    image.dataset.ref=id;
    const apply=url=>{
      if(image.dataset.ref!==id||document.querySelector('#hero')!==hero)return;
      if(url){
        image.onload=()=>{if(image.dataset.ref===id){image.hidden=false;title.hidden=true;}};
        image.onerror=()=>{image.hidden=true;title.hidden=false;};
        image.alt=title.textContent.trim();image.src=url;
      }else{image.hidden=true;title.hidden=false;}
    };
    if(logoCache.has(id)){apply(logoCache.get(id));return;}
    logoCache.set(id,'');
    try{
      const data=await window.zero.api(`/${match[1]}/${match[2]}`,{append_to_response:'images'});
      const url=chooseLogo(data);logoCache.set(id,url);apply(url);
    }catch{apply('');}
  }

  function installRailScrolling(rail){
    rail.tabIndex=-1;
    rail.addEventListener('wheel',event=>{
      if(rail.scrollWidth<=rail.clientWidth)return;
      const amount=Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY;
      if(!amount)return;
      event.preventDefault();
      rail.scrollBy({left:amount,behavior:'auto'});
    },{passive:false});

    // Do not capture the pointer on pointerdown. Chromium/Electron retargets the
    // resulting click to the rail when the rail owns pointer capture, which made
    // Top 10 posters look clickable but never open. Capture only after a real drag.
    let pointerId=null,startX=0,startLeft=0,moved=false,captured=false;
    rail.addEventListener('pointerdown',event=>{
      if(event.pointerType!=='mouse'||event.button!==0)return;
      pointerId=event.pointerId;startX=event.clientX;startLeft=rail.scrollLeft;moved=false;captured=false;
    });
    rail.addEventListener('pointermove',event=>{
      if(pointerId!==event.pointerId)return;
      const distance=event.clientX-startX;
      if(!moved&&Math.abs(distance)>6){
        moved=true;rail.dataset.dragging='1';
        try{rail.setPointerCapture(pointerId);captured=true;}catch{}
      }
      if(moved){event.preventDefault();rail.scrollLeft=startLeft-distance;}
    });
    const endDrag=event=>{
      if(pointerId===null||event.pointerId!==pointerId)return;
      if(moved)rail.dataset.dragged='1';
      if(captured){try{rail.releasePointerCapture(event.pointerId);}catch{}}
      pointerId=null;captured=false;delete rail.dataset.dragging;
      if(moved)setTimeout(()=>delete rail.dataset.dragged,90);
    };
    rail.addEventListener('pointerup',endDrag);rail.addEventListener('pointercancel',endDrag);
    rail.addEventListener('click',event=>{
      if(rail.dataset.dragged==='1'){
        event.preventDefault();event.stopImmediatePropagation();delete rail.dataset.dragged;
      }
    },true);

    rail.addEventListener('focusin',event=>{
      const card=event.target.closest?.('.zero-top10-card');
      if(card)card.scrollIntoView({behavior:'smooth',block:'nearest',inline:'nearest'});
    });
    rail.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight'].includes(event.key))return;
      const cards=[...rail.querySelectorAll('.zero-top10-card')];
      const current=event.target.closest?.('.zero-top10-card');
      const index=cards.indexOf(current);
      if(index<0)return;
      const next=index+(event.key==='ArrowRight'?1:-1);
      if(next<0||next>=cards.length)return;
      event.preventDefault();cards[next].focus();cards[next].scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});
    });
  }

  function top10Section(items,region){
    const section=document.createElement('section');section.className='row-section zero-top10';section.dataset.zeroTop10='1';
    const head=document.createElement('div');head.className='section-head zero-top10-head';
    const h3=document.createElement('h3');h3.textContent=`TOP 10 TODAY IN ${REGION_NAMES[region]||'PHILIPPINES'}`;head.appendChild(h3);section.appendChild(head);
    const rail=document.createElement('div');rail.className='zero-top10-rail';installRailScrolling(rail);
    items.slice(0,10).forEach((item,index)=>{
      const button=document.createElement('button');button.type='button';button.className='zero-top10-card';button.dataset.cardKey=refFor(item);button.setAttribute('aria-label',`Number ${index+1}, ${item.title}`);
      const poster=document.createElement('span');poster.className='zero-top10-poster';
      if(item.poster){const img=document.createElement('img');img.loading='lazy';img.decoding='async';img.src=item.poster;img.alt=item.title;poster.appendChild(img);}
      const rank=document.createElement('span');rank.className='zero-top10-rank';rank.textContent=String(index+1);
      button.append(poster,rank);
      button.addEventListener('click',event=>{
        event.preventDefault();event.stopPropagation();
        if(typeof window.zeroOpenDetails==='function')window.zeroOpenDetails(item);
      });
      rail.appendChild(button);
    });
    section.appendChild(rail);return section;
  }

  async function ensureTop10(){
    if(document.documentElement.dataset.section&&document.documentElement.dataset.section!=='Home')return;
    const hero=document.querySelector('#hero');if(!hero)return;
    const state=await snapshot(),region=state?.settings?.region||'PH',panels=state?.settings?.homePanels;
    const enabled=Array.isArray(panels)&&panels.includes('top10')||((!Array.isArray(panels)||!panels.includes('top10'))&&localStorage.getItem('zeroplay-top10-optout')!=='1');
    if(!enabled){document.querySelector('.zero-top10')?.remove();return;}
    let items=topCache.get(region);
    if(!items){
      try{const data=await window.zero.api('/trending/all/day');items=(data?.results||[]).map(normalize).filter(item=>item&&item.poster).slice(0,10);topCache.set(region,items);}catch{items=[];}
    }
    if(!items.length)return;
    const existing=document.querySelector('.zero-top10');
    if(existing?.dataset.region===region)return;
    existing?.remove();const section=top10Section(items,region);section.dataset.region=region;
    hero.insertAdjacentElement('afterend',section);
  }

  async function applyComingSoonDefault(){
    if(document.documentElement.dataset.section&&document.documentElement.dataset.section!=='Home')return;
    const state=await snapshot(),panels=state?.settings?.homePanels;
    const optedIn=localStorage.getItem('zeroplay-coming-soon-optin')==='1';
    const hiddenByDefault=!optedIn&&isImplicitOldDefault(panels);
    if(hiddenByDefault){
      for(const section of document.querySelectorAll('.row-section')){
        const heading=section.querySelector('.section-head h3, h3');
        if(heading?.textContent.trim().toLowerCase()==='coming soon')section.remove();
      }
      const toggle=document.querySelector('#home-panels input[value="upcoming"]');if(toggle)toggle.checked=false;
    }
  }

  async function decorate(){
    scheduled=false;
    await decorateHero();
    await ensureTop10();
    await applyComingSoonDefault();
  }

  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>decorate().catch(()=>{scheduled=false;}));}

  document.addEventListener('change',event=>{
    const input=event.target;
    if(input?.matches?.('#home-panels input[value="upcoming"]')){
      if(input.checked)localStorage.setItem('zeroplay-coming-soon-optin','1');else localStorage.removeItem('zeroplay-coming-soon-optin');
      stateCache=null;schedule();
    }
    if(input?.matches?.('#home-panels input[value="top10"]')){
      if(input.checked)localStorage.removeItem('zeroplay-top10-optout');else localStorage.setItem('zeroplay-top10-optout','1');
      stateCache=null;schedule();
    }
  });
  document.addEventListener('click',event=>{if(event.target.closest?.('[data-action="save-settings"],[data-action="restore-panels"]')){stateCache=null;setTimeout(schedule,120);}});
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('load',schedule,{once:true});
  schedule();
})();
