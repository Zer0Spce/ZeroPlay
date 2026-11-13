'use strict';
((root,factory)=>{const f=factory();if(typeof module==='object'&&module.exports)module.exports=f;else root.ZeroLiveGuide=f;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const DAY=86400,PHT=8*3600;
 function day(unix){return Math.floor((Number(unix)+PHT)/DAY);}
 function eligible(event,view='today',now=Date.now()/1000){
  if(view==='all')return true;
  if(event?.alwaysLive)return view==='today';
  if(!Number.isFinite(Number(event?.start))||Number(event.start)<=0)return false;
  const offset=day(event.start)-day(now);
  if(view==='today')return offset===0;
  if(view==='tomorrow')return offset===1;
  if(view==='week')return offset>=0&&offset<7;
  return false;
 }
 function time(unix){
  if(!Number.isFinite(Number(unix))||Number(unix)<=0)return 'Schedule unavailable';
  return new Intl.DateTimeFormat('en-PH',{timeZone:'Asia/Manila',weekday:'short',
    month:'short',day:'numeric',hour:'numeric',minute:'2-digit',hour12:true}).format(new Date(Number(unix)*1000))+' PHT';
 }
 function countdown(event,now=Date.now()/1000){
  if(event.alwaysLive)return 'LIVE · 24/7';
  if(!Number(event.start))return 'Schedule unavailable';
  if(Number(event.end)>0&&now>=Number(event.start)&&now<Number(event.end))return 'LIVE';
  if(Number(event.end)>0&&now>=Number(event.end))return 'Ended';
  if(now>=Number(event.start))return 'Started';
  const remaining=Math.max(1,Math.ceil((Number(event.start)-now)/60));
  if(remaining<60)return 'Starts in '+remaining+'m';
  const h=Math.floor(remaining/60),m=remaining%60;
  return 'Starts in '+h+'h'+(m?' '+m+'m':'');
 }
 return Object.freeze({day,eligible,time,countdown});
});
