# ZeroPlay dual-mode ad blocker — test-only
Home toggle: LEFT = original WebView filtering; RIGHT = real Android VPN DNS filtering.
Android's mandatory VPN consent dialog appears when switching right; denial or failure keeps original blocking.
The VPN routes only the virtual DNS resolver (10.119.0.1/32), not movie/video traffic or a whole-device IP tunnel.
DNS filters use built-in domains, plus StevenBlack hosts list downloaded and cached locally after opt-in.
The code is an original minimal implementation based on the VPN-DNS concept of https://github.com/pass-with-high-score/blockads-android; it does NOT embed, copy or claim to be the upstream GPLv3 BlockAds engine.
Limitations: Does not block first-party ads, DoH/DoT, HTTPS ad content, or YouTube in-stream ads. IPv4 UDP DNS only; no TCP DNS support yet.
Known important testing requirements: DNS failure and reconnection, VPN permission, switching modes, 4K MappleTV playback, other apps, Android TV D-pad focus, stop/revoke and process death.
Never release to stable before device QA.

## Ads increased in initial VPN mode: root-cause fix
The previous VPN mode mistakenly wrote `blockAds=false` in both the Home switch handler and the VPN service startup. This disabled the existing WebView blocking and made ads worse, especially first-party ads that DNS filtering cannot catch.
In the corrected QA build, LEFT keeps the original WebView blocking; RIGHT runs **Original + VPN DNS together**. The Home screen displays whether the VPN service actually started and how many DNS queries were received/blocked by the DNS tunnel. If the query count remains zero during playback, VPN DNS filtering is not intercepting the playback client's DNS; do not claim VPN blocking works merely because Android shows a VPN icon.
Only the isolated test branch is modified. No production release.
