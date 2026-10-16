package com.zerostreams.app;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.view.*;
import android.widget.*;

/** Small test-branch entry point layered over the inherited 2.2.2 UI. */
final class Zero23Overlay {
    private Zero23Overlay(){}

    static void attach(Activity activity){
        Button button=new Button(activity);
        button.setText(BuildConfig.TV?"✦ For You 2.3":"✦ 2.3");
        button.setAllCaps(false);
        button.setTextColor(Color.WHITE);
        button.setTextSize(BuildConfig.TV?14:12);
        button.setFocusable(true);
        button.setContentDescription("Open ZeroPlay 2.3 For You test hub");
        button.setBackgroundColor(Color.rgb(27,115,103));
        button.setOnClickListener(v->activity.startActivity(new Intent(activity,Zero23HubActivity.class)));
        FrameLayout.LayoutParams params=new FrameLayout.LayoutParams(dp(activity,BuildConfig.TV?170:72),dp(activity,44),Gravity.BOTTOM|Gravity.END);
        params.setMargins(dp(activity,12),dp(activity,12),dp(activity,18),dp(activity,18));
        activity.addContentView(button,params);
    }

    private static int dp(Activity activity,float value){
        return (int)(activity.getResources().getDisplayMetrics().density*value+.5f);
    }
}
