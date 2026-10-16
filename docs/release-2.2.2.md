# ZeroPlay 2.2.2 — Playback Source Refresh

ZeroPlay 2.2.2 updates the provider layer without changing the established 2.2.1 player behavior.

## Highlights

- **VidStuck domain updated to `vidstuck.cc`** across Android, Android TV, Windows and Web.
- **New ZXCStream (Beta)** playback source using `zxcstream.cc`.
- **Global default video source restored in Settings**. Choose a provider once and it becomes the default for every movie and episode.
- **VidStuck remains the default** for new installs, resets, or invalid saved source values.
- Existing title-specific and one-time source choices remain available where supported.
- Provider trust lists, navigation guards, ad-filter allowlists and website CSP rules include the new domains.
- ZXCStream participates in native source health/failover where supported.
- No player redesign: the established 2.2.1 controls and playback UX remain intact.

## Compatibility

All 2.2.1 discovery, Top 10, Continue Watching, season/episode memory, Home customization and playback features remain in place.
