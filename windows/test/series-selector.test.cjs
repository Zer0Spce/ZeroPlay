const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'..','ui','app.js'),'utf8');
const core=fs.readFileSync(path.join(__dirname,'..','core.cjs'),'utf8');
const main=fs.readFileSync(path.join(__dirname,'..','main.cjs'),'utf8');
test('Windows series selector is only rendered in title details',()=>{
  assert.equal((source.match(/\$\{episodePicker\}/g)||[]).length,1);
  assert.match(source,/const episodePicker=item\.type==='tv'/);
  assert.match(source,/\$\{episodePicker\}<p>\$\{escape\(genres\)\}/);
  const hero=source.slice(source.indexOf('function hero(){'),source.indexOf('function watchlistHome(){'));
  assert.doesNotMatch(hero,/episodePicker/);
});
test('Windows Watch Now consumes selected season and episode',()=>{
  assert.match(source,/item\?\.type==='tv'/);
  assert.match(source,/Number\(\$\('#season'\)\?\.value\)/);
  assert.match(source,/Number\(\$\('#episode'\)\?\.value\)/);
  assert.doesNotMatch(source,/data-action=\?"play-episode/);
});
test('Windows details reopen on the last played season and episode',()=>{
  assert.match(source,/const resume=state\.positions\[key\(item\)\]/);
  assert.match(source,/resume\?\.season/);
  assert.match(source,/await loadEpisodes\(item,token,resume\?\.episode\)/);
  assert.match(main,/let position=selected\?core\.episode\(selected\):saved\|\|\{\}/);
  assert.match(main,/if\(selected&&saved&&saved\.season===position\.season&&saved\.episode===position\.episode\)position=saved/);
  assert.match(core,/state\.positions\[id\]=\{\.\.\.row\}/);
});
test('Windows marks a title started before provider progress arrives',()=>{
  assert.match(core,/if\(!\(Number\(row\.timestamp\)>0\)&&!position\.duration\)row=\{\.\.\.row,timestamp:1,duration:0,percent:0\}/);
});
