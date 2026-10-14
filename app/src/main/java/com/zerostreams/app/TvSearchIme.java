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

/** TV-only Search keyboard that avoids firmware remote-control IME surfaces. */
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
        if(imm!=null&&field.getWindowToken()!=null)imm.hideSoftInputFromWindow(field.getWindowToken(),0);
    }

    private static void showZeroPlayKeyboard(Activity activity,EditText field){
        Dialog dialog=new Dialog(activity);
        dialog.requestWindowFeature(Window.FEATURE_NO_TITLE);
        LinearLayout root=column(activity);
        root.setPadding(dp(activity,18),dp(activity,14),dp(activity,18),dp(activity,18));
        root.setBackground(box(activity,Color.rgb(18,22,31),Color.rgb(101,230,204),18));

        TextView title=new TextView(activity);
        title.setText("Search");
        title.setTextColor(Color.WHITE);
        title.setTextSize(18);
        title.setPadding(dp(activity,8),0,dp(activity,8),dp(activity,8));
        root.addView(title);

        TextView preview=new TextView(activity);
        preview.setText(field.getText());
        preview.setTextColor(Color.WHITE);
        preview.setTextSize(20);
        preview.setSingleLine(true);
        preview.setGravity(Gravity.CENTER_VERTICAL);
        preview.setPadding(dp(activity,14),0,dp(activity,14),0);
        preview.setBackground(box(activity,Color.rgb(34,39,52),0,10));
        LinearLayout.LayoutParams pp=new LinearLayout.LayoutParams(-1,dp(activity,52));
        pp.setMargins(0,0,0,dp(activity,8));
        root.addView(preview,pp);

        final Button[] firstKey={null};
        for(String keys:new String[]{"1234567890","QWERTYUIOP","ASDFGHJKL","ZXCVBNM"}){
            LinearLayout row=new LinearLayout(activity);
            row.setGravity(Gravity.CENTER);
            for(int i=0;i<keys.length();i++){
                final char value=keys.charAt(i);
                Button key=key(activity,String.valueOf(value));
                key.setOnClickListener(v->{insert(field,String.valueOf(value));preview.setText(field.getText());});
                if(firstKey[0]==null)firstKey[0]=key;
                LinearLayout.LayoutParams kp=new LinearLayout.LayoutParams(0,dp(activity,48),1f);
                kp.setMargins(dp(activity,3),dp(activity,3),dp(activity,3),dp(activity,3));
                row.addView(key,kp);
            }
            root.addView(row);
        }

        LinearLayout actions=new LinearLayout(activity);
        actions.setGravity(Gravity.CENTER);
        Button space=key(activity,"Space");
        space.setOnClickListener(v->{insert(field," ");preview.setText(field.getText());});
        Button backspace=key(activity,"⌫");
        backspace.setOnClickListener(v->{backspace(field);preview.setText(field.getText());});
        Button clear=key(activity,"Clear");
        clear.setOnClickListener(v->{field.setText("");preview.setText("");});
        Button submit=key(activity,"Search");
        submit.setOnClickListener(v->{dialog.dismiss();field.requestFocus();field.onEditorAction(EditorInfo.IME_ACTION_SEARCH);});
        for(Button button:new Button[]{space,backspace,clear,submit}){
            LinearLayout.LayoutParams ap=new LinearLayout.LayoutParams(0,dp(activity,50),1f);
            ap.setMargins(dp(activity,3),dp(activity,6),dp(activity,3),0);
            actions.addView(button,ap);
        }
        root.addView(actions);

        dialog.setContentView(root);
        dialog.setCancelable(true);
        dialog.setOnDismissListener(d->{
            if(activeDialog==dialog)activeDialog=null;
            hideSystemIme(activity,field);
            field.requestFocus();
        });
        dialog.setOnShowListener(d->{
            configureWindow(dialog);
            if(firstKey[0]!=null)firstKey[0].requestFocus();
        });
        activeDialog=dialog;
        dialog.show();
        configureWindow(dialog);
    }

    private static void configureWindow(Dialog dialog){
        Window window=dialog.getWindow();
        if(window==null)return;
        window.setBackgroundDrawableResource(android.R.color.transparent);
        window.setLayout(WindowManager.LayoutParams.MATCH_PARENT,WindowManager.LayoutParams.WRAP_CONTENT);
        window.setGravity(Gravity.BOTTOM);
        window.setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_STATE_ALWAYS_HIDDEN);
    }

    private static void insert(EditText field,String value){
        int start=Math.max(0,field.getSelectionStart());
        int end=Math.max(0,field.getSelectionEnd());
        field.getText().replace(Math.min(start,end),Math.max(start,end),value);
    }

    private static void backspace(EditText field){
        int start=Math.max(0,field.getSelectionStart());
        int end=Math.max(0,field.getSelectionEnd());
        if(start!=end)field.getText().delete(Math.min(start,end),Math.max(start,end));
        else if(start>0)field.getText().delete(start-1,start);
    }

    private static LinearLayout column(Activity activity){
        LinearLayout layout=new LinearLayout(activity);
        layout.setOrientation(LinearLayout.VERTICAL);
        return layout;
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
        button.setBackground(box(activity,Color.rgb(43,50,66),0,9));
        button.setOnFocusChangeListener((v,focused)->v.setBackground(box(activity,focused?Color.rgb(58,92,92):Color.rgb(43,50,66),focused?Color.rgb(101,230,204):0,9)));
        return button;
    }

    private static GradientDrawable box(Activity activity,int fill,int stroke,int radius){
        GradientDrawable drawable=new GradientDrawable();
        drawable.setColor(fill);
        drawable.setCornerRadius(dp(activity,radius));
        if(stroke!=0)drawable.setStroke(dp(activity,2),stroke);
        return drawable;
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
