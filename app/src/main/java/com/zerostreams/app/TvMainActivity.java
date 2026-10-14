package com.zerostreams.app;

/** Full Android TV launcher. Search uses only Android system input methods. */
public class TvMainActivity extends PresentationMainActivity {
    @Override void focusSearch(){
        super.focusSearch();
        TvSystemIme.open(this);
    }
}
