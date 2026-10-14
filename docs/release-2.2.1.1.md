# ZeroPlay 2.2.1.1 — Android TV Search Keyboard Hotfix

ZeroPlay 2.2.1.1 is a focused hotfix built on top of 2.2.1. It fixes the Android TV / Google TV Search experience without changing the established movie, series, Home, player, Windows or website behavior from 2.2.1.

## 🔧 Android TV search fix

- Fixed Search opening a TV remote-control/navigation surface instead of the Android TV on-screen keyboard on affected devices.
- Added a TV-only Search input handoff that waits until the hidden modern-layout search row is visible and the text field has real focus before requesting the Android IME.
- Retries the keyboard handoff briefly after layout/focus settles, covering slower Android TV / Google TV launchers where an immediate `showSoftInput()` request could be ignored.
- Restarts input for the active Search field before opening the keyboard so the TV IME receives the correct text editor target.
- Applied to both **Android TV** and **Android TV Lite**.
- Android phone/tablet and Android Lite keep their existing search path unchanged.

## ✅ Preserved 2.2.1 improvements

This hotfix retains everything introduced and fixed in 2.2.1, including Top 10 Today, the Top 10 Home toggle, official featured-title artwork, Continue Watching improvements, saved season/episode resume state, smarter Tonight's Picks and Hidden Gems, Android TV Top 10 rank/poster polish, the VidSrc subtitle-overlay close fix, website trailer previews/deep-link close fixes, and the Windows Top 10 click fix.

## 📦 Builds

The release contains freshly versioned production builds for:

- Android
- Android TV / Google TV
- Android Lite
- Android TV Lite
- Windows 10 / 11 x64 portable ZIP
- SHA-256 checksums

The functional hotfix itself is Android TV-specific; the other packages are rebuilt/versioned as 2.2.1.1 so ZeroPlay's cross-platform updater continues to resolve one complete latest stable release consistently.
