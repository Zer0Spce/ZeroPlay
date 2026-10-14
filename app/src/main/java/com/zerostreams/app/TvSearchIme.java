package com.zerostreams.app;

import android.app.Activity;
import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.view.ViewGroup;
import android.view.inputmethod.InputMethodManager;
import android.widget.EditText;

/** Android TV-only IME handoff for Search after modern layouts reveal the hidden search row. */
final class TvSearchIme {
    private static final Handler MAIN=new Handler(Looper.getMainLooper());

    private TvSearchIme(){}

    static void show(Activity activity){
        if(activity==null||activity.isFinishing()||activity.isDestroyed())return;
        View decor=activity.getWindow().getDecorView();
        Runnable open=()->openNow(activity,decor);
        decor.post(open);
        MAIN.postDelayed(open,120);
        MAIN.postDelayed(open,320);
    }

    private static void openNow(Activity activity,View decor){
        if(activity.isFinishing()||activity.isDestroyed())return;
        EditText field=findSearchField(decor);
        if(field==null||!field.isShown()||!field.isEnabled())return;
        field.setShowSoftInputOnFocus(true);
        field.setCursorVisible(true);
        field.requestFocus();
        if(field.getText()!=null)field.setSelection(field.getText().length());
        field.post(()->{
            if(!field.isAttachedToWindow()||!field.hasFocus())return;
            InputMethodManager imm=(InputMethodManager)activity.getSystemService(Context.INPUT_METHOD_SERVICE);
            if(imm==null)return;
            imm.restartInput(field);
            imm.showSoftInput(field,InputMethodManager.SHOW_IMPLICIT);
        });
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
