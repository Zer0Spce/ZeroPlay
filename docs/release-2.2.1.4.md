# ZeroPlay 2.2.1.4 — Android TV System Keyboard Hotfix

ZeroPlay 2.2.1.4 is an **Android-only** hotfix for Android TV / Google TV Search. Windows and Web are unchanged.

## 🔧 Android TV Search keyboard

- Removes the custom ZeroPlay keyboard completely.
- Uses only Android's standard input-method framework for Search.
- Detects TV firmware that has a remote-control surface selected as the current input method.
- When that happens, ZeroPlay opens **Android's own keyboard/input-method chooser once** so the user can select the real Android TV keyboard / Gboard.
- After a normal keyboard is selected, Search opens it through the standard Android IME path.
- The Search field remains a normal text editor with `IME_ACTION_SEARCH`.
- No ZeroPlay-rendered QWERTY layout, remote panel, or custom key UI is used.
- Applied to Android TV and Android TV Lite. Android phone/tablet builds keep their existing keyboard behavior.

## ✅ Preserved features

This hotfix keeps all existing 2.2.1.x Android improvements, including Top 10 Today, Home customization, carousel title artwork, Continue Watching fixes, last season/episode memory, improved Tonight's Picks / Hidden Gems, Android TV rank styling, source selection, and player/subtitle fixes.

## 📦 Android builds

The release contains:

- Android
- Android TV / Google TV
- Android Lite
- Android TV Lite
- SHA-256 checksums

Windows and Web are not rebuilt or republished by this hotfix.
