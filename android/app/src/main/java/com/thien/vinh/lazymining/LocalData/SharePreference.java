package com.thien.vinh.lazymining.LocalData;

import android.app.Activity;
import android.content.SharedPreferences;

import org.json.JSONObject;

/**
 * Created by doanngocduc on 1/24/18.
 */

public class SharePreference {
    private static final String PREF = "MyPref";
    private static final String AUTH_STRING = "auth";
    private static final Integer MODE = 0;// 0 - for private mode


    public static void saveAuth(Activity activity, JSONObject obj){
        SharedPreferences pref = activity.getSharedPreferences(PREF, MODE);
        SharedPreferences.Editor editor = pref.edit();
        editor.putString(AUTH_STRING, obj.toString()); // Storing string
        editor.commit(); // commit changes
    }

    public static String getAuth(Activity activity){
        SharedPreferences pref = activity.getSharedPreferences(PREF, MODE);
        return pref.getString(AUTH_STRING, "");

    }

}
