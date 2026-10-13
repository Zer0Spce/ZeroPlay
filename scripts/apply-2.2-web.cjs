'use strict';
const fs=require('node:fs'),path=require('node:path');const root=path.resolve(__dirname,'..');const p=rel=>path.join(root,rel);
function req(text,from,to,label){if(!text.includes(from))throw Error('Missing web 2.2 marker: '+label);return text.replace(from,to);}

const catalogPath=p('web/lib/catalog.cjs');let catalog=fs.readFileSync(catalogPath,'utf8');
if(!catalog.includes('search\\/(multi|person)')){
 catalog=req(catalog,
`function endpoint(path){return typeof path==='string'&&(/^\\/(trending\\/all\\/week|movie\\/(popular|top_rated|now_playing|upcoming)|tv\\/popular|search\\/multi|watch\\/providers\\/(movie|tv)|discover\\/(movie|tv))$/.test(path)||/^\\/(movie|tv)\\/[1-9]\\d{0,9}(\\/season\\/\\d{1,4})?$/.test(path));}`,
`function endpoint(path){return typeof path==='string'&&(/^\\/(trending\\/all\\/week|movie\\/(popular|top_rated|now_playing|upcoming)|tv\\/(popular|airing_today|on_the_air)|search\\/(multi|person)|watch\\/providers\\/(movie|tv)|discover\\/(movie|tv))$/.test(path)||/^\\/(movie|tv)\\/[1-9]\\d{0,9}(\\/season\\/\\d{1,4})?$/.test(path)||/^\\/person\\/[1-9]\\d{0,9}$/.test(path)||/^\\/collection\\/[1-9]\\d{0,9}$/.test(path));}`,'catalog endpoints');
 catalog=req(catalog,
`const allowed=new Set(['query','page','append_to_response','watch_region','with_watch_providers','with_watch_monetization_types','sort_by']);const out=new URLSearchParams({include_adult:'false'});`,
`const allowed=new Set(['query','page','append_to_response','watch_region','with_watch_providers','with_watch_monetization_types','sort_by','with_genres','with_original_language','primary_release_date.gte','primary_release_date.lte','first_air_date.gte','first_air_date.lte','vote_average.gte','vote_count.gte','with_runtime.lte','with_origin_country']);const out=new URLSearchParams({include_adult:'false'});`,'catalog filter parameters');
 catalog=req(catalog,
`if(name==='append_to_response'&&value!=='credits,videos,recommendations')throw Error('Invalid details request');`,
`if(name==='append_to_response'&&!['credits,videos,recommendations','combined_credits'].includes(value))throw Error('Invalid details request');`,'person details append');
 catalog=req(catalog,
`if(name==='sort_by'&&value!=='popularity.desc')throw Error('Invalid sorting');`,
`if(name==='sort_by'&&value!=='popularity.desc')throw Error('Invalid sorting');\n    if(name==='with_genres'&&!/^\\d{1,8}$/.test(value))throw Error('Invalid genre');\n    if(name==='with_original_language'&&!/^[a-z]{2}$/.test(value))throw Error('Invalid language');\n    if((name==='primary_release_date.gte'||name==='primary_release_date.lte'||name==='first_air_date.gte'||name==='first_air_date.lte')&&!/^\\d{4}-\\d{2}-\\d{2}$/.test(value))throw Error('Invalid date filter');\n    if(name==='vote_average.gte'&&(!/^\\d(?:\\.\\d)?$/.test(value)||Number(value)>10))throw Error('Invalid rating');\n    if(name==='vote_count.gte'&&!/^\\d{1,7}$/.test(value))throw Error('Invalid vote filter');\n    if(name==='with_runtime.lte'&&(!/^\\d{1,3}$/.test(value)||Number(value)>600))throw Error('Invalid runtime');\n    if(name==='with_origin_country'&&!/^[A-Z]{2}$/.test(value))throw Error('Invalid country');`,'catalog filter validation');
 fs.writeFileSync(catalogPath,catalog);
}

const browserPath=p('web/public/browser.js');let browser=fs.readFileSync(browserPath,'utf8');
if(!browser.includes('activeProfile')){
 browser=req(browser,
`const defaults=()=>({favorites:[],planned:[],history:[],positions:{},searches:[],collections:{},settings:{region:'PH',gain:1,theme:'dark',uiLayout:'youtube',source:'vidstuck'},hasKey:true,version:'2.1.2 Web'});`,
`const defaults=()=>({favorites:[],planned:[],history:[],positions:{},searches:[],collections:{},notInterested:[],profiles:{},activeProfile:'Default',settings:{region:'PH',gain:1,theme:'dark',uiLayout:'youtube',source:'vidstuck'},hasKey:true,version:'2.1.2 Web'});`,'web state defaults');
 browser=req(browser,
`for(const name of ['favorites','planned','history','searches'])if(!Array.isArray(saved[name]))saved[name]=[];`,
`for(const name of ['favorites','planned','history','searches','notInterested'])if(!Array.isArray(saved[name]))saved[name]=[];if(!saved.profiles||typeof saved.profiles!=='object'||Array.isArray(saved.profiles))saved.profiles={};if(!saved.activeProfile)saved.activeProfile='Default';`,'web state normalization');
 browser=req(browser,
`function clean(value){if(!value||!['movie','tv'].includes(value.type)||!Number.isSafeInteger(value.id)||value.id<1)throw Error('Invalid title');const item={id:value.id,type:value.type,title:String(value.title||'Untitled').slice(0,300),overview:String(value.overview||'').slice(0,10000),date:String(value.date||'').slice(0,10),rating:Math.max(0,Math.min(10,Number(value.rating)||0))};for(const field of ['poster','backdrop'])item[field]=/^https:\\/\\/image\\.tmdb\\.org\\/t\\/p\\/(w500|w1280)\\/[A-Za-z\\d_.-]+$/.test(value[field]||'')?value[field]:'';return item;}`,
`function clean(value){if(!value||!['movie','tv'].includes(value.type)||!Number.isSafeInteger(value.id)||value.id<1)throw Error('Invalid title');const item={id:value.id,type:value.type,title:String(value.title||'Untitled').slice(0,300),overview:String(value.overview||'').slice(0,10000),date:String(value.date||'').slice(0,10),rating:Math.max(0,Math.min(10,Number(value.rating)||0)),popularity:Math.max(0,Number(value.popularity)||0),voteCount:Math.max(0,Number(value.voteCount)||0),genreIds:Array.isArray(value.genreIds)?value.genreIds.map(Number).filter(x=>Number.isSafeInteger(x)&&x>0).slice(0,20):[],originalLanguage:/^[a-z]{2}$/.test(value.originalLanguage||'')?value.originalLanguage:'',originCountry:Array.isArray(value.originCountry)?value.originCountry.filter(x=>/^[A-Z]{2}$/.test(x)).slice(0,10):[]};for(const field of ['poster','backdrop'])item[field]=/^https:\\/\\/image\\.tmdb\\.org\\/t\\/p\\/(w185|w342|w500|w780|w1280)\\/[A-Za-z\\d_.-]+$/.test(value[field]||'')?value[field]:'';return item;}`,'richer saved title metadata');
 const profileHelpers=`  function personal(){return {favorites:saved.favorites,planned:saved.planned,history:saved.history,positions:saved.positions,searches:saved.searches,collections:saved.collections,notInterested:saved.notInterested};}\n  function applyPersonal(value={}){saved.favorites=Array.isArray(value.favorites)?value.favorites:[];saved.planned=Array.isArray(value.planned)?value.planned:[];saved.history=Array.isArray(value.history)?value.history:[];saved.positions=value.positions&&typeof value.positions==='object'?value.positions:{};saved.searches=Array.isArray(value.searches)?value.searches:[];saved.collections=value.collections&&typeof value.collections==='object'?value.collections:{};saved.notInterested=Array.isArray(value.notInterested)?value.notInterested:[];}\n  function validProfile(name){return /^[A-Za-z0-9 _-]{1,24}$/.test(name)&&!['__proto__','constructor','prototype'].includes(name);}\n`;
 browser=req(browser,'  const listeners=new Set();',profileHelpers+'  const listeners=new Set();','profile helpers');
 browser=req(browser,
`      else if(action==='clear-history'){saved.history=[];saved.positions={};}\n      else if(action==='settings')`,
`      else if(action==='clear-history'){saved.history=[];saved.positions={};}\n      else if(action==='not-interested'){const id=String(value||'');if(!/^(movie|tv):[1-9]\\d*$/.test(id))throw Error('Invalid title');saved.notInterested=saved.notInterested.includes(id)?saved.notInterested.filter(x=>x!==id):[id,...saved.notInterested].slice(0,500);}\n      else if(action==='mark-watched'){const id=String(value?.key||'');if(!/^(movie|tv):[1-9]\\d*$/.test(id))throw Error('Invalid title');if(value?.watched===false)delete saved.positions[id];else{const source=saved.positions[id]||saved.history.find(x=>key(x)===id)||saved.favorites.find(x=>key(x)===id)||saved.planned.find(x=>key(x)===id)||{id:Number(id.split(':')[1]),type:id.split(':')[0],title:'Watched title',overview:'',date:'',rating:0,poster:'',backdrop:''};saved.positions[id]={...source,timestamp:1,duration:1,percent:100,at:Date.now()};}}\n      else if(action==='profile-add'){const name=String(value||'').trim();if(!validProfile(name))throw Error('Use 1–24 letters, numbers, spaces, _ or -');if(name!==saved.activeProfile&&!saved.profiles[name])saved.profiles[name]={favorites:[],planned:[],history:[],positions:{},searches:[],collections:{},notInterested:[]};}\n      else if(action==='profile-switch'){const name=String(value||'').trim();if(!validProfile(name))throw Error('Invalid profile');saved.profiles[saved.activeProfile]=personal();applyPersonal(saved.profiles[name]||{favorites:[],planned:[],history:[],positions:{},searches:[],collections:{},notInterested:[]});saved.activeProfile=name;}\n      else if(action==='profile-remove'){const name=String(value||'').trim();if(name==='Default'||name===saved.activeProfile)throw Error('Cannot delete Default or the active profile');delete saved.profiles[name];}\n      else if(action==='settings')`,'2.2 local actions');
 fs.writeFileSync(browserPath,browser);
}

const indexPath=p('web/public/index.html');let index=fs.readFileSync(indexPath,'utf8');
if(!index.includes('zero22.css'))index=req(index,'  <link rel="stylesheet" href="enhancements.css">','  <link rel="stylesheet" href="enhancements.css">\n  <link rel="stylesheet" href="zero22.css">','2.2 stylesheet');
if(!index.includes('zero22.js'))index=req(index,'  <script src="app.js"></script>','  <script src="app.js"></script>\n  <script src="zero22.js"></script>','2.2 web script');
fs.writeFileSync(indexPath,index);

const scrollPath=p('web/public/infinite-scroll.js');let scroll=fs.readFileSync(scrollPath,'utf8');
if(!scroll.includes('zero22CatalogRequest')){
 scroll=req(scroll,
`    const section=category,nextPage=page+1,type=section==='Series'?'tv':'movie',path=section==='Series'?'/tv/popular':'/movie/popular';`,
`    const section=category,nextPage=page+1,request=window.zero22CatalogRequest?window.zero22CatalogRequest(section,nextPage):null,type=request?.type||(section==='Series'?'tv':'movie'),path=request?.path||(section==='Series'?'/tv/popular':'/movie/popular'),requestParams=request?.params||{page:nextPage};`,'filtered infinite-scroll request');
 scroll=req(scroll,
`      const data=await api(path,{page:nextPage});`,
`      const data=await api(path,requestParams);`,'filtered infinite-scroll API');
 fs.writeFileSync(scrollPath,scroll);
}

console.log('Applied ZeroPlay 2.2 website integration patch');
