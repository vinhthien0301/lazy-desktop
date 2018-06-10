import React from "react";
import {Link} from 'react-router-dom';
import {Pane, NavGroup, NavTitle, NavGroupItem} from "react-photonkit";
import {Router, Route, IndexRoute, browserHistory} from "react-router";

import styles from '../styles/main.scss';
import packageJson from '../package.json';
import photonStyles from '../styles/photon.css';
import Constant from './EnumCompare';
import axios from 'axios';
import electron from 'electron';


var thiz;
class Sidebar extends React.Component {

    constructor(props) {
        super(props);
        thiz = this;
        this.version = packageJson.version;
        var email = localStorage.getItem('email');
        this.state = {
            userMenuBoxActive: false,
            selectIndex: 1,
            email: email
        };
        console.log(electron);
    }
    componentDidMount() {
        // nothing
    }
    onSelect(index) {
        thiz.setState({
            selectIndex: index
        });
        thiz.props.handleSelect(index);
        console.log(`sidebar clicked with ${index}`);

    }

    showHideUserMenu() {
        thiz.setState({userMenuBoxActive: !thiz.state.userMenuBoxActive});
    }

    signOut(str) {
        var token = localStorage.getItem('token');
        var email = localStorage.getItem('email');

        if (token !== undefined && token !== null && email !== undefined && email !== null) {
            if (token.length > 0 && email.length > 0) {
                var url = Constant.getLogoutString(token);
                axios.post(url)
                    .then(function (response) {
                        var state = response.data.response_code;
                        if (state === Constant.SignOutState.SUCCESS) {
                            localStorage.clear();
                            thiz.props.onSignOutClicked();
                        }
                    })
                    .catch(function (error) {
                        console.log(error);
                    });

            }
        }

    }


    render() {
        return (
            <Pane ptSize="sm" sidebar>
                <div className={styles.user_box} onClick={this.showHideUserMenu}>
                    <div>Xin chào, <strong>{thiz.state.email}</strong></div>
                    <span className={styles.setting_sign}></span>
                </div>
                <div onClick={thiz.signOut}
                     className={this.state.userMenuBoxActive ? styles.user_menu_box : [styles.user_menu_box, photonStyles.hidden].join(' ')}>
                    Đăng xuất
                </div>
                <br/>
                <Pane ptSize="sm" sidebar>
                    <nav className={photonStyles.nav_group}>
                        <h5 className={photonStyles.nav_group_title}>Hoạt động giám sát</h5>
                        <a ref="overview" onClick={thiz.onSelect.bind(this,1)}
                           className={thiz.state.selectIndex == 1 ? photonStyles.nav_group_item_active : photonStyles.nav_group_item}>
                            <span className="icon icon-home"></span> Dàn đào
                        </a>
                        <a ref="config" onClick={this.onSelect.bind(this,2)}
                           className={thiz.state.selectIndex == 2 ? photonStyles.nav_group_item_active : photonStyles.nav_group_item}>
                            <span className="icon icon-download"></span> Thiết lập
                        </a>
                    </nav>
                </Pane>
                <br/>
                <Pane ptSize="sm" sidebar>
                    <nav className={photonStyles.nav_group}>
                        <h5 className={photonStyles.nav_group_title}>Phần mềm đào</h5>
                        <a ref="overview" onClick={this.onSelect.bind(this, 3)}
                           className={thiz.state.selectIndex == 3 ? photonStyles.nav_group_item_active : photonStyles.nav_group_item}>
                            <span className="icon"></span> Claymores
                        </a>
                        <a ref="config" onClick={this.onSelect.bind(this, 4)}
                           className={thiz.state.selectIndex == 4 ? photonStyles.nav_group_item_active : photonStyles.nav_group_item}>
                            <span className="icon"></span> XMR-STAK
                        </a>
                        <a ref="config" onClick={this.onSelect.bind(this, 5)}
                           className={thiz.state.selectIndex == 5 ? photonStyles.nav_group_item_active : photonStyles.nav_group_item}>
                            <span className="icon"></span> lolMiner
                        </a>
                        <a ref="config" onClick={this.onSelect.bind(this, 6)}
                           className={thiz.state.selectIndex == 6 ? photonStyles.nav_group_item_active : photonStyles.nav_group_item}>
                            <span className="icon"></span> SGMiner-SM
                        </a>
                    </nav>
                </Pane>
                <div className={styles.version} >v{thiz.version}</div>

            </Pane>
        );
    }
}

export default Sidebar;
