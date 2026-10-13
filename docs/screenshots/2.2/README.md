# Genuine ZeroPlay 2.2 screenshot provenance

These PNG files capture the running application. They are not generated images, mock HTML, illustrated SVG interfaces or composited screenshots. Click README images to open the original resolution.

## Windows

- Application: published `ZeroPlay-2.2-Windows-x64.zip` from GitHub release `v2.2`.
- Published binary reports `2.2.0`; the capture script refuses any other version.
- Download verified against the release’s `SHA256SUMS.txt` before launch.
- Capture: the released Electron window through Playwright/CDP on a Windows runner.
- Catalog: the app’s real TMDB requests; no fixture bridge or fabricated title data.
- State: a fresh runner profile. Trailer previews were disabled through actual app settings to make still captures stable; layouts were selected through the app settings bridge.
- Empty Library/Downloads screens show their true initial state. They do not demonstrate invented viewing history or completed downloads.
- Resolution: 1008 × 681 capture pixels, as rendered by the runner display. No resizing, repainting or recompression is applied to the PNG files.
- Additional metadata: `windows-capture.json`.

## Android and Android TV

- Source: the 2.2 native app on the documentation branch, with unchanged application source relative to release commit `da84f6ec941d128adf4aad280f4b1d43a7efa995`.
- Capture: the existing native `GalleryTest` instrumentation test and Android `screencap -p`.
- Environment: Android API 28 emulator; Mobile density 420; TV density 240 with a native `tv_1080p` 1920 × 1080 landscape display profile.
- These are native application captures from a debug/instrumentation build of the 2.2 source, rather than a claim that they were taken on a physical device or from a signed release APK.
- Catalog/artwork load through the app’s normal TMDB path. Navigation/layout changes use native application methods and settings.
- Screenshots retain the emulator’s actual resolution and layout.

## Reproduce

Run **Capture genuine ZeroPlay 2.2 screenshots** (`.github/workflows/gallery-2.2.yml`) for Mobile/Windows, and **Capture ZeroPlay 2.2 TV landscape and Hybrid controls** (`.github/workflows/gallery-tv-landscape-2.2.yml`) for the final landscape TV gallery. Windows captures are produced by `scripts/capture-release-gallery.cjs`; Android captures use `GalleryTest`; extra TV controls/profile/mood captures use `scripts/FeatureGalleryTest.java`. The workflow commits capture output only to its selected documentation branch after all capture jobs succeed.

The mint `zeroplay-logo.svg` is a separate branding asset. It is intentionally not described as a screenshot. Older `docs/screenshots` PNGs remain historical assets and are not used as 2.2 captures.
