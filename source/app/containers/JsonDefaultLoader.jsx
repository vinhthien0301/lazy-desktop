import { remote } from 'electron';

var packageJson = require('../../package.json');


export default class JsonDefaultLoader {
    static DOWNLOAD_STATE_DOWNLOADING = "DOWNLOAD_STATE_DOWNLOADING";
    static DOWNLOAD_STATE_FAIL = "DOWNLOAD_STATE_FAIL";
    static DOWNLOAD_STATE_SUCC = "DOWNLOAD_STATE_SUCC";
    static CLAYMORES_SOFTWARE = "CLAYMORE";
    static XMR_STAK_SOFTWARE = "XMR-STAK";
    static LOL_MINER_SOFTWARE = "LOLMINER";
    static SG_MINER_SM_SOFTWARE = "SGMiner-GM";


    static getDataFile(filename) {
        // var appName = remote.app.getName();
        var appName = packageJson.productName;
        var appData  = remote.app.getPath('appData');
        var file = appData+"/"+appName+"/"+(filename ? filename : "");
        return file;
    }

}
