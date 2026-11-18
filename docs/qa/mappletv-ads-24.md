# MappleTV QA #24

Screenshots show the MappleTV `Watch hit movies and hottest new releases in Full HD! Get access?` ad with Continue and the confetti `Big sale time! Great deals at the best prices!` ad overlay. Native DNS blocked 4/40; WebView 25/160, 63 other-host requests; filter download displayed upstream failed, cached hosts used. Neither network blocking layer removes advertising page DOM on its own.

Root cause: previous MappleTV guard ran only when `location.hostname` was mapple.fun, so it never ran in embedded third-party frames even though player-guard.js was injected at document start. It also narrowly handled only one ad string and assumed a literal `<button>` CTA.

Fix: Native guard is explicitly restricted to the MappleTV provider by a Java injection boolean, but executes in its child WebView frames. Targets only verified promotional phrases, including both screenshot examples, supports links/button-role CTAs, safely hides the smallest coherent popup card with its artwork and CTA; excludes media and verification content. Reports DOM ad removals to player diagnostics. Distinguishes upstream filter endpoint/connection/JSON failure from VPN engine failure. Manual validation needed on actual MappleTV source.
