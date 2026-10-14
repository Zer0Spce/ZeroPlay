package com.zerostreams.app;

import android.app.Activity;
import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.view.View;
import android.view.ViewGroup;
import android.view.inputmethod.InputMethodInfo;
import android.view.inputmethod.InputMethodManager;
import android.widget.EditText;
import android.widget.Toast;
import java.util.List;
import java.util.Locale;

/**
 * Android TV Search IME bridge.
 *
 * ZeroPlay never renders a keyboard here. The app hands text entry back to
 * Android's own input-method system. Some TV firmware selects a remote-control
 * surface as the default IME; Android does not permit normal apps to silently
 * replace that secure setting, so 2.2.1.4 offers Android's own IME chooser once
 * when a remote-like input method is detected.
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

        // Undo the legacy immediate IME request from the shared Search path so
        // vendor TV firmware cannot leave a remote-control panel stuck onscreen.
        if(field.getWindowToken()!=null)imm.hideSoftInputFromWindow(field.getWindowToken(),0);

        boolean pickerSeen=activity.getSharedPreferences(PREFS,Context.MODE_PRIVATE).getBoolean(PICKER_SEEN,false);
        if(!pickerSeen&&looksLikeRemoteIme(activity,imm)){
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

    private static boolean looksLikeRemoteIme(Activity activity,InputMethodManager imm){
        String current=Settings.Secure.getString(activity.getContentResolver(),Settings.Secure.DEFAULT_INPUT_METHOD);
        String normalized=current==null?"":current.toLowerCase(Locale.ROOT);
        if(remoteWord(normalized))return true;
        try{
            List<InputMethodInfo> enabled=imm.getEnabledInputMethodList();
            for(InputMethodInfo info:enabled){
                if(current!=null&&!current.isEmpty()&&!current.equals(info.getId()))continue;
                String packageName=info.getPackageName()==null?"":info.getPackageName().toLowerCase(Locale.ROOT);
                CharSequence label=info.loadLabel(activity.getPackageManager());
                String labelText=label==null?"":label.toString().toLowerCase(Locale.ROOT);
                return remoteWord(packageName)||remoteWord(labelText);
            }
        }catch(Throwable ignored){}
        return false;
    }

    private static boolean remoteWord(String value){
        return value.contains("remote")||value.contains("virtualremote")||value.contains("tvcontrol")||value.contains("remotecontrol");
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
