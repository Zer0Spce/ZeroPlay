# ZeroPlay 2.2.2 — Playback Source Refresh

ZeroPlay 2.2.2 updates the provider layer without changing the established player behavior.

## Highlights

- **VidStuck domain updated to `vidstuck.cc`** across Android, Android TV, Windows and Web.
- **New ZXCStream (Beta)** playback source using `zxcstream.cc`.
- **Global default video source restored in Settings** so the selected source is used automatically for movies and episodes.
- Existing title-specific/one-time source choices remain available where supported.
- Provider trust/allowlists, navigation guards and website CSP rules were updated for the new domains.
- ZXCStream participates in native source health/failover where supported.
- Android, Android TV, Windows and Web retain the existing 2.2.1 player controls and playback UX; this release does not redesign the player.

## Compatibility

All 2.2.1 discovery, Top 10, Continue Watching, season/episode memory, Home customization and native playback features remain in place.
