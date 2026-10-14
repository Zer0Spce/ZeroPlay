package com.zerostreams.app;

/** Android TV Lite launcher. Search uses only Android system input methods. */
public class LiteTvMainActivity extends LiteMainActivity {
    @Override void focusSearch(){
        super.focusSearch();
        TvSystemIme.open(this);
    }
}
