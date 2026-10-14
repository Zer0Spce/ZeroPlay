# ZeroPlay 2.2.1.3 — Android TV System Keyboard Revert

ZeroPlay 2.2.1.3 is an **Android-only** hotfix. Windows and Web are not rebuilt or republished.

## 🔧 Android TV Search keyboard

- Removed the custom ZeroPlay QWERTY/D-pad keyboard introduced in 2.2.1.2.
- Android TV and Android TV Lite now use the device's **default Android TV / Android system keyboard (IME)** again.
- Removed the TV-specific keyboard override so Search falls back to the same standard Android text-input path already used by the app.
- Search still focuses the existing ZeroPlay search field and uses the normal Android `IME_ACTION_SEARCH` behavior.
- No custom keyboard UI, styling, or key layout is injected by ZeroPlay.
- This release intentionally restores the platform keyboard behavior requested after 2.2.1.2.

## ✅ Scope

This release keeps the existing ZeroPlay 2.2.1.x Android features and fixes. The hotfix only changes the Android TV Search keyboard behavior plus the Android package version.

## 📦 Android builds

The release contains:

- Android
- Android TV / Google TV
- Android Lite
- Android TV Lite
- SHA-256 checksums

Windows and Web remain on their current release paths.
