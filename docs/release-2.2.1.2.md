# ZeroPlay 2.2.1.2 — Android TV Search Keyboard Hotfix

ZeroPlay 2.2.1.2 is an **Android-only** hotfix for the Android TV / Google TV Search experience. Windows and the website are not rebuilt or republished by this release.

## 🔧 Android TV Search fix

- Replaces the unreliable device/system TV soft-IME handoff from 2.2.1.1 with a ZeroPlay-owned TV keyboard.
- Prevents affected TV firmware from opening the remote-control/navigation panel shown over Search.
- Explicitly suppresses and hides the system soft keyboard on Android TV Search.
- Adds a clean D-pad-friendly QWERTY keyboard with numbers, Space, Backspace, Clear and Search controls.
- Search text is written directly into the existing ZeroPlay Search field, so normal search history and submit behavior remain intact.
- Keeps delayed focus retries so the keyboard still opens reliably after modern TV layouts reveal the Search row.
- Applied to Android TV and Android TV Lite only at runtime.
- Android phone/tablet and Android Lite keep their existing Search behavior unchanged.

## ✅ Preserved 2.2.1 / 2.2.1.1 improvements

This hotfix keeps the existing Android-side Top 10 Today, Home customization, featured-title artwork, Continue Watching and episode resume behavior, Tonight's Picks / Hidden Gems curation, Android TV poster/rank polish, player fixes, source selection and subtitle-overlay fixes.

## 📦 Android builds

The release contains freshly versioned production APKs for:

- Android
- Android TV / Google TV
- Android Lite
- Android TV Lite
- SHA-256 checksums

Windows and Web remain on their existing release paths.
