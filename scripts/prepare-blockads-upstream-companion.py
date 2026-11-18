#!/usr/bin/env python3
"""Prepare a traceable, minimal QA-only BlockAds companion from pinned GPLv3 upstream."""
from pathlib import Path
import sys

root=Path(sys.argv[1])
def patch(path, old, new):
    f=root/path
    src=f.read_text(encoding="utf-8")
    assert src.count(old)==1, f"upstream changed: {path} expected unique marker: {old[:65]}"
    f.write_text(src.replace(old,new),encoding="utf-8")

# Keep all original Go tunnel / filter / VPN sources intact. Only change the
# QA package identity and expose a user-initiated start/stop handshake.
for module in ("app", "blockadstv"):
    patch(f"{module}/build.gradle.kts",
          'applicationId = "app.pwhs.blockads"',
          'applicationId = "app.pwhs.blockads.zeroplayqa"')
    # Upstream compiles with SDK 37, not published in this test runner yet.
    # Only lower the Android compile platform for reproducible test artifacts;
    # leave the Go tunnel, service, repositories, and target SDK untouched.
    patch(f"{module}/build.gradle.kts",
          'version = release(37)',
          'version = release(36)')

tv="blockadstv/src/main/java/app/pwhs/blockadstv/MainActivity.kt"
patch(tv,
      '        }\n    }\n\n    private fun requestProtectionToggle() {',
      '        }\n        handleZeroPlayCommand(intent)\n    }\n\n'
      '    override fun onNewIntent(intent: android.content.Intent) {\n'
      '        super.onNewIntent(intent)\n'
      '        setIntent(intent)\n'
      '        handleZeroPlayCommand(intent)\n'
      '    }\n\n'
      '    private fun handleZeroPlayCommand(intent: android.content.Intent?) {\n'
      '        if (intent?.getStringExtra("zeroplay_command") == "start") {\n'
      '            // The original BlockAds TV VPN owns consent, filters and Go tunnel.\n'
      '            requestVpnPermission()\n'
      '        }\n'
      '    }\n\n'
      '    private fun requestProtectionToggle() {')

receiver=root/"blockadstv/src/main/java/app/pwhs/blockadstv/ZeroPlayStopReceiver.kt"
assert not receiver.exists()
receiver.write_text("""package app.pwhs.blockadstv

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import app.pwhs.blockadstv.service.ServiceController

/** The user-initiated ZeroPlay LEFT mode requests stopping the actual BlockAds tunnel. */
class ZeroPlayStopReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == "app.pwhs.blockads.ZEROPLAY_STOP") {
            ServiceController.requestStop(context)
        }
    }
}
""",encoding="utf-8")

patch("blockadstv/src/main/AndroidManifest.xml",
      '    </application>',
      '        <receiver android:name=".ZeroPlayStopReceiver" android:exported="true">\n'
      '            <intent-filter><action android:name="app.pwhs.blockads.ZEROPLAY_STOP" /></intent-filter>\n'
      '        </receiver>\n'
      '    </application>')
print("Prepared genuine BlockAds APK sources: upstream Go tunnel untouched, TV start/stop bridge installed.")
