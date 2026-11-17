'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('Android TV carousel movie title and metadata are left aligned',()=>{
 const s=read('app/src/main/java/com/zerostreams/app/MainActivity.java');
 assert.match(s,/LinearLayout info=column\(\);info\.setGravity\(Gravity\.START\)/);
 assert.match(s,/title\.setGravity\(Gravity\.START\|Gravity\.CENTER_VERTICAL\)/);
 assert.match(s,/title\.setTextAlignment\(View\.TEXT_ALIGNMENT_VIEW_START\)/);
 assert.match(s,/facts\.setGravity\(Gravity\.START\)/);
 assert.match(s,/description\.setGravity\(Gravity\.START\)/);
});
test('Bundled provider branding remains, but the carousel no longer uses logos',()=>{
 const s=read('app/src/main/java/com/zerostreams/app/MainActivity.java');
 for(const brand of ['netflix','hulu','disney','max','apple','paramount','peacock','youtube-tv'])assert.ok(s.includes('"'+brand+'"'));
 assert.ok(s.includes('providerCarouselDrawable(String brand)'));
 const hero=s.slice(s.indexOf('    void carousel(List<Catalog.Item> all,int token)'),s.indexOf('    void upcomingRow('));
 assert.ok(!hero.includes('providerBadge'));
 assert.ok(!hero.includes('providerFallback'));
});
test('Provider Hub clutter is removed but platform browse paths survive',()=>{
 const w=read('windows/ui/app.js'),a=read('app/src/main/java/com/zerostreams/app/MainActivity.java');
 assert.doesNotMatch(w,/function providerHubTools\(/);
 assert.doesNotMatch(w,/Streaming Provider Hub filters/);
 assert.doesNotMatch(w,/Reported subscription listings, not a playback guarantee/);
 assert.doesNotMatch(a,/providerTools\.addView/);
 assert.doesNotMatch(a,/providerHubSortPicker\(/);
 assert.doesNotMatch(a,/providerHubGenrePicker\(/);
 assert.doesNotMatch(a,/US subscription availability · browsing does not guarantee playable streams/);
 assert.match(w,/if\(section==='Provider'\)/);
 assert.match(a,/category\.equals\("Provider"\)/);
});
