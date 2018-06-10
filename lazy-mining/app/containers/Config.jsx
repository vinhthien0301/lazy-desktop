import React from "react";
import {Pane, Input, Button} from "react-photonkit";
import ConfigAction from './configComponent/ConfigAction.jsx';
import ConfigMachine from './configComponent/ConfigMachine.jsx';

import JsonDefaultLoader from './JsonDefaultLoader.jsx';
import MinerOperation from './MinerOperation.jsx';
import {machineIdSync} from 'node-machine-id';

import appStyles from '../styles/app.scss';

import minersJson from '.././miners.json';

var exec = window.require('electron').remote.require('child_process').exec;


var thiz;

export default class Config extends React.Component {

    downloadLinks = "";
    software = "";
    filename = "";

    constructor(props) {
        super(props);
        thiz = this;
        this.state = {
            machines: JSON.parse(JSON.stringify(minersJson.miners)),
            machinesChanged: JSON.parse(JSON.stringify(minersJson.miners)),
            softwareDownloadLinks: null,
            runBatches: null,
            canSave: false
        };


    }

    componentDidMount() {
        // nothing
    }

    componentWillReceiveProps(nextProps) {

        if (nextProps.machineConfigs && nextProps.machineConfigs.length > 0 && nextProps.needUpdate) {
            thiz.props.onUpdate(false);
            thiz.setState({
                runBatches: nextProps.runBatches,
                machines: JSON.parse(JSON.stringify(nextProps.machineConfigs)),
                softwareDownloadLinks: nextProps.softwareDownloadLinks,
                machinesChanged: JSON.parse(JSON.stringify(nextProps.machineConfigs)),
                canSave: false,
            });
        }
    }

    onSave(e) {

        var machineCount = this.state.machines.length;
        if (machineCount > 0) {

            let machine_id = machineIdSync({original: true});
            var email = localStorage.getItem('email');
            var name = this.state.machines[0].name;
            var auto_start = this.state.machines[0].auto_start;
            var coins_related = this.state.machines[0].coins_related;
            var pool = this.state.machines[0].pool;
            var wallet = this.state.machines[0].wallet;
            var software = this.state.machines[0].software;
            var downloadLinkID = this.state.machines[0].downloadLinkID;
            MinerOperation.submitMinerConfig(email, name, auto_start, coins_related, pool, wallet, machine_id, function (response) {
                if (response.data == 'ok') {
                    thiz.setState({
                        machines: thiz.state.machines,
                        machinesChanged: JSON.parse(JSON.stringify(thiz.state.machines)),
                        canSave: false
                    });

                    var updatedMinersJson = {
                        miners: thiz.state.machines
                    };
                    thiz.props.onSave(updatedMinersJson);
                } else {
                    alert("Không thể lưu thông tin online");
                }

            });

        }

    }


    onMine() {
        var isWin = /^win/.test(process.platform);
        var isLinux = /^linux/.test(process.platform);
        var isMac = /^darwin/.test(process.platform);

        if (isWin) {
            var runCommand = thiz.state.machines[0].command;
            var downloadLinkID = thiz.state.machines[0].downloadLinkID;
            thiz.props.onStart(runCommand, downloadLinkID, thiz.state.machines[0]);

        } else if (isLinux) {
            exec('/Applications/TextEdit.app/Contents/MacOS/textedit', function callback(error, stdout, stderr) {
                console('asds');
            });
        } else if (isMac) {

            var runCommand = thiz.state.machines[0].command;
            var downloadLinkID = thiz.state.machines[0].downloadLinkID;
            thiz.props.onStart(runCommand, downloadLinkID, thiz.state.machines[0]);
        }
    }

    onReset() {
        thiz.setState({
            machines: JSON.parse(JSON.stringify(thiz.state.machinesChanged)),
            machinesChanged: JSON.parse(JSON.stringify(thiz.state.machinesChanged)),
            canSave: false
        });
    }

    onRunBatchFileReady(softwareDownloadLinks, software, filename) {
        thiz.downloadLinks = softwareDownloadLinks;
        thiz.software = software;
        thiz.filename = filename;
    }

    onRefreshConfig(){
        thiz.props.onRefreshConfig();
    }

    onSoftwareUpdated(index, newSoftware) {
        thiz.state.machines[index].software = newSoftware;
    }

    onCommandUpdated(index, newCommand) {
        thiz.state.machines[index].command = newCommand;
    }

    onDownloadLinkIdUpdated(index, newDownloadLinkID) {
        thiz.state.machines[index].downloadLinkID = newDownloadLinkID;
    }

    handleConfigEditing(index, machineData) {
        var rootData = thiz.state.machinesChanged[index];
        var canSave = false;

        if (machineData.name != rootData.name
            || machineData.coins_related != rootData.coins_related
            || machineData.pool != rootData.pool
            || machineData.wallet != rootData.wallet
            || machineData.software != rootData.software
            || machineData.auto_start != rootData.auto_start
            || machineData.command != rootData.command) {
            canSave = true;
            thiz.state.machines[index] = machineData;
        }


        thiz.setState({
            canSave: canSave
        });
    }

    render() {
        return (
            <Pane className={thiz.props.isActive ? "" : [appStyles.hidden].join(' ')}>
                <ConfigAction
                    canSave={thiz.state.canSave}
                    onReset={thiz.onReset.bind(this)}
                    onSave={thiz.onSave.bind(this)}
                    onMine={thiz.onMine.bind(this)}></ConfigAction>
                <ConfigMachine
                    needUpdate={thiz.props.needUpdate}
                    onRunBatchFileReady={thiz.onRunBatchFileReady.bind(this)}
                    machine={thiz.state.machines[0]}
                    runBatches={thiz.state.runBatches}
                    index={0}
                    onRefreshConfig={thiz.onRefreshConfig.bind(thiz)}
                    softwareDownloadLinks={thiz.state.softwareDownloadLinks}
                    onSoftwareUpdated={thiz.onSoftwareUpdated.bind(this)}
                    onCommandUpdated={thiz.onCommandUpdated.bind(this)}
                    onDownloadLinkIdUpdated={thiz.onDownloadLinkIdUpdated.bind(this)}
                    onFieldModified={thiz.handleConfigEditing.bind(this)}></ConfigMachine>
            </Pane>
        );

    }
}

