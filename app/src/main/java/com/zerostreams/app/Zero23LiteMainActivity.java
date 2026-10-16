package com.zerostreams.app;

import android.os.Bundle;

/** 2.3 test launcher wrapper for Lite flavors. Existing Lite behavior stays inherited unchanged. */
public class Zero23LiteMainActivity extends LiteMainActivity {
    @Override public void onCreate(Bundle state){
        super.onCreate(state);
        Zero23Overlay.attach(this);
    }
}
