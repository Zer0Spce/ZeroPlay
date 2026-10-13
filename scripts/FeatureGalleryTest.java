package com.zerostreams.app;
import android.content.Intent;
import android.graphics.Rect;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.test.core.app.ActivityScenario;
import androidx.test.platform.app.InstrumentationRegistry;
import org.junit.Test;
import org.junit.Assert;
import java.io.*;
/** Capture additional real native settings; no fake catalog or UI. */
public class FeatureGalleryTest {
 void capture(String name)throws Exception{try(android.os.ParcelFileDescriptor descriptor=InstrumentationRegistry.getInstrumentation().getUiAutomation().executeShellCommand("screencap -p /data/local/tmp/zeroplay-"+name+".png");InputStream result=new android.os.ParcelFileDescriptor.AutoCloseInputStream(descriptor)){while(result.read()!=-1){}}}
 View find(View root,String text){if(root instanceof TextView&&((TextView)root).getText().toString().contains(text))return root;if(root instanceof ViewGroup){ViewGroup group=(ViewGroup)root;for(int i=0;i<group.getChildCount();i++){View found=find(group.getChildAt(i),text);if(found!=null)return found;}}return null;}
 android.app.AlertDialog dialog(MainActivity activity){try{java.lang.reflect.Field field=MainActivity.class.getDeclaredField("appearanceDialog");field.setAccessible(true);return (android.app.AlertDialog)field.get(activity);}catch(Exception error){throw new AssertionError(error);}}
 @Test public void captureNativeFeatures()throws Exception{Intent intent=new Intent(InstrumentationRegistry.getInstrumentation().getTargetContext(),MainActivity.class);try(ActivityScenario<MainActivity> scenario=ActivityScenario.launch(intent)){
  Thread.sleep(14000);scenario.onActivity(a->a.settings());Thread.sleep(800);
  scenario.onActivity(a->{View target=find(dialog(a).getWindow().getDecorView(),"Android TV movie player controls");Assert.assertNotNull(target);target.requestRectangleOnScreen(new Rect(0,0,target.getWidth(),target.getHeight()+250),true);});Thread.sleep(800);capture("hybrid-controls");
  scenario.onActivity(a->{dialog(a).dismiss();a.profilesDialog();});Thread.sleep(800);capture("profiles");
  InstrumentationRegistry.getInstrumentation().getUiAutomation().executeShellCommand("input keyevent 4").close();Thread.sleep(500);scenario.onActivity(a->a.moodDialog());Thread.sleep(800);capture("moods");
 }}
}
