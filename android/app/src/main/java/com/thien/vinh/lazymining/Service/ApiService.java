package com.thien.vinh.lazymining.Service;

import com.loopj.android.http.AsyncHttpClient;
import com.loopj.android.http.AsyncHttpResponseHandler;
import com.loopj.android.http.JsonHttpResponseHandler;
import com.loopj.android.http.RequestParams;

import org.json.JSONObject;

import cz.msebera.android.httpclient.Header;

/**
 * Created by doanngocduc on 1/23/18.
 */

public class ApiService {

    public static String BASE_URL = "http://lazymining.com:4352";
    //public BASE_URL = "http://192.168.1.111:4352";

    public static String GET_MINER_URL = BASE_URL + "/miners";
    public static String LOGIN_URL =  BASE_URL + "/login";

    public interface Callback {
        void onSuccess(int statusCode, Header[] headers, JSONObject response);
        void onFailure(int statusCode, Header[] headers, String res, Throwable t);
    }

    public static void login(String email, String password,final Callback callback){
        AsyncHttpClient client = new AsyncHttpClient();
        RequestParams params = new RequestParams();
        params.put("email", email);
        params.put("password", password);
        client.get(LOGIN_URL, params, new JsonHttpResponseHandler() {
            @Override
            public void onSuccess(int statusCode, Header[] headers, JSONObject response) {
                // Root JSON in response is an dictionary i.e { "data : [ ... ] }
                // Handle resulting parsed JSON response here
                callback.onSuccess(statusCode,headers,response);
            }

            @Override
            public void onFailure(int statusCode, Header[] headers, String res, Throwable t) {
                // called when response HTTP status is "4XX" (eg. 401, 403, 404)
                callback.onFailure(statusCode,headers,res,t);
            }
        });



    }
}
