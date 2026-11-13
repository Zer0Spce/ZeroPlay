'use strict';
((root,factory)=>{const v=factory();if(typeof module==='object'&&module.exports)module.exports=v;else root.ZeroWatchlist=v;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const RESERVED=['__proto__','constructor','prototype'];
 function name(v){
  const n=String(v||'').trim();
  if(!n||n.length>60||RESERVED.includes(n)||/[\\<>]/.test(n))throw Error('Collection name must be 1–60 safe characters');
  return n;
 }
 function rename(collections,from,to){
  const old=name(from),target=name(to);
  if(!Object.hasOwn(collections||{},old)||!Array.isArray(collections[old]))throw Error('Collection not found');
  if(old!==target&&Object.hasOwn(collections,target))throw Error('A collection with that name already exists');
  const result={};
  for(const [key,items] of Object.entries(collections||{}))result[key===old?target:key]=items;
  return result;
 }
 function remove(collections,n){
  const id=name(n);
  if(!Object.hasOwn(collections||{},id))throw Error('Collection not found');
  const result={...collections};delete result[id];
  return result;
 }
 function watched(positions,item){
  const key=item.type+':'+item.id;
  return Number((positions||{})[key]?.percent||0)>=95;
 }
 function filter(items,positions,mode='all'){
  if(!['all','watched','unwatched'].includes(mode))mode='all';
  return (items||[]).filter(item=>item&&['movie','tv'].includes(item.type)&&
   (mode==='all'||watched(positions,item)===(mode==='watched')));
 }
 return Object.freeze({name,rename,remove,watched,filter});
});
