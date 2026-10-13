# 🎬 ZeroPlay 2.2

### Movies. Series. Live TV. Live Sports. Faster discovery. Smarter TV controls.

**ZeroPlay** is a cross-platform entertainment hub for **Android, Android TV / Google TV, Windows, and Web**. Browse movies, series and anime through TMDB, keep a local library and playback history, switch playback providers, follow Live TV / PPV / Sports, use authorized offline/download features, and customize the experience around your screen.

[![ZeroPlay Windows home](docs/screenshots/windows-home.png)](docs/screenshots/windows-home.png)

**[⬇️ Download ZeroPlay 2.2](https://github.com/Zer0Spce/ZeroPlay/releases/tag/v2.2)** · **[📋 Full 2.2 release notes](docs/release-2.2.md)** · **[📺 Android TV controls](docs/android-tv-controls.md)**

---

## ⭐ ZeroPlay 2.2 highlights

### 📺 Android TV Hybrid Mode — the headline feature

ZeroPlay 2.2 introduces **Hybrid player navigation** for Android TV / Google TV.

Instead of forcing every embedded provider into one remote-control style, Hybrid Mode chooses the best interaction strategy for the player that is actually on screen:

- uses **D-pad / focus navigation** when the provider exposes reliable controls;
- falls back to ZeroPlay's **virtual mouse** when an embedded player does not expose a usable focus graph;
- wakes hidden provider controls before navigating;
- handles provider menus, settings and overlays without changing the rest of the app's remote behavior;
- keeps staged Back behavior so menus/controls close before playback exits;
- keeps **Mouse** and **D-pad** modes available for users who prefer a fixed mode.

Hybrid Mode is shared by the full **Android TV** and lightweight **Android TV Lite** builds.

### ▶️ More playback sources + safer source selection

- Added **Embedwave (BETA)** for movies and series.
- VidStuck and VidSrc.sh remain available; RawCast remains optional where configured.
- Fixed a 2.2 test-build regression where manual source choices could be silently replaced by Embedwave.
- Source priority now respects the explicit title choice, saved per-title choice, then global Settings choice.
- Source health information can assist recovery without overriding the initial manual choice.
- **Automatic Source Recovery is OFF by default** and runs only when the user enables it.
- Normal movie/series playback keeps the provider's **native/default controls** — ZeroPlay no longer draws an extra control strip over the video.

### ⚡ Performance and caching

- Local TMDB catalog caching with memory + disk caching on Windows and persistent catalog caching on Android.
- Cached content can be shown quickly while network work refreshes in the background.
- Reduced repeated tab/catalog requests and unnecessary view regeneration.
- Smarter/lazier artwork loading and lower-cost artwork choices.
- New **Performance Mode** for slower TVs/boxes.
- Background work is reduced while playback is active.

### 🧭 Discovery and personalization

2.2 adds a much richer local discovery layer:

- **Up Next** for the next episode of shows you are following.
- **Because You Watched** recommendations.
- **Hidden Gems** discovery.
- **Tonight's Picks** / shorter-watch discovery.
- TV airing / episode-calendar discovery.
- richer movie/series filters and sorting.
- mood-based discovery helpers.
- person / actor discovery and credits.
- franchise / collection navigation.
- local **Not Interested** preference.
- improved homepage panel ordering and customization.
- local profiles with isolated history, Continue Watching, watchlists, collections and recommendation context.

### ⏯️ Better progress and episode handling

- Improved Continue Watching state.
- Episode/season progress tracking.
- Next-episode calculation and Up Next integration.
- Autoplay-next setting.
- episode quick navigation support.
- configurable intro/recap skip timing support without pretending provider metadata is exact.
- fixed duplicate series cards in Windows **Up Next** by keeping only the newest progress record per TMDB series.

### 🖥️ Windows improvements

- Source health and explicit source-preference handling.
- Player diagnostics and recovery plumbing.
- Mini-player infrastructure and desktop playback shortcuts.
- improved fullscreen/back behavior.
- catalog cache with stale fallback.
- homepage/state restoration improvements.
- smoke-test and fixture cleanup hardening.
- production portable ZIP remains installer-free.

### 🌐 Website 2.2

The website receives the new discovery/performance work while preserving the intentional website-only scope:

- Movies and Series discovery remain available.
- Embedwave (BETA) joins VidStuck on Web.
- filtered catalog requests, profiles/person discovery, Because You Watched, Hidden Gems and episode-calendar helpers are included.
- tab/infinite-scroll fixes prevent runaway or random catalog loading.
- **Live TV, Live Sports and PPV remain intentionally absent from the website.**

---

## 🪶 New Android Lite editions

ZeroPlay 2.2 ships two optional lightweight builds alongside the normal Android apps:

- **ZeroPlay Android Lite** — `com.zerostreams.app.lite.mobile`
- **ZeroPlay Android TV Lite** — `com.zerostreams.app.lite.tv`

Lite keeps the shared 2.2 catalog/player engine but reduces presentation overhead:

- no rotating hero carousel;
- fewer homepage cards kept alive;
- smaller TMDB artwork requests;
- backdrop/blur atmosphere disabled;
- animations, focus trailers and homepage trailers disabled by default;
- Performance Mode enabled by default;
- Classic lightweight layout by default.

**Android TV Lite still includes Hybrid Mode and the 2.2 provider/navigation fixes.** Lite is not a separate old player engine; it is the lightweight presentation layer running on the current 2.2 playback core.

---

## ✨ Core ZeroPlay features

| | Feature |
| --- | --- |
| 🔎 **TMDB discovery & explicit search** | Trending, popular, now playing, upcoming, recommendations and Search-button results without searching every keystroke. |
| 🎲 **Surprise Me** | Pick a random released movie beyond the visible page. |
| 🗂️ **Categories** | Artwork-rich movie/TV genres, Anime, alphabetical browsing and international/language collections with infinite loading. |
| 🎞️ **Rich title pages** | Artwork, synopsis, genres, cast, trailers, ratings, recommendations and provider information. |
| 🧑‍🎬 **People & filmography** | Browse movie + TV credits from exact TMDB person IDs. |
| ❤️ **Local library** | Watchlist, Plan to Watch, custom collections, history, searches and local profiles. |
| ⏯️ **Continue Watching / Up Next** | Resume supported playback and surface the next series episode. |
| ▶️ **Playback sources** | VidStuck, **Embedwave (BETA)**, VidSrc.sh, plus optional RawCast where supported. |
| 📡 **Live PPV** | Dedicated PPV/Sports playlist browsing with refresh and in-app playback. |
| 📺 **Live TV** | IPTV groups, favorites, refresh and platform-specific channel handling. |
| 🏟️ **Live Sports** | Event categories, schedules, artwork, alternate streams, refresh/retry and fullscreen playback. |
| 📺 **Android TV Hybrid Mode** | Automatically chooses focus/D-pad or virtual mouse interaction for embedded players. |
| 🎨 **Four UI layouts** | Clean, Modern, Flix and Native / Original. |
| 🌈 **17 themes** | Zero Dark, Zero Light, Ocean, Orchid, Sunset, Midnight Blue, Ember Glow, Forest Moss, Rose Noir, Amethyst, Cyber Mint, Cobalt Sky, Golden Hour, Coral Night, Aurora, Slate Ice and Mocha. |
| ⚙️ **Homepage customization** | Enable, disable and order homepage sections. |
| ⚡ **Performance controls** | Performance Mode, adaptive artwork behavior and reduced background work during playback. |
| 📥 **Downloads** | Hosted TSP Search configuration, filtering, queue/progress, delete controls and completed-download history for authorized media. |
| 💬 **Offline subtitles** | Local SRT, VTT, ASS and SSA support for downloaded media. |
| ↗️ **External player** | Open completed local media in another installed player. |
| 🛡️ **Adblock 2.0** | Known-network blocking, confirmed QR-ad learning, popup/navigation hardening and provider/CDN protection. |
| 🔊 **Audio boost** | Off / 1.5× / 2× on compatible embedded audio. |
| 🔄 **In-app updater** | Windows, Android and Android TV update flows with version/changelog handling. |
| 🖥️ **Windows portable** | No installer. Extract the ZIP and run ZeroPlay. |

---

## 📺 Android TV controls in 2.2

Choose the player navigation mode in Settings:

### ✨ Hybrid — Recommended

- D-pad/focus is used when ZeroPlay can reliably navigate the provider's visible controls.
- Virtual mouse fallback is used when the embedded provider does not expose a dependable focus layout.
- Provider menus and hidden control bars are detected/woken as needed.
- The provider's own visible controls remain the player UI.

### 🎯 D-pad / Focus

- arrows move between detected provider controls;
- OK activates the focused provider control;
- a visible focus treatment marks the current target.

### 🖱️ Mouse

- arrows move ZeroPlay's virtual pointer;
- OK clicks at the pointer position.

The **Menu** button opens ZeroPlay's playback utility menu when needed. Holding Menu/OK does **not** silently change playback source. Automatic source recovery is disabled by default.

See **[Android TV controls](docs/android-tv-controls.md)** for the full behavior.

---

## ⬇️ Download ZeroPlay 2.2

Production files are published at **[GitHub Releases](https://github.com/Zer0Spce/ZeroPlay/releases/tag/v2.2)**.

| Platform | File | Notes |
| --- | --- | --- |
| 📱 Android | `ZeroPlay-2.2-Android.apk` | Full signed Android build. |
| 📺 Android TV / Google TV | `ZeroPlay-2.2-Android-TV.apk` | Full signed TV build with **Hybrid Mode**. |
| 🪶 Android Lite | `ZeroPlay-2.2-Android-Lite.apk` | Separate lightweight package. |
| 🪶📺 Android TV Lite | `ZeroPlay-2.2-Android-TV-Lite.apk` | Lightweight TV package with **Hybrid Mode**. |
| 🖥️ Windows x64 | `ZeroPlay-2.2-Windows-x64.zip` | Portable ZIP; no installer. |
| ✅ Integrity | `SHA256SUMS.txt` | SHA-256 for all production assets. |

Android production builds continue using the established signing identity for their corresponding package IDs.

---

## ⚠️ Provider / platform notes

- Embedded playback providers are third-party services and can change independently of ZeroPlay.
- A new QR creative may still need to be closed with its own X or allowed to expire while ZeroPlay learns confirmed ad-host evidence.
- ZeroPlay does not solve or bypass CAPTCHA / Cloudflare / verification challenges.
- Windows SmartScreen reputation can still depend on Authenticode reputation even after Defender scanning.
- Windows offline playback behavior can depend on local codecs/compositor conditions; external-player opening remains available for completed downloads.
- **Embedwave is labeled BETA** because provider behavior can change independently.

---

## 🛠️ Release validation

The 2.2 release pipeline validates the merged release source before publication:

- Android Mobile + Android TV release unit tests;
- Android Lite + Android TV Lite release unit tests;
- signed APK builds for all four Android variants;
- APK signature, package-ID and version checks;
- lint for all four Android variants;
- TV player/navigation regression tests including Hybrid behavior;
- Windows unit, UI, player-guard and Electron smoke tests;
- preservation of the existing production Windows updater/offline-player stack;
- portable Windows packaging and packaged-ASAR verification;
- Microsoft Defender scan of the packaged Windows build;
- website unit/UI/build validation;
- credential audit and SHA-256 checksum generation;
- publication only after required production jobs succeed.

**Windows remains portable-only.**

---

## 🙌 Credits

Metadata and artwork: **TMDB** and their respective rights holders. This product uses the TMDB API but is not endorsed or certified by TMDB. Provider availability: **JustWatch through TMDB**. Optional ratings: **OMDb**. Embedded playback providers include **VidStuck**, **Embedwave** and **VidSrc.sh**. QR decoding: **ZXing**. Android media playback: **AndroidX Media3**. Windows torrent engine: **WebTorrent**.

See **[ZeroPlay 2.2 release notes](docs/release-2.2.md)** for the complete feature, optimization and fix record.
