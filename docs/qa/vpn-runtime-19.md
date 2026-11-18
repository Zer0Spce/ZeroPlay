# Android TV Modern UI / VPN ad-blocking QA #19

## User report
Run #18 passed GitHub Actions but Modern UI still had no visible ad-block toggle, and advertisements continued.

## Verified cause of missing control
TV flavor launches `PresentationMainActivity`, which extends `CategoryMainActivity` -> ... -> `FixedMainActivity`. `FixedMainActivity.addGoogleNavigation` overrides `MainActivity.addGoogleNavigation`. Both previous TV Modern UI modifications targeted the bypassed base method. This QA update modifies the **actual override**.

## Changes
- Fixed Modern TV navigation chip in a non-scrolling container to the right of the horizontally scrolling tab row. It remains focusable with focus outline and readable label. Keeps TV Modern UI compact and all other layouts unchanged.
- Mobile Modern UI also receives the chip in its actual override (beside brand).
- Settings has a fallback **VPN blocking status / controls** action. It reports native Go query counts (including the self-test), denied counts, downloaded filter status, latest-player blocked WebView request counts, and whether the self-test passed. Users can select Original or VPN there.
- In VPN mode, prevent Settings from turning the original player filtering off. Respect VPN mode even if a stale `blockAds=false` exists.
- Combine in-player AdBlockRules with active native VPN downloaded hosts filtering in `WebViewClient.shouldInterceptRequest`, protecting against cached or alternate DNS resolution for external ad subresources. The provider safety allowlist remains intact.
- Preserve 2.2.6.9, branch isolation and side-by-side package IDs.

## Limitations
CI cannot verify real streaming ads disappear. DNS-only VPN filtering cannot block encrypted first-party/in-stream ads, and native/adblock matching must be validated on the device. Inspect DNS counts and WebView blocked count while reproducing the failure; `VPN ✓` reports only synthetic test success.
