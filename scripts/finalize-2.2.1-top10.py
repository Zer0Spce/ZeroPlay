from pathlib import Path


def patch(path, old, new):
    file = Path(path)
    text = file.read_text(encoding='utf-8')
    if new in text:
        return False
    if old not in text:
        raise SystemExit(f'expected text missing in {path}: {old[:100]!r}')
    file.write_text(text.replace(old, new, 1), encoding='utf-8')
    return True

changed = False

changed |= patch(
    'app/src/main/java/com/zerostreams/app/HomePanels.java',
    'static final String[] IDS={"clock","featured","continue","upnext","because","watchlist","tonight","hidden","upcoming","providers","recommended","trending","popular","series","now","airing","action"',
    'static final String[] IDS={"clock","featured","top10","continue","upnext","because","watchlist","tonight","hidden","upcoming","providers","recommended","trending","popular","series","now","airing","action"'
)
changed |= patch(
    'app/src/main/java/com/zerostreams/app/HomePanels.java',
    'static final String[] LABELS={"Clock","Featured carousel","Continue watching","Up next","Because you watched","Watchlist","Tonight\'s picks","Hidden gems","Coming soon"',
    'static final String[] LABELS={"Clock","Featured carousel","Top 10 today","Continue watching","Up next","Because you watched","Watchlist","Tonight\'s picks","Hidden gems","Coming soon"'
)
changed |= patch(
    'app/src/main/java/com/zerostreams/app/HomePanels.java',
    'static final int EXTRA_START=16;',
    'static final int EXTRA_START=17;'
)
changed |= patch(
    'app/src/main/java/com/zerostreams/app/HomePanels.java',
    'private static final String[] DEFAULTS={"clock","featured","continue","upnext","because","watchlist","tonight","hidden","providers","recommended","trending","popular","series","now","airing"};',
    'private static final String[] DEFAULTS={"clock","featured","top10","continue","upnext","because","watchlist","tonight","hidden","providers","recommended","trending","popular","series","now","airing"};'
)
changed |= patch(
    'app/src/main/java/com/zerostreams/app/PresentationMainActivity.java',
    '        super.renderHome22(rows,token);\n        LinearLayout host=contentHost();if(host==null)return;',
    '        super.renderHome22(rows,token);\n        if(!homePanel("top10"))return;\n        LinearLayout host=contentHost();if(host==null)return;'
)
changed |= patch(
    'app/src/test/java/com/zerostreams/app/HomePanelsTest.java',
    'assertEquals(15,enabled.size());assertTrue(enabled.containsAll(Arrays.asList("featured","continue","upnext","because","watchlist","tonight","hidden","providers","popular","series","airing")));',
    'assertEquals(16,enabled.size());assertTrue(enabled.containsAll(Arrays.asList("featured","top10","continue","upnext","because","watchlist","tonight","hidden","providers","popular","series","airing")));'
)

changed |= patch(
    'windows/main.cjs',
    "const homePanelIds=['clock','featured','continue','upnext','because','watchlist','tonight','hidden','upcoming','providers','recommended','trending','popular','series','now','airing','action'",
    "const homePanelIds=['clock','featured','top10','continue','upnext','because','watchlist','tonight','hidden','upcoming','providers','recommended','trending','popular','series','now','airing','action'"
)
changed |= patch(
    'windows/main.cjs',
    "homePanels:homePanelIds.slice(0,16),homePanelOrder:homePanelIds.slice()",
    "homePanels:['clock','featured','top10','continue','upnext','because','watchlist','tonight','hidden','providers','recommended','trending','popular','series','now','airing'],homePanelOrder:homePanelIds.slice()"
)

changed |= patch(
    'windows/ui/app.js',
    "const homePanels=[['clock','Clock'],['featured','Featured carousel'],['continue','Continue watching']",
    "const homePanels=[['clock','Clock'],['featured','Featured carousel'],['top10','Top 10 today'],['continue','Continue watching']"
)
changed |= patch(
    'windows/ui/app.js',
    "const enabledPanel=id=>(state.settings.homePanels||homePanels.slice(0,16).map(p=>p[0])).includes(id);",
    "const DEFAULT_HOME_PANELS=['clock','featured','top10','continue','upnext','because','watchlist','tonight','hidden','providers','recommended','trending','popular','series','now','airing'];\nfunction enabledPanel(id){const panels=Array.isArray(state.settings.homePanels)?state.settings.homePanels:DEFAULT_HOME_PANELS;if(id==='top10'&&!panels.includes('top10')&&localStorage.getItem('zeroplay-top10-optout')!=='1')return true;return panels.includes(id);}"
)
changed |= patch(
    'windows/ui/app.js',
    "document.addEventListener('contextmenu',event=>{const card=event.target.closest?.('[data-card-key]');",
    "window.zeroOpenDetails=async item=>{if(!item)return;titles.set(key(item),item);await details(item);};\ndocument.addEventListener('contextmenu',event=>{const card=event.target.closest?.('[data-card-key]');"
)

changed |= patch(
    'windows/ui/home-visuals.js',
    "    const state=await snapshot(),region=state?.settings?.region||'PH';\n    let items=topCache.get(region);",
    "    const state=await snapshot(),region=state?.settings?.region||'PH',panels=state?.settings?.homePanels;\n    const enabled=Array.isArray(panels)&&panels.includes('top10')||((!Array.isArray(panels)||!panels.includes('top10'))&&localStorage.getItem('zeroplay-top10-optout')!=='1');\n    if(!enabled){document.querySelector('.zero-top10')?.remove();return;}\n    let items=topCache.get(region);"
)
changed |= patch(
    'windows/ui/home-visuals.js',
    "      button.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();if(typeof window.details==='function')window.details(item);});",
    "      button.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();window.zeroOpenDetails?.(item);});"
)
changed |= patch(
    'windows/ui/home-visuals.js',
    "    if(input?.matches?.('#home-panels input[value=\"upcoming\"]')){\n      if(input.checked)localStorage.setItem('zeroplay-coming-soon-optin','1');else localStorage.removeItem('zeroplay-coming-soon-optin');\n      stateCache=null;schedule();\n    }",
    "    if(input?.matches?.('#home-panels input[value=\"upcoming\"]')){\n      if(input.checked)localStorage.setItem('zeroplay-coming-soon-optin','1');else localStorage.removeItem('zeroplay-coming-soon-optin');\n      stateCache=null;schedule();\n    }\n    if(input?.matches?.('#home-panels input[value=\"top10\"]')){\n      if(input.checked)localStorage.removeItem('zeroplay-top10-optout');else localStorage.setItem('zeroplay-top10-optout','1');\n      stateCache=null;schedule();\n    }"
)

changed |= patch(
    'windows/test/home-visuals.test.cjs',
    "  assert.match(js,/TOP 10 TODAY IN/);",
    "  assert.match(js,/TOP 10 TODAY IN/);\n  assert.match(js,/zeroplay-top10-optout/);\n  assert.match(js,/zeroOpenDetails/);"
)

print('2.2.1 Top 10 finalization applied' if changed else '2.2.1 Top 10 finalization already applied')
