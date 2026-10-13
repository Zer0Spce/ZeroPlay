# Android TV / Google TV playback controls — ZeroPlay 2.2

ZeroPlay 2.2 adds **Hybrid Mode**, a smarter player-navigation layer designed for inconsistent third-party embedded players.

## ✨ Hybrid Mode — Recommended

Hybrid Mode chooses the most reliable interaction strategy for the provider currently on screen:

- uses **D-pad / focus navigation** when the provider exposes enough usable controls;
- falls back to ZeroPlay's **virtual mouse** when the player does not expose a dependable focus graph;
- wakes hidden provider control bars before navigation;
- prefers provider-native controls instead of drawing a permanent ZeroPlay toolbar over the video;
- handles provider menus/settings/overlays before normal playback exit behavior;
- keeps app/home navigation independent from playback navigation.

Hybrid Mode is available in both **Android TV** and **Android TV Lite**.

## 🎯 D-pad / Focus mode

- Arrow keys move between detected visible player controls.
- OK activates the focused provider control.
- A visible mint-style focus treatment marks the current target where ZeroPlay can safely apply it.
- Hidden provider controls can be woken by remote input before focus movement continues.
- Raw arrow-key seeking is suppressed when ZeroPlay is intentionally routing arrows as focus navigation.

## 🖱️ Mouse mode

- D-pad arrows move ZeroPlay's virtual pointer.
- OK clicks at the pointer position.
- Pointer movement is limited to playback; normal ZeroPlay browsing keeps standard TV focus navigation.

## ☰ Menu button

The Menu button opens ZeroPlay's playback utility menu where supported. That menu can provide app-level functions such as:

- navigation mode;
- retry player;
- next source / source recovery action;
- episode navigation;
- intro/recap timing helpers;
- diagnostics;
- exit playback.

**Holding Menu or Center/OK does not automatically change playback source.**

## 🔁 Source behavior

ZeroPlay 2.2 supports VidStuck, Embedwave (BETA), VidSrc.sh and optional RawCast where configured.

Manual source precedence is:

1. one-time title choice;
2. saved per-title choice;
3. global Settings source;
4. normal fallback.

**Automatic Source Recovery is disabled by default.** When enabled, it can try another provider only after a meaningful player failure; it does not silently replace the initial source choice.

## ↩️ Back behavior

During embedded movie/series playback, ZeroPlay tries to preserve staged behavior:

- close an active provider menu/dialog/settings layer first when detectable;
- hide/wake controls as appropriate to the active navigation strategy;
- exit playback only when the player has no higher-priority layer to close.

A provider's own labelled Back / Go back / Return / Exit player action can also return to ZeroPlay when exposed by the player.

## 🎞️ Provider controls

Normal movies and series use the **provider's native/default visible controls**. ZeroPlay 2.2 does not draw the experimental `Back / -10 / Play / +10 / Skip / Mini / Info / Full screen` strip over the provider player.

Sports-specific support controls are separate and remain where that specialized player requires them.

## 📺 Native Live PPV / Live TV

Open Live PPV or Live TV, choose a channel, and use arrows plus OK to operate the native player controls. Controls can hide after a few seconds and reappear on remote activity.

Depending on the active native player, ZeroPlay can expose controls such as:

- Play/Pause;
- Live / return to live edge;
- Retry;
- Channels;
- Audio;
- Subtitles;
- Fit/Fill.

Channel Up/Down can switch channels where supported. Media Play/Pause buttons work directly where the platform reports them.

## 🪶 Android TV Lite

Android TV Lite uses the same 2.2 player/remote core, including **Hybrid Mode**, while reducing UI/rendering overhead:

- no rotating hero carousel;
- fewer homepage cards kept alive;
- smaller artwork;
- no full-screen backdrop/blur atmosphere;
- animations and homepage/focus trailers off by default;
- Performance Mode on by default;
- Classic lightweight layout by default.

## 🛡️ Player guard / ad behavior

ZeroPlay continues to use evidence-based player protection:

- known ad-network requests can be blocked;
- confirmed QR-ad hosts can be quarantined for the session;
- provider/video CDN hosts are protected from over-aggressive filtering;
- new-window/popunder attempts are restricted inside app playback;
- CAPTCHA / Cloudflare / verification controls are not solved or bypassed.

Third-party providers can change independently, so real-device behavior can vary over time.

## 🧪 Automated coverage

2.2 regression coverage includes:

- Hybrid/D-pad/mouse navigation routing;
- menu-first Back behavior;
- focus movement;
- raw arrow-seek suppression while focus-routing;
- OK activation;
- iframe/provider navigation;
- provider-native-control preservation;
- source-selection precedence;
- Embedwave wiring;
- Automatic Source Recovery default OFF;
- player guard / shadow-DOM QR behavior.

Both full Android TV and Android TV Lite are built and linted in the production release pipeline.
