'use strict';
/* Search 2.0. Filtering is explicitly scoped to the TMDB search-result pages
   that have been loaded. Availability is checked from US flatrate metadata. */
((root,factory)=>{
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.ZeroUniversalSearch=api;
})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const MODES=['all','movie','tv'],SORT=['relevance','popular','rating','newest','az'];
 const APPROVED=['netflix','hulu','disney','max','apple','paramount','peacock','youtube-tv'];
 function normalize(input={}){
   return {
     media:MODES.includes(input.media)?input.media:'all',
     sort:SORT.includes(input.sort)?input.sort:'relevance',
     year:/^(?:19|20)\d{2}$/.test(String(input.year||''))?String(input.year):'',
     rating:[0,5,6,7,8,9].includes(Number(input.rating))?Number(input.rating):0,
     genre:Number.isInteger(Number(input.genre))&&Number(input.genre)>=0&&Number(input.genre)<999999?Number(input.genre):0,
     provider:APPROVED.includes(input.provider)?input.provider:''
   };
 }
 function filter(items,options={}){
   const f=normalize(options);
   const chosen=(items||[]).filter(x=>x&&['movie','tv'].includes(x.type)
     &&(f.media==='all'||x.type===f.media)
     &&(!f.year||String(x.date||'').slice(0,4)===f.year)
     &&(!f.rating||Number(x.rating)>=f.rating)
     &&(!f.genre||(x.genreIds||[]).includes(f.genre)));
   return chosen.sort((a,b)=>f.sort==='popular'?(b.popularity||0)-(a.popularity||0):
     f.sort==='rating'?(b.rating||0)-(a.rating||0):
     f.sort==='newest'?(b.date||'').localeCompare(a.date||''):
     f.sort==='az'?String(a.title).localeCompare(String(b.title)):0);
 }
 function usFlatRate(data,providerId){
   if(!Number.isSafeInteger(Number(providerId))||Number(providerId)<=0)return false;
   const rows=data?.results?.US?.flatrate||[];
   return rows.some(x=>Number(x.provider_id)===Number(providerId));
 }
 function recentSuggestions(query,history=[],max=6){
   const q=String(query||'').trim().toLocaleLowerCase();
   if(q.length<2)return [];
   return [...new Set(history.filter(x=>typeof x==='string'&&x.toLocaleLowerCase().includes(q)))].slice(0,max);
 }
 async function filterByProvider(items,providerIds,load,{concurrency=4}={}){
   if(!items.length)return {items:[],unverified:0};
   let cursor=0,unverified=0;
   const approved=[];
   const work=async()=>{
     while(cursor<items.length){
       const index=cursor++,item=items[index],id=providerIds[item.type];
       if(!Number.isSafeInteger(Number(id))||Number(id)<=0)continue;
       try{
         const data=await load('/'+item.type+'/'+item.id+'/watch/providers',{});
         if(usFlatRate(data,id))approved.push({index,item});
       }catch{unverified++;}
     }
   };
   await Promise.all(Array.from({length:Math.min(Math.max(1,concurrency),4,items.length)},()=>work()));
   approved.sort((a,b)=>a.index-b.index);
   return {items:approved.map(x=>x.item),unverified};
 }
 return Object.freeze({MODES,SORT,APPROVED,normalize,filter,usFlatRate,recentSuggestions,filterByProvider});
});
