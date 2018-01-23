package com.thien.vinh.lazymining.Adapter;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.TextView;

import com.thien.vinh.lazymining.Object.MinerObject;
import com.thien.vinh.lazymining.R;

import java.util.ArrayList;

/**
 * Created by doanngocduc on 1/23/18.
 */

public class ManageFragmentManageAdapter extends ArrayAdapter<MinerObject> implements View.OnClickListener{

    private ArrayList<MinerObject> dataSet;
    Context mContext;

    // View lookup cache
    private static class ViewHolder {
        TextView txtName;
        TextView txtShare;
        TextView txtIp;
        TextView txtSpeed;
        TextView txtReject;
        TextView txtWorkTime;
        TextView txtMineHole;
    }

    public ManageFragmentManageAdapter(ArrayList<MinerObject> data, Context context) {
        super(context, R.layout.fragment_manage_list_item, data);
        this.dataSet = data;
        this.mContext=context;
    }

    @Override
    public void onClick(View v) {

//        int position=(Integer) v.getTag();
//        Object object= getItem(position);
//        DataModel dataModel=(DataModel)object;
//
//        switch (v.getId())
//        {
//            case R.id.item_info:
//                Snackbar.make(v, "Release date " +dataModel.getFeature(), Snackbar.LENGTH_LONG)
//                        .setAction("No action", null).show();
//                break;
//        }
    }

    private int lastPosition = -1;

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        // Get the data item for this position
        MinerObject dataModel = getItem(position);
        // Check if an existing view is being reused, otherwise inflate the view
        ViewHolder viewHolder; // view lookup cache stored in tag

        final View result;

        if (convertView == null) {

            viewHolder = new ViewHolder();
            LayoutInflater inflater = LayoutInflater.from(getContext());
            convertView = inflater.inflate(R.layout.fragment_manage_list_item, parent, false);
            viewHolder.txtName = (TextView) convertView.findViewById(R.id.txt_name);
            viewHolder.txtIp = (TextView) convertView.findViewById(R.id.txt_ip);
            viewHolder.txtReject = (TextView) convertView.findViewById(R.id.txt_reject);
            viewHolder.txtShare = (TextView) convertView.findViewById(R.id.txt_share);
            viewHolder.txtSpeed = (TextView) convertView.findViewById(R.id.txt_speed);
            viewHolder.txtMineHole = (TextView) convertView.findViewById(R.id.txt_mine_hole);
            viewHolder.txtWorkTime = (TextView) convertView.findViewById(R.id.txt_work_time);

            result=convertView;

            convertView.setTag(viewHolder);
        } else {
            viewHolder = (ViewHolder) convertView.getTag();
            result=convertView;
        }

        lastPosition = position;

        viewHolder.txtName.setText(dataModel.getName());
        viewHolder.txtIp.setText(dataModel.getIp());
        viewHolder.txtReject.setText(dataModel.getReject());
        viewHolder.txtShare.setText(dataModel.getShare());
        viewHolder.txtSpeed.setText(dataModel.getSpeedAmout());
        viewHolder.txtMineHole.setText(dataModel.getMine_hole());
        viewHolder.txtWorkTime.setText(dataModel.getWorkTime());
        // Return the completed view to render on screen
        return convertView;
    }
}