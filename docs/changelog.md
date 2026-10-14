# ZeroPlay — complete release history

Current release: **2.2.1**. This archive includes all 25 published GitHub release records available during the 2.2 documentation refresh. The previously missing 2.0.1 record was restored from its published release description. Historical additions, removed experiments and old known issues describe their release; use the [current README](../README.md) for today’s behavior.

<details open>
<summary><strong>ZeroPlay 2.2.1</strong></summary>

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

</details>

<details>
<summary><strong>ZeroPlay 2.2</strong></summary>

# ZeroPlay 2.2 — Navigation, Discovery & Performance

ZeroPlay 2.2 is the largest navigation/discovery release since the 2.x redesign. It focuses on making Android TV playback substantially easier to control, reducing repeated network/UI work, adding local personalization and deeper discovery, improving episode progress, and making provider selection/recovery more predictable.

## ⭐ Headline: Android TV Hybrid Mode

**Hybrid Mode** is the biggest Android TV / Google TV change in 2.2.

Embedded video providers do not expose remote controls consistently. Some have a good focus graph, some only respond reliably to pointer input, and some dynamically hide controls. Hybrid Mode lets ZeroPlay choose the interaction method that fits the player currently on screen:

- uses detected **D-pad / focus navigation** when the provider exposes enough reliable controls;
- falls back to the **virtual mouse** when the focus graph is missing, incomplete or unsuitable;
- wakes hidden provider control bars before trying to move focus;
- handles player menus/settings/overlays without changing normal app navigation;
- avoids raw D-pad seeking when ZeroPlay is using focus navigation;
- keeps staged Back behavior so a provider menu/controls can close before playback exits;
- preserves fixed **Mouse** and **D-pad** modes for users who do not want automatic strategy selection.

Hybrid Mode is included in both **Android TV** and **Android TV Lite**.

## ▶️ Playback sources and provider behavior

### Embedwave (BETA)

- Added **Embedwave (BETA)** for movies and TV episodes.
- Movie format uses the provider's TMDB embed path.
- TV playback includes TMDB ID + season + episode.
- No additional ZeroPlay API key is required for Embedwave.
- Embedwave is included in trusted-provider handling rather than being treated as unrestricted external navigation.

### Manual source choice now wins

During 2.2 testing we found and fixed a regression where health scoring could silently replace a manually selected provider with Embedwave.

The corrected source precedence is:

1. one-time source selected for this title;
2. saved per-title source;
3. source selected in Settings;
4. normal fallback.

Health scoring can help recovery after a real failure, but it no longer silently overrides the user's initial source choice.

### Automatic Source Recovery

- Added source-health tracking for success/failure/load behavior.
- Added optional automatic recovery to another provider after a meaningful failure.
- **Automatic Source Recovery is OFF by default.**
- It runs only when the user explicitly enables it.
- Manual provider selection remains the starting provider even when recovery is enabled.

### Provider-native controls

An early 2.2 test build added a ZeroPlay control strip above normal movie/series playback. That was removed after testing.

Final 2.2 behavior:

- normal embedded movie/series playback uses the provider's **native/default controls**;
- no permanent ZeroPlay `Back / ±10 / Play / Skip / Mini / Info / Full screen` strip overlays the video;
- Android/TV's visible quick bar was removed from normal provider playback;
- app-level remote/back/source/recovery behavior remains available behind the scenes;
- existing Sports-specific support controls remain where that specialized player requires them.

## 📺 Android TV / Google TV improvements

- New **Hybrid / Smart** player-navigation mode.
- Existing Mouse and D-pad/focus modes remain available.
- Better spatial focus navigation between visible provider controls.
- Hidden controls can be woken by remote activity.
- Focus handling is more stable after player controls auto-hide.
- Provider iframe navigation has better fallback handling.
- Player menus/settings are detected before exit behavior.
- Back closes an active provider/menu layer before leaving playback when possible.
- The Menu button opens ZeroPlay's playback utility menu where supported.
- Holding Menu/Center does **not** silently change playback source.
- Mouse mode continues to support pointer movement + OK click.
- Player diagnostics expose provider/navigation/source information for troubleshooting.
- Source selection on Android/TV now includes VidStuck, Embedwave (BETA), VidSrc.sh, plus RawCast where configured.
- Fixed the insertion bug that temporarily pushed VidSrc.sh out of the visible Android/TV source list.

## 🪶 Android Lite and Android TV Lite

2.2 restores the separate Lite product flavors used in 2.1.2:

- `com.zerostreams.app.lite.mobile`
- `com.zerostreams.app.lite.tv`

Lite is not a renamed full APK. It uses a dedicated lightweight launcher/presentation layer:

- rotating hero carousel disabled;
- fewer cards kept alive per homepage row;
- smaller TMDB artwork requests;
- full-screen backdrop/blur atmosphere disabled;
- UI animations disabled by default;
- focus trailers disabled by default;
- homepage trailer disabled by default;
- Performance Mode enabled by default;
- artwork quality defaults to the saver-oriented setting;
- Classic layout used by default.

The Lite editions still share the current 2.2 catalog/player core, so **Android TV Lite includes Hybrid Mode, Embedwave, fixed source precedence, native provider controls and the rest of the 2.2 playback work.**

## ⚡ Performance and caching

### Catalog caching

- Added persistent catalog caching around TMDB-backed requests.
- Windows uses memory + disk caching.
- Android uses persistent catalog cache helpers.
- Frequently requested catalog data can be served without blocking on every network round trip.
- Stale cached information can be used as a fallback when TMDB temporarily fails.
- Cache sizes/ages are bounded instead of growing forever.

### Less unnecessary work

- Reduced repeated catalog requests when returning to previously loaded sections.
- Reduced unnecessary tab/page regeneration.
- Improved state retention between sections.
- Background refresh work is separated from the immediate navigation path where possible.
- Playback can suspend/reduce unrelated homepage work.

### Artwork

- Smarter/lazier image loading.
- Smaller artwork choices where appropriate.
- Adaptive artwork-quality settings.
- Lite editions request smaller TMDB sizes by default.
- Offscreen/unused artwork work is reduced.

### Performance Mode

Performance Mode reduces expensive presentation work on slower devices, especially TVs/Android boxes:

- animated presentation can be reduced;
- trailer/focus-preview work can be reduced;
- heavier artwork behavior can be avoided;
- Lite builds enable this mode by default.

## 🏠 Homepage and discovery

### Up Next

- Added **Up Next** to surface the next episode of series with saved progress.
- Uses episode/season progress rather than treating every progress entry as a separate recommendation.
- Fixed a Windows test-build bug where the **Up Next section** could be stored/rendered more than once.
- Fixed a second Windows bug where the **same series appeared multiple times inside Up Next** because multiple episode-progress records were rendered independently.
- Final behavior deduplicates by TMDB series ID and keeps the newest progress record for each show.

### Because You Watched

- Added local recommendation rows based on recent viewing context.
- Uses local history/recommendation signals instead of relying only on global popularity.

### Hidden Gems

- Added a lower-popularity/high-rating discovery concept with vote thresholds to avoid random unrated titles.

### Tonight's Picks

- Added more situational discovery intended for choosing something to watch now, including shorter/highly-rated/recent options.

### TV discovery

Expanded TV-specific discovery around concepts such as:

- airing today;
- new/recent episodes;
- returning/ongoing shows;
- completed series;
- episode-calendar/upcoming information.

### Movie and TV filters

2.2 expands filtering/sorting support around combinations of:

- genre;
- year/date;
- rating;
- language;
- runtime;
- country/origin;
- TV status where available;
- popularity/rating/release/alphabetical style sorting.

### Mood discovery

Added the 2.2 discovery layer used for “What should I watch?” style browsing, with concepts such as funny, scary, action, romance, family, mind-bending, highly rated and shorter watches.

### Person and collection discovery

- Expanded people/person search and credits.
- Better actor/filmography navigation.
- Better collection/franchise relationships.
- More-like-this logic has more local/contextual signals available.

## 👤 Local personalization

### Local profiles

Added local profile support without requiring a ZeroPlay cloud account.

Profiles can maintain separate personal state such as:

- history;
- Continue Watching / progress;
- watchlist/planned titles;
- searches;
- custom collections;
- Not Interested choices;
- local recommendation context.

Switching profiles stores the outgoing profile's state and restores the incoming profile's data.

### Not Interested

- Added a local Not Interested list for hiding/down-ranking unwanted recommendations.
- Stored locally with profile-specific personal state.

### Homepage customization

- New 2.2 sections participate in homepage customization.
- Homepage panel order is persisted.
- Saved Windows panel order is normalized/deduplicated so duplicate section IDs cannot render duplicate rows.

## ⏯️ Continue Watching and episodes

- Improved Continue Watching progress persistence.
- TV progress retains season/episode context.
- Improved completed/in-progress handling.
- Next unwatched episode calculation feeds Up Next.
- Season/series progress information is available to the new discovery layer.
- Autoplay-next setting added/expanded.
- Previous/next episode navigation support added to player utility paths.
- Episode/season quick navigation infrastructure added.
- Configurable intro and recap timing support added without claiming exact crowd-sourced timestamps.

## 🧭 Search and library

- Search remains **explicit**: ZeroPlay does not search on every typed character.
- Expanded search/discovery plumbing includes Movies, TV and People/person results where supported.
- Watchlist/library filtering has additional local state available for Movies/TV/Anime and progress-oriented groups.
- Custom collections remain local and work with the new profile model.
- Quick title actions can expose Watch, Details, Watchlist, Mark Watched, Collection, Not Interested and related discovery paths where supported by the active UI.

## 🖥️ Windows 2.2

- Added catalog memory/disk cache with bounded entries and stale fallback.
- Added source-health tracking.
- Fixed explicit source-selection precedence.
- Added Embedwave (BETA).
- Automatic source recovery defaults OFF.
- Added/expanded player diagnostics.
- Mini-player infrastructure and keyboard playback shortcuts are part of the 2.2 desktop player work.
- Improved fullscreen/back behavior.
- Improved browsing/home-state restoration.
- Homepage order normalization prevents duplicated sections.
- Up Next deduplication prevents repeated series cards.
- Provider-native movie/series controls are preserved; the experimental ZeroPlay top control bar was removed.
- Electron smoke coverage was expanded/hardened.

### Windows smoke-test hang fixed

During 2.2 validation, the smoke test completed all functional playback checks but sometimes never exited because the local fixture HTTP server waited for Electron keep-alive connections.

The test-fixture shutdown was fixed to close remaining connections, so a successful smoke test now exits normally instead of hanging until CI timeout.

## 🌐 Website 2.2

Website changes remain intentionally scoped separately from the native apps:

- Movies and Series discovery remain available.
- Added Embedwave (BETA) alongside VidStuck.
- Added/connected 2.2 discovery helpers including Because You Watched, Hidden Gems, profiles/person discovery and episode-calendar behavior.
- Improved filtered catalog pagination/infinite scroll.
- Fixed tab/pagination behavior that could continuously append or appear to load random Movies/Series when switching tabs.
- Loaded pages append in place rather than rebuilding the entire catalog unnecessarily.
- Web cache/bundle refresh behavior was tightened after the pagination fixes.
- **Live TV, Live Sports and PPV remain intentionally removed from the website only.** Native Android/TV/Windows live sections are unaffected.

## 🛡️ Player / ad-protection behavior retained

2.2 preserves the existing Adblock 2.0 direction:

- known ad-network host blocking;
- popup/popunder navigation hardening;
- confirmed QR-ad host learning/quarantine;
- expiration of learned hosts instead of permanent poisoning;
- protection for provider/video CDN hosts;
- no automatic CAPTCHA/Cloudflare solving or bypassing.

Adding Embedwave also updates trusted-provider handling so the provider can load correctly without weakening general external-navigation protections.

## 🧪 Regression and validation improvements

A large part of 2.2 was hardened through real test-build feedback.

New/expanded regression coverage includes:

- Hybrid/D-pad/mouse player navigation behavior;
- player guard/ad behavior;
- explicit source-selection precedence;
- Embedwave URL/source wiring;
- automatic source-recovery default OFF;
- homepage panel-order deduplication;
- Up Next unique-series behavior;
- provider-native controls/no normal movie-player toolbar;
- Android/Android TV unit tests + lint + APK builds;
- Windows unit, desktop UI, player-guard and Electron smoke tests;
- website unit/UI/build checks;
- exact-HEAD validation so Web + Android/TV + Windows can be tested against the same committed source state.

## 🔧 Important fixes discovered during 2.2 testing

- Fixed explicit source choices being replaced by Embedwave.
- Restored VidSrc.sh to the Android/TV picker after Embedwave insertion changed source indexing.
- Disabled Automatic Source Recovery by default for new and migrated 2.2 settings.
- Removed the experimental ZeroPlay movie/series control strip and kept provider-native controls.
- Kept Sports-specific controls where they are required.
- Fixed duplicate Windows Up Next section ordering.
- Fixed duplicate titles inside Windows Up Next.
- Fixed stale source-count regression tests after adding Embedwave.
- Fixed stale homepage-panel test expectations after adding 2.2 rows.
- Fixed web UI tests/guards that still assumed only one provider.
- Fixed Windows smoke fixture cleanup hang.
- Hardened CI generated-source handling to prevent unrelated platform diffs/push races.

## 📦 Production files

ZeroPlay 2.2 publishes:

- `ZeroPlay-2.2-Android.apk`
- `ZeroPlay-2.2-Android-TV.apk`
- `ZeroPlay-2.2-Android-Lite.apk`
- `ZeroPlay-2.2-Android-TV-Lite.apk`
- `ZeroPlay-2.2-Windows-x64.zip`
- `SHA256SUMS.txt`

Android Lite packages remain separate from the full packages and therefore can be installed independently.

## ⚠️ Known provider/platform limitations

- VidStuck, Embedwave and VidSrc.sh are third-party providers and can change without a ZeroPlay release.
- Embedwave remains labeled **BETA**.
- Progress events depend on what a provider exposes.
- A newly changed QR creative may need its own X / timeout before ZeroPlay has confirmed evidence for its host.
- ZeroPlay deliberately does not solve verification challenges.
- Windows SmartScreen reputation can vary when trusted Authenticode reputation is unavailable.
- Offline/local playback compatibility can depend on media/container/compositor conditions; external-player opening remains available for completed downloads.

## ✅ Release validation

The 2.2 production process validates:

- Android + Android TV release unit tests;
- Android Lite + Android TV Lite release unit tests;
- signing, package ID and `2.2` version on all four APKs;
- lint for all four Android flavors;
- Hybrid/player navigation regressions;
- Windows tests and desktop/player smoke behavior;
- preservation of the production Windows updater/offline-player stack used by 2.1.2;
- portable Windows packaging and packaged-ASAR checks;
- Microsoft Defender scan of the production Windows tree;
- website validation;
- credential audit;
- SHA-256 checksums;
- release publication only after required jobs pass.

---

**ZeroPlay 2.2 is primarily a navigation, discovery, personalization, playback-reliability and performance release.** The standout change is Android TV **Hybrid Mode**, designed to make third-party embedded players feel much more consistent from a remote without replacing the providers' own video controls.

</details>

<details>
<summary><strong>ZeroPlay 2.1.2</strong></summary>

# ZeroPlay 2.1.2 Hotfix

ZeroPlay 2.1.2 is a focused hotfix for Windows playback UI stability and player ad filtering across Windows, Android, and Android TV / Google TV.

**Release channel:** Hotfix

## Highlights

### Windows series / source UI hotfix

- Fixes the `Cannot access 'action' before initialization` regression in the Windows UI.
- Restores the close/X behavior after selecting a series.
- Keeps source-selection actions clickable and functional.
- Retains the working Windows per-title source confirmation flow.

### Windows watched-state tracking retained

The Windows episode completion logic that was manually verified before this hotfix remains included:

- checks real `currentTime` + `duration`
- catches the actual `ended` event
- treats 95%+ as completed
- forces completed episodes to 100% / `✓ Watched`
- final completion events bypass the normal progress throttle
- completed episodes stop being tracked so auto-next cannot overwrite them

### Stronger embedded-player ad blocking

- Adds `histats.com` and `histats.net` to the static ad/tracker blocklist.
- Adds a network-layer request filter to the Windows embedded movie/show player so blocked ad/tracker frames are cancelled before they render.
- Keeps provider/CDN allowlists intact to avoid blocking legitimate playback traffic.
- Android and Android TV include the updated HiStats block rules in their WebView filtering path.

### Android / Android TV note

Android episode watched/completion markers remain on the existing 2.1.1 behavior in this hotfix. The incomplete parity experiment is not being advertised as fixed in 2.1.2.

## Files

- `ZeroPlay-2.1.2-Android.apk` — Android phone / tablet
- `ZeroPlay-2.1.2-Android-TV.apk` — Android TV / Google TV
- `ZeroPlay-2.1.2-Windows-x64.zip` — Windows 10 / 11 x64 portable build
- `SHA256SUMS.txt` — SHA-256 checksums for all release assets

Windows remains portable only; there is no installer.

## Validation

The 2.1.2 production pipeline performs:

- Android Mobile and Android TV unit tests
- signed Android production builds
- APK signature and version verification
- Android lint
- Windows test suite
- pinned mpv SHA-256 verification
- native mpv video-surface helper build
- Windows source/action hotfix verification
- Windows episode-completion verification
- HiStats adblock wiring verification
- Windows smoke test
- portable ZIP build and packaged-source verification
- Microsoft Defender scan
- credential audit
- SHA-256 generation for all published assets

## Upgrade

### Windows

Users on 2.1 or 2.1.1 can use ZeroPlay's in-app updater, or download and extract the 2.1.2 portable ZIP manually.

### Android / Android TV

Install the matching signed 2.1.2 APK over the existing ZeroPlay installation using the normal Android update flow.

</details>

<details>
<summary><strong>ZeroPlay 2.1.1</strong></summary>

# ZeroPlay 2.1.1

ZeroPlay 2.1.1 is a reliability hotfix and Windows playback update for Windows, Android, and Android TV / Google TV.

The biggest Windows changes are the new native mpv-backed offline player and repaired episode completion tracking. Android and Android TV also include the finalized 2.1 carousel behavior and UI fixes.

## Highlights

### Windows offline player rebuilt

- Replaced the old Chromium-only offline video path with a bundled **mpv** playback engine.
- Video renders through a dedicated native Windows child surface while ZeroPlay keeps its own modern controls.
- Keeps playback inside the ZeroPlay experience instead of opening the normal mpv interface.
- Supports local **SRT, VTT, ASS, and SSA** subtitles.
- Supports embedded subtitle and audio tracks.
- Includes play/pause, seek, volume, mute, playback speed, fit/fill, fullscreen, subtitle selection, and external subtitle loading.
- Uses D3D11 / gpu-next playback with hardware decoding where available.
- The final player implementation was manually tested successfully before this release.

### Windows episode progress / completion fixed

- Episode progress now refreshes while the title details screen is open.
- Windows no longer relies only on provider progress messages for the final watched state.
- ZeroPlay also checks the real video playback position and duration.
- The actual video `ended` state is captured when available.
- Episodes at 95% or later are finalized as **100% / Watched**.
- Final completion updates bypass the normal progress-event throttle so the last state is not dropped.
- Completed episodes are locked before auto-next can overwrite the finished episode state.
- Episode selectors now correctly show **Continue %** and **✓ Watched** status.

### Windows title-source and history polish

- Playback source preference can be kept per title without changing every other title.
- One-time source switching remains available.
- Episode history is stored per season/episode instead of only at the series level.
- Added a dedicated watched-history clear action that keeps downloads, watchlist, and settings.
- Windows desktop exit remains immediate without the old exit confirmation dialog.

### Android / Android TV

- Finalized homepage carousel source parity with Windows.
- Carousel source choices now drive the actual visible hero cards.
- Watchlist and Continue Watching stay true to their selected source instead of silently falling back to Trending.
- Carousel is capped at 10 cards.
- Trailer previews follow the movie currently displayed in the hero.
- Season and Episode selector focus/selection visibility is improved.
- Reset application/settings support is retained.

### Windows updater

The dedicated `ZeroPlayUpdater.exe` architecture introduced in 2.1 is retained in 2.1.1.

- Users already on **2.1** can use the repaired in-app updater for 2.1.1.
- Users on **2.0–2.0.3** should still update manually because those older builds contain the broken updater.
- Update packages continue to be SHA-256 verified before activation.

## Files

- `ZeroPlay-2.1.1-Android.apk` — Android phone / tablet
- `ZeroPlay-2.1.1-Android-TV.apk` — Android TV / Google TV
- `ZeroPlay-2.1.1-Windows-x64.zip` — Windows 10 / 11 x64 portable build
- `SHA256SUMS.txt` — SHA-256 checksums for all release assets

Windows remains **portable only**. There is no installer.

## Validation

The 2.1.1 production pipeline performs:

- Android Mobile unit tests
- Android TV unit tests
- signed Android production APK builds
- Android lint for Mobile and TV
- APK signature verification and version verification
- Windows test suite
- pinned mpv download with SHA-256 verification
- native mpv video-surface helper build
- Windows episode-completion/source/history patch verification
- Windows desktop smoke test with bounded shutdown handling
- portable Windows ZIP build
- packaged mpv/native-host verification
- standalone updater verification
- Microsoft Defender scan of the packaged Windows application
- credential audit
- SHA-256 generation for all published assets

## Upgrade

### Windows 2.1

Use ZeroPlay's in-app updater, or download and extract `ZeroPlay-2.1.1-Windows-x64.zip` manually.

### Windows 2.0–2.0.3

Download `ZeroPlay-2.1.1-Windows-x64.zip` manually, extract it to a fresh folder, and launch `ZeroPlay.exe`.

### Android / Android TV

Install the matching signed 2.1.1 APK over the existing ZeroPlay installation using the normal Android update flow.

</details>

<details>
<summary><strong>ZeroPlay 2.1</strong></summary>

# ZeroPlay 2.1

ZeroPlay 2.1 is a reliability and UX update for Windows, Android, and Android TV / Google TV. The biggest change is a complete repair of the Windows portable updater, plus carousel-source parity across all platforms and a set of navigation/settings fixes.

> [!IMPORTANT]
> ## Windows 2.0 / 2.0.1 / 2.0.2 / 2.0.3 users must update manually once
>
> The Windows updater shipped in 2.0 through 2.0.3 is the bug being replaced by this release, so those versions cannot reliably upgrade themselves to 2.1.
>
> **Windows users on 2.0, 2.0.1, 2.0.2, or 2.0.3 should manually download `ZeroPlay-2.1-Windows-x64.zip`, extract it to a fresh folder, and launch `ZeroPlay.exe`.**
>
> After 2.1 is installed, future Windows releases can be installed through ZeroPlay's in-app updater.

Android and Android TV builds keep the established ZeroPlay signing identity and can continue to use the normal Android package update flow.

---

## Highlights

### Windows updater rebuilt

- Replaced the fragile in-app ZIP replacement flow with a dedicated **`ZeroPlayUpdater.exe`** helper.
- Update downloads are SHA-256 verified before activation.
- Updates are extracted with the .NET ZIP implementation instead of the old PowerShell/tar/in-place replacement path.
- New versions are installed under a versioned `versions/<version>/` directory instead of overwriting the running portable app.
- `current.json` is switched atomically only after the new portable build is validated.
- The updater waits for the running ZeroPlay process to close before changing the active version.
- The stable launcher now starts the selected version as an independent detached process so the updated app stays alive after handoff.
- Pending-version confirmation and rollback behavior are retained for safer activation.
- Temporary `.download-*` and staging folders are cleaned after a successful update.
- The helper writes `ZeroPlayUpdater-error.txt` when a helper-level update error occurs.
- The final helper architecture was validated through temporary newer-version updater tests before this release.

### Homepage carousel parity

The homepage carousel source setting now behaves consistently across **Windows, Android, and Android TV**.

Available sources:

1. **This Week Top Picks**
2. **Watchlist**
3. **Recommended Movies**
4. **Popular Movies**
5. **Now Playing**
6. **Continue Watching**

Additional fixes:

- Carousel source changes now replace the actual visible hero data rather than leaving the release renderer on Trending.
- Android / Android TV now use the real launcher/release presentation path instead of a lower-level renderer that was being overridden.
- Recommended, Popular, and Now Playing use their own ordered TMDB feeds.
- Watchlist and Continue Watching no longer silently fall back to Trending when empty.
- Carousel size is capped at **10 cards**.
- Trailer previews are bound to the exact movie currently displayed in the hero.
- Windows hero trailers now follow the selected carousel source instead of always using Top Picks.

### Android / Android TV controls and settings

- Season and Episode selectors have stronger visible focused/pressed/selected states.
- Selector styling is applied consistently in dark and light themes.
- Season/Episode labels are clearer and use the active accent treatment.
- Exit-choice copy now uses **`No, Go Back`** where that confirmation remains part of the Android playback/application flow.
- Added **Reset application and settings** under Settings.
- Reset clears settings, watchlist, history, collections, and API preferences while leaving downloaded media files intact.

### Windows behavior cleanup

- Removed the desktop **Exit ZeroPlay?** confirmation; closing the Windows app now exits normally.
- Kept playback-specific safeguards separate from ordinary desktop window closing.
- Fixed the Windows carousel source/trailer mismatch.

---

## Windows updater migration details

The previous Windows updater could successfully download an update yet fail during extraction, validation, replacement, or relaunch. 2.1 changes the updater boundary completely: Electron downloads and verifies the package, then hands installation to the standalone updater helper.

Because the broken updater lives inside the already-installed 2.0–2.0.3 applications, it cannot be relied on to deliver its own replacement. That is why the **manual 2.1 download is required once** for those Windows versions.

After you are running 2.1, the repaired updater is part of the portable build and future updates can use the in-app flow.

---

## Files

- `ZeroPlay-2.1-Android.apk` — Android phone / tablet
- `ZeroPlay-2.1-Android-TV.apk` — Android TV / Google TV
- `ZeroPlay-2.1-Windows-x64.zip` — Windows 10 / 11 x64 portable build
- `SHA256SUMS.txt` — SHA-256 checksums for all release assets

Windows remains **portable only**. There is no installer.

---

## Validation performed for 2.1

Before publication, the 2.1 production pipeline performs:

- Android Mobile unit tests
- Android TV unit tests
- signed production APK builds
- Android lint for Mobile and TV
- APK signature verification
- Windows test suite
- Windows desktop smoke test
- standalone updater-helper build
- verification that `ZeroPlayUpdater.exe`, `ZeroPlay.exe`, and `resources/app.asar` are present in the Windows portable package
- verification that the packaged Windows application reports version `2.1.0`
- verification that the old internal extraction path is absent
- verification that the Windows desktop exit confirmation is absent
- Microsoft Defender scan of the packaged Windows application
- release credential audit
- SHA-256 generation for published assets

---

## Upgrade instructions

### Windows 2.0–2.0.3

1. Download `ZeroPlay-2.1-Windows-x64.zip` manually from this release.
2. Extract it into a **new/fresh folder**.
3. Launch `ZeroPlay.exe`.
4. Confirm **2.1.0** in Settings → About.
5. Future versions can then use the repaired in-app updater.

### Android / Android TV

Install the matching signed 2.1 APK over the existing production installation, or use the normal in-app/package update flow where available.

---

Thanks to everyone who tested the updater and carousel behavior across Windows, Android, and Android TV. Those repeated real-device tests directly exposed the final renderer and updater-handoff bugs fixed in this release.

</details>

<details>
<summary><strong>ZeroPlay 2.0.3</strong></summary>

# ZeroPlay 2.0.3

## Windows updater repair

ZeroPlay 2.0.3 replaces the Windows portable updater handoff. The updater now waits for every ZeroPlay process using the installed executable, force-closes only remaining ZeroPlay processes if necessary, overlays the complete extracted portable package with retry handling, verifies both `ZeroPlay.exe` and `resources/app.asar` after replacement, and relaunches the updated application from the installation directory. A detailed `ZeroPlay-updater.log` is written to the Windows temporary directory if installation fails.

> **Important for Windows users:** the updater in earlier builds cannot reliably replace its own files. Please manually download the full **ZeroPlay 2.0.3 Windows ZIP**, extract it over your current ZeroPlay folder, and launch ZeroPlay once. This installs the repaired updater for future updates.

## Series playback selection

On Android mobile/tablet, Android TV, Windows, and Web, TV-series details now show separate **Season** and **Episode** selectors beside or directly below the Watch Now area. Selecting a season loads its episode list, and **Watch Now** opens the exact selected episode. Movies are unchanged.

</details>

<details>
<summary><strong>ZeroPlay 2.0.2</strong></summary>

# ZeroPlay 2.0.2

Maintenance update for Android, Android TV, and Windows.

## Changes
- Live PPV now auto-refreshes its catalogue once per hour. The Refresh button always forces an immediate network refresh.
- Live Sports now auto-refreshes its catalogue once per hour. The Refresh button always forces an immediate network refresh.
- Android phone/tablet Modern UI now shows Categories in place of Downloads, matching Android TV Modern UI. Downloads remain available through the library/download flows.
- Modern UI Home label is normalized to Home.
- Includes the Windows updater reliability fix carried forward from 2.0.1.

</details>

<details>
<summary><strong>ZeroPlay 2.0.1</strong></summary>

# ZeroPlay v2.0.1 — Maintenance Update

> **Important for Windows users upgrading from ZeroPlay 2.0:** the updater bug in the original 2.0 Windows build may prevent the update from unpacking or relaunching correctly. Please manually download the updated **ZeroPlay 2.0.1 Windows ZIP**, extract it over your existing ZeroPlay folder, and launch ZeroPlay once. After that, the repaired built-in updater will be in place for future updates.

This is a focused maintenance patch for the native ZeroPlay apps.

## Fixed
- Movie and episode playback now requires an explicit exit confirmation before leaving playback.
- **Yes, exit** leaves playback; **No, keep watching** returns cleanly to the video.
- App-exit and playback-exit confirmations now share the same clean, opaque, uniform styling.
- Android's in-app updater dialog is now opaque, cleaner, more consistent, and easier to use on mobile and TV.
- Windows updater now waits for ZeroPlay to fully exit, reliably applies the extracted portable files with retries, verifies the updated executable after replacement, and relaunches ZeroPlay automatically.
- If the Windows updater cannot finish applying an update, it now leaves a diagnostic updater log and shows a visible failure message instead of silently disappearing.

## Android TV / Modern UI
- Renamed **For you** to **Home**.
- Added **Categories** to Modern UI on Android TV by replacing the Downloads navigation slot there. Downloads functionality itself is not removed from ZeroPlay.

## Live refresh behavior
- **Live PPV** catalogue network refreshes are limited to once per hour.
- **Live Sports** catalogue network refreshes are limited to once per hour.
- Saved/cached data remains available between refreshes.

## Version
- Android / Android TV: **2.0.1** (`versionCode 38`)
- Windows: **2.0.1**

This remains the same **2.0.1** maintenance update. The Windows portable ZIP was refreshed only to repair the updater handoff included in the earlier 2.0 Windows build.

</details>

<details>
<summary><strong>ZeroPlay 2.0</strong></summary>

# ZeroPlay 2.0 🎬📺🏟️

ZeroPlay 2.0 is the largest UI, TV-control, player, updater and reliability release since the ZeroMovies → ZeroPlay transition. This release keeps the existing Android signing identity and local libraries while rebuilding several parts that had accumulated too many one-off fixes.

## Highlights

- 📺 Android TV D-pad player navigation rewritten as one clean controller.
- 🖱️ Android TV Mouse mode back behavior fixed and preserved.
- 🎨 Four UI choices: Clean, Modern, Flix and Native / Original.
- 🧭 Platform-specific fresh-install defaults.
- 🖥️ Windows app fullscreen button beside Surprise Me / Update.
- 🔄 Native update flows for Windows, Android and Android TV.
- 🎬 Clickable cast and filmography navigation.
- 🍅 Rotten Tomatoes ratings through OMDb when configured.
- 🗂️ Rebuilt categories with international collections and Anime.
- 🛡️ Versioned 2.0 adblock hardening with learned-host quarantine.
- 🚪 Exit confirmation for playback and the app to prevent accidental exits.

---

## Every fix and improvement since 1.9

1. **Windows updater rebuilt** — checks GitHub on launch and manually, shows version/changelog, supports Update / Cancel / Skip, download progress, verification and relaunch.
2. **Android / Android TV updater added** — checks the GitHub release, downloads the matching APK and hands it to the Android installer with TV/mobile-friendly controls.
3. **Windows Settings reorganized** into General, Home, Appearance, Experience, Playback & Downloads, Player and About while preserving existing settings handlers.
4. **Android / Android TV Settings cleanup** brought the same grouping and readability improvements to the mobile/TV builds.
5. **Clean UI rebuilt around a YouTube-TV-style navigation model** with a full sidebar that collapses to a compact icon rail when browsing content.
6. **Modern UI rebuilt around a Google-TV-style presentation** with balanced header/navigation, cinematic discovery and portrait movie cards.
7. **Flix UI added** as a fourth cinematic layout with its own isolated layout rules so it does not leak styling into the other interfaces.
8. **Native / Original UI preserved** for users who prefer the original ZeroPlay layout.
9. **Fresh-install defaults corrected:** Windows → Clean UI, Android phone/tablet → Modern UI, Android TV → Native / Original UI. Existing saved choices remain untouched.
10. **Modern Movies & Shows shelves made more compact** so more content fits naturally without oversized cards.
11. **Portrait vs. landscape card behavior corrected** across content sections.
12. **Carousel timing standardized to 15 seconds** with directional transitions that respect the UI Animations setting.
13. **17 exact themes finalized:** Zero Dark, Zero Light, Ocean, Orchid, Sunset, Midnight Blue, Ember Glow, Forest Moss, Rose Noir, Amethyst, Cyber Mint, Cobalt Sky, Golden Hour, Coral Night, Aurora, Slate Ice and Mocha.
14. **Theme-aware ZeroPlay branding added** so `Zero` remains the primary word while `Play` follows the active accent color.
15. **Clickable cast added on Windows** using the exact TMDB person ID rather than name guessing.
16. **Clickable cast / filmography added on Android** using TMDB combined credits.
17. **Filmography pages corrected** to use combined movie + TV credits and the selected person’s exact TMDB identity.
18. **Categories redesigned** with clearer artwork, alphabetical browsing, international/language collections and Anime using the same visual system as the other categories.
19. **Surprise Me Again scoped correctly** so the control appears only on a title that was actually opened through Surprise Me.
20. **Rotten Tomatoes ratings added** through OMDb when `OMDB_API_KEY` is configured.
21. **Android TV Settings focus visibility fixed** so dropdowns and selectable settings show a clear highlight.
22. **Android TV Home navigation restored** to normal Android focus dispatch after custom key interception caused focus regressions.
23. **Android TV player mode made Settings-only** — Mouse / D-pad selection is no longer accidentally changed by a playback key.
24. **Android TV D-pad player navigation rewritten from scratch.** The previous collection of iframe guesses, wake interceptors and competing handlers was removed in favor of one TV input controller.
25. **D-pad focus highlight cleaned up** with a slimmer teal focus treatment that also works with open Shadow DOM controls.
26. **D-pad left/right navigation no longer intentionally maps to provider seek actions** while navigating the control surface.
27. **D-pad hidden-control wake handling rebuilt** so the first remote input is reserved for restoring provider controls before normal navigation continues.
28. **Android TV Mouse mode kept independent** from the D-pad controller; the smooth virtual pointer remains the Mouse-mode input path.
29. **Mouse-mode Back sequence fixed:** an open settings/quality/subtitle function closes first; visible player controls hide next; only the following Back exits playback.
30. **Player Back behavior is no longer allowed to dump the user out of playback just because an embedded provider is slow to answer.**
31. **Playback exit confirmation added** so leaving a movie/episode requires an explicit `Yes, exit` choice; `No` returns to playback.
32. **App exit confirmation added** to reduce accidental exits from the main application.
33. **Live TV reliability improved** with safer retry/error handling on Windows and Android.
34. **Cignal and Converge controls separated** so each provider can be enabled independently; Windows defaults both off while keeping other Live TV channels available.
35. **Android TV icon centering corrected** across focusable navigation surfaces.
36. **Windows Flix top-right controls corrected** and kept isolated from the other layouts.
37. **Windows Offline Player rebuilt around local/native playback** with local SRT/VTT/ASS/SSA parsing, playback controls, Fit / Fill, speed and fullscreen support.
38. **Windows Offline Player compositor handling improved** with the Direct Composition video-overlay workaround retained for files that previously hid controls behind the video surface.
39. **Manual Offline Player show/hide control added** as a fallback after automatic hide proved unreliable across Windows media/compositor combinations.
40. **Windows app fullscreen button added** beside Surprise Me / Update. It enters true app fullscreen, removes the normal Windows chrome and hides the visual scrollbar while preserving scrolling.
41. **Live PPV / Live TV / Live Sports player behavior retained** while the movie/offline-player work was isolated from those stacks.
42. **Adblock ruleset versioned** as `2.0-known-good-2026-10-08` so the known-good baseline is identifiable and reversible.
43. **Confirmed-host quarantine added:** a host positively identified by the QR scanner is blocked exactly for the rest of the current session.
44. **Temporary learned ad-host list added:** confirmed hosts are remembered for seven days rather than becoming permanent rules forever.
45. **Explicit provider/CDN allowlist added** so VidStuck, VidSrc.sh and common player/video CDN hosts cannot be accidentally caught by future ad rules.
46. **Local adblock debug log added** with the ruleset version, blocked host and reason, making playback regressions easier to diagnose without sending browsing data anywhere.
47. **Safer cosmetic ad cleanup added:** the app first removes an exact confirmed-host ad frame/container; the broader legacy QR cleanup is used only as a confirmed-QR fallback.
48. **Popunder/new-window hardening retained and reinforced** through denied popup windows, denied unsupported top-level redirects and allowlist-aware network rules.
49. **Windows adblock now mirrors the learned-host model** with an expiring local learned-host file and rolling local debug log.
50. **QR confirmation never opens the QR destination and never interacts with CAPTCHA/verification controls.**
51. **Release/test coverage expanded** for the rewritten TV controller, Shadow DOM focus, staged Back behavior, adblock allowlist, ruleset version and exact-host quarantine.
52. **Windows portable packaging remains installer-free** and keeps all normal browsing/playback in one application window.

---

## Adblock 2.0

The adblock upgrade deliberately favors **confirmed evidence over aggressive guessing**.

- Static ad-network rules remain deliberately small.
- A QR destination must be positively decoded before its exact host is learned.
- Learned hosts expire after seven days.
- The current-process quarantine blocks the exact confirmed host immediately.
- Player/provider/CDN allowlists take priority over blocking rules.
- Block decisions are logged locally with the ruleset version and reason.
- New-window/popunder attempts remain denied inside app playback.
- CAPTCHA / Cloudflare / verification controls are not clicked, solved or removed by ZeroPlay.

The stable 2.0 restore point is preserved on:

`backup/v2.0-stable-2026-10-08`

---

## Known issues / workarounds

### Windows Offline Player controls

On some Windows systems/video files, the Offline Player’s control chrome can still become unreliable after using the manual eye control. In the affected state the eye control itself or subtitle overlay may also disappear.

**Workaround:** from the completed download, choose **Open in external player** and play the file with your preferred local player. The downloaded media file itself is unaffected.

### Microsoft Defender SmartScreen

If the Windows build is not signed with a trusted Authenticode certificate, Windows may show an **Unrecognized app / Windows protected your PC** warning. The release workflow still runs the packaged Windows files through Microsoft Defender before publishing. SmartScreen reputation requires trusted code signing and reputation over time.

### Third-party embedded players

VidStuck / VidSrc.sh can change their player UI or advertising behavior independently of ZeroPlay. A provider update can temporarily affect control discovery, resume events, subtitle behavior or ad filtering until ZeroPlay adapts.

### QR overlays

2.0 is substantially stricter about confirmed QR-ad hosts, but if a provider changes its creative before the filter recognizes it, close the overlay with its **X** or wait for it to expire. ZeroPlay does not bypass verification/CAPTCHA challenges.

---

## Downloads

Release assets:

- `ZeroPlay-2.0-Android.apk`
- `ZeroPlay-2.0-Android-TV.apk`
- `ZeroPlay-2.0-Windows-x64.zip`
- `SHA256SUMS.txt`

Android production APKs continue using the existing ZeroPlay signing identity so production installations can update in place.

---

Thanks to everyone who kept testing the awkward stuff: TV focus, Back sequencing, provider menus, local playback, live channels and the ads that only show up when you think you are finally done. 2.0 exists because those edge cases got tested instead of hand-waved away.

</details>

<details>
<summary><strong>ZeroPlay 1.9</strong></summary>

# ZeroPlay v1.9 ✨

ZeroPlay 1.9 is the final polish-and-stability update before the planned 2.0 redesign. It keeps the working 1.8.2 playback stack, fixes Windows torrent downloading, upgrades downloaded-movie playback, improves Clean and Modern UI consistency, refreshes Downloads, expands color customization, and adds a new Golden ZeroPlay easter egg.

## 🖥️ Windows

- **Torrent downloads fixed:** Windows now uses **WebTorrent 3.0.21** with DHT, trackers, peer exchange, local peer discovery, uTP, NAT traversal, web seeds, fallback trackers, and a metadata timeout instead of leaving dead jobs stuck forever at `metadata · 0 peers`.
- **Clean UI carousel enlarged:** the featured carousel is taller and more cinematic.
- **Cleaner branding:** the ZeroPlay logo is larger and more uniform in Clean and Modern layouts.
- **Search bar normalized:** Clean UI uses a consistent rounded search pill with balanced height and spacing.
- **Dedicated offline player:** downloaded movies now use a separate **Video.js 8.24.1** offline player with a modern seek bar, playback speed, fullscreen, Picture-in-Picture where supported, Fit / Fill, and keyboard seeking.
- **Offline subtitle integration:** matching local **SRT, VTT, ASS and SSA** files are detected automatically. A new **Load subtitles** action lets you pick a sidecar subtitle manually. SRT/ASS/SSA are converted locally to WebVTT for playback.
- **Live playback intentionally unchanged:** Live TV, Live PPV, Live Sports, RawCast and regular embedded movie/series streaming players were not modified by the offline-player work.
- The official Windows portable ZIP still bundles the release TMDB key and requires no installer.

## 📥 Better Downloads

- Active downloads now use polished media cards similar to the Find Downloads results.
- New queue entries carry the **movie poster, synopsis, quality, codec, health, seeders, size, speed, peers, ETA and progress** into the Downloads tab.
- Pause, cancel, retry, offline playback, external-player and delete actions are grouped more cleanly.
- Older saved download entries continue to render even if they do not contain all of the newer metadata.
- Healthy TSP search results remain capped at **20** without weakening the configured health/seeder filters.

## 📺 Android TV / 📱 Android

- **Clean UI sidebar fixed:** the collapsed icon rail is narrower and centered, removing the empty strip beside the icons.
- **Modern UI logo improved:** the ZeroPlay wordmark is larger and more proportional.
- Downloads now show poster/synopsis-rich transfer cards with quality, health and progress information.
- Existing movie playback, Android TV controls, Live TV, PPV and Live Sports players remain unchanged.

## 🎨 UI polish across platforms

- Movie/series artwork now carries the **title directly on the thumbnail**, closer to the Native / Original UI presentation.
- Cards include year/type information and warm gold rating accents when ratings are available.
- Focus/hover previews gain a subtle color flare and clearer gold star ratings.
- Clean UI, Modern UI and Native / Original UI remain independently selectable from the color theme.
- Platform defaults remain:
  - **Android TV → Native / Original UI**
  - **Android phone/tablet → Modern UI**
  - **Windows → Clean UI**
- Existing saved UI choices still take precedence.

## 🌈 17 color themes

The five existing theme IDs are preserved so saved preferences continue to work. 1.9 adds **12 new palettes**, bringing the selectable total to 17:

- Midnight Blue
- Ember Glow
- Forest Moss
- Rose Noir
- Amethyst
- Cyber Mint
- Cobalt Sky
- Golden Hour
- Coral Night
- Aurora
- Slate Ice
- Mocha

The new palettes are validated against ZeroPlay's existing readability tests, including 4.5:1 text contrast across primary surfaces.

## ✨ Golden ZeroPlay easter egg

The old colorful easter egg has been replaced with a premium **Golden Mode** on Windows, Android and Android TV:

- gold/champagne accent palette
- animated gold logo shimmer
- warm gold focus and selected states
- subtle sparkle particles across the interface
- golden sidebar glow and buttons
- dedicated **Exit Golden Mode** action

It remains cosmetic only and does not modify playback, downloads, API settings or library data.

## 🛡️ Stability / security

- Windows package continues through the production unit/UI/player tests, Electron smoke test, credential audit and **Microsoft Defender scan** before publishing.
- Android production builds remain signed with the existing release key and pass mobile/TV unit, lint and emulator/device gates.
- Public artifacts contain no personal TSP key.
- TSP and user-entered provider credentials remain outside public source/release assets.

## 📦 Downloads

- `ZeroPlay-1.9-Android.apk`
- `ZeroPlay-1.9-Android-TV.apk`
- `ZeroPlay-1.9-Windows-x64.zip`
- `SHA256SUMS.txt`

Use downloads only for public-domain, Creative Commons, user-owned, or otherwise authorized content. Torrent health and peer counts are estimates and do not guarantee availability or speed.

</details>

<details>
<summary><strong>ZeroPlay 1.8.2</strong></summary>

# ZeroPlay 1.8.2

A UI and downloads polish release focused on better platform defaults and a cleaner torrent picker.

## ✨ What’s new

- **Platform-specific UI defaults** — Android TV now defaults to **Native / Original UI**, Android phone/tablet defaults to **Modern UI**, and Windows defaults to **Clean UI**. Existing saved layout choices are preserved.
- **Clean UI refresh** — the Clean layout now uses a darker YouTube-inspired presentation with compact navigation, rounded search, clearer focus states, cleaner cards, and restrained branding.
- **Up to 20 healthy torrent results** — TSP Search can now return up to 20 ranked matching results on Android and Windows while preserving the existing health, seeder, title/year, episode, and suspect-result filtering.
- **Better torrent result cards** — resolution, codec, size, seeders, leechers, health score, health bar, and a Recommended result are easier to scan.
- **Themed download confirmation** — torrent download confirmation now follows the active ZeroPlay UI instead of using a generic popup.
- **Android TV focus polish** — layout selection and torrent controls retain remote-friendly focus behavior.

## 📥 Downloads

- TSP Search remains the torrent-search provider.
- Existing v1.8 torrent download behavior is preserved.
- Confirmation remains required before a selected torrent is queued.
- Seeder counts and health scores help rank results but do not guarantee download speed.
- Public Android APKs do not contain the private TSP API key.

## 🔐 Private Android TV build

A separate private Android TV APK can be built with the repository `TSP_API_KEY` secret embedded at build time. This private APK is not attached to the public GitHub release and should not be redistributed because embedded API keys can be extracted from APK files.

## Platforms

- Android Mobile / Tablet
- Android TV
- Windows portable ZIP

Windows remains portable-only; no installer is included.

</details>

<details>
<summary><strong>ZeroPlay 1.8.1</strong></summary>

# ZeroPlay 1.8.1

A focused playback and Android UI update built on the 1.8.0 interface release.

## ✨ What’s new

- **Automatic offline subtitles** — ZeroPlay now checks downloaded torrent folders for local `.srt`, `.vtt`, `.ass`, and `.ssa` subtitles and loads matching files automatically.
- **Optional SubDL fallback** — add your own free SubDL API key in Settings and ZeroPlay can automatically look up subtitles by TMDB title, season, and episode when no local subtitle is available.
- **External video players** — completed downloads keep ZeroPlay’s built-in offline player as the default, with a new **Open in external player** option on Android and Windows.
- **Better Android phone/tablet layout** — movie actions no longer get squeezed beside the poster on smaller screens; phones use a clean stacked action area while wider tablets keep the TV-style side actions.
- **Private Android TV TSP build support** — a separate private-TV build can receive a TSP Search key at build time. The normal public Android and Android TV APKs do not contain that key.

## 🔐 Subtitle & API-key handling

- SubDL is optional. Local downloaded subtitles work without an API key.
- SubDL keys entered in Android are encrypted with Android Keystore.
- The public release does **not** ship a shared SubDL key.
- The private Android TV APK is intentionally kept separate from public release assets because an API key embedded in an APK can be extracted by anyone who receives that APK.

## 📥 Downloads

- TSP Search remains the torrent search provider.
- Existing health/seeder filtering and download controls are unchanged.
- Downloaded sidecar subtitle files are preferred before any online subtitle lookup.
- Delete Video still removes the local downloaded video/torrent data after confirmation.

## Platforms

- Android Mobile / Tablet
- Android TV
- Windows portable ZIP

No installer is added for Windows.

</details>

<details>
<summary><strong>ZeroPlay 1.8.0</strong></summary>

# ZeroPlay v1.8.0

- Added **Settings → Appearance → UI layout** on Android, Android TV, Windows and the web UI: **YouTube TV**, **Google TV**, and **Classic**. YouTube TV is the default when no layout has been selected; switching saves your choice.
- **YouTube TV:** wide 16:9 artwork cards, a compact icon navigation rail, and a cleaner featured carousel. Moving focus from navigation to a movie collapses the rail to icons; returning expands its labels. Mouse hover and a navigation menu button provide the same access on desktops and touch devices.
- **Google TV:** top navigation, a cinematic featured area, wide shelves and generous spacing, adapted for phone screens and TV remotes.
- **Classic:** preserves ZeroPlay’s original sidebar and portrait-poster design.
- Color themes, animations, focus/hover information and trailer previews, two-second trailer delay, homepage panels and proportional trailer cropping carry across layouts. Layout changes keep your library, history, collections, downloads and playback settings.
- Search, Live TV/PPV/Sports, TSP downloads and optional RawCast playback remain accessible. RawCast stays off by default and hidden while disabled; VidStuck remains the default playback source.
- Added navigation/focus regression checks and device captures for all three designs. Updated the main page and download instructions.

YouTube can still display its own branding or overlays. Download availability and speed depend on the reported swarm; offline codecs depend on the platform player. Public builds contain no personal API keys.

TSP key setup: open [tspsearch.dev](https://tspsearch.dev/), expand **Advanced: copy and paste it yourself**, and use **Copy URL** and **Copy key**. Paste the full values in ZeroPlay’s Downloads Settings, save, then test the connection. The Downloads tab includes this guide; Android TV also offers a QR code for opening the site on your phone.

</details>

<details>
<summary><strong>ZeroPlay 1.7.5</strong></summary>

# ZeroPlay v1.7.5

- Replaced RawCast downloads with hosted **TSP Search** and integrated torrent downloads on Windows, Android and Android TV. Configure your TSP URL and personal key in **Settings → Downloads → Torrent Search**; no local search server or external torrent client is required.
- Download opens a picker with up to ten matching results, reported seeds/leechers, size, quality, codec and health score. Wrong years/episodes, suspect results, invalid magnets and weak swarms are filtered. Review and confirm a result before starting.
- Added a persistent download queue with pause, cancel, resume, progress, speed and peer counts. Up to two transfers run at once. Multiple substantial video files require a file selection; samples and executable files are excluded. Android provides a foreground notification and defaults to Wi-Fi/Ethernet only.
- Added Android storage selection for app-scoped internal and available external/USB locations. Completed files use the existing native offline player. No download conversion/preparation stage or playback during torrent transfer is used. Completed legacy downloaded files remain available where their original files still exist.
- **RawCast is optional playback only, off by default.** Its source, API key controls and usage panel stay hidden while off. Disabling a selected RawCast source returns playback to VidStuck. Enable it explicitly to use your own key and limited provider quota.
- Windows homepage carousel trailers now cover the full frame using a centered proportional crop, without stretching. Preview containers resize with the window.
- Muted trailer previews on all platforms default to a **two-second focus delay**. YouTube controls and annotations are disabled and previews are cropped to reduce title overlays. YouTube can still display its own branding or overlays; complete removal is not guaranteed.
- Updated the main page, settings and download instructions for this release.

TSP reports swarm availability; these reports do not guarantee transfer speed or an available download for every title. Only download public-domain, Creative Commons, user-owned or otherwise authorized content. Codec support depends on the platform's native player. Public release artifacts contain no personal API keys.

</details>

<details>
<summary><strong>ZeroPlay 1.7.3</strong></summary>

# ZeroPlay v1.7.3

- Restored the 1.7.1 application baseline and download implementation after download problems with subsequent patches. This includes the original Windows MP4/MKV output choices and preparation behavior; the 1.7.1.1/1.7.2 playback and download changes are rolled back.
- RawCast playback is now disabled and hidden by default on Android, Android TV and Windows. Enable it with the RawCast playback toggle in Settings. Disabling it returns an existing RawCast selection to VidStuck. RawCast API key input, downloads and quota usage remain available independently.
- Windows homepage trailer videos fill the carousel using a responsive centered 16:9 cover crop, preserving proportions without stretching. Edges may be cropped; black bars embedded in the video may remain. Android carousel sizing is unchanged from 1.7.1.
- Updated the main page and download instructions for 1.7.3.

RawCast streaming and downloads share the account quota. Availability and upstream video content depend on the provider; this rollback does not guarantee a download for every title.

Includes signed Android and Android TV APKs, Windows portable ZIP and SHA-256 checksums. Personal API keys and private APKs are excluded from public assets.

</details>

<details>
<summary><strong>ZeroPlay 1.7.2</strong></summary>

# ZeroPlay v1.7.2

- Restored original-format downloads: accept MP4, MKV and other supported direct video containers returned by RawCast, as in 1.7.1. Removed the MP4-only restriction introduced in 1.7.1.1.
- Downloads preserve the original file and its correct extension. No format selection, preparation, conversion, or full-file audio processing after downloading.
- Restored the JSON download response request (`redirect=false`) used in 1.7.1, while retaining safe handling of attachment redirects.
- Windows retains on-demand AAC audio decoding for supported AC-3/E-AC-3/DTS audio during playback; the original downloaded file is unchanged.
- Android offline files explicitly use Media3/ExoPlayer with a local FileDataSource, saved playback position and native controls; no HTTP source or online subtitles are requested for downloaded files. Codec support on Android depends on the device.
- Android downloads also finalize without the post-download player preparation check.

Availability remains dependent on RawCast; this patch does not guarantee a source for every title or verify the identity of upstream video content.

Includes signed Android / Android TV APKs and the portable Windows ZIP. Personal API keys and private APKs are excluded from the public release.

</details>

<details>
<summary><strong>ZeroPlay 1.7.1.1</strong></summary>

# ZeroPlay v1.7.1.1 🎬

Windows offline playback hotfix:

- Removed the lengthy preparation step after downloads and when opening older downloads. MP4 and MKV files remain unchanged; no second movie file, full-video conversion, or extra disk space is needed.
- Added on-demand offline audio decoding for AC-3, E-AC-3 and DTS to AAC inside the existing player. Audio is decoded only during playback; the original video track is copied into a temporary in-memory playback stream.
- Seeking restarts playback at the selected position. Pause, volume and fullscreen remain available.
- Removed the MKV download option. New downloads use RawCast’s documented Direct MP4 endpoint with selectable quality on Windows. Non-MP4 responses are rejected without conversion. Existing MKV downloads can still be played. File size depends on the source supplied by RawCast.

Includes signed Android and Android TV APKs plus the portable Windows ZIP. RawCast fixes apply to all platforms: resolve ranked DASH/HLS URLs and skip broken or non-manifest responses, preserve required stream headers and subtitles, request clean retail releases, reject mismatched title IDs and known Rickroll URLs. Windows additionally receives the offline playback hotfix. Personal builds and API keys are excluded from this public release.

</details>

<details>
<summary><strong>ZeroPlay 1.7.1</strong></summary>

# ZeroPlay v1.7.1 🎬

## 🐛 Fixes across Android Mobile, Android TV and Windows

- Moved Downloads into Your Space. On mobile, open Your Space from the library button.
- Added masked RawCast API key entry, Save Key, Remove Key and Test API directly in Downloads alongside the usage panel.
- Added RawCast as an optional streaming source with a clear limited API quota warning. Streaming uses the securely stored personal key and shares usage reporting with downloads. Only explicit RawCast playback resolves a stream; catalog browsing and trailers consume no RawCast quota.
- Kept VidStuck as the default and recommended playback source, while preserving an explicitly selected alternate source.
- Positioned delayed movie descriptions beside the selected poster and title, with placement adjusted to fit the screen.

## 🪟 Windows fixes

- Fixed the homepage and hover YouTube trailer embed origin by serving the local UI from a matching loopback HTTP origin. Previews remain muted and fall back to artwork when YouTube blocks a trailer.
- Added local AAC stereo audio preparation for downloaded videos, covering MKV files with audio codecs unsupported by Chromium.
- Added MP4 and MKV output choices plus 1080p, 720p, 480p and 360p quality selection before downloading.
- Converts the provider file into the selected container locally; this does not claim a provider-side format option. Lower quality can reduce download size; changing the container alone does not guarantee a smaller file.
- Copies video without re-encoding where supported, with H.264 conversion when required by the built-in player.
- Prepares legacy downloads for compatible playback when opened. Preparation can take time and requires additional disk space. Successful legacy preparation replaces the old file with a compatible MP4.
- Validates video playback and audio decoding before finalizing newly downloaded videos.

Includes signed Android Mobile and Android TV APKs and a Windows x64 portable ZIP. RawCast keys are stored securely and are never bundled in releases. Usage displays authoritative provider quota information when available.

</details>

<details>
<summary><strong>ZeroPlay 1.7</strong></summary>

# ZeroPlay v1.7

## 🎨 New UI & Themes

- Added Default, Light and three selectable color palettes inspired by Digital Synopsis's numbered collection.
- Themes switch immediately and remain saved across restarts.
- Added configurable UI animations and delayed focus/hover information previews.
- Improved sidebar typography, focus states and appearance controls.

## 🎬 Trailer Experience

- Added default-on muted trailer playback in the homepage carousel.
- Added delayed, muted focus/hover trailer previews with configurable delay.
- Only one preview plays at a time; changing focus, navigating or hiding the app stops it.
- Missing, blocked or failed trailers automatically fall back to artwork.
- Separate settings control animations, information previews, focus trailers and homepage trailers.

## 📥 RawCast Downloads

- Added RawCast strictly as a download provider, separate from streaming and trailers.
- Added movie downloads and season/episode selection for series, from title details only.
- Added an internal, single-transfer download queue and a Downloads tab.
- Added progress, percentage, speed, downloaded/total size and ETA when available.
- Added pause, cancel, retry and byte-range resume where the server supports it.
- Added persisted download history, duplicate prevention and completed-file playback.
- Direct files use their actual container extension and are checked against the device's player before completion.
- Added securely stored personal API keys, masked key display, Save Key, Remove Key and Test API controls.
- Release builds require the user's own key. No developer fallback is included.
- Added authoritative request/quota information when returned by RawCast, manual usage refresh and setup instructions.
- Cached download resolution and avoided RawCast requests during ordinary browsing, previews or streaming.
- Added a configurable Windows download folder and app-specific Android Movies storage.

## 🗑️ Download Management

- Added Delete Video with title, file size and actual-file deletion confirmation.
- Added Remove from History, preserving the local video.
- Added detection for videos deleted outside ZeroPlay.
- Updated download records and the Downloads tab after deletion.

## ▶️ Player Fixes

- Back closes an active player menu or dialog and keeps playback running.
- With no player menu open, Back immediately returns to the previous page.
- Applied the behavior across Android Mobile, Android TV and Windows.

## 🌈 Easter Egg

- Press the ZeroPlay logo ten times to activate temporary colorful effects.
- Press it again or use Exit Easter Egg to restore the selected theme.
- The temporary mode does not overwrite theme preferences.

## 🧹 Cleanup

- Removed SuperEmbed and VidSrc.to, their source options and unused provider code.
- Retained VidStuck and VidSrc.sh, with safe migration of saved source selections.
- Removed unused torrent engines and dependencies.

## ⚡ Performance

- Loaded trailers only for the featured or focused title.
- Bounded preview metadata and image caches and stopped hidden previews.
- Throttled download progress updates and limited concurrent transfers to one.
- Reduced unused download dependencies and unnecessary provider requests.

## 🐛 Bug Fixes

- Fixed saved source selections pointing to removed providers.
- Fixed mislabeled direct videos being saved with an incorrect extension.
- Rejected HTML, HLS playlists and invalid files masquerading as downloaded video.
- Fixed resume handling when servers ignore byte ranges or return invalid ranges.
- Added interrupted-transfer retries, stalled-transfer timeouts and clear storage errors.
- Prevented stale API-key requests from restoring cached results after a key change.
- Fixed missing downloaded videos remaining marked playable.
- Fixed quick theme switching requiring an Android activity restart.
- Prevented an unfinished episode picker from falling back to episode 1.
- Paused downloads safely when history storage is full or unwritable.
- Fixed Cancel focus in download deletion dialogs for touch-mode and TV remote input.
- Kept dialog titles, switches and temporary colorful mode readable during theme changes.

RawCast offers a free API tier at release time; your account determines the actual limits.

Provider availability, playable codecs and resume support depend on the returned file and device. RawCast currently exposes quota headers on relevant responses; account identity fields and a separate quota endpoint are omitted when unavailable.

</details>

<details>
<summary><strong>ZeroPlay 1.6.1</strong></summary>

Bug fixes

</details>

<details>
<summary><strong>ZeroPlay 1.6.0</strong></summary>

# ZeroPlay v1.6.0 🎬

Android, Android TV, and Windows receive the same browsing and playback improvements.

- 🎮 Live Sports uses compact controls over the bottom of the video, styled like PPV/Sports. Controls hide during playback; touch/mouse activity or the TV Menu key brings them back. Retry, fullscreen, Back and clearly labeled alternate sources remain available.
- 🛡️ Windows Live Sports now uses a memory-only browser session with disk caching disabled. Startup removes the old sports browser Cache, Code Cache, GPUCache and Service Worker cache only. Watchlists, settings, histories and the sports catalogue are preserved. Android sports playback bypasses and clears WebView cache.
- 🔤 Categories are alphabetical, with Anime in the ordinary category grid plus Japanese, Korean, Filipino, French, Spanish and Hindi collections.
- ↕️ More sorts: featured, popularity, rating, newest, oldest and title A–Z/Z–A for loaded titles; playlist/name/group channel sorting; schedule/name sports sorting.
- 🏠 Fifteen more optional genre panels, readable panel buttons and checkboxes in light/dark themes. Current homepage defaults are preserved.
- 🖼️ Stable carousel height and text areas, consistent portrait movie cards, and uniform monochrome Windows navigation icons. Removed the home tagline.

## Security note
The reported `Trojan:Win32/Suschil!rfn` alert identified a file in the legacy Windows Live Sports browser cache. This release stops retaining that player's browser cache on disk and removes the old cache. A cache path alone does not identify the supplying request or prove a false positive. Keep Microsoft Defender enabled and remove/quarantine any detected item; do not restore it or add an exclusion. These changes and the release scan do not certify third-party streams or clean other files on your computer.

## Temporarily disabled
Movie downloads/preloading and torrent downloads remain disabled because of unfixable bugs in the previous implementation. They will be reimplemented in a future release once a working fix is found. There are no movie download or save-video buttons in playback.

## Known player issue
If a QR ad shows up, press its **X** button or wait for it to close itself. It is a known bug; embedded player behavior varies by provider.

## Downloads
Signed Android mobile and Android TV APKs, the Windows x64 portable ZIP, and SHA256SUMS.txt are attached. Android APKs use the existing permanent signing key.

</details>

<details>
<summary><strong>ZeroPlay 1.5.1</strong></summary>

# ZeroPlay v1.5.1 🎬🏟️

A focused update for **Android, Android TV / Google TV, and Windows**.

## 🏟️ Live Sports first

- **Live Sports now sits in Discover**, alongside Movies, Series, PPV/Sports, and LIVE TV. Android mobile keeps it in its browsing tabs; Android TV and Windows place it in their Discover navigation.
- Android TV Live Sports uses compact four-column cards and a category filter, matching the PPV/Sports layout.
- Live Sports now uses ZeroPlay’s advertisement filtering: known ad domains, banners, popups, redirects, and recognized timed QR overlays are filtered. Player-triggered file downloads and popup windows are blocked.
- URL and HTML iframe sources, fullscreen, Back, TV remote controls, loading/error states, Retry, and alternate sources remain supported.
- The catalogue refreshes approximately every minute while open. **↻ Refresh sports** requests fresh API data on every press.
- This remains a separate embedded API player, alongside the existing native M3U players.

## 🐛 Downloads temporarily disabled

**Movie downloads and torrent downloads are disabled because of bugs we have not been able to fix in the current implementation.** The Downloads tab, Download / Download as torrent buttons, and the Save movie button below playback have been removed for now.

We plan to reimplement these features in a future version once a reliable fix is found. Existing downloaded files are not deleted by this update.

## ✨ Still included

Anime appears as an artwork card in both movie and series category grids. Also included: homepage panel settings, LIVE TV favorites, explicit Search, automatic loading as you scroll, watchlists, collections, and light/dark themes.

## 🛡️ Playback notes

If a QR ad appears, press its **X** button or wait for it to close automatically. This is a known bug. Advertisement filtering cannot guarantee removal of every provider ad.

A Windows Defender detection was reported for v1.5; its affected file and cause have not been confirmed. This update does not establish that alert was caused by sports ads or that it was a false positive. Do not restore quarantined files or disable antivirus protection.

## ⬇️ Downloads

- `ZeroPlay-1.5.1-Android.apk` — signed Android mobile build.
- `ZeroPlay-1.5.1-Android-TV.apk` — signed Android TV build, with mouse mode enabled by default.
- `ZeroPlay-1.5.1-Windows-x64.zip` — Windows portable build; extract and launch `ZeroPlay.exe`.
- `SHA256SUMS.txt` — checksums for all three files.

Android updates use the same permanent signing key as earlier production versions. Functional validation covers mobile/TV emulators and Windows; it is separate from malware analysis.

</details>

<details>
<summary><strong>ZeroPlay 1.5</strong></summary>

# ZeroPlay v1.5 🎬 📺 🏟️

Android, Android TV, and Windows:

- 🏟️ **Live Sports**: separate PPV API catalogue with categories, posters, local schedules, and labeled alternate sources. Cached catalogue refreshes every minute while open; **Refresh sports** requests the API on every press.
- ▶️ API iframe URLs and iframe HTML play with provider ads and integrations preserved. Sports playback is separate from PPV/Sports and LIVE TV M3U playback.
- ↓ **Downloads**: Download and Download as torrent buttons, pause/resume/remove, and offline playback of completed movies/episodes. Start playback, then select a detected supported media source for direct downloads.
- 🧲 Built-in torrent engine with EXT search and browser/paste-magnet fallback. Selects the largest supported movie file. Torrents share pieces while downloading; completed downloads stop seeding. Android torrents require Android 7+. Keep ZeroPlay open for Windows downloads.
- 🌸 **Anime** movies and series in Categories.
- ⚙️ **Homepage panels**: current panels enabled by default; optional Action, Comedy, Horror, Animation, and Anime rows, plus Restore defaults.
- ⭐ **Live TV favorites** with a Favorites group.

Download availability depends on the source. Protected sources and ongoing live streams cannot be saved as offline movies. Torrent playback depends on file codecs and device support.

**Known bug:** If a QR ad appears, press the **X** button or wait for it to close automatically. This is a known bug. Live Sports intentionally preserves its provider's ads.

Signed Android mobile and Android TV APKs, Windows x64 portable ZIP, and SHA256SUMS.txt are included after validation.

</details>

<details>
<summary><strong>ZeroPlay 1.0.1</strong></summary>

# 🎬 ZeroPlay v1.0.1 — New name, better playback

**ZeroMovies is now ZeroPlay — Movies. Live TV. One place.** The new name appears in Android, Android TV, Windows, and the portable executable. Existing app IDs and saved data remain compatible.

## 📺 Windows LIVE TV

- Corrects invalid audio-channel counts in ZTE/Converge DASH manifests. Valid multichannel layouts and other channel-description schemes remain preserved.
- Updates audio-track controls to the bundled Shaka player's current APIs, so working playback is not reported as unavailable.
- Native Windows checks now decode real DASH, HLS, and ClearKey test media and require playback time to advance. The DASH fixture includes the malformed audio metadata seen in Converge's playlist.

## 🛡️ Broader advertisement blocking

- Removes explicit banner/ad slots and ad-labelled popups; blocks known advertising requests, redirects, and new windows.
- Handles dark or smaller timed “Confirm you're not a robot” QR advertisements with a close button, nested headings, and open shadow roots.
- Continues checking for ads inserted after playback starts. Genuine CAPTCHA widgets, checkbox challenges, and movie controls remain preserved.

## 🖱️ Android TV

Mouse mode stays enabled by default for movie playback. Arrows move the cursor; OK clicks; Menu switches to focus navigation and remembers your choice.

## ⬇️ Downloads

- 📱 `ZeroPlay-1.0.1-Android.apk`
- 📺 `ZeroPlay-1.0.1-Android-TV.apk`
- 🖥️ `ZeroPlay-1.0.1-Windows-x64.zip` — extract and launch `ZeroPlay.exe`.
- ✅ `SHA256SUMS.txt`

Signed Android APKs update earlier production builds while preserving local data. Windows library data is retained. PPV/Sports, LIVE TV, automatic catalog loading, submitted search, and category artwork remain included.

Stream availability still depends on the provider and device codecs. Automated checks do not guarantee every third-party stream or advertisement behaves identically on every device.

</details>

<details>
<summary><strong>ZeroPlay 1.0</strong></summary>

# 🎬 ZeroMovies v1.0 — More to watch, less to click

A unified release for **Android phones/tablets, Android TV / Google TV, and Windows**.

## 📡 PPV/Sports & 📺 LIVE TV

- **PPV/Sports** brings the ZeroStreams live-event playlist into its own tab. It checks for updated channels every 30 minutes while the tab is open.
- **LIVE TV** brings the separate IPTV channel playlist into a dedicated tab, cached until you refresh it.
- Colored **Refresh sports** and **Refresh TV** buttons update either list immediately. Failed refreshes keep the last good channels.
- Channel groups, channel logos, and submitted channel search make finding a stream easier.

## ▶️ Our own live player

Watch directly in ZeroMovies with custom controls: Play/Pause, return to the live edge, Retry, channel switching, audio, subtitles, and Fit/Fill. Android TV supports D-pad and media controls. Windows keeps playback in the same window with fullscreen and Back controls, plus volume adjustment.

HLS/DASH playback supports playlist-provided request headers and ClearKey configurations. Playback still depends on the stream being available and on device codec support.

## ♾️ Browse without page buttons

Movie, series, genre, provider, and search results automatically load more near the bottom. Earlier titles remain in place, repeated results are removed, and failed page requests can be retried.

## 🔎 Search when you're ready

Typing no longer launches a search with every letter. Press **Search** or the keyboard Search/Enter action to submit. Channel searches follow the same rule.

## 🖼️ Categories with artwork

Movie and TV genre tiles now use relevant TMDB artwork with readable captions.

## 🛡️ QR advertisement filtering improvements

Android's QR scanner no longer requires a mostly white screen, captures more detail, and checks multiple QR codes. Native-confirmed dark overlays and smaller QR creatives are handled by the guard. Windows receives the matching overlay rules and improved capture detail. Recognized CAPTCHA widgets and movie playback controls remain preserved.

## ⬇️ Downloads

| Platform | File |
| --- | --- |
| 📱 Android phone / tablet | `ZeroMovies-1.0-Android.apk` |
| 📺 Android TV / Google TV | `ZeroMovies-1.0-Android-TV.apk` |
| 🖥️ Windows 10 / 11 · x64 | `ZeroMovies-1.0-Windows-x64.zip` |
| ✅ Integrity checks | `SHA256SUMS.txt` |

Android APKs use the permanent production signing key and can update signed v0.4.5/v0.4.6 installations while keeping local data. Windows remains portable: extract the ZIP and launch `ZeroMovies.exe`. Existing library storage is retained. No installer is required.

Automated checks cover Android release unit tests/lint/signatures and Windows core/UI/QR regressions, live-player controls, native fullscreen, Back behavior, and portable packaging. Stream availability and codec compatibility still need checking on your own device.


🖱️ Android TV movie players start with mouse mode enabled, including the first launch after this update. Arrows move the cursor and OK clicks; Menu switches to D-pad focus and remembers your choice.

</details>

<details>
<summary><strong>ZeroPlay 0.4.5</strong></summary>

# 🎬 ZeroMovies v0.4.5

A cleaner movie and TV experience for Android, Android TV, and Windows.

## ✨ What's new

- **🎲 Surprise Me:** a red dice button beside the compact theme toggle. Discover released TMDB movies beyond the homepage recommendations.
- **Categories:** browse movie and TV genres from the side navigation, with paginated results.
- **Watch Now where you need it:** beside the movie poster and title, above the synopsis and cast.
- **Choose your source:** a separate source picker beside Watch Now. **VidStuck is Recommended**, with VidSrc.sh also available.
- **Polished artwork:** subtle blurred backgrounds and saved light/night mode.
- **Your library:** Home watchlist, Continue Watching, search and watch history, collections, and Plan to Watch.

## 📺 Playback and navigation

- Android TV supports D-pad navigation and optional mouse mode during playback.
- Player controls hide while idle and wake on remote input. Back hides visible controls first; another Back returns to browsing.
- Windows keeps browsing and playback in one window, supports native fullscreen, and restores browsing with the player Back button.
- Existing popup, redirect, and recognized QR advertisement filtering is retained.
- Optional compatible-stream audio boost: Off, 1.5×, or 2×.

## 📥 Downloads

| File | Platform |
| --- | --- |
| `ZeroMovies-0.4.5-Android.apk` | Android phone/tablet, Android 6+ |
| `ZeroMovies-0.4.5-Android-TV.apk` | Android TV / Google TV, Android 6+ |
| `ZeroMovies-0.4.5-Windows-x64.zip` | Windows 10/11, x64; portable |
| `SHA256SUMS.txt` | File integrity checksums |

**Windows:** extract the ZIP and launch `ZeroMovies.exe`. No installer.

**Android:** install the APK matching your device. This first production-signed release may require uninstalling an earlier debug build because its signing certificate differs. Uninstalling clears the device's local watchlist and history. Subsequent releases must keep the same production signing key.

## ✅ Validation

Android release variants run unit tests, player and remote-control regressions, compilation, lint, non-debug manifest checks, and APK signature verification. The reused Windows portable build passed UI regressions, live TMDB checks, and actual Electron single-window, fullscreen, and Back smoke tests.

TMDB supplies metadata and artwork; new catalog entries do not need an app rebuild. A listed title does not guarantee playback availability. Progress, subtitles, audio boost, and advertisement filtering depend on the embedded provider and device WebView. Surprise picks sample TMDB discovery pages rather than uniformly selecting every TMDB ID.

## Credits

This product uses the TMDB API but is not endorsed or certified by TMDB. Provider availability: JustWatch through TMDB. Embedded players: VidStuck and VidSrc.sh. QR decoding: ZXing. Android media playback: AndroidX Media3.

</details>

