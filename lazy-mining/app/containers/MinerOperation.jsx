import JsonDefaultLoader from './JsonDefaultLoader.jsx';
import Utility from './Utility.jsx';

import axios from 'axios';
import Constant from './EnumCompare';

var download = require('download-file');
var admZip = require('adm-zip');
var fs = require('fs');

var exec = window.require('electron').remote.require('child_process').exec;

export default class MinerOperation {

    static KILL_SOFTWARE_CMD = "taskkill /f /t /im ";
    static getCommandRunSoftware(url, command) {
        return "cd \"" + url + "\" && start " + command;
    }

    static stopMinerSoftWare(processName){
        var cmd = MinerOperation.KILL_SOFTWARE_CMD + processName;
        exec(cmd, function callback(error, stdout, stderr) {
            if (error) {
                // nothing
            }

            if(stdout){
                // nothing
            }
        });
    }

    static killAllMinerSoftwares(softwareDownloadLinks) {
        for (var index = 0; index < softwareDownloadLinks.length; index++) {
            MinerOperation.stopMinerSoftWare(softwareDownloadLinks[index].process_name);
        }
    }

    static prepareConfigFile(rootDir, minerConfig, softwareDownloadLinks, successCB, failedCB) {
        if (minerConfig.software == JsonDefaultLoader.CLAYMORES_SOFTWARE) {
            if (successCB) {
                successCB();
            }
        } else {
            for (var index = 0; index < softwareDownloadLinks.length; index++) {
                if (softwareDownloadLinks[index].id == minerConfig.downloadLinkID) {
                    if (softwareDownloadLinks[index].config_download_link == null) { // STOP LOADING CONFIG
                        if (successCB) {
                            successCB();
                        }
                        return;
                    }
                    axios.get(softwareDownloadLinks[index].config_download_link).then(function (response) {

                        var format = response.data;
                        if ((typeof response.data) != "string") {
                            format = JSON.stringify(response.data);
                        }

                        var content = MinerOperation.buildCommand(format, minerConfig.email,
                            minerConfig.pool, minerConfig.wallet, minerConfig.name, minerConfig.port, "");

                        fs.writeFile(rootDir + "/" + softwareDownloadLinks[index].config_filename, content, function(err) {
                            if(err) {
                                console.log(err);
                                return;
                            }

                            if (successCB) {
                                successCB();
                            }
                        });
                    });
                    break;
                }
            }
        }
    }

    static getPlatform() {
        var isWin = /^win/.test(process.platform);
        var isLinux = /^linux/.test(process.platform);
        var isMac = /^darwin/.test(process.platform);
        if (isWin || isMac) {
            return "WINDOWS";
        } else if (isLinux) {
            return "UBUNTU";
        }
    }

    static getCoinMiningOptions(runBatches) {
        var coinItems = [];
        runBatches.forEach(function (item, index, arr) {
            coinItems.push(item.coins_related + " | " + item.name);
        });
        return coinItems;
    }

    static loadSoftwareOptionsAndCommand(minerConfig, runScriptArray, downloadLinks) {
        var softwareItems = [];

        downloadLinks.forEach(function (item, index, arr) {
            softwareItems.push(item);
        });

        var command = null;
        var coinPos = null;
        var softwareId = null;
        if (runScriptArray.length == 0) {
            return;
        }

        runScriptArray.forEach(function (item1, index, arr) {
            if (MinerOperation.buildCommandID(item1.coins_related, item1.name) == minerConfig.coins_related) {
                softwareId = item1.software;
                command = item1.bat_script;
                coinPos = MinerOperation.buildCommandID(item1.coins_related, item1.name);
            }
        });

        // Set first option if no matches
        if (coinPos == null) {
            softwareId = runScriptArray[0].software;
            command = runScriptArray[0].bat_script;
            coinPos = MinerOperation.buildCommandID(runScriptArray[0].coins_related,
                runScriptArray[0].name);
        }

        var value = null;
        var downloadLinkID = null;
        var software = null;
        var version = null;
        var commandFormat = null;


        for (var index = 0; index < downloadLinks.length; index++) {
            var item2 = downloadLinks[index];
            if (softwareId == item2.id) {
                downloadLinkID = item2.id;
                software = item2.software;
                version = item2.version;
                commandFormat = item2.command_format;
                value = software+" v"+version;
                break;
            }
        }

        // Set command
        if (software != null) {
            command = MinerOperation.buildCommand(commandFormat,
                minerConfig.email,
                minerConfig.pool,
                minerConfig.wallet,
                minerConfig.name,
                minerConfig.port,
                command);
            minerConfig.command = command;

            return {
                command: command,
                software: software,
                downloadLinkID: downloadLinkID
            };
        }
        return {
            command: "",
            software: "",
            downloadLinkID: ""
        };

    }

    static getMinerConfig(machine_id,callback){
        var url = Constant.getMinerConfigString(machine_id);
        axios.post(url).then(function (response) {
            if(callback){
                callback(response);
            }
        });
    }

    static submitMinerConfig(email, name, auto_start, coins_related,
                             pool, wallet, machine_id, callback) {
        var url = Constant.getSubmitMinerConfigString(email, name, auto_start, coins_related,
            pool, wallet, machine_id);
        axios.post(url).then(function (response) {
            if(callback){
                callback(response);
            }
        }).catch(function (error) {
            // nothing
        });

    }

    static loadAllSoftwareDownloadLinks(machineID, email, token, callback) {

        var platform = MinerOperation.buildPlatformString();

        var url = Constant.getAllSoftwareDownloadLinksString(platform, machineID, email, token);
        axios.post(url).then(function (response) {
                if(callback){
                    response = Utility.getResponse(response.data);
                    callback(response.response_code,response,response.description);
                }
            }).catch(function (error) {
                // nothing
            });
    }

    static submitRootDirDownloaded(machineID, softwareDownloadLinkID, rootDir, callback) {

        var url = Constant.submitRootDirDownloadedString(machineID, softwareDownloadLinkID, encodeURIComponent(rootDir));
        axios.post(url).then(function (response) {
            if (callback) {
                callback(response.data);
            }
        })
        .catch(function (error) {
            // nothing
        });
    }

    static loadMinersConfig(machines, machineID, email, platform, token, callback) {
        if (!machines || machines.length == 0) {
            return;
        }

        machines[0].machine_id = machineID;
        machines[0].email = email;
        machines[0].platform = platform;

        var url = Constant.getRigConfigWithMachineIDString(machineID,email,platform,token);
        axios.post(url).then(function (response) {
            if(callback){
                var response = Utility.getResponse(response.data);
                var data = response.data;
                var response_code = response.response_code;
                var description = response.description;

                if (data == null) {
                    callback(response_code,machines,description);
                    return;
                }

                if (data.length > 0) {

                    if (data[0].name != null) {
                        machines[0].name = data[0].name;
                    }
                    if (data[0].coins_related != null) {
                        machines[0].coins_related = data[0].coins_related;
                    }
                    if (data[0].pool != null) {
                        machines[0].pool = data[0].pool;
                    }
                    if (data[0].wallet != null) {
                        machines[0].wallet = data[0].wallet;
                    }
                    if(data[0].auto_start != null) {
                        machines[0].auto_start = data[0].auto_start;
                    }
                    if (data[0].software != null) {
                        machines[0].software = data[0].software;
                    }
                    if (data[0].host != null) {
                        machines[0].host = data[0].host;
                    }
                    if (data[0].port != null) {
                        machines[0].port = data[0].port;
                    }

                    callback(response_code,machines,description);
                }
            }
        });
    }


    static validateToken(token, callback) {




        var url = Constant.validateRigTokenDesktop(token);
        axios.post(url).then(function (response) {
            if(callback){
                var response = Utility.getResponse(response.data);
                callback(response);
            }
        });
    }

    static onDownloadSoftware(rootDirs, machineID, downloadItem, callback) {

        var software = downloadItem.software;
        var version = downloadItem.version;
        var filename = downloadItem.filename;
        var name = downloadItem.name;
        var download_link_id = downloadItem.id;
        var download_link = downloadItem.download_link;

        callback(JsonDefaultLoader.DOWNLOAD_STATE_DOWNLOADING);

        var dir = JsonDefaultLoader.getDataFile(software+"/"+name+"/"+version);
        var options = {
            directory: dir,
            filename: filename + ".zip"
        };
        //
        download(download_link, options, function(err) {

            if (err) {
                callback(JsonDefaultLoader.DOWNLOAD_STATE_FAIL);
                throw err;
            }

            var zipFile = options.directory + "/" + options.filename;
            setTimeout(function(){

                var zip = new admZip(zipFile);
                zip.extractAllTo(options.directory, true);

                var softwareDownloadedDir = options.directory+"/"+filename;
                MinerOperation.submitRootDirDownloaded(machineID, download_link_id, softwareDownloadedDir,function (data) {
                    callback(JsonDefaultLoader.DOWNLOAD_STATE_SUCC, data.data, softwareDownloadedDir);
                });

            }, 5000);
            //
            //
        });


    }

    static buildPlatformString() {
        var isWin = /^win/.test(process.platform);
        var isLinux = /^linux/.test(process.platform);
        var isMac = /^darwin/.test(process.platform);

        var platform = null;

        if (isWin || isMac) {
            platform = "WINDOWS";
        }
        else if (isLinux) {
            platform = "LINUX";
        }
        //else if (isMac) {
        //    platform = "MAC";
        //}
        return platform;
    }

    static buildCommand(format, email, pool, wallet, workerName, monitorPort, suffix) {

        var poolDomain = '';
        var poolPort = '';
        var poolParts = pool.split(':');
        if (poolParts.length > 1) {
            poolDomain = poolParts[poolParts.length - 2];
            poolPort = poolParts[poolParts.length - 1];
        }


        var command = format.replace(/\[POOL\]/g, pool);
        command = command.replace(/\[POOL_DOMAIN\]/g, poolDomain);
        command = command.replace(/\[POOL_PORT\]/g, poolPort);
        command = command.replace(/\[EMAIL\]/g, email);
        command = command.replace(/\[WALLET\]/g, wallet);
        if (workerName) {
            command = command.replace(/\[WORKER_NAME\]/g, workerName.replace(/ /g, '_'));
        } else {
            command = command.replace(/\[WORKER_NAME\]/g, workerName);
        }
        command = command.replace(/\[MONITOR_PORT\]/g, monitorPort);
        command = command.replace(/\[MORE\]/g, suffix);
        return command;
    }

    static buildCommandID(coinsRelated, name) {
        return coinsRelated + " | " + name;
    }

}
