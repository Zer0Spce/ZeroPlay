# ZeroPlay 2.2.2 — Playback Source Refresh

ZeroPlay 2.2.2 refreshes the playback-source layer while keeping the established 2.2.1 player controls and playback UX unchanged.

## Released builds

- Windows x64 portable
- Android TV
- Android Lite
- Android TV Lite

The Web build is intentionally not part of this 2.2.2 release pass, and the standard Android phone APK is not attached to this release.

## Highlights

- **VidStuck updated to `vidstuck.cc`** on the released builds.
- **New ZXCStream (Beta)** playback source using `zxcstream.cc`.
- **Global default video source restored in Settings**. Choose a source once and it is used as the default for movies and episodes.
- **VidStuck remains the default/recommended source** for new installs, resets, and invalid saved source values.
- Existing one-title and one-time source choices remain available where supported.
- Provider trust/navigation rules and source recovery logic recognize the new domains.
- ZXCStream participates in native source health/failover where supported.
- **No player redesign or player-control changes** were made for 2.2.2.

## Preserved from 2.2.1

Top 10, Continue Watching, season/episode memory, Home customization, discovery improvements, title artwork, TV navigation polish, and the existing player behavior remain intact.
