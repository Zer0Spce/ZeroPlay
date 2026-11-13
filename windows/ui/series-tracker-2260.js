'use strict';
((root,factory)=>{const v=factory();if(typeof module==='object'&&module.exports)module.exports=v;else root.ZeroSeriesTracker=v;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 function progress(positions,showId,season,episode){
   const key='tv:'+showId+':'+Number(season)+':'+Number(episode);
   const row=(positions||{})[key]||{};
   const percent=Math.max(0,Math.min(100,Number(row.percent)||0));
   return {percent,watched:percent>=95,started:percent>0&&percent<95};
 }
 function analyze(positions,showId,season,episodes){
   const list=(episodes||[]).filter(x=>Number.isSafeInteger(Number(x.episode_number))&&Number(x.episode_number)>0)
     .sort((a,b)=>a.episode_number-b.episode_number);
   const full=list.map(x=>({...x,...progress(positions,showId,season,x.episode_number)}));
   const watched=full.filter(x=>x.watched).length;
   const next=full.find(x=>x.started)||full.find(x=>!x.watched)||null;
   return {season,total:full.length,watched,percent:full.length?Math.round(100*watched/full.length):0,
     next:next?{season,episode:Number(next.episode_number),name:String(next.name||'Episode '+next.episode_number),
       continue:next.started}:null};
 }
 function seriesWatched(positions,showId){
   const prefix='tv:'+showId+':',ids=new Set();
   for(const [key,row] of Object.entries(positions||{})){
     if(!key.startsWith(prefix)||!/^\d+:\d+$/.test(key.slice(prefix.length)))continue;
     if(Number(row?.percent)>=95)ids.add(key);
   }
   return ids.size;
 }
 return Object.freeze({progress,analyze,seriesWatched});
});
