package com.thien.vinh.lazymining.Object;

/**
 * Created by doanngocduc on 1/23/18.
 */

public class MinerObject {
    private String speedAmout;
    private String share;
    private String reject;
    private String workTime;
    private String mine_hole;
    private String name;
    private String ip;
    public MinerObject(){
        setSpeedAmout("");
        setShare("");
        setReject("");
        setWorkTime("");
        setMine_hole("");
        setName("");
        setIp("");
    }
    public MinerObject(String name, String ip,String speedAmout, String share, String reject, String workTime, String mine_hole){
        setSpeedAmout(speedAmout);
        setShare(share);
        setReject(reject);
        setWorkTime(workTime);
        setMine_hole(mine_hole);
        setName(name);
        setIp(ip);
    }


    public String getSpeedAmout() {
        return speedAmout;
    }

    public void setSpeedAmout(String speedAmout) {
        this.speedAmout = speedAmout;
    }

    public String getShare() {
        return share;
    }

    public void setShare(String share) {
        this.share = share;
    }

    public String getReject() {
        return reject;
    }

    public void setReject(String reject) {
        this.reject = reject;
    }

    public String getWorkTime() {
        return workTime;
    }

    public void setWorkTime(String workTime) {
        this.workTime = workTime;
    }

    public String getMine_hole() {
        return mine_hole;
    }

    public void setMine_hole(String mine_hole) {
        this.mine_hole = mine_hole;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getIp() {
        return ip;
    }

    public void setIp(String ip) {
        this.ip = ip;
    }
}
