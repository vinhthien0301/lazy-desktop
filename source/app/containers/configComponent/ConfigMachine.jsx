import React from "react";
import { Pane, Input, Button, RadioGroup, Radio, Options } from "react-photonkit";
import MinerOperation from './../MinerOperation.jsx';

import styles from '../../styles/main.scss';
import appStyles from '../../styles/app.scss';

var thiz;

export default class ConfigMachine extends React.Component {

    constructor(props) {
        super(props);
        thiz = this;

        thiz.state = {
            coinPos: [],
            runBatches: [],
            softwareDownloadLinks: [],
            coinOptions: null
        }
    }

    componentWillReceiveProps(nextProps) {

        if (nextProps.runBatches) {
            var coinItems = MinerOperation.getCoinMiningOptions(nextProps.runBatches);

            var temp = null;
            const coinOptions = coinItems.map((item, i) => {
                const key = item;
                var arr = item.split("-");
                if(arr[1] == nextProps.machine.coins_related){
                    temp = item;
                }
                return (
                    <option >{item}</option>
                );

            });

            thiz.setState({
                coinOptions: coinOptions,
                machine: nextProps.machine,
                runBatches: nextProps.runBatches,
                softwareDownloadLinks: nextProps.softwareDownloadLinks,
                coinPos: temp,
                softwareDisabled: true,
                commandDisabled: true
            }, function () {
                var choice = thiz.loadSoftwareOptionsAndCommand(this.state.runBatches, thiz.state.softwareDownloadLinks, thiz.props.machine);
                thiz.props.onSoftwareUpdated(thiz.props.index, choice.software);
                thiz.props.onCommandUpdated(thiz.props.index, choice.command);
                thiz.props.onDownloadLinkIdUpdated(thiz.props.index, choice.downloadLinkID);
            });
        }
    }

    loadSoftwareOptionsAndCommand(runBatchesArray, softwareDownloadLinks, machine) {
        var runBatches = [];

        runBatchesArray.forEach(function (item, index, arr) {
            runBatches.push(item);
        });

        var command = null;
        var downloadLinkID = null;
        var coinPos = null;
        var softwareId = null;
        if (runBatches.length == 0) {
            return;
        }

        runBatches.forEach(function (item1, index, arr) {
            if (MinerOperation.buildCommandID(item1.coins_related, item1.name) == machine.coins_related) {
                softwareId = item1.software;
                command = item1.bat_script;
                coinPos = MinerOperation.buildCommandID(item1.coins_related, item1.name);
            }
        });

        // Set first option if no matches
        if (coinPos == null) {
            softwareId = runBatches[0].software;
            command = runBatches[0].bat_script;
            coinPos = MinerOperation.buildCommandID(runBatches[0].coins_related,
                runBatches[0].name);
        }

        var value = null;
        var software = null;
        var version = null;
        var commandFormat = null;

        for (var index = 0; index < softwareDownloadLinks.length; index++) {
            var item2 = softwareDownloadLinks[index];
            if (softwareId == item2.id) {
                software = item2.software;
                version = item2.version;
                commandFormat = item2.command_format;
                value = software+" v"+version;
                downloadLinkID = item2.id;

                break;
            }
        }



        const softwareOptions = softwareDownloadLinks.map((item, i) => {
            const key = i;
            return (
                <option key={key}>{item.software} v{item.version}</option>
            );
        });

        thiz.setState({
            softwareOptions: softwareOptions,
            softwarePos: value,
            coinPos: coinPos
        });

        // Set command
        if (software != null) {
            command = MinerOperation.buildCommand(commandFormat,
                machine.email,
                machine.pool,
                machine.wallet,
                machine.name,
                machine.port,
                command);
            machine.command = command;
            thiz.setState({
                command: command
            });
            return {
                software: software,
                command: command,
                downloadLinkID: downloadLinkID
            };
        }
        return {
            software: "",
            command: "",
            downloadLinkID: ""
        }

    }




    onCoinChanged(e) {
        var newCoinsRelated = e.target.value;
        thiz.props.machine.coins_related = newCoinsRelated;
        var editMachine = JSON.parse(JSON.stringify(thiz.props.machine));
        editMachine.coins_related = newCoinsRelated;
        var choice = thiz.loadSoftwareOptionsAndCommand(
            thiz.state.runBatches,
            thiz.state.softwareDownloadLinks, editMachine);

        editMachine.software = choice.software;
        editMachine.command = choice.command;
        editMachine.downloadLinkID = choice.downloadLinkID;
        thiz.props.onSoftwareUpdated(thiz.props.index, choice.software);
        thiz.props.onCommandUpdated(thiz.props.index, choice.command);
        thiz.props.onDownloadLinkIdUpdated(thiz.props.index, choice.downloadLinkID);
        thiz.props.onFieldModified(thiz.props.index, editMachine);
    }

    onPoolChanged(e) {
        var newPool = e.target.value;
        thiz.props.machine.pool = newPool;
        var editMachine = JSON.parse(JSON.stringify(thiz.props.machine));
        editMachine.pool = newPool;
        thiz.props.onFieldModified(thiz.props.index, editMachine);

    }

    onNameChanged(e) {
        var newName = e.target.value;
        thiz.props.machine.name = newName;
        var editMachine = JSON.parse(JSON.stringify(thiz.props.machine));
        editMachine.name = newName;
        thiz.props.onFieldModified(thiz.props.index, editMachine);
    }
    onAutoStartChanged(e) {
        var checked = e.target.checked;
        thiz.props.machine.auto_start = checked;
        var editMachine = JSON.parse(JSON.stringify(thiz.props.machine));
        if (checked) {
            editMachine.auto_start = 1;
        } else {
            editMachine.auto_start = 0;
        }
        thiz.props.onFieldModified(thiz.props.index, editMachine);
    }

    onSoftwareChanged(e) {
        var newSoftwareIndex = e.target.value;
        var item = thiz.state.softwareDownloadLinks[newSoftwareIndex];
        var newSoftware = item.software;
        var editMachine = JSON.parse(JSON.stringify(thiz.props.machine));
        editMachine.software = newSoftware;
        thiz.props.onFieldModified(thiz.props.index, editMachine);

        thiz.props.onRunBatchFileReady(item.downloadFile, item.software, item.filename);
    }

    onWalletChanged(e){
        var newWallet = e.target.value;
        thiz.props.machine.wallet = newWallet;
        var editMachine = JSON.parse(JSON.stringify(thiz.props.machine));
        editMachine.wallet = newWallet;
        thiz.props.onFieldModified(thiz.props.index, editMachine);

    }
    onRefreshData(){
        thiz.props.onRefreshConfig();
    }
    onBatChanged(e){
        var newBat = e.target.value;
        thiz.props.machine.bat = newBat;

        thiz.props.onFieldModified(thiz.props.index, thiz.props.machine);
    }

    render() {
        return (
            <Pane className={styles.main_content}>
                <input type="checkbox" checked={thiz.props.machine.auto_start} onChange={thiz.onAutoStartChanged.bind(this)} /> &nbsp;Khởi động lúc startup
                <br/><br/>
                <Input onChange={thiz.onNameChanged.bind(this)}
                       value={thiz.props.machine.name}
                       label="Tên máy"
                       placeholder="Ví dụ: Máy số 1"/>

                <div className="form-group">
                    <label>Đồng tiền ảo cần đào</label>
                    <select  className="form-control"
                             value={thiz.props.machine.coins_related}
                             onChange={thiz.onCoinChanged.bind(this)}>
                        {thiz.state.coinOptions}
                    </select>
                </div>

                <Input className={[styles.main_content_input_large, styles.margin_top].join(' ')}
                       value={thiz.props.machine.pool}
                       onChange={thiz.onPoolChanged.bind(this)}
                       label="Hố đào"
                       placeholder="Nhập tên miền hoặc địa chỉ IP"/>

                <Input className={[styles.main_content_input_large, styles.margin_top].join(' ')}
                       value={thiz.props.machine.wallet}
                       onChange={thiz.onWalletChanged.bind(this)}
                       label="Địa chỉ ví"
                       placeholder="Nhập địa chỉ ví"/>

                <div className="form-group">
                    <label>Phần mềm đào</label>
                    <select disabled={thiz.state.softwareDisabled} value={thiz.state.softwarePos} className="form-control"
                            onChange={thiz.onSoftwareChanged.bind(this)}>
                        {thiz.state.softwareOptions}
                    </select>
                </div>

                <div className="form-group">
                    <label>Lệnh chạy phần mềm đào</label>
                    <textarea className={["form-control", appStyles.command].join(' ')}
                              disabled={thiz.state.commandDisabled}
                              value={thiz.state.command}
                              onChange={thiz.onBatChanged.bind(this)}
                              placeholder="Ví dụ: EthDcrMiner64.exe -epool us1.ethpool.org:3333 -ewal 0xD69af2A796A737A103F12d2f0BCC563a13900E6F">
                    </textarea>
                </div>

            </Pane>
        );
    }
}
