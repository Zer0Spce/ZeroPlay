# ZeroPlay 2.3 — 50-point enhancement test branch

Branch: `dev/2.3-50-point-enhancements`
Baseline: ZeroPlay 2.2.2 main at `88be9d5493cdb3ed153b2ec4666c6262bce723ba`

## Release rule

This branch is **test-only**. It must not publish a GitHub release, move a release tag, deploy the production web site, or merge into `main` until the owner explicitly approves release after hands-on testing.

## Frozen playback boundary

The 2.3 enhancement work is discovery, personalization, library UX, profiles, accessibility, cache/offline, sync/backup, and diagnostics. Existing movie/series/live player behavior and playback-source implementations are frozen. CI compares the branch against the 2.2.2 baseline and fails if a frozen player/provider file changes.

## 50 enhancements

1. For You — personalized discovery hub and homepage preview.
2. Taste Profile — learns genres, language, era and content-type preferences from local library/history.
3. Adaptive Home — adds a profile-aware For You preview to Home without replacing existing rows.
4. Contextual Because You Watched — recommendations from the latest watched title.
5. Household Profiles — multiple local profiles.
6. Continue Watching cleanup — profile-local hide/cleanup layer without deleting history.
7. Finish It — titles at 65–94% progress.
8. Series Hub — active series in one place.
9. Episode notifications — followed-series next-airing checks while the 2.3 hub is active/refreshed.
10. Release Radar — upcoming movies plus currently-airing TV.
11. Follow people/directors/franchises — local follow lists and people search.
12. Franchise progress — collections/followed franchise groups become progress groups.
13. Collection timelines — existing collections summarized as timeline groups.
14. Watchlist organization — profile-aware sorting tools.
15. Watchlist Roulette — random watchlist pick.
16. Watchlist Voting — local up/down scores without mutating the watchlist.
17. Calendar — local planned-watch dates.
18. Newly Added catalog — current release/on-air discovery.
19. Decades — era discovery generated from taste.
20. Awards & acclaim — high-rating/high-vote discovery lens (not an awards database claim).
21. Seasonal Home — month-sensitive genre row.
22. Philippines Trends — PH-region discovery lens.
23. Critics vs Audience lens — high-rating vs popularity views; labels avoid claiming unavailable critic data.
24. Advanced Search — type/year/min-rating filters.
25. Aliases & typo tolerance — normalized punctuation fallback search.
26. Universal Search — titles plus people.
27. TV voice search — Web Speech API where available; Android RecognizerIntent on supported devices.
28. Habit-based suggestions — time-of-day context combined with taste.
29. TV quick panel — profile/preset/data-saver/continue status.
30. Remote shortcuts — MENU/Search/R on Android hub; Alt+F/R on Web/Windows hub.
31. Focus memory — remembers the last focused 2.3 title/control.
32. Per-profile UI — density, accessibility and preset preferences per profile.
33. Kids/Guest profiles — profile modes.
34. Avatars — profile avatar selection.
35. Ambient artwork — focused 2.3 cards feed a subtle ambient backdrop on Web/Windows.
36. Poster density — comfortable/balanced/compact.
37. Accessibility — high contrast, large text and reduced motion.
38. Quick presets — Beautiful, Balanced, Fast, Data Saver and TV Performance.
39. Storage dashboard — estimates local 2.3/core storage.
40. Smart cache — bounded in-memory/local API cache with explicit clear action.
41. Network-aware artwork — Data Saver / slow-network smaller TMDB image requests in the 2.3 layer.
42. Offline catalog — successful 2.3 discovery responses are retained for fallback on Web/Windows; Android preserves local profile/library views when discovery is offline.
43. Profile import/export — portable JSON profile backup.
44. LAN sync packet — portable device-to-device sync packet for manual same-network transfer.
45. Backup scheduler — daily rolling profile snapshots while the app is used.
46. Unified Home state — profile, focus, personalization and UI state share one 2.3 schema.
47. What Changed — built-in 2.3 change summary.
48. Feature Tips — contextual 2.3 tips.
49. Diagnostics health page — network/TMDB/storage/profile/build health, explicitly separate from player diagnostics.
50. Profile backup foundations — versioned backup schema for future sync evolution.

## Platform access

- Web: `For You` appears in the left navigation.
- Windows: `For You` appears in the left navigation.
- Android phone/tablet: launcher wrapper keeps the existing app and adds a small `✦ 2.3` entry button.
- Android TV: launcher wrapper keeps the existing app and adds a focusable `✦ For You 2.3` entry button.
- Lite Android variants inherit the same test hub through a Lite launcher wrapper.

## Test gate

Only branch artifacts are allowed. No publish/tag/deploy jobs are part of the 2.3 test workflow. Production release remains an explicit later step after owner approval.
