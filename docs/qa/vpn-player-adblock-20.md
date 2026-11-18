# QA #20 — Player ads remain with native DNS responding

User confirmed Android TV status showed `VPN ✓ 4/40` but visible ads persisted. This indicates *some* DNS queries blocked, not ad-free playback.

Root cause verified in Player Guard: the existing explicitly labeled ad-slot cleanup skipped ANY ad container containing an iframe other than the sole hard-coded QR-ad domain. Real third-party ad iframe slots therefore stayed visible.

Changes:
- Preserve the original DNS filter and playback allowlist; no unverified domain blanket bans.
- Remove the stale exemption for arbitrary ad iframes; only protect known playback iframes and challenge/verification widgets before hiding explicitly identified ad slots.
- Add conservative, ad-labelled modal/overlay removal, excluding media and verification.
- Count DOM ad elements removed (including child frames, using scoped postMessage), and expose it in TV player diagnostics (Menu button).
- Count WebView subresource requests, requests on different hosts, blocked requests, and native DNS block totals. Show related counts in Settings QA diagnostics.
- Rename VPN shield summary from `VPN ✓ N/M` to `DNS N/M`; a successful local DNS probe must not be represented as proof that advertisements are gone.

Manual Android TV QA is still required: verify ad removal by source, unaffected video controls, CAPTCHA flow, playback and VPN performance. DNS-only VPN cannot block in-stream or first-party ads in the media playlist. All changes isolated to `test/vpn-adblock-mode-android-tv`, no production update.
