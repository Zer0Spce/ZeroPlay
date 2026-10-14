# ZeroPlay 2.2.1 — Home, Resume & Player Polish

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
