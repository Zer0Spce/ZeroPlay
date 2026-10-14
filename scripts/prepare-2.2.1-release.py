from pathlib import Path

ROOT=Path('.')

def replace(path, old, new, required=True):
    p=ROOT/path
    text=p.read_text(encoding='utf-8')
    if new in text:
        return False
    if old not in text:
        if required:
            raise SystemExit(f'missing expected text in {path}: {old[:120]!r}')
        return False
    p.write_text(text.replace(old,new,1),encoding='utf-8')
    return True

# Android / Windows version metadata.
replace(Path('app/build.gradle'), "versionCode 44\n        versionName '2.2'", "versionCode 45\n        versionName '2.2.1'")
replace(Path('windows/package.json'), '"version": "2.2.0"', '"version": "2.2.1"')
replace(Path('windows/package.json'), '"artifactName": "ZeroPlay-2.2-Windows-x64.${ext}"', '"artifactName": "ZeroPlay-2.2.1-Windows-x64.${ext}"')

release_notes = r'''# ZeroPlay 2.2.1 — Home, Resume & Player Polish

ZeroPlay 2.2.1 is a cross-platform polish update for **Android, Android TV / Google TV, Windows and Web**. It focuses on the Home experience, reliable Continue Watching / episode resume behavior, better featured artwork and trailer previews, and a set of player/navigation fixes found after the 2.2 release.

## ⭐ Highlights

### 🔟 Top 10 Today

A new **TOP 10 TODAY** shelf is available on Android, Android TV and Windows.

- Uses the current region label, including **TOP 10 TODAY IN PHILIPPINES** for PH.
- Uses real vertical poster artwork with large rank numerals.
- Posters keep a proper portrait presentation instead of being letterboxed.
- The row scrolls horizontally with touch/swipe, mouse/trackpad/drag and TV D-pad focus navigation where supported.
- Android / Android TV prioritize lighter Top 10 poster assets so the row appears much sooner after Home opens.
- Android TV rank numbers were refined to sit in front of the poster edge with a solid bold condensed style and consistent scale from **1–10**.
- Windows Top 10 cards now use the normal title-details opening path and are fully clickable.
- **Top 10 Today can be disabled from Homepage panels / Home customization.** It remains enabled by default.
- **Coming Soon is hidden by default** and can still be enabled manually.

### 🎬 Official featured-title artwork

When TMDB provides an official transparent logo for a movie or series, ZeroPlay now uses that designed title artwork in the featured carousel instead of always rendering the title as plain text. Normal text remains the fallback when no suitable logo exists.

### ▶️ Better resume and Continue Watching

Series progress is now much more consistent across platforms:

- ZeroPlay remembers the **last season and episode actually opened**.
- Reopening a series defaults to that saved season/episode instead of returning to **S1 E1**.
- Android, Android TV, Windows and Web retain this selection in their respective local progress stores.
- Continue Watching is registered as soon as playback starts, so a title no longer depends on a provider reporting progress before appearing in the row.
- Series parent progress keeps season/episode context for later resume.

### 🌙 Smarter Tonight's Picks and Hidden Gems

The two discovery shelves no longer look like duplicate "latest movies" rows.

- **Tonight's Picks** uses a broader quality-focused candidate pool and rotates choices daily.
- **Hidden Gems** deliberately favors well-rated, lower-popularity and generally older titles, with a weekly rotation component.
- Windows and Web build curation from a deduplicated mix of Top Rated, Trending, Popular and Now Playing sources.
- Android / Android TV use matching intent rather than simply sorting the already-loaded newest titles.

## 🌐 Website improvements

- Collapsed the duplicated navigation/header treatment into **one physical top bar**.
- Added muted **featured trailer autoplay previews** with an audio toggle and artwork fallback.
- Fixed the trailer metadata request path so TMDB video data is actually accepted by the website API layer.
- Added official TMDB title-logo artwork to the hero when available.
- Fixed shared/deep movie and series links that reopened their details immediately after the user closed them.
- Fixed the same close-loop when a title was opened normally and browser route state tried to reopen it.
- Preserved shareable `/movie/:id` and `/tv/:id` routes while keeping browser Back/Forward behavior predictable.
- Updated frame/CSP handling for trailer embeds and refreshed the service-worker shell so stale double-bar assets do not linger.

## 📺 Android / Android TV improvements

- Added the Top 10 Today shelf and Home-panel toggle.
- Prioritized Top 10 poster loading instead of leaving those posters at the back of the normal lazy-image queue.
- Fixed the Android TV `10` rank being cropped or disproportionately small.
- Refined TV rank drawing order so poster artwork can no longer hide the rank number.
- Made TV ranks solid, bold, condensed and slightly slimmer while keeping the poster visible.
- Kept the full vertical poster presentation in the Top 10 rail.
- Updated the featured **Watch now** button to use the normal ZeroPlay accent treatment instead of a dark inconsistent focused state.
- Improved Continue Watching registration and series resume season/episode memory.
- Added provider-safe handling for the VidSrc subtitle panel so Back / close attempts can dismiss the subtitle overlay before exiting playback.

## 🖥️ Windows improvements

- Added the Top 10 Today shelf with horizontal wheel/trackpad/drag scrolling and keyboard focus support.
- Fixed Top 10 cards not opening title details.
- Added Top 10 to Home customization so the row can be disabled.
- Added official featured title logos when TMDB supplies them.
- Improved Continue Watching registration and last-season/episode restoration.
- Added the VidSrc subtitle-overlay close fallback without closing the whole player.
- Updated Tonight's Picks and Hidden Gems to use distinct curated candidate pools instead of presenting near-identical recent movies.

## 🛠️ Fixes included in 2.2.1

1. Fixed Windows Top 10 posters being non-clickable.
2. Fixed Android TV Top 10 rank numbers rendering behind posters.
3. Fixed Android TV rank `10` clipping and mismatched sizing.
4. Reduced Android TV rank bulk while keeping all rank numbers visually uniform.
5. Fixed Top 10 posters appearing one to two minutes after the rest of Home on Android / TV by priority-loading smaller poster assets.
6. Removed Top 10 poster letterboxing / dark bands and kept a full portrait card presentation.
7. Added horizontal Top 10 scrolling across pointer/touch/remote-capable interfaces.
8. Added a user-facing switch to disable Top 10 Today.
9. Hid Coming Soon by default while keeping it opt-in.
10. Fixed Continue Watching missing titles that had actually been opened for playback.
11. Fixed series selectors reverting to S1 E1 instead of the last played season/episode.
12. Fixed Tonight's Picks and Hidden Gems collapsing into similar latest-release lists.
13. Fixed the Android / TV hero Watch now button using an overly dark focus style.
14. Fixed VidSrc subtitle/options overlays that could not be dismissed reliably from the ZeroPlay player shell.
15. Fixed website title-details close loops for normal clicks and shared deep links.
16. Fixed website hero trailer requests being rejected by the catalog API allowlist.
17. Added hero trailer fallback behavior when no usable preview is available.
18. Added official title-logo fallback logic so plain text remains available when TMDB has no logo.
19. Updated website cache/CSP behavior for the new hero preview stack.
20. Kept all changes compatible with the existing 2.2 player-source, updater, ad-filtering, Lite and offline-playback foundations.

## 📦 Release files

- `ZeroPlay-2.2.1-Android.apk`
- `ZeroPlay-2.2.1-Android-TV.apk`
- `ZeroPlay-2.2.1-Android-Lite.apk`
- `ZeroPlay-2.2.1-Android-TV-Lite.apk`
- `ZeroPlay-2.2.1-Windows-x64.zip`
- `SHA256SUMS.txt`

Android Full and Lite editions keep separate package IDs. Windows remains a portable ZIP with no installer.

## 🧪 Release validation

The 2.2.1 production pipeline validates:

- all four Android release variants with unit tests, APK build, signatures, package/version checks and lint;
- Windows unit tests, UI/player regressions, Electron smoke testing, packaged ASAR checks, the preserved mpv/offline/updater stack and Microsoft Defender scanning;
- website unit tests, interaction checks and production build validation;
- release credential audits and final SHA-256 checksums.

## ℹ️ Notes

- Provider behavior can change independently of ZeroPlay.
- Trailer autoplay starts muted because browsers generally block autoplay with sound.
- Official title logos and trailers depend on TMDB / provider availability for each title.
- Libraries, profiles, resume state and panel choices remain local to each device/profile; there is no cloud synchronization.
'''
Path('docs/release-2.2.1.md').write_text(release_notes,encoding='utf-8')

# README: promote 2.2.1 and expose the update's headline features without rewriting the complete 2.2 inventory.
p=Path('README.md'); text=p.read_text(encoding='utf-8')
text=text.replace('# 🎬 ZeroPlay 2.2\n','# 🎬 ZeroPlay 2.2.1\n',1)
text=text.replace('Version **2.2** adds **Hybrid TV controls**, local profiles, deeper discovery, persistent catalog caching and updated **Lite editions**.','Version **2.2.1** keeps the 2.2 foundation and adds **Top 10 Today**, official featured-title artwork, stronger Continue Watching / episode resume behavior, smarter Home curation and player/web polish.',1)
text=text.replace('[📋 2.2 release notes](docs/release-2.2.md)','[📋 2.2.1 release notes](docs/release-2.2.1.md)',1)
for old,new in [
 ('releases/download/v2.2/ZeroPlay-2.2-Android.apk','releases/download/v2.2.1/ZeroPlay-2.2.1-Android.apk'),
 ('releases/download/v2.2/ZeroPlay-2.2-Android-TV.apk','releases/download/v2.2.1/ZeroPlay-2.2.1-Android-TV.apk'),
 ('releases/download/v2.2/ZeroPlay-2.2-Android-Lite.apk','releases/download/v2.2.1/ZeroPlay-2.2.1-Android-Lite.apk'),
 ('releases/download/v2.2/ZeroPlay-2.2-Android-TV-Lite.apk','releases/download/v2.2.1/ZeroPlay-2.2.1-Android-TV-Lite.apk'),
 ('releases/download/v2.2/ZeroPlay-2.2-Windows-x64.zip','releases/download/v2.2.1/ZeroPlay-2.2.1-Windows-x64.zip'),
 ('releases/download/v2.2/SHA256SUMS.txt','releases/download/v2.2.1/SHA256SUMS.txt')]:
    text=text.replace(old,new)
text=text.replace('## ⭐ What’s new in 2.2\n\n**Hybrid TV controls · Embedwave (BETA) · Local profiles · Up Next · Because You Watched · Hidden Gems · Performance Mode · Persistent catalog caching · Updated Lite editions**',
'''## ⭐ What’s new in 2.2.1

**Top 10 Today · Official carousel title artwork · Last season/episode resume · More reliable Continue Watching · Smarter Tonight’s Picks · Smarter Hidden Gems · Website trailer previews · Deep-link close fixes · VidSrc subtitle-menu close fix · Top 10 Home toggle**

> **Top 10 Today** is enabled by default on Android, Android TV and Windows and can be disabled from Homepage panels / Home customization. **Coming Soon is hidden by default.**''',1)
text=text.replace('- **Hidden Gems:** discovery with popularity/rating/vote thresholds.','- **Hidden Gems:** well-rated, lower-popularity discovery that deliberately leans away from the newest mainstream releases and rotates over time.',1)
text=text.replace('- **Tonight’s Picks:** shorter and highly rated choices for watching now.','- **Tonight’s Picks:** a rotating quality-focused mix for watching now rather than another newest-release shelf.',1)
text=text.replace('- **Continue Watching** with supported provider progress and season/episode context.','- **Continue Watching** registers when playback starts and retains season/episode context; reopening a series restores the last season/episode you actually played.',1)
text=text.replace('- Homepage panel toggles, saved panel ordering and category shelves.','- Homepage panel toggles, saved panel ordering and category shelves, including an optional **Top 10 Today** rail; **Coming Soon is off by default**.',1)
text=text.replace('- Focus information, configurable preview delay, focus trailers and homepage trailers linked to the displayed title.','- Focus information, configurable preview delay, focus trailers and homepage trailers linked to the displayed title; official TMDB title-logo artwork is used in the hero when available.',1)
text=text.replace('- Continuous pagination with retry, deduplication, end-of-results handling and improved tab/scroll restoration.','- Continuous pagination with retry, deduplication, end-of-results handling and improved tab/scroll restoration.\n- Single-bar website navigation plus muted hero trailer autoplay previews with an audio toggle and artwork fallback.\n- Shared/deep movie and series links close cleanly instead of immediately reopening their detail dialog.',1)
marker='### 2.2 — navigation, discovery, personalization and performance\n'
section='''### 2.2.1 — Home, resume and player polish

1. Added **Top 10 Today** on Android, Android TV and Windows, with regional labeling, real portrait posters and large rank numerals.
2. Added horizontal Top 10 navigation/scrolling and a **Homepage panels** toggle so the shelf can be disabled.
3. Hid **Coming Soon** by default while retaining it as an opt-in panel.
4. Added official TMDB title-logo artwork to featured carousels when available, with plain-title fallback.
5. Added muted website hero trailer autoplay with sound toggle and fallback artwork.
6. Fixed website deep/shared title links reopening immediately after the detail dialog was closed.
7. Fixed website trailer metadata requests being rejected by the API allowlist.
8. Improved Continue Watching so playback start is recorded immediately instead of waiting on provider progress callbacks.
9. Restored the last played **season and episode** when reopening a series on Android, Android TV, Windows and Web.
10. Reworked **Tonight’s Picks** and **Hidden Gems** so they no longer behave like duplicate newest-movie shelves.
11. Prioritized Android/TV Top 10 poster loading and reduced poster request size for a much faster Home appearance.
12. Fixed Android TV rank drawing, clipping, `10` sizing and poster overlap; ranks are now solid, bold and condensed in front of the poster edge.
13. Fixed Windows Top 10 cards not opening details.
14. Removed Top 10 poster letterboxing and preserved proper vertical artwork presentation.
15. Made the Android/TV carousel **Watch now** focus treatment consistent with the ZeroPlay accent UI.
16. Added a provider-safe close fallback for the VidSrc subtitle/options overlay on Android/TV and Windows.
17. Preserved the existing 2.2 source-selection, Hybrid controls, updater, ad-filtering, Lite and offline-playback foundations.

[Full 2.2.1 release notes](docs/release-2.2.1.md).

'''
if '### 2.2.1 — Home, resume and player polish' not in text:
    if marker not in text: raise SystemExit('README 2.2 fixes marker missing')
    text=text.replace(marker,section+marker,1)
p.write_text(text,encoding='utf-8')

# Changelog: add the new release summary before 2.2.
p=Path('docs/changelog.md'); ch=p.read_text(encoding='utf-8')
ch=ch.replace('Current release: **2.2**.','Current release: **2.2.1**.',1)
entry='''<details open>
<summary><strong>ZeroPlay 2.2.1</strong></summary>

'''+release_notes+'''\n</details>\n\n'''
if '<summary><strong>ZeroPlay 2.2.1</strong></summary>' not in ch:
    anchor='<details>\n<summary><strong>ZeroPlay 2.2</strong></summary>'
    if anchor not in ch: raise SystemExit('changelog 2.2 anchor missing')
    ch=ch.replace(anchor,entry+anchor,1)
p.write_text(ch,encoding='utf-8')

# Derive the production workflow from the proven 2.2 release pipeline.
source=Path('.github/workflows/release-2.2.yml').read_text(encoding='utf-8')
workflow=source
replacements=[
 ('ZeroPlay 2.2 Production Release','ZeroPlay 2.2.1 Production Release'),
 ('zeroplay-2-2-production','zeroplay-2-2-1-production'),
 ("Release ZeroPlay v2.2'","Release ZeroPlay v2.2.1'"),
 ('versionCode 44','versionCode 45'),
 ("versionName '2.2'","versionName '2.2.1'"),
 ("versionName='2.2'","versionName='2.2.1'"),
 ("$pkg.version='2.2.0'","$pkg.version='2.2.1'"),
 ("$pkg.version -ne '2.2.0'","$pkg.version -ne '2.2.1'"),
 ('Expected Windows version 2.2.0','Expected Windows version 2.2.1'),
 ('ZeroPlay-2.2-Android-Production','ZeroPlay-2.2.1-Android-Production'),
 ('ZeroPlay-2.2-Windows-Production','ZeroPlay-2.2.1-Windows-Production'),
 ('ZeroPlay-2.2-Android.apk','ZeroPlay-2.2.1-Android.apk'),
 ('ZeroPlay-2.2-Android-TV.apk','ZeroPlay-2.2.1-Android-TV.apk'),
 ('ZeroPlay-2.2-Android-Lite.apk','ZeroPlay-2.2.1-Android-Lite.apk'),
 ('ZeroPlay-2.2-Android-TV-Lite.apk','ZeroPlay-2.2.1-Android-TV-Lite.apk'),
 ('ZeroPlay-2.2-Windows-x64.zip','ZeroPlay-2.2.1-Windows-x64.zip'),
 ('ZeroPlay-2.2-Windows-x64.${ext}','ZeroPlay-2.2.1-Windows-x64.${ext}'),
 ('Windows 2.2 portable ZIP','Windows 2.2.1 portable ZIP'),
 ('Website 2.2 Validation','Website 2.2.1 Validation'),
 ('Publish ZeroPlay 2.2','Publish ZeroPlay 2.2.1'),
 ('gh release view v2.2 ','gh release view v2.2.1 '),
 ("'v2.2 already exists","'v2.2.1 already exists"),
 ('gh release create v2.2 \\', 'gh release create v2.2.1 \\'),
 ("--title 'ZeroPlay 2.2 — Navigation, Discovery & Performance'","--title 'ZeroPlay 2.2.1 — Home, Resume & Player Polish'"),
 ('--notes-file docs/release-2.2.md','--notes-file docs/release-2.2.1.md'),
]
for old,new in replacements:
    workflow=workflow.replace(old,new)
# Ensure every production job gates on the 2.2.1 release commit.
if "Release ZeroPlay v2.2.1" not in workflow: raise SystemExit('release trigger substitution failed')
if "versionName '2.2.1'" not in workflow: raise SystemExit('Android 2.2.1 verification missing')
if 'ZeroPlay-2.2.1-Windows-x64.zip' not in workflow: raise SystemExit('Windows 2.2.1 artifact missing')
Path('.github/workflows/release-2.2.1.yml').write_text(workflow,encoding='utf-8')
print('ZeroPlay 2.2.1 release metadata prepared')
