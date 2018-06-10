import React from "react";
import { Window, Content, PaneGroup ,Pane } from "react-photonkit";
import Monitor from "./Monitor.jsx";
import Config from "./Config.jsx";
import XmrStakSetup from "./softwareComponent/XmrStakSetup.jsx";
import ClaymoresSetup from "./softwareComponent/ClaymoresSetup.jsx";
import LolMinerSetup from "./softwareComponent/LolMinerSetup.jsx";
import SGMinerSMSetup from "./softwareComponent/SGMinerSMSetup.jsx";
import publicIP from 'react-native-public-ip';
import EnumCompare from './EnumCompare.jsx';

import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import Sidebar from "./Sidebar.jsx";

import JsonDefaultLoader from './JsonDefaultLoader.jsx';
import MinerOperation from './MinerOperation.jsx';

import minersJson from '../miners.json';
import configJson from '../config.json';

var LogStateEnum = {
    WORK_GOOD: "work_good",
    WARNING: "warn",
    ERROR: "error",
    DEBUG: "debug"
};

var express = require('express');
var favicon = require('serve-favicon');
//
var exec = window.require('electron').remote.require('child_process').exec;

var io = require('socket.io-client');
var net = require('net');
var moment = require('moment');
require("moment-duration-format");
var quickLocalIP = require('quick-local-ip');
var ip = require('ip');
var localIp = ip.address(); // my ip address
var si = require('systeminformation');
var tempM;
var tempObj;
var alreadySubmitCardInfo = false;
var packageJson = require('../../package.json');
import {machineIdSync} from 'node-machine-id';
import ButterToast, { CinnamonSugar } from 'butter-toast';

import electron from 'electron';
import Constant from './EnumCompare';
import axios from 'axios';
var os = require('os');


var claymoresInterval;
var xmrStakInterval;

var thiz;

export default class AppContainer extends React.Component {

    constructor(props) {
        super(props);
        thiz = this;

        var miners = [{name: "example"}];
        miners.json = [];

        thiz.stepOne = false;
        thiz.stepTwo = false;
        thiz.toastArray = [];
        thiz.global_token = localStorage.getItem('token');
        this.state = {
            mainViewIndex: 1,
            claymoreActiveDownloading: true,
            miners: miners,
            change: 1,
            machineConfigs: [],
            runBatches: [],
            softwareDownloadLinks: [],
            rootDirs: [],
            downloadingSoftware: [],
            needConfigUpdate: true
        };
        thiz.startOperation();

        setTimeout(function() {

            thiz.checkUpdate();
        }, 2000);

    }

    fetchAllDataFromServer(callback) {
        let machine_id = machineIdSync({original: true});
        var email = localStorage.getItem('email');
        var platform = MinerOperation.getPlatform(process.platform);
        MinerOperation.loadMinersConfig(minersJson.miners, machine_id, email, platform, thiz.global_token, function (response_code,machines,description) {
            if(response_code == EnumCompare.GET_MINER_CONFIG.ERRO_TOKEN_NOT_EXIST){
                thiz.signOut();
                return;
            }

            MinerOperation.loadAllSoftwareDownloadLinks(machine_id, email, thiz.global_token, function (response_code_a,softwareJsonA,description) {
                if(response_code_a == EnumCompare.GET_MINER_CONFIG.ERRO_TOKEN_NOT_EXIST){
                    thiz.signOut();
                    return;
                }
                if (machines[0].auto_start == 0) {
                    machines[0].auto_start = false;
                } else {
                    machines[0].auto_start = true;
                }

                var dataChoice = MinerOperation.loadSoftwareOptionsAndCommand(
                    machines[0],
                    softwareJsonA.data.runBatches,
                    softwareJsonA.data.downloadLinks
                ); // this wont save online
                machines[0].software = dataChoice.software;
                machines[0].command = dataChoice.command;
                machines[0].downloadLinkID = dataChoice.downloadLinkID;

                callback(machines, softwareJsonA);
            });
        });
    };

    startOperation(){

        thiz.fetchAllDataFromServer(function(machines, softwareJsonA) {
            let machine_id = machineIdSync({original: true});
            var downloadLinkIDChoice = machines[0].downloadLinkID;
            var canStart = machines[0].auto_start;
            if (canStart) {
                for (var index = 0; index < softwareJsonA.data.rootDirs.length; index++) {
                    if (softwareJsonA.data.rootDirs[index].machine_id == machine_id
                        && softwareJsonA.data.rootDirs[index].download_link_id == downloadLinkIDChoice) {
                        thiz.startMiningSoftware(softwareJsonA.data.rootDirs[index].root_dir, machines[0]);
                        break;
                    }
                }
            }


            thiz.setState({
                softwareDownloadLinks: softwareJsonA.data.downloadLinks,
                rootDirs: softwareJsonA.data.rootDirs,
                runBatches: softwareJsonA.data.runBatches,
                machineConfigs: machines,
            }, function() {
                    thiz.startProcess(machines);

            });
        });



    }

    componentDidMount(){
        // nothing

    }

    checkUpdate(){
        let machine_id = machineIdSync({original: true});
        var version = packageJson.version;

        var url = Constant.getCheckUpdateString(version,machine_id,thiz.global_token);

        axios.post(url)
            .then(function (response) {
                if (response.data.response_code === Constant.SUCC_UPDATE_RIG_MACHINE.SUCC_UPDATE_RIG_MACHINE) {
                    if(response.data.data.needUpdate){
                        var url = response.data.data.url;
                        electron.ipcRenderer.send('update-new-version', url);
                        MinerOperation.killAllMinerSoftwares(thiz.state.softwareDownloadLinks);

                    }
                }else if(response.data.response_code === Constant.SUCC_UPDATE_RIG_MACHINE.ERRO_TOKEN_NOT_EXIST) {
                    thiz.signOut();
                }
            })
            .catch(function (error) {
               // alert("Lỗi không thể kiểm tra cập nhật");
            });
    }

    getCoinMiningOptions(callback) {
        var isWin = /^win/.test(process.platform);
        var isLinux = /^linux/.test(process.platform);
        var isMac = /^darwin/.test(process.platform);
        thiz.getRunBatches(isWin, isLinux, isMac, function(data) {
            if (callback) {
                callback(data);
            }

        });
    }



    startMiningSoftwareFromConfig(runCommand, downloadLinkID, machine){
        let machine_id = machineIdSync({original: true});
        var rootDir = "";
        for (var index = 0; index < thiz.state.rootDirs.length; index++) {
            if (thiz.state.rootDirs[index].machine_id == machine_id
                && thiz.state.rootDirs[index].download_link_id == downloadLinkID) {
                rootDir = thiz.state.rootDirs[index].root_dir;
                break;
            }
        }

        if (!rootDir || rootDir == "") {
            thiz.autoDownload(downloadLinkID, function(newRootDir) {
                thiz.startMiningSoftware(newRootDir, machine);
            });
        } else {
            thiz.startMiningSoftware(rootDir, machine);
        }

    }
    showToast(text,imageUrl,neesSticky){

        const toast = CinnamonSugar.fresh({
            theme: 'lite',
            image: imageUrl,
            title: 'Thông báo', // you can also add jsx code here!
            message: text, // you can also add jsx code here!
            toastTimeout: 4000
            // literally any font awesome 4.7 icon
            // you may also add here regular butter-toast options, such as toastTimeout,
            // name, sticky, etc..
        });

        ButterToast.raise(toast);

    }

    startMiningSoftware(rootDir, minerObj){
        var isWin = /^win/.test(process.platform);
        var isLinux = /^linux/.test(process.platform);
        var isMac = /^darwin/.test(process.platform);

        if (isWin) {

            MinerOperation.killAllMinerSoftwares(thiz.state.softwareDownloadLinks);
            MinerOperation.prepareConfigFile(rootDir, minerObj, thiz.state.softwareDownloadLinks, function() {
                setTimeout(function() {
                    exec(MinerOperation.getCommandRunSoftware(rootDir, minerObj.command, minerObj.port), function callback(error, stdout, stderr) {
                        if (error) {
                            thiz.autoDownload(function (newRootDir) {
                                thiz.startMiningSoftware(newRootDir, minerObj);
                            });
                            return;
                        }
                    });
                }, 1000);
            });

        } else if (isLinux) {
            exec('/Applications/TextEdit.app/Contents/MacOS/textedit', function callback(error, stdout, stderr) {
                console('asds');
            });
        } else if (isMac) {
            var command = minerObj.command;
            exec(MinerOperation.getCommandRunSoftware(rootDir, command, minerObj.port), function callback(error, stdout, stderr) {
                if (error) {
                    thiz.autoDownload(function(newRootDir) {
                        thiz.startMiningSoftware(newRootDir, minerObj);
                    });
                    return;
                }

            });
        }

    }

    autoDownload(downloadLinkID, callback) {
        if (downloadLinkID == null) {
            return;
        }

        for (var index = 0; index < thiz.state.softwareDownloadLinks.length; index++) {
            if (thiz.state.softwareDownloadLinks[index].id == downloadLinkID) {
                thiz.globalDownloadSoftware(thiz.state.softwareDownloadLinks[index], function(newRootDir) {
                    if (callback) {
                        callback(newRootDir);
                    }
                });
                break;
            }
        }


    }
    componentWillReceiveProps(nextProps) {
        // nothing
    }

    componentWillUpdate(){
        // nothing
    }

    componentDidUpdate(prevProps, prevState) {
        // nothing
    }

    shouldComponentUpdate(){
        return true;
    }

    addLogMachine(index, miner, logState, content) {
        if (miner.logs == null) {
            miner.logs = [];
        }
        miner.logs.push({
            name: miner.name,
            state: logState,
            content: content
        });
        var temp = thiz.state.data;
        thiz.state.miners[0] = miner;
        thiz.setState({
            miners: thiz.state.miners,
            changedIndex: index
        });

    }




    getRunBatches(isWin, isLinux, isMac, callback) {
        let machine_id = machineIdSync({original: true});

        var fileExt = "";
        var email = localStorage.getItem('email');
        var platformReq = MinerOperation.getPlatform(process.platform);
        if (isWin || isMac) {
            fileExt = ".bat";
        } else if (isLinux) {
            fileExt = ".sh";
        }
        var url = Constant.getRunBatchString(platformReq,machine_id,email,thiz.global_token);
        axios.post(url)
            .then(function (response) {
                if (response.data.response_code === Constant.RunBatchState.SUCCESS) {
                    if (response.data.data != undefined && response.data.data !== null) {
                        callback(response.data.data);
                    }

                } else if(response.data.response_code === EnumCompare.GET_MINER_CONFIG.ERRO_TOKEN_NOT_EXIST){
                    thiz.signOut();
                    //var info = "";
                    //if (response.data.response_code == Constant.RunBatchState.ERROR_FILE_NOT_FOUND) {
                    //    info = "";
                    //}
                    //
                    //thiz.setState({
                    //    messageInfo: info
                    //});
                }
            });

    }


    getCardInfo(callback1){

        var isWin = /^win/.test(process.platform);
        var isLinux = /^linux/.test(process.platform);
        var isMac = /^darwin/.test(process.platform);

        if(isWin){
            // exec("wmic PATH Win32_videocontroller GET description && wmic PATH Win32_videocontroller GET pnpdeviceid", function callback(error, stdout, stderr) {
            //     if (error) {
            //         alert("error "+error);
            //     }
            //     if(stdout){
            //         var array = stdout.split(/\r?\n/);
            //         var cardNameArray = [];
            //         var cardIdArray = [];
            //         var posName = -1;
            //         var posId = -1;
            //
            //         for(var index = 0; index < array.length; index ++){
            //             if(array[index].indexOf("Description") != -1){
            //                 posName = index;
            //                 continue;
            //             }else if(array[index].indexOf("PNPDeviceID") != -1){
            //                 posId = index;
            //                 continue;
            //             }
            //             if(posName > -1 && posId == -1 && array[index].replace(/\s/g, '').length > 0
            //                 && (array[index].indexOf("NVIDIA") != -1 || array[index].indexOf("Radeon") != -1)){
            //                 cardNameArray.push(array[index]);
            //             }
            //
            //             if(posId > -1 && array[index].replace(/\s/g, '').length > 0){
            //                 if(array[index-posId].indexOf("NVIDIA") != -1 || array[index-posId].indexOf("Radeon") != -1){
            //                     cardIdArray.push(array[index]);
            //                 }
            //             }
            //         }
            //         callback1({id: cardIdArray,name: cardNameArray});
            //
            //     }
            // });
        }else if(isLinux){

        }else if(isMac){

        }


    }

    startMonitor(m, c, index) {

        // stop previous monitors first (Claymores, XMR-STAK

        if (claymoresInterval != null) { // for Claymores
            clearInterval(claymoresInterval);
            claymoresInterval = null;
        }

        if (xmrStakInterval != null) { // for XMR-STAK
            clearInterval(xmrStakInterval);
            xmrStakInterval = null;
        }

        if (c.software == JsonDefaultLoader.CLAYMORES_SOFTWARE) {

            var connectData = function() {

                if (m.socket == null) {
                    // request Claymores for get miner information
                    m.socket = new net.Socket()

                        .on('connect', function () {
                            var req = '{"id":0,"jsonrpc":"2.0","method":"miner_getstat1"}';
                            ++m.reqCnt;

                            m.socket.write(req + '\n');
                            m.socket.setTimeout(m.timeout);
                        })
                        .on('timeout', function (e) {
                            publicIP().then(ip => {
                                thiz.addLogMachine(index, m, LogStateEnum.WARNING, 'Phần mềm '+JsonDefaultLoader.CLAYMORES_SOFTWARE+' bị đứng.');

                                m.socket.destroy();
                                let machine_id = machineIdSync({original: true});

                                thiz.state.miners.json[index] = {
                                    "name": m.name,
                                    "email": m.email,
                                    "local_ip": localIp,
                                    "public_ip": ip,
                                    "mining_info_ready": false,
                                    "warning": JsonDefaultLoader.CLAYMORES_SOFTWARE + " đang bị treo",
                                    "last_seen": c.last_seen ? c.last_seen : 'never',
                                    "machine_id": machine_id
                                };

                                if (m.serverSocket != null && m.serverSocket.connected) {
                                    m.serverSocket.emit('miner', JsonDefaultLoader.CLAYMORES_SOFTWARE, thiz.state.miners.json[index], thiz.global_token); // Submit miner info
                                }
                            });

                        })

                        .on('data', function (data) {

                            publicIP().then(ip => {
                                ++m.rspCnt;
                                //logger.trace(m.name + ': rsp[' + m.rspCnt + ']: ' + data.toString().trim());
                                c.last_seen = moment().format("YYYY-MM-DD HH:mm:ss");
                                m.socket.setTimeout(0);
                                var d = JSON.parse(data);
                                var totalMainSpeed = 0;
                                var mainSpeedUnit = "Mh/s";
                                var hashInfo = d.result[2].split(";");
                                if (hashInfo.length > 0) {
                                    totalMainSpeed = hashInfo[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1.");
                                }

                                var totalSubSpeed = 0;
                                var subSpeedUnit = "Mh/s";
                                var hashInfo = d.result[4].split(";");
                                if (hashInfo.length > 0) {
                                    totalSubSpeed = hashInfo[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1.");
                                }
                                let machine_id = machineIdSync({original: true})

                                var version = 0;
                                if (packageJson) {
                                    version = packageJson.version;
                                }
                                thiz.state.miners.json[index] = {
                                    "name": m.name,
                                    "email": m.email,
                                    "mining_info_ready": true,
                                    "uptime": moment.duration(parseInt(d.result[1]), 'minutes').format('d [ngày,] hh [giờ] mm [phút]'),
                                    "total_main_speed": totalMainSpeed,
                                    "main_speed_unit": mainSpeedUnit,
                                    "total_sub_speed": totalSubSpeed,
                                    "sub_speed_unit": subSpeedUnit,
                                    "main_coin": d.result[2],
                                    "sub_coin": d.result[4],
                                    "main_coin_hr": d.result[3],
                                    "sub_coin_hr": d.result[5],
                                    "temps": d.result[6],
                                    "pools": d.result[7],
                                    "ver": d.result[0],
                                    "warning": "",
                                    "local_ip": localIp,
                                    "public_ip": ip,
                                    "machine_id": machine_id,
                                    "version": version,
                                    "socket_id": m.serverSocket.id
                                };

                                var content = "Tổng tốc độ đào hiện tại là: " + totalMainSpeed + " " + mainSpeedUnit;
                                thiz.addLogMachine(index, m, LogStateEnum.WORK_GOOD, content);

                                if (m.serverSocket != null && m.serverSocket.connected) {
                                    m.serverSocket.emit('miner', JsonDefaultLoader.CLAYMORES_SOFTWARE, thiz.state.miners.json[index],thiz.global_token); // Submit miner info
                                }
                            });

                        })

                        .on('close', function () {
                            // nothing
                        })

                        .on('error', function (e) {

                            thiz.addLogMachine(index, m, LogStateEnum.WARNING, 'Không thể kết nối được vào ' + JsonDefaultLoader.CLAYMORES_SOFTWARE + '. Vui lòng khởi động ' + c.software + '.');
                            publicIP().then(ips => {
                                // console.log(ips);
                                //=> '47.122.71.234'
                                let machine_id = machineIdSync({original: true});
                                var version = 0;
                                if (packageJson) {
                                    version = packageJson.version;
                                }

                                thiz.state.miners.json[index] = {
                                    "name": m.name,
                                    "email": m.email,
                                    "mining_info_ready": false,
                                    "warning": JsonDefaultLoader.CLAYMORES_SOFTWARE + " chưa khởi động.",
                                    "last_seen": c.last_seen ? c.last_seen : 'never',
                                    "local_ip": localIp,
                                    "public_ip": ips,
                                    "machine_id": machine_id,
                                    "version": version,
                                    "socket_id": m.serverSocket.id
                                };

                                if (m.serverSocket != null && m.serverSocket.connected) {
                                    m.serverSocket.emit('miner', JsonDefaultLoader.CLAYMORES_SOFTWARE, thiz.state.miners.json[index]); // Submit miner info
                                }
                            });

                        });
                }
                m.socket.connect(m.port, m.host);
            };
            function poll() {
                if (claymoresInterval == null) {
                    claymoresInterval = setInterval(connectData, m.timeout);
                }
            }

            poll();
        }
        else if (c.software == JsonDefaultLoader.XMR_STAK_SOFTWARE) {
            var url = Constant.getXmrStakInfo(m.port);

            var connectData = function() {

                axios.post(url)
                    .then(function (response) {

                        if (!response || !response.data) {
                            return;
                        }

                        publicIP().then(ip => {
                            ++m.rspCnt;

                            var d = response.data;

                            var totalMainSpeed = d.hashrate.total[0] ? d.hashrate.total[0] : 0;
                            var mainSpeedUnit = "H/s";
                            var totalSubSpeed = 0;
                            var subSpeedUnit = "H/s";
                            var sharesGood = d.results.shares_good;
                            var sharesTotal = d.results.shares_total;
                            var sharesError = sharesTotal - sharesGood;
                            var pool = d.connection.pool;
                            var xmrStakVersion = d.version.split("/")[1];

                            var mainCoinHr = "";
                            var subCoinHr = "";
                            var temps = "";
                            var threads = d.hashrate.threads;
                            for (var index = 0; index < threads.length; index++) {
                                mainCoinHr += threads[index][0];
                                subCoinHr += "off";
                                temps += "off;off";
                                if (index < threads.length - 1) {
                                    mainCoinHr += ";";
                                    subCoinHr += ";";
                                    temps += ";"
                                }
                            }

                            let machine_id = machineIdSync({original: true});

                            var version = 0;
                            if (packageJson) {
                                version = packageJson.version;
                            }

                            thiz.state.miners.json[index] = {
                                "name": m.name,
                                "email": m.email,
                                "mining_info_ready": true,
                                "uptime": moment.duration(parseInt(d.connection.uptime), 'minutes').format('d [ngày,] hh [giờ] mm [phút]'),
                                "total_main_speed": totalMainSpeed,
                                "main_speed_unit": mainSpeedUnit,
                                "total_sub_speed": totalSubSpeed,
                                "sub_speed_unit": subSpeedUnit,
                                "main_coin": totalMainSpeed+";"+sharesGood+";"+sharesError,
                                "sub_coin": "0;0;0",
                                "main_coin_hr": mainCoinHr,
                                "sub_coin_hr": subCoinHr,
                                "temps": temps,
                                "pools": pool,
                                "ver": xmrStakVersion,
                                "warning": "",
                                "local_ip": localIp,
                                "public_ip": ip,
                                "machine_id": machine_id,
                                "version": version,
                                "socket_id": m.serverSocket.id
                            };
                            var content = "Tổng tốc độ đào hiện tại là: " + totalMainSpeed + " " + mainSpeedUnit;
                            thiz.addLogMachine(index, m, LogStateEnum.WORK_GOOD, content);

                            if (m.serverSocket != null && m.serverSocket.connected) {
                                m.serverSocket.emit('miner', JsonDefaultLoader.XMR_STAK_SOFTWARE, thiz.state.miners.json[index]); // Submit miner info
                            }
                        });

                    })
                    .catch(function (error) {
                        thiz.addLogMachine(index, m, LogStateEnum.WARNING, 'Không thể kết nối được vào '+JsonDefaultLoader.XMR_STAK_SOFTWARE+'. Vui lòng khởi động '+JsonDefaultLoader.XMR_STAK_SOFTWARE+'.');
                        publicIP().then(ips => {
                            // console.log(ips);
                            //=> '47.122.71.234'
                            let machine_id = machineIdSync({original: true});

                            var version = 0;
                            if (packageJson) {
                                version = packageJson.version;
                            }

                            thiz.state.miners.json[index] = {
                                "name": m.name,
                                "email": m.email,
                                "mining_info_ready": false,
                                "warning": JsonDefaultLoader.XMR_STAK_SOFTWARE+" chưa khởi động.",
                                "last_seen": c.last_seen ? c.last_seen : 'never',
                                "local_ip":localIp,
                                "public_ip": ips,
                                "machine_id" : machine_id,
                                "version": version,
                                "socket_id": m.serverSocket.id
                            };

                            if (m.serverSocket != null && m.serverSocket.connected) {
                                m.serverSocket.emit('miner', JsonDefaultLoader.XMR_STAK_SOFTWARE, thiz.state.miners.json[index]); // Submit miner info
                            }
                        });
                    });
            };

            function poll() {
                if (xmrStakInterval == null) {
                    xmrStakInterval = setInterval(connectData, m.timeout);
                }
            }

            poll();


        }
    }

    startProcess(minersConfigs) {
        minersConfigs.forEach(function (item, index, arr) {

            electron.ipcRenderer.on('reply', (event, data) => {
                if (data.type == 'error') {
                    thiz.addLogMachine(index, m, LogStateEnum.ERROR, data.message);
                } else if (data.type == 'update-not-available') {
                    thiz.addLogMachine(index, m, LogStateEnum.WARNING, data.message);
                } else {
                    thiz.addLogMachine(index, m, LogStateEnum.WORK_GOOD, data.message);
                }

            });

            let machine_id = machineIdSync({original: true});

            // settings
            var m = thiz.state.miners[index] = {};
            var c = m.config = minersConfigs[index];
            var s = configJson.server_monitor;

            m.name = c.name;
            m.email = localStorage.getItem('email');
            m.host = c.host;
            m.port = c.port;

            m.poll = (typeof c.poll !== 'undefined') ? c.poll : configJson.miner_poll;
            m.timeout = (typeof c.timeout !== 'undefined') ? c.timeout : configJson.miner_timeout;

            var a = {};

            a.app_name = configJson.name;
            a.app_version = configJson.version;
            if (packageJson) {
                a.app_name = packageJson.productName;
                a.app_version = packageJson.version;
            }

            a.email = m.email;
            a.name = m.name;
            a.machine_id = machine_id;
            a.platform = MinerOperation.getPlatform(process.platform);
            a.local_ip = localIp;


            m.app_info = a;

            // stats
            m.reqCnt = 0;
            m.rspCnt = 0;

            // it was never seen and never found good yet
            c.last_seen = null;
            c.last_good = null;


            tempObj = a;
            // Keep connect to management server
            m.serverSocket = io.connect('http://' + s.host + ':' + s.port, {reconnect: true});

            tempM = m;
            // Add a connect listener
            m.serverSocket.on('connect', function (socket) {

                m.serverSocket.emit('socket-miner-id', m.serverSocket.id, m.email, m.name, machine_id, localStorage.getItem('token')); // Submit card info

                thiz.addLogMachine(index, m, LogStateEnum.WORK_GOOD, 'Đã kết nối đến máy chủ đám mây.');

                publicIP().then(ip => {
                    a.public_ip = ip;
                    m.serverSocket.emit('app-info', localStorage.getItem('token'), a); // Submit app info
                });
            });
            m.serverSocket.on("restart-miner", function (opts) {
                // var req = {"id":0,"jsonrpc":"2.0","method":"miner_restart"};
                // if(m.socket != null){
                //     m.socket.write(req + '\n');
                // }
                MinerOperation.killAllMinerSoftwares(thiz.state.softwareDownloadLinks);

                var isWin = /^win/.test(process.platform);
                var isLinux = /^linux/.test(process.platform);
                var isMac = /^darwin/.test(process.platform);

                if (isWin) {
                    exec("shutdown -t 0 -r -f", function callback(error, stdout, stderr) {
                        if (error) {
                            alert("error " + error);
                        }
                        if (stdout) {
                            // alert(stdout);
                        }
                    });
                } else if (isLinux) {
                    // nothing
                } else if (isMac) {
                    // nothing
                }

            });
            m.serverSocket.on("update_new_version", function (feedURL) {
                electron.ipcRenderer.send('update-new-version', feedURL);
                thiz.addLogMachine(index, m, LogStateEnum.WORK_GOOD, 'Kiểm tra cập nhật phiên bản mới...');

                MinerOperation.killAllMinerSoftwares(thiz.state.softwareDownloadLinks);

            });

            m.serverSocket.on("not_found_token", function () {
                MinerOperation.killAllMinerSoftwares(thiz.state.softwareDownloadLinks);
                thiz.signOut();
            });

            m.serverSocket.on("update_config", function (newConfig) {
                let machine_id = machineIdSync({original: true});

                if (newConfig
                    && newConfig.machineId == machine_id) {

                    thiz.state.miners.forEach(function (item, index, arr) {
                        var m = thiz.state.miners[index];
                        // m.serverSocket.close();
                        var temp = thiz.state.miners;
                        m.name = newConfig.name;
                        m.config.coins_related = newConfig.coins_related;
                        m.config.pool = newConfig.pool;
                        m.config.wallet = newConfig.wallet;
                        temp[index] = m;
                        thiz.setState({miners: temp});

                    });



                    thiz.fetchAllDataFromServer(function(machines, softwareJsonA) {
                        thiz.setState({
                            softwareDownloadLinks: softwareJsonA.data.downloadLinks,
                            rootDirs: softwareJsonA.data.rootDirs,
                            runBatches: softwareJsonA.data.runBatches,
                            machineConfigs: machines,
                            needConfigUpdate: true
                        }, function() {
                            MinerOperation.killAllMinerSoftwares(thiz.state.softwareDownloadLinks);

                        });
                    });

                }
            });

            m.serverSocket.on("update_config_and_run", function (newConfig) {
                let machine_id = machineIdSync({original: true});

                if (newConfig
                    && newConfig.machineId == machine_id) {

                    thiz.state.miners.forEach(function (item, index, arr) {
                        var m = thiz.state.miners[index];
                        // m.serverSocket.close();
                        var temp = thiz.state.miners;
                        m.name = newConfig.name;
                        m.config.coins_related = newConfig.coins_related;
                        m.config.pool = newConfig.pool;
                        m.config.wallet = newConfig.wallet;
                        temp[index] = m;
                        thiz.setState({miners: temp});

                    });

                    thiz.fetchAllDataFromServer(function(machines, softwareJsonA) {
                        var downloadLinkIDChoice = machines[0].downloadLinkID;
                            for (var index = 0; index < softwareJsonA.data.rootDirs.length; index++) {
                                if (softwareJsonA.data.rootDirs[index].machine_id == machine_id
                                    && softwareJsonA.data.rootDirs[index].download_link_id == downloadLinkIDChoice) {
                                    thiz.startMiningSoftware(softwareJsonA.data.rootDirs[index].root_dir, machines[0]);
                                    break;
                                }
                            }



                        thiz.setState({
                            softwareDownloadLinks: softwareJsonA.data.downloadLinks,
                            rootDirs: softwareJsonA.data.rootDirs,
                            runBatches: softwareJsonA.data.runBatches,
                            machineConfigs: machines,
                        }, function() {
                            thiz.startProcess(machines);

                        });
                    });
                }
            });

            thiz.startMonitor(m, c, index);

        });
    }
    handleSelect(index) {
        this.setState({mainViewIndex: index});
        if (index == 1) { // monitor
            console.log(`I'm in Monitor view`);
        } else if (index == 2) { // config
            console.log(`I'm in Config view`);
        }
    }

    handleEvent(object) {
        if (object != null) {
            if (object.length > 0) {
                this.setState({object: object});
            }
        }
        object = null;
    }

    updateConfigNow(needUpdate) {
        thiz.setState({
            needConfigUpdate: needUpdate
        });
    }

    handleSaveConfig(savedMinersJson) {
        savedMinersJson.miners.forEach(function (item, index, arr) {
            var changeNameJson = {
                email: thiz.state.miners[index].email,
                name: thiz.state.miners[index].name,
                newName: item.name
            };

            if (thiz.state.miners[index].name !== item.name) {
                if(thiz.state.miners[index].serverSocket) {
                    thiz.state.miners[index].serverSocket.emit('app-change-name', localStorage.getItem('token'), changeNameJson); // Submit app info
                }
                thiz.state.miners[index].name = item.name;
                thiz.state.miners[index].pool = item.pool;
                thiz.state.miners[index].app_info.name = item.name;
            }
            thiz.state.miners[index].auto_start = item.auto_start;

            thiz.state.minersConfigs = JSON.parse(JSON.stringify(savedMinersJson));
            var m = thiz.state.miners[index];
            var c = thiz.state.miners[index].config = item;

            thiz.startMonitor(m, c, index);
        });


    }



    signOut(e) {
        if(tempM && tempM.serverSocket){
            tempM.serverSocket.emit('app-sign-out', localStorage.getItem('token'), tempObj); // Submit app info
        }
        if(thiz.state.miners.length > 0){
            thiz.state.miners.forEach(function (item, index, arr) {
                var m = thiz.state.miners[index];
                if(m && m.serverSocket){
                    m.serverSocket.close();
                }

            });
        }

        thiz.props.history.push('/login', null);
    }

    globalDownloadSoftware(item, callback) {
        var software = item.software;
        var version = item.version;
        var name = item.name;
        let machine_id = machineIdSync({original: true});
        MinerOperation.onDownloadSoftware(thiz.state.rootDirs, machine_id, item, function (result, rootDirs, newRootDir) {
            if(result == JsonDefaultLoader.DOWNLOAD_STATE_DOWNLOADING){
                thiz.showToast(
                    "Đang tải "+name+" | "+software+" version "+version,
                    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAclBMVEX///8zMzMdHR3MzMwtLS1eXl5hYWEgICAnJyeWlpa9vb0wMDB8fHwXFxe6urojIyN1dXXg4OCQkJA4ODivr69FRUXo6OhmZmbz8/PDw8P5+flSUlKenp5YWFjZ2dkaGhqBgYE+Pj4HBwempqYRERGdnZ3E4VrNAAAFu0lEQVR4nO2d63aqMBBGw8WSGhBFUVHb6rF9/1c8UsSj4IWamczQM/unXV2wV75JguCgFBLLYh+/5TvvMbv8Ld4XS6wTwWE+G/i+Do3pIOh5xoTa9wezOfVpd2YSh1HYye2cw//EE+pT78QyjnS3sWuNpY7iHoR1pPVTehVaj6gFHrDaJs+N32kck+2KWuIey7fUyq8kfWOc1Pnu5xNMm3DHdlJdggiWilxHcWAzx5yjB9Qq18nsa7AmzahlrlEkYIKelxTUOm1WU7tl4hIz5bdmvMJltCR9pRZqsoSaZY4YzW0+fQU2ZDeIqxyyCktMzqsSAx9Y0PP8gFrqgi10SA/L/pZa6gLwkJYxpZY6Zw652tcknDbgRYRgGHHa1+xhl/uKdE+tdQbCRMNsqhnDXBheEo6ptc5YoBguqLXOGKAYcroOFkMxFEN6xFAMxZAeMRRDMaRHDMVQDOkRQzEUQ3rEUAzFkB4xFEMxpEcMxVAM6RFDMRRDesRQDMWQHjEUQzGkRwzFUAzpEUMxFEN6xFAMxZAeMRRDMaRHDMVQDOkRQzHkb/iCYvji6OzfR5ssHi8WL3eYIgh63vTeIV8W4zjbjOx7Se7XH5HW4QNQBA+j+ACtI//NstHi7BPr7KEIP4dWhijtIGCxbC4xw2haAku6sTJc7uBb6wCjLdvY7OEbQMGiYztBpca8K9HsrFuCrYBadiLx+W4rqNQkZFyKCUgfovcnWzs7wP+CEFQqiJgqRmBtTocYzcrsiayn0X+MPhiOYgTaR2rIL6gp4Ah+K3ILKmREK0aWzdaBgY3oUZFTUOFHsIRRLULX4EmRSy3ijGAJk1rEqMEaFkHFiuhR8YPaDzGiFSNqRcyI1oqkQcUXJK5F3Bo8KdItGtg1WEO2aLiIaAVRUN1E9KhI8R2jq4hWjNzXoruI1oqOg+pa0HktuqzBk6LLoLqtwRqHGzj3ET0q+o6CSiXorBYpavCk6KIWaWqwxsGiQRfRCvSgUkb0qIi7gaONaAXqokEd0QrEq34egoi1SF+DNUiLBocarEG5mOIS0QqEDRynESwBr0U+NVgDXIvcRrAEdAPHqwZrAIPKL6IVYLdtOEa0AmgDxzOiFSAbOM6CILXItQZrrBcNvjVYY7lo8I5ohVVQuUe0wuKqn39EK56+0uiL4NO12IcarHmqFvtRgzVPbOD6E9GKH2/g+hTRih9e9fdP8Ie12K8arPnBBq5vNVjTedHoY0QrOgYVOaKvDTL73w7/Y9hlugGN6CRrCind4E8AeLwu6yJsDQZ/mkKqeUAf1PCg+GAUfdiIBq1tP7ahKtK7itEW9nAEhqq4N4r+FvhoFIaquD3dgAvSGN4OKrwgkaEKzNXfEvuvCIeiMVST6RXFZIZwJCpDNc+bP3o3H3b9LG5AZqhWg/TiMGGIcxw6Q6Xi8ylV55CbwzMoDdVM10k1yda6E8INSA3VMv7UoQn1R453DFrDw4SzWawHW8wjUBviI4ZiyB8xFEP+iKEY8kcMxZA/YiiG/BFDMeTPf2nYbMUdFdQnaUXRbHw8VXnjkxTjboI7ZmnDJ1frxp2vsLdPfnwzbtwCMuvWR56P9XW0C1bNMjwM2KZ5U0iDtT0lIGvZbNSw1ZM87e9sGjSr0IuGat56+syYvioGpnU7PZkrlbc+NWnWx1pcZe3nBUx++MPXlZbk2h/PiqBPFLOxf02kbBY9aWW3JEwjv09E6dWHIdLvG7EL1k3XrQgX3/ltb+V+DfUmG+VNPxw4vW1owqW3LDTJ6XGIjP+bSJ7hvCn9r8zpxRux5lMG3XOBMdOL17O8u2rb5QzjN97tEfwyRdP+Nub92uODvSWcXnk7y3zwe2bUaHD9FUlZ8juGMUxuXsRPBn7/HUN/cO+5x2CR8n1vTgeMThePrt8nX3kSac5vQLqBCXWU5F+dnludDzfjdY7z1kYspvl6vBlem1/+Aqx6hSX2v55iAAAAAElFTkSuQmCC",
                    true
                );

                thiz.state.downloadingSoftware.push(item);
                thiz.setState({
                    downloadingSoftware: thiz.state.downloadingSoftware
                });
            } else if(result == JsonDefaultLoader.DOWNLOAD_STATE_FAIL){
                thiz.showToast(
                    "Tai phan mem "+name+" | "+software+" that bai",
                    "data:image/png;base64,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",
                    false
                );

            } else if(result == JsonDefaultLoader.DOWNLOAD_STATE_SUCC){
                thiz.showToast(
                    "Tải "+name+" | "+software+" thành công",
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Antu_task-complete.svg/768px-Antu_task-complete.svg.png",
                    false
                );
                thiz.setState({
                    rootDirs: rootDirs,
                    downloadingSoftware: []
                });
                if (callback) {
                    callback(newRootDir);
                }

            } else if(result == Constant.LoginState.ERROR_INVALID_AUTH){
                // nothing

            }
        });
    }

    render() {
        return (
            <Window >
                <Content class="fix">
                    <PaneGroup>

                        <Sidebar ref="sideBar"
                                 handleSelect={thiz.handleSelect.bind(this)}
                                 onSignOutClicked={thiz.signOut.bind(this)}/>
                        <Monitor ref="monitor"
                                 isActive={thiz.state.mainViewIndex == 1}
                                 data={thiz.state.miners}
                                 changedIndex={thiz.state.changedIndex}/>
                        <Config ref="config"
                                isActive={thiz.state.mainViewIndex == 2}
                                needUpdate={thiz.state.needConfigUpdate}
                                softwareDownloadLinks={thiz.state.softwareDownloadLinks}
                                runBatches={thiz.state.runBatches}
                                machineConfigs={thiz.state.machineConfigs}
                                onUpdate={thiz.updateConfigNow.bind(this)}
                                onSave={thiz.handleSaveConfig.bind(this)}
                                onRefreshConfig={thiz.getCoinMiningOptions.bind(this)}
                                onStart={thiz.startMiningSoftwareFromConfig.bind(this)}
                                onClick={(object) => thiz.handleEvent(object)}/>

                        <ClaymoresSetup ref="claymoreSetup"
                                        isActive={this.state.mainViewIndex == 3}
                                        softwareDownloadLinks={thiz.state.softwareDownloadLinks}
                                        rootDirs={thiz.state.rootDirs}
                                        downloadingSoftware={thiz.state.downloadingSoftware}
                                        onDownloadClicked={thiz.globalDownloadSoftware.bind(this)}
                        />

                        <XmrStakSetup ref="xmrStakSetup"
                                      isActive={this.state.mainViewIndex == 4}
                                      softwareDownloadLinks={thiz.state.softwareDownloadLinks}
                                      rootDirs={thiz.state.rootDirs}
                                      downloadingSoftware={thiz.state.downloadingSoftware}
                                      onDownloadClicked={thiz.globalDownloadSoftware.bind(this)}
                        />

                        <LolMinerSetup ref="lolMinerSetup"
                                      isActive={this.state.mainViewIndex == 5}
                                      softwareDownloadLinks={thiz.state.softwareDownloadLinks}
                                      rootDirs={thiz.state.rootDirs}
                                      downloadingSoftware={thiz.state.downloadingSoftware}
                                      onDownloadClicked={thiz.globalDownloadSoftware.bind(this)}
                        />

                        <SGMinerSMSetup ref="sgminerSMSetup"
                                    isActive={this.state.mainViewIndex == 6}
                                    softwareDownloadLinks={thiz.state.softwareDownloadLinks}
                                    rootDirs={thiz.state.rootDirs}
                                    downloadingSoftware={thiz.state.downloadingSoftware}
                                    onDownloadClicked={thiz.globalDownloadSoftware.bind(this)}

                        />
                    </PaneGroup>
                    <ButterToast trayPosition="top-right"/>

                </Content>
            </Window>
        );
    }
}
