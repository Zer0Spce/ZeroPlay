'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const s=require('../ui/universal-search-2260.js');
const item=(id,extra={})=>({id,type:'movie',title:'Movie '+id,date:'2026-09-13',rating:7.7,genreIds:[18],popularity:90,...extra});
test('search filters media, release year, rating and genre on loaded TMDB results',()=>{
 const rows=[item(1),item(2,{type:'tv',date:'2025-12-10'}),item(3,{rating:3}),item(4,{genreIds:[28]})];
 assert.deepEqual(s.filter(rows,{media:'movie',year:'2026',rating:7,genre:18}).map(x=>x.id),[1]);
 assert.deepEqual(s.filter(rows,{media:'tv'}).map(x=>x.id),[2]);
});
test('search sorts loaded results and safely normalizes invalid filter controls',()=>{
 const rows=[item(1,{title:'Zed',popularity:5}),item(2,{title:'Able',popularity:99})];
 assert.deepEqual(s.filter(rows,{sort:'az'}).map(x=>x.id),[2,1]);
 assert.deepEqual(s.filter(rows,{sort:'popular'}).map(x=>x.id),[2,1]);
 assert.deepEqual(s.normalize({media:'untrusted',sort:'unknown',year:'1600',rating:13,provider:'amazon'}),{
  media:'all',sort:'relevance',year:'',rating:0,genre:0,provider:''
 });
});
test('US provider checks only count a subscription flat-rate listing (no renting/buying)',()=>{
 const data={results:{US:{flatrate:[{provider_id:8}],rent:[{provider_id:15}],buy:[{provider_id:25}]},GB:{flatrate:[{provider_id:15}]}}};
 assert.equal(s.usFlatRate(data,8),true);
 for(const id of [15,25,999])assert.equal(s.usFlatRate(data,id),false);
});
test('async provider verification is bounded, stable and never treats unavailable API as confirmed',async()=>{
 const rows=Array.from({length:8},(_,i)=>item(i+1));
 let inFlight=0,peak=0;
 const response=await s.filterByProvider(rows,{movie:8,tv:15},async(path)=>{
   inFlight++;peak=Math.max(peak,inFlight);
   await Promise.resolve();
   inFlight--;
   if(path.includes('/3/'))throw Error('GitHub/TMDB inaccessible');
   const id=Number(path.split('/')[2]);
   return {results:{US:{flatrate:id%2===0?[{provider_id:8}]:[]}}};
 });
 assert.deepEqual(response.items.map(x=>x.id),[2,4,6,8]);
 assert.equal(response.unverified,1);
 assert.ok(peak<=4);
});
test('suggestions are local, minimal, and no search text is sent before submission',()=>{
 assert.deepEqual(s.recentSuggestions('str',['Stranger Things','Strange Magic','Cobra Kai']),['Stranger Things','Strange Magic']);
 assert.deepEqual(s.recentSuggestions('s',['Stranger Things']),[]);
});
test('search controls are wired in actual Windows interface',()=>{
 const app=fs.readFileSync(path.join(__dirname,'..','ui','app.js'),'utf8');
 const html=fs.readFileSync(path.join(__dirname,'..','ui','index.html'),'utf8');
 assert.match(html,/universal-search-2260\.js/);
 assert.match(app,/function searchFilterHTML/);
 assert.match(app,/ZeroUniversalSearch\.filter/);
 assert.match(app,/ZeroUniversalSearch\.filterByProvider/);
 assert.match(app,/data-search-filter/);
});
