# VPN QA follow-up after Run #17 (test branch only)

User-observed:
- Modern UI Android TV scrolled the navigation header so its shield toggle was not visible; other themes were unaffected.
- Selecting VPN did not visibly block ads.

Changes:
1. Pin the TV Modern UI shield in a separate fixed-width slot outside the horizontal navigation scroll. Keep mobile and other themes unchanged.
2. Fix the case-sensitive upstream Go DNS response contract: `NXDOMAIN`, not `nxdomain` (which silently used the custom-IP default).
3. Include the upstream BlockAds TV synthetic IPv6 DNS address and route, not just IPv4.
4. Align initial built-in ad host coverage with original ZeroPlay AdBlockRules. Native Go filters and StevenBlack lists remain asynchronously refreshed.
5. Perform an on-device UDP DNS test of `doubleclick.net` through synthetic resolver `100.64.100.1:53`. The test only passes when a genuine NXDOMAIN answer and intercepted blocked-query counters are observed. TV shield shows 'VPN checking…', 'VPN ✓ blocked/queries' or 'VPN DNS !'. Counters include the test query.
6. Keep original WebView/player filtering enabled in both modes.

CI verifies source invariants and builds four separate unsigned QA app packages; **it cannot demonstrate device-level effectiveness**. Manually test TV visibility and focus, VPN consent, query counters, MappleTV/VidStuck, and remaining ads. DNS blocking cannot remove first-party/in-stream/DoH ads. Keep 2.2.6.9 stable and never merge without real-device QA.
