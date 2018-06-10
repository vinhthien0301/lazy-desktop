import React from "react";
import ReactDom from "react-dom";
import {Pane, Input, Button} from "react-photonkit";

import styles from '../../styles/main.scss';

function removeSpace(str) {
    return str.replace(/\s+/g, '');
}

class MonitorTableRow extends React.Component {


    constructor(props) {
        super(props);

        var stateClass = "";
        if (this.props.log.stateClass == "work_good") {
            stateClass = styles.state_good;
        } else if (this.props.log.stateClass == "warn") {
            stateClass = styles.state_warn;
        } else if (this.props.log.stateClass == "error") {
            stateClass = styles.state_error;
        }

        this.state = {
            stateClass: stateClass
        };

    }


    render() {
        return (
            <tr>
                <td>{this.props.log.activity}</td>
                <td className={this.state.stateClass}>
                    {this.props.log.state}</td>
                <td>{this.props.log.time}</td>
            </tr>
        );
    }
}

export default MonitorTableRow
