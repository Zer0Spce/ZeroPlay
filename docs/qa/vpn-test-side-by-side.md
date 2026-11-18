# Side-by-side ZeroPlay VPN Test builds

The test-only Gradle flag `-PzeroVpnQaIsolated=true` isolates app IDs and display labels so Android and Android TV can install the VPN QA build without replacing existing ZeroPlay releases.

| Edition | QA package ID | Launcher label |
| --- | --- | --- |
| Android Mobile | `com.zerostreams.app.mobile.vpntest` | ZeroPlay VPN Test |
| Android TV | `com.zerostreams.app.tv.vpntest` | ZeroPlay VPN Test |
| Lite Mobile | `com.zerostreams.app.lite.mobile.vpntest` | ZeroPlay VPN Test Lite |
| Lite TV | `com.zerostreams.app.lite.tv.vpntest` | ZeroPlay VPN Test Lite |

Production app IDs, signing and published 2.2.6.9 binaries remain unchanged. The flag is not enabled by default. The QA workflow tests and validates the actual APK metadata before uploading temporary Artifacts. VPN permission is independently requested for each test app. Android only allows one active VPN at a time.

To test: open the GitHub Actions workflow, download the Artifacts ZIP, install the applicable debug APK, and verify ZeroPlay VPN Test appears beside ZeroPlay. The two packages have separate saved settings and watch history. No public release will be created.
