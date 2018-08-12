import configJson from '../config.json';

class Constant {
    static LoginState = {
        SUCCESS: "SUCC_LOGIN",
        ERROR_INVALID_AUTH: "ERRO_INVALID_AUTH",
        ERRO_TOKEN_NOT_EXIST:  "ERRO_TOKEN_NOT_EXIST"

    };
    static SignUpState = {
        SUCCESS: "SUCC_SIGNUP",
        ERROR_ACCOUNT_EXISTING: "ERRO_ACCOUNT_EXISTING"
    };
    static SignOutState = {
        SUCCESS: "SUCC_LOGOUT"
    };

    static SUCC_EXEC = {
        SUCCESS: "SUCC_EXEC"
    };

    static GET_MINER_CONFIG = {
        ERRO_TOKEN_NOT_EXIST:  "ERRO_TOKEN_NOT_EXIST"
    };

    static SUCC_UPDATE_RIG_MACHINE = {
        SUCC_UPDATE_RIG_MACHINE: "SUCC_UPDATE_RIG_MACHINE",
        ERRO_TOKEN_NOT_EXIST:  "ERRO_TOKEN_NOT_EXIST"

    };

    static DownloadLinkState = {
        SUCCESS: "SUCC_DOWNLOAD_LINK",
        ERROR_FILE_NOT_FOUND: "ERRO_FILE_NOT_FOUND"
    };

    static RunBatchState = {
        SUCCESS: "SUCC_RUN_BATCH",
        ERROR_FILE_NOT_FOUND: "ERRO_FILE_NOT_FOUND"
    };

    static GetCoinsCanBeMiningState = {
        SUCCESS: "SUCC_GET_COINS_CAN_BE_MINING"
    };

    static XmrStakInfoState = {
        SUCCESS: "SUCC_XMR_STAK_INFO",
        ERROR_FILE_NOT_FOUND: "ERRO_FILE_NOT_FOUND"
    };


    static baseUrl = "http://" + configJson.server_monitor.host + ":" + configJson.server_monitor.port + "/api/";

    static getLoginString(email, pw, info,machine_id,ip) {
        return Constant.baseUrl + "rig_login?email=" + email + "&password=" +
            pw +"&sysInfo="+encodeURIComponent(info)+"&machine_id="+machine_id+"&ip="+ip;
    }

    static getForgorPasswordString() {
        return Constant.baseUrl + "forgot_password_user";
    }

    static getSignUpString(email, pw, info,machine_id,ip) {
        return Constant.baseUrl + "rig_signup?email=" + email + "&password=" +
            pw+"&sysInfo="+info+"&machine_id="+machine_id+"&ip="+ip;
    }

    static getCheckUpdateString(version,machine_id,token) {
        return Constant.baseUrl + "rig_check_update?version=" + version + "&machine_id=" +
            machine_id+ "&token=" +
            token;
    }

    static getSubmitMinerConfigString(email, name, auto_start, coins_related,
                                        pool, wallet, machine_id) {
        return Constant.baseUrl + "rig_submit_config_info?email=" + email + "&name=" +
            name + "&auto_start=" + auto_start + "&coins_related=" + coins_related
            + "&pool=" + pool + "&wallet=" + wallet + "&machine_id=" + machine_id;
    }

    static getMinerConfigString(machine_id) {
        return Constant.baseUrl + "get_rig_info?machine_id="+machine_id;
    }

    static getLogoutString(token) {
        return Constant.baseUrl + "rig_logout?token=" + token;

    }

    static getLatestDownloadLinkString(software) {
        return Constant.baseUrl + "rig_download_link?software=" + software + "&latest=1";
    }

    static getLatestDownloadLinkString(software,version) {
        return Constant.baseUrl + "rig_download_link?software=" + software + "&version="+ version;
    }

    static getSoftwareDownloadString(software,version,name) {
        return Constant.baseUrl + "rig_download_link?software=" + software + "&name=" + name + "&version=" + version;
    }

    static getAllSoftwareDownloadLinksString(platform, machineID, email, token) {
        return Constant.baseUrl + "rig_get_all_download_links?platform=" + platform + "&machine_id=" + machineID + "&email=" + email + "&token=" + token;
    }

    static getRigConfigWithMachineIDString(machineID,email,platform,token) {
        return Constant.baseUrl + "rig_get_config?machine_id=" + machineID
            +"&email="+email+"&platform="+platform+"&token="+token;
    }

    static validateRigTokenDesktop(token) {
        return Constant.baseUrl + "validate_rig_token_desktop?token="+token;
    }

    static submitRootDirDownloadedString(machineID, softwareDownloadLinkID, rootDir) {
        return Constant.baseUrl + "rig_submit_root_dir_downloaded?machine_id=" + machineID + "&software_download_link_id=" + softwareDownloadLinkID + "&root_dir=" + rootDir;
    }


    static getRunBatchString(platform, machine_id, email, token) {
        return Constant.baseUrl + "rig_run_batch?platform=" + platform+"&machine_id="+machine_id+"&email="+email+"&token="+token;
    }

    static getXmrStakInfo(port) {
        return "http://localhost:" + port + "/api.json";
    }

}

export default Constant;