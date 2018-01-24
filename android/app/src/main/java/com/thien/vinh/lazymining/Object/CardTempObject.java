package com.thien.vinh.lazymining.Object;

/**
 * Created by doanngocduc on 1/24/18.
 */

public class CardTempObject {
    private String temp;
    private String percent;

    public CardTempObject(String temp,String percent){
        setPercent(percent);
        setTemp(temp);
    }
    public String getTemp() {
        return temp;
    }

    public void setTemp(String temp) {
        this.temp = temp;
    }

    public String getPercent() {
        return percent;
    }

    public void setPercent(String percent) {
        this.percent = percent;
    }
}
