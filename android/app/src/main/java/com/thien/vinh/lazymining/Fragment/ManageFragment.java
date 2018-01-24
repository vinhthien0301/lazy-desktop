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

import com.thien.vinh.lazymining.Adapter.ManageFragmentMinerAdapter;
import com.thien.vinh.lazymining.LocalData.SharePreference;
import com.thien.vinh.lazymining.Object.CardTempObject;
import com.thien.vinh.lazymining.Object.MinerObject;
import com.thien.vinh.lazymining.R;
import com.thien.vinh.lazymining.Service.ApiService;
import com.thien.vinh.lazymining.Utility.Enum;
import com.thien.vinh.lazymining.Utility.Utility;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Iterator;

import cz.msebera.android.httpclient.Header;


/**
 * Fragment class for each nav menu item
 */
public class ManageFragment extends Fragment {


    private View mContent;
    private TextView mTextView;
    private ListView lvMiner;
    private TextView tvTime;
    private ArrayList<MinerObject> minerObjectArrayList;
    private ManageFragmentMinerAdapter adapter;

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
        minerObjectArrayList = new ArrayList<>();
        adapter = new ManageFragmentMinerAdapter(minerObjectArrayList, getActivity());
        lvMiner.setAdapter(adapter);
        loadRig();
        startCountDown();
    }

    private void loadRig() {
        String text = SharePreference.getAuth(getActivity());
        try {
            JSONObject obj = new JSONObject(text);
            String email = obj.getString("email");
            String token = obj.getString("token");
            ApiService.load(email, token, new ApiService.Callback() {
                @Override
                public void onSuccess(int statusCode, Header[] headers, JSONObject response) {
                    try {
                        String responseCode = response.getString("response_code");
                        if (responseCode.equals(Enum.SUCC_MINERS)) {
                            minerObjectArrayList.clear();
                            JSONObject minerArray = response.getJSONObject("data").getJSONObject("miners");

                            try {
                                Iterator<String> temp = minerArray.keys();
                                while (temp.hasNext()) {
                                    String key = temp.next();
                                    Object value = minerArray.get(key);
                                    updateRig((JSONObject) value);
                                }
                            } catch (JSONException e) {
                                e.printStackTrace();
                            }
                            adapter.notifyDataSetChanged();
                        } else {
                            Utility.showToast(getActivity(), "không thể lấy thông tin");
                        }

                    } catch (JSONException e) {
                        Utility.showToast(getActivity(), "Không thể parse Json");
                    }
                }

                @Override
                public void onFailure(int statusCode, Header[] headers, String res, Throwable t) {

                }
            });
        } catch (JSONException e) {

        }


    }


    private void updateRig(JSONObject minerObj) {
        try {
            String email = minerObj.getString("email");
            String local_ip = minerObj.getString("local_ip");
            String main_coin = minerObj.getString("main_coin");
            String main_coin_hr = minerObj.getString("main_coin_hr");
            String main_speed_unit = minerObj.getString("main_speed_unit");
            Integer mining_info_ready = minerObj.getInt("mining_info_ready");
            String name = minerObj.getString("name");
            String pools = minerObj.getString("pools");
            String show_mode = minerObj.getString("show_mode");
            String sub_coin = minerObj.getString("sub_coin");
            String sub_coin_hr = minerObj.getString("sub_coin_hr");
            String sub_speed_unit = minerObj.getString("sub_speed_unit");
            String temps = minerObj.getString("temps");
            String total_main_speed = minerObj.getString("total_main_speed");
            String total_sub_speed = minerObj.getString("total_sub_speed");
            String uptime = minerObj.getString("uptime");
            String ver = minerObj.getString("ver");
            String working_status = minerObj.getString("working_status");
            String warning_message = minerObj.getString("warning_message");
            String machine_id = minerObj.getString("machine_id");
            String public_ip = minerObj.getString("public_ip");
            MinerObject obj = new MinerObject();

            obj.setIp(public_ip + " (local: " + local_ip + ")");
            obj.setWorkStatus(working_status);
            obj.setWarningMessage(warning_message);
            if (working_status.equals(Enum.WORKING_STATUS_WORKING)) {
                String share = main_coin.split(";")[1];
                String reject = main_coin.split(";")[2];
                obj.setName(name + " - (" + getCoinSpeedNb(main_coin_hr) + " VGA)");
                obj.setMine_hole(pools);
                obj.setWorkTime(uptime);
                obj.setShare(share);
                obj.setReject(reject);
                String x = main_coin.split(";")[0];
                String last = x.substring(x.length()-3, x.length());
                String first = x.substring(0, x.length()-3);
                obj.setSpeedAmout(first+","+last+ " Mh/s");
                String[] array = temps.split(";");
                ArrayList<CardTempObject> cardArray = new ArrayList<>();
                for (int index = 0; index < array.length; index += 2) {
                    String temp = array[index];
                    String percent = "";
                    if (index < (array.length - 1)) {
                        percent = array[index + 1];
                    }
                    cardArray.add(new CardTempObject(temp, percent));
                }
                obj.setVgaArray(cardArray);
            }else {
                obj.setName(name);
            }
            minerObjectArrayList.add(obj);
        } catch (JSONException e) {

        }
    }

    public int getCoinSpeedNb(String coinSpeedString) {
        return coinSpeedString.split(";").length;
    }

    private void startCountDown() {
        new CountDownTimer(10000, 1000) {

            public void onTick(long millisUntilFinished) {
                tvTime.setText("" + millisUntilFinished / 1000 + " giây");
            }

            public void onFinish() {
                loadRig();
                this.start();
            }
        }.start();
    }

    @Override
    public void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
    }
}
