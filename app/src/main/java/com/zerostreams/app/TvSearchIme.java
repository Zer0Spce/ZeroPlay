package com.zerostreams.app;

import android.app.Activity;
import android.app.Dialog;
import android.content.Context;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputMethodManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;

/**
 * Android TV-only Search keyboard.
 *
 * Some TV firmwares replace the normal text IME with a remote-control/navigation
 * surface. ZeroPlay therefore suppresses the device soft IME and provides a
 * deterministic D-pad friendly QWERTY keyboard for TV Search only.
 */
final class TvSearchIme {
    private static final Handler MAIN=new Handler(Looper.getMainLooper());
    private static Dialog activeDialog;

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

        // Never allow affected TV firmware to substitute its remote-control panel.
        field.setShowSoftInputOnFocus(false);
        field.setCursorVisible(true);
        field.setFocusableInTouchMode(true);
        field.requestFocus();
        if(field.getText()!=null)field.setSelection(field.getText().length());
        hideSystemIme(activity,field);

        if(activeDialog!=null&&activeDialog.isShowing())return;
        showZeroPlayKeyboard(activity,field);
    }

    private static void hideSystemIme(Activity activity,EditText field){
        activity.getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_STATE_ALWAYS_HIDDEN);
        InputMethodManager imm=(InputMethodManager)activity.getSystemService(Context.INPUT_METHOD_SERVICE);
        if(imm==null)return;
        if(field.getWindowToken()!=null)imm.hideSoftInputFromWindow(field.getWindowToken(),0);
    }

    private static void showZeroPlayKeyboard(Activity activity,EditText field){
        Dialog dialog=new Dialog(activity);
        dialog.requestWindowFeature(Window.FEATURE_NO_TITLE);

        LinearLayout root=new LinearLayout(activity);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(dp(activity,18),dp(activity,14),dp(activity,18),dp(activity,18));
        GradientDrawable panel=new GradientDrawable();
        panel.setColor(Color.rgb(18,22,31));
        panel.setCornerRadii(new float[]{dp(activity,18),dp(activity,18),dp(activity,18),dp(activity,18),0,0,0,0});
        panel.setStroke(dp(activity,2),Color.rgb(101,230,204));
        root.setBackground(panel);

        TextView title=new TextView(activity);
        title.setText("Search");
        title.setTextColor(Color.WHITE);
        title.setTextSize(18);
        title.setGravity(Gravity.CENTER_VERTICAL);
        title.setPadding(dp(activity,8),0,dp(activity,8),dp(activity,8));
        root.addView(title,new LinearLayout.LayoutParams(-1,-2));

        TextView preview=new TextView(activity);
        preview.setText(field.getText());
        preview.setTextColor(Color.WHITE);
        preview.setTextSize(20);
        preview.setSingleLine(true);
        preview.setPadding(dp(activity,14),dp(activity,10),dp(activity,14),dp(activity,10));
        GradientDrawable previewBg=new GradientDrawable();
        previewBg.setColor(Color.rgb(34,39,52));
        previewBg.setCornerRadius(dp(activity,10));
        preview.setBackground(previewBg);
        LinearLayout.LayoutParams previewParams=new LinearLayout.LayoutParams(-1,dp(activity,52));
        previewParams.setMargins(0,0,0,dp(activity,10));
        root.addView(preview,previewParams);

        String[] rows={"1234567890","QWERTYUIOP","ASDFGHJKL","ZXCVBNM"};
        Button first=null;
        for(String rowText:rows){
            LinearLayout row=new LinearLayout(activity);
            row.setGravity(Gravity.CENTER);
            for(int i=0;i<rowText.length();i++){
                char value=rowText.charAt(i);
                Button key=key(activity,String.valueOf(value));
                key.setOnClickListener(v->{
                    field.getText().insert(field.getSelectionStart(),String.valueOf(value));
                    preview.setText(field.getText());
                });
                if(first==null)first=key;
                LinearLayout.LayoutParams kp=new LinearLayout.LayoutParams(0,dp(activity,48),1f);
                kp.setMargins(dp(activity,3),dp(activity,3),dp(activity,3),dp(activity,3));
                row.addView(key,kp);
            }
            root.addView(row,new LinearLayout.LayoutParams(-1,-2));
        }

        LinearLayout actions=new LinearLayout(activity);
        actions.setGravity(Gravity.CENTER);
        Button space=key(activity,"Space");
        space.setOnClickListener(v->{
            field.getText().insert(field.getSelectionStart()," ");
            preview.setText(field.getText());
        });
        Button backspace=key(activity,"⌫");
        backspace.setOnClickListener(v->{
            int start=Math.max(0,field.getSelectionStart());
            int end=Math.max(0,field.getSelectionEnd());
            if(start!=end){field.getText().delete(Math.min(start,end),Math.max(start,end));}
            else if(start>0){field.getText().delete(start-1,start);}
            preview.setText(field.getText());
        });
        Button clear=key(activity,"Clear");
        clear.setOnClickListener(v->{field.setText("");preview.setText("");});
        Button submit=key(activity,"Search");
        submit.setOnClickListener(v->{
            dialog.dismiss();
            field.requestFocus();
            field.onEditorAction(EditorInfo.IME_ACTION_SEARCH);
        });
        for(Button button:new Button[]{space,backspace,clear,submit}){
            LinearLayout.LayoutParams ap=new LinearLayout.LayoutParams(0,dp(activity,50),1f);
            ap.setMargins(dp(activity,3),dp(activity,6),dp(activity,3),0);
            actions.addView(button,ap);
        }
        root.addView(actions,new LinearLayout.LayoutParams(-1,-2));

        dialog.setContentView(root);
        dialog.setCancelable(true);
        dialog.setOnDismissListener(d->{
            if(activeDialog==dialog)activeDialog=null;
            hideSystemIme(activity,field);
            field.requestFocus();
        });
        dialog.setOnShowListener(d->{
            Window window=dialog.getWindow();
            if(window!=null){
                window.setBackgroundDrawableResource(android.R.color.transparent);
                window.setLayout(WindowManager.LayoutParams.MATCH_PARENT,WindowManager.LayoutParams.WRAP_CONTENT);
                window.setGravity(Gravity.BOTTOM);
                window.setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_STATE_ALWAYS_HIDDEN);
            }
            if(first!=null)first.requestFocus();
        });
        activeDialog=dialog;
        dialog.show();
        Window window=dialog.getWindow();
        if(window!=null){
            window.setLayout(WindowManager.LayoutParams.MATCH_PARENT,WindowManager.LayoutParams.WRAP_CONTENT);
            window.setGravity(Gravity.BOTTOM);
            window.setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_STATE_ALWAYS_HIDDEN);
        }
    }

    private static Button key(Activity activity,String label){
        Button button=new Button(activity);
        button.setText(label);
        button.setAllCaps(false);
        button.setTextColor(Color.WHITE);
        button.setTextSize(16);
        button.setFocusable(true);
        button.setMinWidth(0);
        button.setMinimumWidth(0);
        button.setPadding(dp(activity,6),0,dp(activity,6),0);
        GradientDrawable normal=new GradientDrawable();
        normal.setColor(Color.rgb(43,50,66));
        normal.setCornerRadius(dp(activity,9));
        button.setBackground(normal);
        button.setOnFocusChangeListener((v,focused)->{
            GradientDrawable bg=new GradientDrawable();
            bg.setColor(focused?Color.rgb(58,92,92):Color.rgb(43,50,66));
            bg.setCornerRadius(dp(activity,9));
            if(focused)bg.setStroke(dp(activity,2),Color.rgb(101,230,204));
            v.setBackground(bg);
        });
        return button;
    }

    private static int dp(Activity activity,int value){
        return (int)(value*activity.getResources().getDisplayMetrics().density+.5f);
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
