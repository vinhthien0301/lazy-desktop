package com.thien.vinh.lazymining.Adapter;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.LinearLayout;
import android.widget.ListView;
import android.widget.TextView;

import com.thien.vinh.lazymining.Object.CardTempObject;
import com.thien.vinh.lazymining.Object.MinerObject;
import com.thien.vinh.lazymining.R;
import com.thien.vinh.lazymining.Utility.Enum;
import com.thien.vinh.lazymining.Utility.Utility;

import java.util.ArrayList;

/**
 * Created by doanngocduc on 1/23/18.
 */

public class ManageFragmentCardAdapter extends ArrayAdapter<CardTempObject> implements View.OnClickListener{

    private ArrayList<CardTempObject> dataSet;
    Context mContext;

    // View lookup cache
    private static class ViewHolder {
        TextView txtCardTemp;

    }

    public ManageFragmentCardAdapter(ArrayList<CardTempObject> data, Context context) {
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
        CardTempObject dataModel = getItem(position);
        // Check if an existing view is being reused, otherwise inflate the view
        ViewHolder viewHolder; // view lookup cache stored in tag

        final View result;

        if (convertView == null) {

            viewHolder = new ViewHolder();
            LayoutInflater inflater = LayoutInflater.from(getContext());
            convertView = inflater.inflate(R.layout.fragment_manage_list_item_card, parent, false);
            viewHolder.txtCardTemp = (TextView) convertView.findViewById(R.id.txt_card_temp);
            result=convertView;
            convertView.setTag(viewHolder);
        } else {
            viewHolder = (ViewHolder) convertView.getTag();
            result=convertView;
        }
        viewHolder.txtCardTemp.setText("GPU"+position+" "+"("+dataModel.getTemp()+"C - "+dataModel.getPercent()+"%)");

        // Return the completed view to render on screen
        return convertView;
    }


}