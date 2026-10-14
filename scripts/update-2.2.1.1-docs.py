from pathlib import Path

VERSION='2.2.1.1'
PREVIOUS='2.2.1'

readme_path=Path('README.md')
readme=readme_path.read_text(encoding='utf-8')

replacements={
    '# 🎬 ZeroPlay 2.2.1':'# 🎬 ZeroPlay 2.2.1.1',
    'Version **2.2.1** keeps the 2.2 foundation and adds **Top 10 Today**, official featured-title artwork, stronger Continue Watching / episode resume behavior, smarter Home curation and player/web polish.':'Version **2.2.1.1** keeps the complete 2.2.1 feature set and adds a focused **Android TV / Google TV Search keyboard hotfix**, restoring the normal on-screen keyboard when Search is opened on affected TV devices.',
    '**[⬇️ Get the latest release](https://github.com/Zer0Spce/ZeroPlay/releases/latest)** · **[📋 2.2.1 release notes](docs/release-2.2.1.md)**':'**[⬇️ Get the latest release](https://github.com/Zer0Spce/ZeroPlay/releases/latest)** · **[📋 2.2.1.1 hotfix notes](docs/release-2.2.1.1.md)**',
    '## ⭐ What’s new in 2.2.1':'## 🔧 What’s fixed in 2.2.1.1',
    '**Top 10 Today · Official carousel title artwork · Last season/episode resume · More reliable Continue Watching · Smarter Tonight’s Picks · Smarter Hidden Gems · Website trailer previews · Deep-link close fixes · VidSrc subtitle-menu close fix · Top 10 Home toggle**':'**Android TV Search keyboard restored · TV-only delayed IME handoff · Android TV Lite covered · Android phone/tablet search unchanged · Full 2.2.1 feature set preserved**\n\nThe hotfix waits until the TV Search field is actually visible and focused before handing input to Android’s IME, then retries briefly for slower TV launchers. This prevents Search from falling back to remote/navigation controls instead of the on-screen keyboard.\n\n### ⭐ Everything from 2.2.1 remains included\n\n**Top 10 Today · Official carousel title artwork · Last season/episode resume · More reliable Continue Watching · Smarter Tonight’s Picks · Smarter Hidden Gems · Website trailer previews · Deep-link close fixes · VidSrc subtitle-menu close fix · Top 10 Home toggle**'
}
for old,new in replacements.items():
    if old not in readme:
        raise SystemExit(f'README marker missing: {old[:90]}')
    readme=readme.replace(old,new,1)

readme=readme.replace('releases/download/v2.2.1/ZeroPlay-2.2.1-Android.apk',f'releases/download/v{VERSION}/ZeroPlay-{VERSION}-Android.apk')
readme=readme.replace('releases/download/v2.2.1/ZeroPlay-2.2.1-Android-TV.apk',f'releases/download/v{VERSION}/ZeroPlay-{VERSION}-Android-TV.apk')
readme=readme.replace('releases/download/v2.2.1/ZeroPlay-2.2.1-Android-Lite.apk',f'releases/download/v{VERSION}/ZeroPlay-{VERSION}-Android-Lite.apk')
readme=readme.replace('releases/download/v2.2.1/ZeroPlay-2.2.1-Android-TV-Lite.apk',f'releases/download/v{VERSION}/ZeroPlay-{VERSION}-Android-TV-Lite.apk')
readme=readme.replace('releases/download/v2.2.1/ZeroPlay-2.2.1-Windows-x64.zip',f'releases/download/v{VERSION}/ZeroPlay-{VERSION}-Windows-x64.zip')
readme=readme.replace('releases/download/v2.2.1/SHA256SUMS.txt',f'releases/download/v{VERSION}/SHA256SUMS.txt')
readme_path.write_text(readme,encoding='utf-8')

changelog_path=Path('docs/changelog.md')
changelog=changelog_path.read_text(encoding='utf-8')
current='Current release: **2.2.1**.'
if current not in changelog:
    raise SystemExit('Current-release marker missing in changelog')
changelog=changelog.replace(current,'Current release: **2.2.1.1**.',1)
anchor='<details open>\n<summary><strong>ZeroPlay 2.2.1</strong></summary>'
if anchor not in changelog:
    raise SystemExit('2.2.1 changelog anchor missing')
hotfix='''<details open>
<summary><strong>ZeroPlay 2.2.1.1</strong></summary>

# ZeroPlay 2.2.1.1 — Android TV Search Keyboard Hotfix

- Fixed Android TV / Google TV Search opening remote/navigation controls instead of the on-screen keyboard on affected devices.
- Search now waits for the modern-layout Search field to become visible and focused before requesting the Android IME.
- Added short TV-only retry handoffs plus `restartInput()` so slower TV launchers reliably attach the keyboard to the real Search editor.
- Applied to Android TV and Android TV Lite only; phone/tablet search behavior remains unchanged.
- Rebuilt/versioned Android, Android TV, Lite editions and Windows as 2.2.1.1 so the cross-platform updater continues to see a complete latest stable release.
- All 2.2.1 Home, Top 10, resume, player, Windows and website improvements remain intact.

</details>

'''
changelog=changelog.replace(anchor,hotfix+anchor,1)
changelog_path.write_text(changelog,encoding='utf-8')

print('Updated README.md and docs/changelog.md for ZeroPlay 2.2.1.1')
