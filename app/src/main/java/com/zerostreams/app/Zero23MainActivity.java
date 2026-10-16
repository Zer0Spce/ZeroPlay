package com.zerostreams.app;

import android.os.Bundle;

/** 2.3 test launcher wrapper. Core 2.2.2 presentation and playback stay inherited unchanged. */
public class Zero23MainActivity extends PresentationMainActivity {
    @Override public void onCreate(Bundle state){
        super.onCreate(state);
        Zero23Overlay.attach(this);
    }
}
