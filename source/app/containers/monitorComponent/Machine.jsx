import React from "react";
import {Pane, Input, Button} from "react-photonkit";
import MonitorTableRow from './MachineTableRow.jsx';

import styles from '../../styles/main.scss';


var moment = require('moment');
require("moment-duration-format");

var thiz;

export default class MonitorMachine extends React.Component {

    constructor(props) {
        super(props);
        thiz = this;
        this.states = {
            logs: [],
            data: this.props.data,
            logsHtml: []
        };
    }

    addLogMachine(key, name, logState, content) {
        var stateString = "";
        var stateClass = logState;
        if (logState == "work_good") {
            stateString = "Hoạt động tốt";
        } else if (logState == "warn") {
            stateString = "Cảnh báo";
        } else if (logState == "debug") {
            stateString = "Gỡ rối";
        } else if (logState == "error") {
            stateString = "Thất bại";
        } else {
            return;
        }
        var a = moment.utc().format('DD-MM-YYYY hh:mm A');
        var localTime  = moment.utc(a).toDate();
        localTime = moment(localTime).format('DD-MM-YYYY hh:mm A');
        this.states.logsHtml.push(
            <MonitorTableRow
                key={key}
                log={{
                    activity: content,
                    state: stateString,
                    time: localTime,
                    stateClass: stateClass
                }}>
            </MonitorTableRow>);
        thiz.setState(thiz.states, function() {
            var main = this.refs.main;
            main.scrollIntoView(false);
        });


    }

    componentWillReceiveProps(nextProps) {
        if (thiz.props.data.logs != null && thiz.props.data.logs.length > 0) {
            if (thiz.states.logs.length < thiz.props.data.logs.length) {
                for (var index = thiz.states.logs.length; index < thiz.props.data.logs.length; index ++) {
                    var item = thiz.props.data.logs[index];
                    thiz.addLogMachine(index, item.name, item.state, item.content);
                    thiz.states.logs.push(item);
                }
            }
        }
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

    render() {
        return (
            <div ref="main" id={this.props.data.name} className={styles.main_element}>
                <p className={styles.machine_title}>{this.props.data.name}</p>
                <table ref="main" className="table-striped">
                    <thead>
                        <tr>
                            <th>Hoạt động</th>
                            <th>Tình trạng</th>
                            <th>Thời điểm</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.states.logsHtml}
                    </tbody>
                </table>
            </div>
        );
    }
}

