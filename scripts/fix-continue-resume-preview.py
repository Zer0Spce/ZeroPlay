from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MAIN = ROOT / "app/src/main/java/com/zerostreams/app/MainActivity.java"
HISTORY = ROOT / "app/src/main/java/com/zerostreams/app/HistoryStore.java"
PRESENTATION = ROOT / "app/src/main/java/com/zerostreams/app/PresentationMainActivity.java"
WINDOWS_CORE = ROOT / "windows/core.cjs"
WEB_BROWSER = ROOT / "web/public/browser.js"


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if new in text:
        print(f"{label}: already applied")
        return text
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly one match, found {count}")
    print(f"{label}: applied")
    return text.replace(old, new, 1)


# Android mobile + Android TV: make every title appear in Continue Watching as soon as
# playback starts, and keep the last series season/episode selected everywhere the
# user can choose an episode.
history = HISTORY.read_text(encoding="utf-8")
history = replace_once(
    history,
    '            if(duration>0&&ProgressRules.percent(position,duration)>=95){position=0;prefs.edit().putLong("position:"+key,0).apply();}\n            row.put("timestamp",position/1000d).put("duration",duration/1000d);',
    '            if(duration>0&&ProgressRules.percent(position,duration)>=95){position=0;prefs.edit().putLong("position:"+key,0).apply();}\n            SharedPreferences.Editor startEdit=prefs.edit().putString("saved:"+item.id,item.raw.toString()).putLong("watchedAt:"+item.id,System.currentTimeMillis());\n            if(!item.type.equals("series")&&position<=0)startEdit.putLong("position:"+item.id,1).putInt("percent:"+item.id,0);\n            startEdit.apply();\n            row.put("timestamp",position/1000d).put("duration",duration/1000d);',
    "Android started-title persistence",
)
HISTORY.write_text(history, encoding="utf-8")

main = MAIN.read_text(encoding="utf-8")
main = replace_once(
    main,
    'int preferred=0;for(int i=0;i<numbers.size();i++)if(numbers.get(i)==1){preferred=i;break;}String[] seasonLabels=labels.toArray(new String[0]);',
    'int preferred=0,rememberedSeason=prefs.getInt("resumeSeason:"+item.id,-1);for(int i=0;i<numbers.size();i++)if(numbers.get(i)==1){preferred=i;break;}if(rememberedSeason>=0)for(int i=0;i<numbers.size();i++)if(numbers.get(i)==rememberedSeason){preferred=i;break;}String[] seasonLabels=labels.toArray(new String[0]);',
    "Android remembered season selector",
)
main = replace_once(
    main,
    'episodePicker.setAdapter(spinnerAdapter(labels));episodePicker.setSelection(0,false);episodePicker.setEnabled(true);selectedEpisode[0]=numbers[0];episodePicker.setOnItemSelectedListener',
    'episodePicker.setAdapter(spinnerAdapter(labels));int preferredEpisode=0,rememberedEpisode=season==prefs.getInt("resumeSeason:"+item.id,-1)?prefs.getInt("resumeEpisode:"+item.id,0):0;if(rememberedEpisode>0)for(int i=0;i<numbers.length;i++)if(numbers[i]==rememberedEpisode){preferredEpisode=i;break;}episodePicker.setSelection(preferredEpisode,false);episodePicker.setEnabled(true);selectedEpisode[0]=numbers[preferredEpisode];episodePicker.setOnItemSelectedListener',
    "Android remembered episode selector",
)
main = replace_once(
    main,
    'new AlertDialog.Builder(this).setTitle(item.title).setItems(labels,(d,n)->loadSeason(item,id,available.get(n).optInt("season_number"),key)).setNegativeButton("Close",null).show();',
    'int preferredSeason=0,savedSeason=prefs.getInt("resumeSeason:"+item.id,-1);for(int i=0;i<available.size();i++)if(available.get(i).optInt("season_number")==savedSeason){preferredSeason=i;break;}new AlertDialog.Builder(this).setTitle(item.title).setSingleChoiceItems(labels,preferredSeason,(d,n)->{d.dismiss();loadSeason(item,id,available.get(n).optInt("season_number"),key);}).setNegativeButton("Close",null).show();',
    "Android season dialog remembers last season",
)
main = replace_once(
    main,
    'new AlertDialog.Builder(this).setTitle(number==0?"Specials":"Season "+number).setItems(labels,(d,n)->{JSONObject ep=episodes.optJSONObject(n);try{chooseStreams(item,ContentApi.movieSources(id,"tv",number,ep.optInt("episode")),item.id+":s"+number+"e"+ep.optInt("episode"));}catch(JSONException ignored){}}).setNegativeButton("Close",null).show();',
    'int preferredEpisode=0,savedEpisode=prefs.getInt("resumeEpisode:"+item.id,0);if(number==prefs.getInt("resumeSeason:"+item.id,-1)&&savedEpisode>0)for(int i=0;i<episodes.length();i++)if(episodes.optJSONObject(i)!=null&&episodes.optJSONObject(i).optInt("episode")==savedEpisode){preferredEpisode=i;break;}new AlertDialog.Builder(this).setTitle(number==0?"Specials":"Season "+number).setSingleChoiceItems(labels,preferredEpisode,(d,n)->{d.dismiss();JSONObject ep=episodes.optJSONObject(n);try{chooseStreams(item,ContentApi.movieSources(id,"tv",number,ep.optInt("episode")),item.id+":s"+number+"e"+ep.optInt("episode"));}catch(JSONException ignored){}}).setNegativeButton("Close",null).show();',
    "Android episode dialog remembers last episode",
)
main = replace_once(
    main,
    'status.setText("TMDB season service unavailable");try{chooseStreams(item,ContentApi.movieSources(id,"tv",1,1),item.id+":s1e1");}catch(JSONException ignored){}',
    'status.setText("TMDB season service unavailable");int savedSeason=prefs.getInt("resumeSeason:"+item.id,1),savedEpisode=prefs.getInt("resumeEpisode:"+item.id,1);if(savedSeason<0)savedSeason=1;if(savedEpisode<1)savedEpisode=1;try{chooseStreams(item,ContentApi.movieSources(id,"tv",savedSeason,savedEpisode),item.id+":s"+savedSeason+"e"+savedEpisode);}catch(JSONException ignored){}',
    "Android remembered episode fallback",
)
MAIN.write_text(main, encoding="utf-8")

# Android mobile + TV Top 10: reserve a narrow side gutter for the rank and let only
# a small part of the outline overlap the poster edge. The poster itself stays full 2:3.
presentation = PRESENTATION.read_text(encoding="utf-8")
presentation = replace_once(
    presentation,
    '        int rankWidth=BuildConfig.TV?112:80,posterWidth=BuildConfig.TV?160:116,posterHeight=Math.round(posterWidth*1.5f),overlap=BuildConfig.TV?64:46;',
    '        int rankWidth=BuildConfig.TV?100:70,posterWidth=BuildConfig.TV?160:116,posterHeight=Math.round(posterWidth*1.5f),overlap=BuildConfig.TV?84:58;',
    "Android Top 10 side rank placement",
)
PRESENTATION.write_text(presentation, encoding="utf-8")

# Windows: the details selector and player already consume state.positions for the
# last season/episode. Mark playback as started immediately so Continue Watching is
# reliable even when an embed provider never reports progress.
windows = WINDOWS_CORE.read_text(encoding="utf-8")
windows = replace_once(
    windows,
    "if(old?.percent>=95&&!position.duration)row={...value,...ep,historyKey,at:Date.now(),timestamp:0,duration:0,percent:0};state.history=[row,...state.history.filter(x=>x.historyKey!==historyKey)].slice(0,100);",
    "if(old?.percent>=95&&!position.duration)row={...value,...ep,historyKey,at:Date.now(),timestamp:0,duration:0,percent:0};if(!(Number(row.timestamp)>0)&&!position.duration)row={...row,timestamp:1,duration:0,percent:0};state.history=[row,...state.history.filter(x=>x.historyKey!==historyKey)].slice(0,100);",
    "Windows started-title persistence",
)
WINDOWS_CORE.write_text(windows, encoding="utf-8")

# Website: same rule as desktop. record() already stores the selected season and
# episode in the parent position, and details() restores it on the next open.
web = WEB_BROWSER.read_text(encoding="utf-8")
web = replace_once(
    web,
    "if(old?.percent>=95&&!position.duration)row={...item,season,episode,historyKey,at:Date.now(),timestamp:0,duration:0,percent:0};saved.history=[row,...saved.history.filter(x=>x.historyKey!==historyKey)].slice(0,100);",
    "if(old?.percent>=95&&!position.duration)row={...item,season,episode,historyKey,at:Date.now(),timestamp:0,duration:0,percent:0};if(!(Number(row.timestamp)>0)&&!position.duration)row={...row,timestamp:1,duration:0,percent:0};saved.history=[row,...saved.history.filter(x=>x.historyKey!==historyKey)].slice(0,100);",
    "Web started-title persistence",
)
WEB_BROWSER.write_text(web, encoding="utf-8")

print("Preview Continue Watching, episode memory, and Top 10 side-rank fixes are ready for Android, Android TV, Windows and Web.")
