'use strict';
(() => {
  const SECTION_PATHS={Home:'/',Movies:'/movies',Series:'/series',Search:'/search',Library:'/library'};
  const pathFor=item=>`/${item?.type==='tv'?'tv':'movie'}/${Number(item?.id)}`;
  const cleanPath=path=>path.replace(/\/+$/,'')||'/';
  let routing=false;

  function currentSectionPath(){
    try{return SECTION_PATHS[category]||'/';}catch{return '/';}
  }

  function updateShareLabels(root=document){
    for(const button of root.querySelectorAll?.('[data-share]')||[]) {
      button.textContent='↗ Share';
      button.title='Share this ZeroPlay title';
      button.setAttribute('aria-label','Share this title');
    }
  }

  function waitForApp(timeout=8000){
    return new Promise((resolve,reject)=>{
      const started=Date.now();
      const tick=()=>{
        try{
          if(typeof state!=='undefined'&&state&&typeof api==='function'&&typeof normalize==='function'&&typeof details==='function')return resolve();
        }catch{}
        if(Date.now()-started>timeout)return reject(new Error('ZeroPlay took too long to initialize.'));
        setTimeout(tick,40);
      };
      tick();
    });
  }

  async function loadTitle(type,id,{replace=false}={}){
    if(routing)return;
    routing=true;
    try{
      await waitForApp();
      const raw=await api(`/${type}/${id}`,{},false);
      const item=normalize(raw,type);
      if(!item)throw new Error('This title is unavailable.');
      const target=pathFor(item);
      if(cleanPath(location.pathname)!==target){
        history[replace?'replaceState':'pushState']({zeroPlay:true,type,id:item.id},'',target);
      }
      document.title=`${item.title} — ZeroPlay`;
      await details(item);
      updateShareLabels($('#detail'));
    }catch(error){
      try{toast(error.message||'Could not open this shared title.');}catch{}
      if(cleanPath(location.pathname)!=='/')history.replaceState({zeroPlay:true},'','/');
    }finally{routing=false;}
  }

  async function routeLocation({replace=false}={}){
    const path=cleanPath(location.pathname);
    const match=path.match(/^\/(movie|tv)\/(\d+)$/);
    if(match){
      const id=Number(match[2]);
      if(Number.isSafeInteger(id)&&id>0)return loadTitle(match[1],id,{replace});
    }
    try{
      await waitForApp();
      if($('#detail')?.open){$('#detail').close();++detailRequest;}
      const section=Object.entries(SECTION_PATHS).find(([,value])=>value===path)?.[0]||'Home';
      document.title='ZeroPlay 2.2 — Discover your next great watch';
      await navigate(section);
    }catch{}
  }

  async function shareItem(item){
    if(!item)return;
    const url=new URL(pathFor(item),location.origin).href;
    const payload={title:`${item.title} — ZeroPlay`,text:`Watch ${item.title} on ZeroPlay`,url};
    try{
      if(navigator.share){
        await navigator.share(payload);
        return;
      }
      if(navigator.clipboard?.writeText){
        await navigator.clipboard.writeText(url);
        toast('ZeroPlay link copied');
        return;
      }
      const input=document.createElement('input');
      input.value=url;input.style.position='fixed';input.style.opacity='0';document.body.appendChild(input);input.select();
      document.execCommand('copy');input.remove();toast('ZeroPlay link copied');
    }catch(error){
      if(error?.name!=='AbortError')toast('Could not share this link');
    }
  }

  document.addEventListener('click',async event=>{
    const target=event.target.closest('button,[data-nav],.brand');
    if(!target)return;

    if(target.dataset.share){
      event.preventDefault();
      event.stopImmediatePropagation();
      let item;
      try{item=titles.get(target.dataset.share);}catch{}
      await shareItem(item);
      return;
    }

    if(target.dataset.detail){
      try{
        const item=titles.get(target.dataset.detail);
        if(item){
          const next=pathFor(item);
          if(cleanPath(location.pathname)!==next)history.pushState({zeroPlay:true,type:item.type,id:item.id},'',next);
          document.title=`${item.title} — ZeroPlay`;
        }
      }catch{}
      return;
    }

    if(target.dataset.nav){
      const next=SECTION_PATHS[target.dataset.nav]||'/';
      if(cleanPath(location.pathname)!==next)history.pushState({zeroPlay:true,section:target.dataset.nav},'',next);
      document.title='ZeroPlay 2.2 — Discover your next great watch';
      return;
    }

    if(target.classList.contains('brand')){
      history.pushState({zeroPlay:true,section:'Home'},'','/');
      document.title='ZeroPlay 2.2 — Discover your next great watch';
      return;
    }

    if(target.dataset.action==='close'&&$('#detail')?.open){
      history.pushState({zeroPlay:true,section:category},'',currentSectionPath());
      document.title='ZeroPlay 2.2 — Discover your next great watch';
    }
  },true);

  window.addEventListener('popstate',()=>routeLocation({replace:true}));

  const observer=new MutationObserver(records=>{
    for(const record of records)for(const node of record.addedNodes)if(node.nodeType===1)updateShareLabels(node);
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});

  const boot=async()=>{
    updateShareLabels();
    if(/^\/(movie|tv)\/\d+\/?$/.test(location.pathname))await routeLocation({replace:true});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
