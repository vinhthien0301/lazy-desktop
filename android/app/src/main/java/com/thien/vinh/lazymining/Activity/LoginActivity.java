package com.thien.vinh.lazymining.Activity;

import android.os.Bundle;
import android.support.annotation.ColorRes;
import android.support.annotation.NonNull;
import android.support.design.widget.BottomNavigationView;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentTransaction;
import android.support.v4.content.ContextCompat;
import android.support.v7.app.ActionBar;
import android.support.v7.app.AppCompatActivity;
import android.text.SpannableString;
import android.text.style.UnderlineSpan;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.thien.vinh.lazymining.Fragment.ContactFragment;
import com.thien.vinh.lazymining.Fragment.ManageFragment;
import com.thien.vinh.lazymining.R;
import com.thien.vinh.lazymining.Service.ApiService;
import com.thien.vinh.lazymining.Utility.Enum;
import com.thien.vinh.lazymining.Utility.Utility;

import org.json.JSONException;
import org.json.JSONObject;

import cz.msebera.android.httpclient.Header;

public class LoginActivity extends AppCompatActivity implements View.OnClickListener,View.OnFocusChangeListener {
    private TextView tvSignup;
    private TextView tvErrEmail;
    private TextView tvErrPw;
    private LinearLayout lnMain;
    private Button btnLogin;
    private EditText etEmail;
    private EditText etPw;
    private Boolean succEmail = false;
    private Boolean succPw = false;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);
        Utility.hideTilteBar(this);
        initUi();
        Utility.setUnderlineText("ĐĂNG KÝ",tvSignup);

    }

    private void initUi(){
        tvSignup = (TextView) findViewById(R.id.tv_sign_up);
        tvErrEmail = (TextView) findViewById(R.id.tv_err_email);
        tvErrPw = (TextView) findViewById(R.id.tv_err_pw);
        lnMain = (LinearLayout) findViewById(R.id.ln_main);
        btnLogin = (Button) findViewById(R.id.btn_log_in);
        etEmail = (EditText) findViewById(R.id.et_email);
        etPw = (EditText) findViewById(R.id.et_pw);
        etEmail.setOnFocusChangeListener(this);
        lnMain.setOnClickListener(this);
        btnLogin.setOnClickListener(this);
        etEmail.requestFocus();
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
    }


    @Override
    public void onClick(View view) {
        switch(view.getId()) {
            case R.id.ln_main:
                Utility.hideKeyboard(this);
                checkEmail();
                checkPassword();
                break;
            case R.id.btn_log_in:
                logIn();
                break;
        }
    }
    private void logIn(){

        ApiService.login(etEmail.getText().toString(),etPw.getText().toString(),new ApiService.Callback() {
            @Override
            public void onSuccess(int statusCode, Header[] headers, JSONObject response) {

                try {
                    String responseCode = response.getString("response_code");
                    if(responseCode == Enum.SUCC_LOGIN){
                        JSONObject obj = response.getJSONObject("data");
                        String token = obj.getString("token");
                        String email = obj.getString("email");
                        
                    }else {
                        Utility.showToast(LoginActivity.this,"Sai tài khoản hoặc mật khẩu");
                    }

                }catch (JSONException e){
                    Utility.showToast(LoginActivity.this,"Không thể parse Json");
                }
            }

            @Override
            public void onFailure(int statusCode, Header[] headers, String res, Throwable t) {
                Utility.showToast(LoginActivity.this,"Lỗi mạng");
            }
        });
    }

    private void checkEmail(){
        if(etEmail.getText().length() == 0 || !Utility.isEmailValid(etEmail.getText().toString())){
            tvErrEmail.setVisibility(View.VISIBLE);
            btnLogin.setEnabled(false);
        }else {
            succEmail = true;
            tvErrEmail.setVisibility(View.GONE);
            if(succPw){
                btnLogin.setEnabled(true);
            }else {
                btnLogin.setEnabled(false);
            }
        }
    }
    private void checkPassword(){



        if(etPw.getText().length() == 0 ){
            tvErrPw.setVisibility(View.VISIBLE);
            btnLogin.setEnabled(false);
        }else {
            succPw = true;
            tvErrPw.setVisibility(View.GONE);
            if(succEmail){
                btnLogin.setEnabled(true);
            }else {
                btnLogin.setEnabled(false);
            }
        }
    }
    @Override
    public void onFocusChange(View view, boolean hasFocus) {
        switch(view.getId()) {
            case R.id.et_email:
                if(!hasFocus){
                    checkEmail();
                }

                break;
            case R.id.et_pw:
                if(!hasFocus) {
                    checkPassword();
                }
                break;
        }
    }
}
