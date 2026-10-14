package com.zerostreams.app;

import android.app.Activity;
import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.view.ViewGroup;
import android.view.inputmethod.InputMethodManager;
import android.widget.EditText;
import android.widget.Toast;

/**
 * Android TV Search IME bridge.
 *
 * ZeroPlay never renders a keyboard here. The app hands text entry back to
 * Android's own input-method system. Because some TV firmware exposes a remote
 * control panel as its selected IME under unpredictable vendor package names,
 * 2.2.1.4 shows Android's own IME picker once after updating. The user selects
 * the real Android TV keyboard/Gboard, and later searches use that system IME.
 */
final class TvSystemIme {
    private static final Handler MAIN=new Handler(Looper.getMainLooper());
    private static final String PREFS="zero";
    private static final String PICKER_SEEN="tvSystemImePicker214";

    private TvSystemIme(){}

    static void open(Activity activity){
        if(activity==null||activity.isFinishing()||activity.isDestroyed())return;
        View decor=activity.getWindow().getDecorView();
        Runnable handoff=()->handoff(activity,decor);
        decor.post(handoff);
        MAIN.postDelayed(handoff,140);
    }

    private static void handoff(Activity activity,View decor){
        if(activity.isFinishing()||activity.isDestroyed())return;
        EditText field=findSearchField(decor);
        if(field==null||!field.isShown()||!field.isEnabled())return;

        field.setShowSoftInputOnFocus(true);
        field.setFocusableInTouchMode(true);
        field.requestFocus();
        if(field.getText()!=null)field.setSelection(field.getText().length());

        InputMethodManager imm=(InputMethodManager)activity.getSystemService(Context.INPUT_METHOD_SERVICE);
        if(imm==null)return;

        // Dismiss whatever the shared Search path opened first. This prevents a
        // vendor remote-control surface from remaining stuck behind the picker.
        if(field.getWindowToken()!=null)imm.hideSoftInputFromWindow(field.getWindowToken(),0);

        boolean pickerSeen=activity.getSharedPreferences(PREFS,Context.MODE_PRIVATE).getBoolean(PICKER_SEEN,false);
        if(!pickerSeen){
            activity.getSharedPreferences(PREFS,Context.MODE_PRIVATE).edit().putBoolean(PICKER_SEEN,true).apply();
            Toast.makeText(activity,"Choose your Android TV keyboard",Toast.LENGTH_LONG).show();
            MAIN.postDelayed(imm::showInputMethodPicker,120);
            return;
        }

        MAIN.postDelayed(()->{
            if(activity.isFinishing()||activity.isDestroyed()||!field.isShown())return;
            field.requestFocus();
            imm.showSoftInput(field,InputMethodManager.SHOW_IMPLICIT);
        },180);
    }

    private static EditText findSearchField(View view){
        if(view instanceof EditText){
            CharSequence description=view.getContentDescription();
            if(description!=null&&"Search titles".contentEquals(description))return (EditText)view;
        }
        if(view instanceof ViewGroup){
            ViewGroup group=(ViewGroup)view;
            for(int i=0;i<group.getChildCount();i++){
                EditText found=findSearchField(group.getChildAt(i));
                if(found!=null)return found;
            }
        }
        return null;
    }
}
