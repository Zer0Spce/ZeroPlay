const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('website is labeled as ZeroPlay 2.2 Web',()=>{
  const html=read('web/public/index.html');
  const browser=read('web/public/browser.js');
  assert.match(html,/ZeroPlay 2\.2/);
  assert.match(browser,/version:'2\.2 Web'/);
});

test('website does not expose Live TV, PPV or Live Sports',()=>{
  const html=read('web/public/index.html');
  assert.doesNotMatch(html,/data-live-nav|live-player|web-live\.js|live\.css|shaka-player/i);
  assert.equal(fs.existsSync(path.join(root,'web/public/web-live.js')),false);
  assert.equal(fs.existsSync(path.join(root,'web/public/live.css')),false);
  assert.equal(fs.existsSync(path.join(root,'api/live.js')),false);
});

test('website movies and series append more cards below the current grid',()=>{
  const html=read('web/public/index.html');
  const infinite=read('web/public/infinite-scroll.js');
  const sw=read('web/public/sw.js');
  assert.match(html,/infinite-scroll\.js\?v=20261013c/);
  assert.match(sw,/zeroplay-web-2\.2\.2-shell-20261016/);
  assert.match(sw,/infinite-scroll\.js\?v=20261013c/);
  assert.match(infinite,/category==='Movies'\|\|category==='Series'/);
  assert.match(infinite,/async function appendCatalogPage/);
  assert.match(infinite,/zero22CatalogRequest\?window\.zero22CatalogRequest\(section,nextPage\):null/);
  assert.match(infinite,/requestParams=request\?\.params\|\|\{page:nextPage\}/);
  assert.match(infinite,/const data=await api\(path,requestParams\)/);
  assert.match(infinite,/grid\.insertAdjacentHTML\('beforeend',html\)/);
  assert.match(infinite,/page=nextPage/);
  assert.match(infinite,/grid\.children\.length\+' titles loaded'/);
  assert.match(infinite,/if\(canAppendCatalog\(\)\)\{appendCatalogPage\(grid,pager\);return;\}/);
  assert.match(infinite,/function nearBottom\(\)\{return window\.scrollY>0/);
  assert.match(infinite,/function resetTabPosition\(\)/);
  assert.match(infinite,/if\(y>lastScrollY\+2\)\{armScrollIntent\(\);scheduleCheck\(\);\}/);
});

test('shared movie and TV details stay closed after dismissal',()=>{
  const html=read('web/public/index.html');
  const router=read('web/public/web-router.js');
  const enhancements=read('web/public/web-enhancements.js');
  assert.match(html,/web-router\.js\?v=20261014d/);
  assert.match(router,/clearDetailRoute/);
  assert.match(router,/history\.replaceState/);
  assert.match(router,/detail\?\.addEventListener\('close'/);
  assert.match(router,/window\.addEventListener\('popstate'/);
  assert.match(router,/suppressReopen/);
  assert.doesNotMatch(router,/async function loadTitle/);
  assert.doesNotMatch(router,/history\.pushState/);
  assert.match(enhancements,/window\.addEventListener\('popstate'/);
  assert.match(enhancements,/const initialPath=location\.pathname/);
  assert.match(enhancements,/if\(document\.querySelector\('dialog\[open\]'\)\)return/);
  assert.match(enhancements,/if\(item&&typeof window\.details==='function'\)window\.details\(item\)/);
});

test('website header is collapsed to one bar',()=>{
  const html=read('web/public/index.html');
  const css=read('web/public/singlebar.css');
  assert.match(html,/singlebar\.css\?v=20261014d/);
  assert.match(css,/aside\{[\s\S]*height:72px!important/);
  assert.match(css,/header\{[\s\S]*height:72px!important/);
  assert.match(css,/header>div\{display:none!important\}/);
});

test('homepage hero loads trailer previews and official title artwork',()=>{
  const html=read('web/public/index.html');
  const trailer=read('web/public/hero-trailer.js');
  assert.match(html,/hero-trailer\.js\?v=20261014d/);
  assert.match(trailer,/www\.youtube\.com\/embed/);
  assert.match(trailer,/include_image_language/);
  assert.match(trailer,/file_path/);
});
