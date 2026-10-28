# ZeroPlay 2.3 private preview validation

This branch is **not a release**. Never merge into or modify `ZEROPLAY-BACKUP-TRANSFER-10.27.26`.

## Scope

- Web and Windows discovery: Original + Cinematic Dark + Modern Streaming + Premium Media Library + ZeroPlay Signature.
- Android and Android TV: four opt-in appearance palettes, retaining existing layout/navigation.
- Home discovery: Top Rated TV, On the Air, Korean Dramas, Animation & Anime, and Documentaries (optional panels).
- Existing home panel ordering, watchlist, recommendations, filters and caches remain the foundation.

## Required checks before handing over builds

1. Run `node --test tests/zero23-discovery-skins.test.cjs` and check `node --check` for edited JS.
2. Run Android Mobile/TV unit tests and signed builds with the existing 2.2.5 build-time compatibility scripts.
3. Run Windows tests and package the portable ZIP.
4. Verify **three** preview artifacts and checksums. Keep artifacts inside GitHub Actions, not GitHub Releases.
5. Open Settings on each platform, select all four styles, and return to Original. Restart and confirm persistence.
6. Verify optional home rows, hide/reorder, empty API state, search and recommendations.
7. Regression-test protected Live TV, PPV, Live Sports, Android TV remote/back navigation, player and audio booster **without modifying their implementations**.
8. Test Android TV on actual hardware with remote and Android Mobile/Windows on representative devices.
9. Only publish after the user separately approves release.

## Known limits

The Android implementation adds appearance **palettes**, not four independently restructured layouts. The web and Windows styles use discovery CSS. The full 70-item roadmap is not yet implemented. The private build workflow needs a successful run before any package can be considered test-ready.
