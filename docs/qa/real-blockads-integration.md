# Verified original BlockAds integration test path

The companion source build from current upstream is currently blocked by its Gradle plugin resolution (Kotlin Compose 2.3.10), so **it must not be claimed as available or bundled**. Instead, this test path deliberately uses the **original signed, unmodified BlockAds v7.1.2 release APKs**, downloaded from the project's GitHub Releases and SHA-256 verified against the hashes published by GitHub.

- Android Mobile: BlockAds official app v7.1.2, package `app.pwhs.blockads`. ZeroPlay right switch launches its built-in `extra_start_vpn` MainActivity entrypoint. ZeroPlay left broadcasts its documented `app.pwhs.blockads.TASKER_STOP` receiver.
- Android TV: BlockAds official TV app v7.1.2, package `app.pwhs.blockadstv`. It contains the real Go tunnel, `TvVpnService`, `GoTunnelAdapter`, and filter lists. Upstream **does not export a remote start or stop API**. ZeroPlay right opens BlockAds TV for the user to enable VPN; left asks them to disable it in BlockAds and confirm. Do not pretend a toggle can silently stop it.
- ZeroPlay's own compact mode chip is embedded in its navigation bar/header. Player WebView blocking is **always enabled in both choices**.
- ZeroPlay APK uses an isolated `.vpntest` application ID. Official BlockAds APKs retain their original application IDs (and may update existing BlockAds installs, but not ZeroPlay).
- Source: https://github.com/pass-with-high-score/blockads-android/releases/tag/v7.1.2. The official project is GPLv3, with code and licenses available there. These APKs are redistributed without modification.
- No production release. Real-device VPN connectivity, playback stability, and TV flow need user testing. App's selected mode is not proof the external VPN is connected.

The pinned-upstream source build script remains in the test repository for later work, but is not used as a source of downloadable APKs until its upstream dependencies resolve.
