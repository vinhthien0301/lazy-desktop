package com.thien.vinh.lazymining.Fragment;


import android.os.Bundle;
import android.support.annotation.Nullable;
import android.support.v4.app.Fragment;
import android.text.SpannableString;
import android.text.style.UnderlineSpan;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import com.thien.vinh.lazymining.R;


/**
 * Fragment class for each nav menu item
 */
public class ContactFragment extends Fragment {

    private TextView tvEmail;
    private TextView tvFb;
    public static Fragment newInstance() {
        Fragment frag = new ContactFragment();
        return frag;
    }


    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_contact, container, false);
    }

    @Override
    public void onViewCreated(View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        tvEmail = view.findViewById(R.id.tv_email);
        tvFb = view.findViewById(R.id.tv_facebook);
        setUnderlineText("vinh.thien0301@gmail.com",tvEmail);
        setUnderlineText("Lazy Mining",tvFb);
    }

    private void setUnderlineText(String text,TextView tv){
        String mystring=new String(text);
        SpannableString content = new SpannableString(mystring);
        content.setSpan(new UnderlineSpan(), 0, mystring.length(), 0);
        tv.setText(content);
    }
    @Override
    public void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
    }
}
