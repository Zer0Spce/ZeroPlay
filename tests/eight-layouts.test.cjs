'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const old=['youtube','google','flix','classic'],added=['cinema','studio','librarypro','horizon'];
test('Windows retains four original UI choices and offers four new ones',()=>{
 const html=read('windows/ui/index.html'),js=read('windows/ui/layouts.js');
 for(const id of [...old,...added]){assert.ok(html.includes('value="'+id+'"'),id);assert.ok(js.includes("'"+id+"'"),id);}
 assert.match(html,/eight-layouts\.css/);
});
test('Each new Windows layout has separate structural navigation, hero and cards',()=>{
 const css=read('windows/ui/eight-layouts.css');
 for(const id of added){for(const selector of ['aside','main','cards .card'])assert.ok(css.includes('[data-layout="'+id+'"] '+selector),id+' '+selector);}
 for(const id of added)assert.ok(css.includes('[data-layout="'+id+'"] main:has(#home:not([hidden])) .hero'),id+' hero');
 assert.doesNotMatch(css,/\[data-layout="(?:youtube|google|flix|classic)"\]/);
});
test('Android retains all eight choices and distinct discovery geometry',()=>{
 const java=read('app/src/main/java/com/zerostreams/app/MainActivity.java');
 for(const id of [...old,...added])assert.ok(java.includes('"'+id+'"'),id);
 for(const part of ['eightLayoutPalette()','eightPosterWidth()','eightPosterRatio()','layoutStyle().equals("librarypro")'])assert.ok(java.includes(part),part);
});
test('Preview pipeline has no release publisher',()=>{
 const workflow=read('.github/workflows/build-2.4-private-test.yml');
 assert.match(workflow,/contents: read/);
 assert.doesNotMatch(workflow,/gh release create|softprops\/action-gh-release/);
});
