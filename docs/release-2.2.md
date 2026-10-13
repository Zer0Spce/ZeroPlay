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
