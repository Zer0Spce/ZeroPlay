'use strict';
// Capture the published Windows executable. No mock bridge, HTML replacement,
// fake catalog, or generated screenshot is used.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path');
const out=path.resolve('docs/screenshots/2.2');
const pause=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  let browser;
  for(let i=0;i<60;i++){try{browser=await chromium.connectOverCDP('http://127.0.0.1:9222');break;}catch{await pause(1000);}}
  if(!browser)throw Error('Released executable did not expose capture connection');
  const context=browser.contexts()[0];let page;
  for(let i=0;i<60;i++){page=context.pages().find(p=>p.url().includes('/ui/index.html'));if(page)break;await pause(1000);}
  if(!page)throw Error('Actual app window missing');
  await page.waitForFunction(()=>document.querySelector('.card img')?.complete,{timeout:90000});
  const version=await page.evaluate(async()=> (await window.zero.state()).version);
  if(version!=='2.2.0')throw Error('Expected published 2.2.0, got '+version);
  fs.mkdirSync(out,{recursive:true});
  async function snap(name){
    await page.evaluate(async()=>{await Promise.all([...document.images].filter(i=>i.getBoundingClientRect().top<innerHeight).map(i=>Promise.race([i.decode().catch(()=>{}),new Promise(r=>setTimeout(r,8000))])));});
    await pause(700);await page.screenshot({path:path.join(out,'windows-'+name+'.png')});
  }
  async function nav(name){await page.evaluate(async n=>{await navigate(n,true);window.zeroLayouts?.expand(false);},name);await pause(3500);}
  async function close(){await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));}
  await page.evaluate(async()=>{await change('settings',{...state.settings,focusTrailer:false,homepageTrailer:false});await navigate('Home',true);window.zeroLayouts?.expand(false);});
  await snap('home');
  for(const [layout,name] of [['google','modern'],['flix','flix'],['classic','original']]){
    await page.evaluate(async layout=>{await change('settings',{...state.settings,uiLayout:layout});await navigate('Home',true);window.zeroLayouts?.expand(false);},layout);await snap(name);
  }
  await page.evaluate(async()=>{await change('settings',{...state.settings,uiLayout:'youtube'});});
  for(const [section,name] of [['Movies','movies-filters'],['Series','series-filters'],['Categories','categories'],['LiveTV','live-ppv'],['IPTV','live-tv'],['Live Sports','live-sports'],['Library','library'],['Downloads','downloads']]){await nav(section);await snap(name);}
  await nav('Movies');
  await page.locator('[data-detail]').first().click();
  await page.waitForFunction(()=>document.querySelector('#detail-body .watch-actions'),{timeout:30000});await snap('title-details');
  await page.locator('#detail [data-action="source"]').click();await snap('sources');await close();
  await page.locator('[data-action="settings"]').click();await snap('settings');
  for(const [selector,name] of [['#zero22-settings','profiles-performance'],['#home-panels','home-panels'],['#carousel-source','carousel'],['#playback-source','playback-settings'],['#theme','themes']]){
    if(await page.locator(selector).count()){await page.locator(selector).scrollIntoViewIfNeeded();await snap(name);}
  }
  await close();
  fs.writeFileSync(path.join(out,'windows-capture.json'),JSON.stringify({version,source:'Published ZeroPlay-2.2-Windows-x64.zip',capture:'Playwright CDP screenshots of actual released Electron UI',mockData:false,settings:'Fresh runner profile; trailers disabled for stable captures; layouts selected through app settings.',capturedAt:new Date().toISOString()},null,2)+'\n');
  await browser.close();
})().catch(e=>{console.error(e.message);process.exitCode=1;});
