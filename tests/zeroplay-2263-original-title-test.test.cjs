'use strict';
const {test}=require('node:test'), assert=require('node:assert/strict'), fs=require('node:fs'), path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const baseline="TextView title=text(\"\",BuildConfig.TV?(flixLayout()?58:googleLayout()?50:37):flixLayout()?40:googleLayout()?36:29,INK);bold(title);title.setMaxLines(2);title.setEllipsize(TextUtils.TruncateAt.END);info.addView(title,new LinearLayout.LayoutParams(-1,dp(BuildConfig.TV?(googleLayout()?118:90):googleLayout()?88:72)));space(info,8);";
test('Android carousel title component exactly matches working 2.2.5 release',()=>{
 const s=read('app/src/main/java/com/zerostreams/app/MainActivity.java');
 assert.ok(s.includes(baseline),'2.2.5 TextView title was not restored verbatim');
 assert.doesNotMatch(s,/movieTitleLogo|loadCarouselMovieTitleLogo|trimTransparentMovieLogo/);
 assert.match(s,/title\.setText\(item\.title\)/);
});
test('carousel uses exact v2.2.5.9 info layout with one title',()=>{
 const s=read('app/src/main/java/com/zerostreams/app/MainActivity.java');
 const block=s.slice(s.indexOf('    void carousel('),s.indexOf('    List<Catalog.Item> localItems(){'));
 assert.ok(block.includes("LinearLayout info=column();info.setPadding(dp(googleLayout()?36:24),dp(googleLayout()?34:24),dp(googleLayout()?30:20),dp(googleLayout()?34:20));FrameLayout.LayoutParams ip=new FrameLayout.LayoutParams(BuildConfig.TV?dp(googleLayout()?620:440):-1,-2,Gravity.START|Gravity.BOTTOM);if(BuildConfig.TV&&!googleLayout())ip.rightMargin=dp(245);hero.addView(info,ip);"));
 assert.doesNotMatch(block,/TextView title=text\(item\.title/);
});

test('Streaming provider badge is outside 2.2.5 title layout',()=>{
 const s=read('app/src/main/java/com/zerostreams/app/MainActivity.java');
 assert.match(s,/hero\.addView\(providerBadge,badgeSlot\)/);
 assert.doesNotMatch(s,/info\.addView\(providerBadge/);
 assert.match(s,/providerBadge\.setImageResource\(drawable\)/);
});
test('TV Refresh Picks is pinned above other hero elements and visibly focusable',()=>{
 const s=read('app/src/main/java/com/zerostreams/app/MainActivity.java');
 assert.match(s,/boolean runningOnTelevision\(\)/);
 assert.match(s,/UI_MODE_TYPE_TELEVISION/);
 assert.match(s,/Button refreshPicks=button\("↻ Refresh picks",this::refreshHomePicks\)/);
 assert.match(s,/refreshPicks\.setBackground\(shape\(ACCENT,Color\.WHITE\)\)/);
 assert.match(s,/refreshPicks\.bringToFront\(\)/);
 assert.match(s,/refreshPicks\.setVisibility\(View\.VISIBLE\)/);
 assert.match(s,/Gravity\.TOP\|Gravity\.RIGHT/);
});
test('TEST uses different Android package name and visible TEST label',()=>{
 const s=read('app/build.gradle');
 assert.match(s,/applicationIdSuffix '\.tv\.test'/);
 assert.match(s,/applicationIdSuffix '\.mobile\.test'/);
 assert.match(s,/appLabel: 'ZeroPlay TEST'/);
});
test('Nothing on main is released from TEST workflow',()=>{
 const s=read('.github/workflows/zeroplay-2263-original-title-test.yml');
 assert.match(s,/contents: read/);
 assert.match(s,/test\/zeroplay-2263-original-225-carousel/);
 assert.doesNotMatch(s,/gh release|create-release|release\/tags|contents: write/);
});
