import React from "react";
import ReactDOM from "react-dom";
import {Pane, Table} from "react-photonkit";
import MonitorMachine from './monitorComponent/Machine.jsx';
var moment = require('moment');
require("moment-duration-format");

import appStyles from '../styles/app.scss';
import styles from '../styles/main.scss';

var thiz;

export default class Monitor extends React.Component {


    constructor(props) {
        super(props);
        thiz = this;

        this.state = {
            data: this.props.data
        };

    }

    componentDidMount() {
        // nothing
    }

    componentWillReceiveProps(nextProps) {
        // nothing
    }

    componentDidUpdate(prevProps, prevState) {
        // only update chart if the data has changed

    }



    render() {
        return (
            <Pane ref="pane" className={this.props.isActive ? styles.padded_more : [styles.padded_more, appStyles.hidden].join(' ')}>
               <div id="machineHolder" className="machineHolder" >
                    <MonitorMachine
                      ref="monitorMachine"
                         data={this.state.data[0]}></MonitorMachine>
               </div>
            </Pane>
        );
    }
}

