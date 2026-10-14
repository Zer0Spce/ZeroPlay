package com.zerostreams.app;

/** Full Android TV launcher with a TV-specific Search keyboard handoff. */
public class TvMainActivity extends PresentationMainActivity {
    @Override void focusSearch(){
        super.focusSearch();
        TvSearchIme.show(this);
    }
}
