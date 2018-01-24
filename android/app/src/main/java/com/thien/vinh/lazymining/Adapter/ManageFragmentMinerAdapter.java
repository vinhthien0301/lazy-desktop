package com.thien.vinh.lazymining.Adapter;

import android.content.Context;
import android.support.v4.content.ContextCompat;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.LinearLayout;
import android.widget.ListAdapter;
import android.widget.ListView;
import android.widget.TextView;

import com.thien.vinh.lazymining.Object.MinerObject;
import com.thien.vinh.lazymining.Utility.Enum;
import com.thien.vinh.lazymining.R;
import com.thien.vinh.lazymining.Utility.Utility;

import java.util.ArrayList;

/**
 * Created by doanngocduc on 1/23/18.
 */

public class ManageFragmentMinerAdapter extends ArrayAdapter<MinerObject> implements View.OnClickListener{

    private ArrayList<MinerObject> dataSet;
    private Context mContext;


    // View lookup cache
    private class ViewHolder {
        TextView txtName;
        TextView txtShare;
        TextView txtIp;
        TextView txtSpeed;
        TextView txtReject;
        TextView txtWorkTime;
        TextView txtMineHole;
        TextView txtWarningMessage;
        LinearLayout lnSpeed;
        LinearLayout lnShare;
        LinearLayout lnMineHole;
        LinearLayout lnTimeWork;
        LinearLayout lnCardTemp;
        LinearLayout lnMain;
        ListView lvCardTemp;
    }

    public ManageFragmentMinerAdapter(ArrayList<MinerObject> data, Context context) {
        super(context, R.layout.fragment_manage_list_item, data);
        this.dataSet = data;
        this.mContext=context;
    }

    @Override
    public void onClick(View v) {
    }


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
            viewHolder.txtWarningMessage = (TextView) convertView.findViewById(R.id.txt_warning_message);
            viewHolder.lnSpeed = (LinearLayout) convertView.findViewById(R.id.ln_speed);
            viewHolder.lnShare = (LinearLayout) convertView.findViewById(R.id.ln_share);
            viewHolder.lnTimeWork = (LinearLayout) convertView.findViewById(R.id.ln_time_work);
            viewHolder.lnMineHole = (LinearLayout) convertView.findViewById(R.id.ln_mine_hole);
            viewHolder.lnCardTemp = (LinearLayout) convertView.findViewById(R.id.ln_card_temp);
            viewHolder.lnMain = (LinearLayout) convertView.findViewById(R.id.ln_main);
            viewHolder.lvCardTemp = (ListView) convertView.findViewById(R.id.lv_card);

            result=convertView;

            convertView.setTag(viewHolder);
        } else {
            viewHolder = (ViewHolder) convertView.getTag();
            result=convertView;
        }
        refreshColorUI(viewHolder);
        viewHolder.txtName.setText(dataModel.getName());
        viewHolder.txtIp.setText(dataModel.getIp());
        switch (dataModel.getWorkStatus()){
            case Enum.WORKING_STATUS_WORKING:
                showUI(viewHolder);
                viewHolder.txtReject.setText(dataModel.getReject());
                viewHolder.txtShare.setText(dataModel.getShare());
                viewHolder.txtSpeed.setText(dataModel.getSpeedAmout());
                viewHolder.txtMineHole.setText(dataModel.getMine_hole());
                viewHolder.txtWorkTime.setText(dataModel.getWorkTime());
                ManageFragmentCardAdapter adapter = new ManageFragmentCardAdapter(dataModel.getVgaArray(), mContext);
                viewHolder.lvCardTemp.setAdapter(adapter);
                setListViewHeightBasedOnChildren(viewHolder.lvCardTemp);
                break;
            case Enum.WORKING_STATUS_WARNING:
                setViewToWarningMiner(viewHolder,dataModel);
                break;
            case Enum.WORKING_STATUS_STOPPED:
                setViewToStoppedMiner(viewHolder,dataModel);
                break;
        }

        // Return the completed view to render on screen
        return convertView;
    }

    private void refreshColorUI(ViewHolder viewHolder){
        showUI(viewHolder);
        viewHolder.txtWarningMessage.setVisibility(View.GONE);
        viewHolder.lnMain.setBackgroundColor(Utility.getColorFromResource(mContext,R.color.fragment_manage_list_item_background));
        viewHolder.txtName.setTextColor(Utility.getColorFromResource(mContext,R.color.colorWhite));
        viewHolder.txtIp.setTextColor(Utility.getColorFromResource(mContext,R.color.colorWhite));
        viewHolder.lnCardTemp.setVisibility(View.VISIBLE);
    }
    private void setViewToStoppedMiner(ViewHolder viewHolder,MinerObject dataModel){
        if(dataModel.getWarningMessage().length() > 0){
            viewHolder.txtWarningMessage.setVisibility(View.VISIBLE);
            viewHolder.txtWarningMessage.setText(dataModel.getWarningMessage());
        }
        viewHolder.txtName.setTextColor(Utility.getColorFromResource(mContext,R.color.text_green));
        viewHolder.txtIp.setTextColor(Utility.getColorFromResource(mContext,R.color.text_green));
        viewHolder.lnMain.setBackgroundColor(Utility.getColorFromResource(mContext,R.color.color_e));
        hideUI(viewHolder);
    }

    private void setViewToWarningMiner(ViewHolder viewHolder,MinerObject dataModel){
        if(!dataModel.getWarningMessage().equals("") || dataModel.getWarningMessage().length() > 0){
            viewHolder.txtWarningMessage.setVisibility(View.VISIBLE);
            viewHolder.txtWarningMessage.setText(dataModel.getWarningMessage());
        }
        viewHolder.lnMain.setBackgroundColor(Utility.getColorFromResource(mContext,R.color.color_d));
        hideUI(viewHolder);
    }
    public void setListViewHeightBasedOnChildren(ListView listView) {
        ListAdapter listAdapter = listView.getAdapter();
        if (listAdapter == null)
            return;

        int desiredWidth = View.MeasureSpec.makeMeasureSpec(listView.getWidth(), View.MeasureSpec.UNSPECIFIED);
        int totalHeight = 0;
        View view = null;
        for (int i = 0; i < listAdapter.getCount(); i++) {
            view = listAdapter.getView(i, view, listView);
            if (i == 0)
                view.setLayoutParams(new ViewGroup.LayoutParams(desiredWidth, ViewGroup.LayoutParams.WRAP_CONTENT));
            view.measure(desiredWidth, View.MeasureSpec.UNSPECIFIED);
            totalHeight += view.getMeasuredHeight();
        }
        ViewGroup.LayoutParams params = listView.getLayoutParams();
        params.height = totalHeight + (listView.getDividerHeight() * (listAdapter.getCount() - 1));
        listView.setLayoutParams(params);
        listView.requestLayout();
    }

    private void hideUI(ViewHolder viewHolder){
        viewHolder.lnSpeed.setVisibility(View.GONE);
        viewHolder.lnShare.setVisibility(View.GONE);
        viewHolder.lnMineHole.setVisibility(View.GONE);
        viewHolder.lnTimeWork.setVisibility(View.GONE);
        viewHolder.lnCardTemp.setVisibility(View.GONE);
    }

    private void showUI(ViewHolder viewHolder){
        viewHolder.lnSpeed.setVisibility(View.VISIBLE);
        viewHolder.lnShare.setVisibility(View.VISIBLE);
        viewHolder.lnMineHole.setVisibility(View.VISIBLE);
        viewHolder.lnTimeWork.setVisibility(View.VISIBLE);
        viewHolder.lnCardTemp.setVisibility(View.VISIBLE);
    }
}