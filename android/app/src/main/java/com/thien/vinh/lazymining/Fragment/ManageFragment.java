package com.thien.vinh.lazymining.Fragment;


import android.os.Bundle;
import android.os.CountDownTimer;
import android.support.annotation.Nullable;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ListView;
import android.widget.TextView;

import com.thien.vinh.lazymining.Adapter.ManageFragmentManageAdapter;
import com.thien.vinh.lazymining.Object.MinerObject;
import com.thien.vinh.lazymining.R;

import java.util.ArrayList;


/**
 * Fragment class for each nav menu item
 */
public class ManageFragment extends Fragment {


    private View mContent;
    private TextView mTextView;
    private ListView lvMiner;
    private TextView tvTime;
    private ArrayList<MinerObject> minerObjectArrayList ;
    private static ManageFragmentManageAdapter adapter;
    public static Fragment newInstance() {
        Fragment frag = new ManageFragment();
        return frag;
    }


    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_manage, container, false);
    }

    @Override
    public void onViewCreated(View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);


        // initialize views
        mContent = view.findViewById(R.id.fragment_content);
        mTextView = (TextView) view.findViewById(R.id.text);
        tvTime = (TextView) view.findViewById(R.id.tv_time);
        lvMiner = (ListView) view.findViewById(R.id.lv_miner);
        minerObjectArrayList  = new ArrayList<>();
        for(int index = 0; index < 10; index ++){
            MinerObject obj = new MinerObject();
            obj.setName("Thien0"+index+" - (7 VGA)");
            obj.setIp("27.78.12.45 (local: 192.168.1.1)");
            obj.setReject("0");
            obj.setShare("3");
            obj.setWorkTime(" 10 phút");
            obj.setMine_hole("asia1.ethermine.org:14444");
            minerObjectArrayList.add(obj);
        }
        adapter= new ManageFragmentManageAdapter(minerObjectArrayList,getActivity());

        lvMiner.setAdapter(adapter);
        startCountDown();
    }

    private void startCountDown(){
        new CountDownTimer(10000, 1000) {

            public void onTick(long millisUntilFinished) {
                tvTime.setText(""+millisUntilFinished / 1000);
            }

            public void onFinish() {
                this.start();
            }
        }.start();
    }

    @Override
    public void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
    }
}
