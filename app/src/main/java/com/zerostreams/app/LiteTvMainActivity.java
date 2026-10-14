package com.zerostreams.app;

/** Android TV Lite launcher with the same TV-specific Search keyboard handoff. */
public class LiteTvMainActivity extends LiteMainActivity {
    @Override void focusSearch(){
        super.focusSearch();
        TvSearchIme.show(this);
    }
}
