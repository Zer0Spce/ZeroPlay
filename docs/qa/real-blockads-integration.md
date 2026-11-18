# ZeroPlay real BlockAds companion QA (GPLv3)

This test integration is not a reproduction of BlockAds' engine. The companion APKs are built from the **actual** pinned source of https://github.com/pass-with-high-score/blockads-android at commit `40bf7c959ed23dd3dcf3cb8577dc1b027c29c946`.

The upstream Go tunnel, `TvVpnService`, `GoTunnelAdapter`, `FilterListRepository` and their filters are unchanged. The repo's SHA-256-verified upstream tunnel release artifact is used in the build. A minimal patch changes the QA package ID to `app.pwhs.blockads.zeroplayqa`, adds a ZeroPlay-intent entrypoint to the original BlockAds TV MainActivity (including Android's VPN consent prompt), and a stop receiver. For mobile, the original upstream `extra_start_vpn` MainActivity entrypoint and Tasker stop receiver are used without modifying their behavior.

**Test installation requires two separate APKs:** install ZeroPlay VPN Test for the device, and install the matching `BlockAds-Upstream-app-ZeroPlay-TEST.apk` (Android phone) or `BlockAds-Upstream-blockadstv-ZeroPlay-TEST.apk` (Android TV). Both packages are isolated from stable ZeroPlay and from a separately installed official BlockAds app. The small navigation "Ads" switch is left Original; switching right selects BlockAds and opens the companion to request the VPN permission. Switching left requests stop from BlockAds and retains original WebView blocking.

The app displays **selected mode**, not a guaranteed connected status: Android's VPN permission can be denied, another VPN may conflict, and network-level effectiveness must be tested on device. No release until successful device QA.

**GPLv3 notice:** BlockAds code is licensed under GPLv3. Original source and license are linked above; the exact reproducible source patch is in `scripts/prepare-blockads-upstream-companion.py`. When distributing these binary APKs, make the complete corresponding source (including applicable dependencies and modifications) available under GPLv3. This workflow publishes only short-lived private CI artifacts, not a public product.
