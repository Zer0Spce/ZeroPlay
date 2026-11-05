'use strict';
const fs = require('node:fs');
const assert = require('node:assert/strict');
const code = fs.readFileSync('app/src/main/java/com/zerostreams/app/LivePpvShakaActivity.java','utf8');
const main = fs.readFileSync('app/src/main/java/com/zerostreams/app/MainActivity.java','utf8');
const controller = fs.readFileSync('app/src/main/assets/ppv-shaka-controller.js','utf8');

function has(source,pattern,message){assert.match(source,pattern,message);}

has(code,/CONTROLS_HIDE_DELAY_MS\s*=\s*4500L/,'4.5 second auto-hide');
has(code,/ui\.postDelayed\(hideControls,CONTROLS_HIDE_DELAY_MS\)/,'scheduled hide');
has(code,/if\(destroyed\s*\|\|\s*!playbackRunning\s*\|\|\s*channelDialogOpen/,'pause and dialogue hide guard');
has(code,/topBar\.setVisibility\(View\.GONE\)/,'top toolbar hides');
has(code,/controlsContainer\.setVisibility\(View\.GONE\)/,'bottom toolbar hides');
has(code,/root\.requestFocus\(\)/,'hidden toolbar has focus anchor');
has(code,/case "playing":[\s\S]*?playbackRunning=true;wakeControls\(\)/,'playing schedules hide');
for(const state of ['buffering','paused','error']){
  has(code,new RegExp('case "'+state+'":[\\s\\S]*?playbackRunning=false;wakeControls\\(\\)'),state+' unhides and cancels timer');
}
has(code,/browser\.setOnTouchListener/,'tap-to-show controls');
has(code,/button\.setNextFocusLeftId/,'TV D-pad left neighbor');
has(code,/button\.setNextFocusRightId/,'TV D-pad right neighbor');
has(code,/button\.setNextFocusUpId\(backButton\.getId\(\)\)/,'TV D-pad up neighbor');
has(code,/backButton\.setNextFocusDownId\(play\.getId\(\)\)/,'TV D-pad down neighbor');
has(code,/boolean hidden=controlsContainer!=null/,'remote buttons recognize hidden controls');
has(code,/if\(hidden\)\s*\{[\s\S]*?focusControl\(focusedControlIndex\)/,'first hidden remote press restores focus only');
has(code,/target\.performClick\(\)/,'remote OK invokes selected native control');
has(code,/backButton\.performClick\(\)/,'remote OK invokes Back');
has(code,/focused \? ACCENT : 0xFF242733/,'native focus has visible highlight');
has(code,/if\(channelDialogOpen\)return super\.dispatchKeyEvent\(event\)/,'channel picker keeps own navigation');
has(code,/controlsContainer\.smoothScrollTo/,'focused source controls scroll into view');
has(code,/if\(event\.getAction\(\)!=KeyEvent\.ACTION_DOWN\)return true/,'remote UP is consumed without double click');
has(code,/play\.requestFocus\(\)/,'TV focus on Play button');
has(code,/ui\.removeCallbacks\(hideControls\)/,'cleanup pending hide callbacks');
has(code,/if\(!getIntent\(\)\.getBooleanExtra\("liveList",false\)\)/,'Live PPV-only guard remains');
has(main,/live\?LivePpvShakaActivity\.class:LivePlayerActivity\.class/,'non-PPV routing unchanged');
has(controller,/window\.ZeroPpv\s*=/,'working Shaka controller unchanged');
console.log('Live PPV Shaka control auto-hide, touch and D-pad regression assertions passed');
