from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MAIN = ROOT / "app/src/main/java/com/zerostreams/app/MainActivity.java"
HISTORY = ROOT / "app/src/main/java/com/zerostreams/app/HistoryStore.java"


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if new in text:
        print(f"{label}: already applied")
        return text
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly one match, found {count}")
    print(f"{label}: applied")
    return text.replace(old, new, 1)


history = HISTORY.read_text(encoding="utf-8")
history = replace_once(
    history,
    '            if(duration>0&&ProgressRules.percent(position,duration)>=95){position=0;prefs.edit().putLong("position:"+key,0).apply();}\n            row.put("timestamp",position/1000d).put("duration",duration/1000d);',
    '            if(duration>0&&ProgressRules.percent(position,duration)>=95){position=0;prefs.edit().putLong("position:"+key,0).apply();}\n            SharedPreferences.Editor startEdit=prefs.edit().putString("saved:"+item.id,item.raw.toString()).putLong("watchedAt:"+item.id,System.currentTimeMillis());\n            if(!item.type.equals("series")&&position<=0)startEdit.putLong("position:"+item.id,1).putInt("percent:"+item.id,0);\n            startEdit.apply();\n            row.put("timestamp",position/1000d).put("duration",duration/1000d);',
    "HistoryStore started-title persistence",
)
HISTORY.write_text(history, encoding="utf-8")

main = MAIN.read_text(encoding="utf-8")
main = replace_once(
    main,
    'int preferred=0;for(int i=0;i<numbers.size();i++)if(numbers.get(i)==1){preferred=i;break;}String[] seasonLabels=labels.toArray(new String[0]);',
    'int preferred=0,rememberedSeason=BuildConfig.TV?prefs.getInt("resumeSeason:"+item.id,-1):-1;for(int i=0;i<numbers.size();i++)if(numbers.get(i)==1){preferred=i;break;}if(rememberedSeason>=0)for(int i=0;i<numbers.size();i++)if(numbers.get(i)==rememberedSeason){preferred=i;break;}String[] seasonLabels=labels.toArray(new String[0]);',
    "Android TV remembered season selector",
)
main = replace_once(
    main,
    'episodePicker.setAdapter(spinnerAdapter(labels));episodePicker.setSelection(0,false);episodePicker.setEnabled(true);selectedEpisode[0]=numbers[0];episodePicker.setOnItemSelectedListener',
    'episodePicker.setAdapter(spinnerAdapter(labels));int preferredEpisode=0,rememberedEpisode=BuildConfig.TV&&season==prefs.getInt("resumeSeason:"+item.id,-1)?prefs.getInt("resumeEpisode:"+item.id,0):0;if(rememberedEpisode>0)for(int i=0;i<numbers.length;i++)if(numbers[i]==rememberedEpisode){preferredEpisode=i;break;}episodePicker.setSelection(preferredEpisode,false);episodePicker.setEnabled(true);selectedEpisode[0]=numbers[preferredEpisode];episodePicker.setOnItemSelectedListener',
    "Android TV remembered episode selector",
)
main = replace_once(
    main,
    'status.setText("TMDB season service unavailable");try{chooseStreams(item,ContentApi.movieSources(id,"tv",1,1),item.id+":s1e1");}catch(JSONException ignored){}',
    'status.setText("TMDB season service unavailable");int savedSeason=BuildConfig.TV?prefs.getInt("resumeSeason:"+item.id,1):1,savedEpisode=BuildConfig.TV?prefs.getInt("resumeEpisode:"+item.id,1):1;if(savedSeason<0)savedSeason=1;if(savedEpisode<1)savedEpisode=1;try{chooseStreams(item,ContentApi.movieSources(id,"tv",savedSeason,savedEpisode),item.id+":s"+savedSeason+"e"+savedEpisode);}catch(JSONException ignored){}',
    "Android TV remembered episode fallback",
)
MAIN.write_text(main, encoding="utf-8")

print("Preview history/resume fixes are ready.")
