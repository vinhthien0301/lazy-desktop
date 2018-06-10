import React from "react";

import MinerOperation from './../MinerOperation.jsx';


export default class SoftwareInterface extends React.Component {

    onDownloadClicked(item) {
        this.props.onDownloadClicked(item);
    }

    onBrowse(item, machineID) {
        const {dialog} = require('electron').remote;

        dialog.showOpenDialog({properties: ['openDirectory']}, function (files) {
            if (!files) { // cancel
                return;
            }

            var newDir = files[0];

            MinerOperation.submitRootDirDownloaded(machineID, item.id, newDir);

        });
    }

    getDir(item, rootDirs){
        if(rootDirs.length > 0){
            for(var index = 0;index < rootDirs.length;index++){
                if(rootDirs[index].download_link_id == item.id){
                    return rootDirs[index].root_dir;
                }
            }
            return 'Không có';
        }else {
            return 'Không có';
        }
    }

    getState(item, rootDirs, downloadingSoftware) {
        if (downloadingSoftware) {
            if (downloadingSoftware.length > 0) {
                for (var index = 0; index < downloadingSoftware.length; index++) {
                    if (item.software == downloadingSoftware[index].software
                            && item.version == downloadingSoftware[index].version) {
                        return "Đang tải";
                    }
                }
            }
        }
        if (item == null) {
            return "Chưa được tải về.";
        }
        for (var index = 0; index < rootDirs.length; index++) {
            if (rootDirs[index].download_link_id == item.id) {
                if (!rootDirs[index].root_dir) {
                    return "Chưa được tải về";
                }
                return "Đã tải và sẵn sàng sử dụng."
            }
        }
        return "Chưa được tải về.";


    }

    onShow(item, machineID, rootDirs) {

        const shell = require('electron').shell;

        for (var index = 0; index < rootDirs.length; index++) {
            if (rootDirs[index].download_link_id == item.id
                && rootDirs[index].machine_id == machineID) {
                shell.showItemInFolder(rootDirs[index].root_dir);
                return;
            }
        }
        alert("Đường dẫn không tồn tại.");
    }
}

