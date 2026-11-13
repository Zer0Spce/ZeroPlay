'use strict';
/* A page loading does not prove a title plays. Only confirmed playback progress is success. */
const ONLINE=Object.freeze(['vidstuck','zxcstream','embedwave','vidnest','vidrift','vidfast','vidapi']);
const COOLDOWN_MS=30*60*1000;
function touch(stats={},id,kind,elapsed=0,now=Date.now()){
  if(!ONLINE.includes(id))return stats;
  const row={ok:0,fail:0,load:0,...(stats[id]||{})};
  if(kind==='load'){const t=Math.min(30000,Math.max(0,Number(elapsed)||0));
    if(t)row.load=row.load?Math.round((row.load*3+t)/4):t;
  }
  if(kind==='progress'){row.ok=Math.min(500,row.ok+1);row.failStreak=0;row.lastGoodAt=now;}
  if(kind==='failure'){row.fail=Math.min(500,row.fail+1);row.failStreak=Math.min(20,(row.failStreak||0)+1);row.lastFailAt=now;}
  stats[id]=row;return stats;
}
function score(row={},now=Date.now()){
  const reliability=((Number(row.ok)||0)+2)/((Number(row.ok)||0)+(Number(row.fail)||0)+4);
  const latency=Number(row.load)>0?Math.max(-.10,.07-Math.min(.17,row.load/60000)):.01;
  const cooldown=(Number(row.failStreak)>=2&&now-Number(row.lastFailAt)<COOLDOWN_MS)?-.9:0;
  return reliability+latency+cooldown;
}
function rank(stats={},preferred='vidstuck',now=Date.now()){
  return [...ONLINE].sort((a,b)=>{
    const aScore=score(stats[a],now)+(a===preferred?0.12:0);
    const bScore=score(stats[b],now)+(b===preferred?0.12:0);
    return bScore-aScore||ONLINE.indexOf(a)-ONLINE.indexOf(b);
  });
}
const best=(stats,preferred='vidstuck',now=Date.now())=>rank(stats,preferred,now)[0];
const next=(stats,current,attempted=[],preferred='vidstuck',now=Date.now())=>
  rank(stats,preferred,now).find(id=>id!==current&&!attempted.includes(id))||null;
module.exports={ONLINE,COOLDOWN_MS,touch,score,rank,best,next};
