# ZeroPlay 2.2.3 — Android Playback Hotfix

ZeroPlay 2.2.3 is a focused bug-fix release for Android playback, with special fixes for Android TV Lite and Play Next.

## Important for Android TV Lite users

**If you are currently on Android TV Lite 2.2.2, you must manually download and install `ZeroPlay-2.2.3-Android-TV-Lite.apk` for this update.**

The 2.2.2 Android TV Lite updater has a routing bug that can download the regular Android TV APK instead of the Lite APK. Because the bug is inside the installed 2.2.2 updater, it cannot reliably deliver the corrected Lite build to itself.

After you manually install Android TV Lite 2.2.3, future updates can use the corrected Lite updater routing.

## Bug fixes

### Android TV Lite playback

- Reduced VidStuck/player overhead on Android TV Lite by restoring a lighter 2.1.2-style embedded-player path.
- Android TV Lite no longer loads the additional 2.2 `player-22.js` helper layer during provider playback.
- Android TV Lite skips Smart / Hybrid navigation setup and uses the simpler direct TV player path.
- Disabled the newer cursor-assist DOM scan on Lite TV playback.
- Disabled the extra 2.2 player health/load-timeout/failover work on Android TV Lite.
- The normal 2.2 Lite app UI remains unchanged; this hotfix targets the video-player path rather than the Home UI.
- Regular Android TV keeps the full 2.2 player feature set.

### Android updater routing

- Fixed Android TV Lite updater selecting the regular Android TV APK.
- Updater now selects the correct APK for all four Android variants:
  - Android
  - Android TV
  - Android Lite
  - Android TV Lite

### Play Next / episode playback

- Fixed the Android double-autoplay race where ZeroPlay and the embedded provider could both try to advance to the next episode.
- ZeroPlay is now the single automatic Play Next owner on Android while provider episode-selection controls remain available.
- Fixed invalid fallback to Season 1 Episode 1 when provider progress metadata is missing.
- Play Next now resolves real episode numbers instead of assuming array positions equal episode numbers.
- Handles missing episode numbers, empty seasons, and season-number gaps.
- Handles both `/embed/tv/...` and `/player/tv/...` episode URL formats.
- Source failover now stays on the currently playing episode instead of jumping back to the originally opened episode.
- Fixed Android TV episode-menu field mapping for episode number and title.

## Platforms

The shared Play Next fixes apply to Android, Android TV, Android Lite, and Android TV Lite.

The lightweight legacy-style VidStuck/player path is specific to Android TV Lite. Windows and Web playback behavior is unchanged in this hotfix.

## Released builds

- `ZeroPlay-2.2.3-Android.apk`
- `ZeroPlay-2.2.3-Android-TV.apk`
- `ZeroPlay-2.2.3-Android-Lite.apk`
- `ZeroPlay-2.2.3-Android-TV-Lite.apk`
- `ZeroPlay-2.2.3-Windows-x64.zip`
- `SHA256SUMS.txt`
