import React from "react";

import {Window, Content, Button, PaneGroup, Pane} from "react-photonkit";
import {Router, Route, IndexRoute, browserHistory} from "react-router";
import axios from 'axios';
import Constant from './EnumCompare';
import Utility from './Utility';
var os = require('os');
import {machineIdSync} from 'node-machine-id';
import publicIP from 'react-native-public-ip';


import appStyles from '../styles/app.scss';
import styles from '../styles/login.scss';
import imageTitle from '.././icon.png';
import imageWarning from '.././styles/img/warining.png';
import MinerOperation from './MinerOperation.jsx';
import EnumCompare from './EnumCompare.jsx';

import configJs from '../config.json';


var AutoLaunch = require('auto-launch');
var spawn = require('process');
var child = require('child_process');

var thiz;

export default class LoginPage extends React.Component {

    constructor(props) {
        super(props);
        thiz = this;

        var lazyAutoLauncher = new AutoLaunch({
            name: 'LazyDesktop',
            path: spawn.execPath
        });

        lazyAutoLauncher.enable();

        lazyAutoLauncher.isEnabled()
            .then(function (isEnabled) {
                if (isEnabled) {
                    return;
                }
                lazyAutoLauncher.enable();
            })
            .catch(function (err) {
                // handle error
            });

            var token = localStorage.getItem('token');
            var email = localStorage.getItem('email');
            if (token != null && token.length > 0 && email != null && email.length > 0) {
                thiz.props.history.push('/main');
                MinerOperation.validateToken(token, function (response) {
                    var response_code = response.response_code;
                    if (response_code != EnumCompare.LoginState.SUCCESS) {
                        localStorage.removeItem('email');
                        localStorage.removeItem('token');
                        thiz.props.history.push('/');
                    }
                });
            }

        this.state = {
            emailFirstFocus: true,
            passwordFirstFocus: true,
            errorEmailContent: "",
            errorPwContent: "",
            errorLoginContent: "",
            signInReady: false
        }


    }


    getSysInfo() {
        return JSON.stringify({
            EOL: os.EOL,
            arch: os.arch(),
            cpus: JSON.stringify(os.cpus()),
            freemem: os.freemem(),
            homedir: os.homedir(),
            hostname: os.hostname(),
            loadavg: os.loadavg(),
            networkInterfaces: JSON.stringify(os.networkInterfaces()),
            platform: os.platform(),
            release: os.release(),
            tmpdir: os.tmpdir(),
            totalmem: os.totalmem(),
            type: os.type(),
            uptime: os.uptime(),
            userInfo: JSON.stringify(os.userInfo())
        })
    }

    login(str) {
        publicIP().then(ip => {
            var public_ip = ip;
            var email = thiz.refs.email.value;
            var pw = thiz.refs.pw.value;
            let machineID = machineIdSync({original: true});

            var url = Constant.getLoginString(email, pw, this.getSysInfo(),machineID,public_ip);

            axios.post(url)
                .then(function (response) {
                    if (response.data.response_code === Constant.LoginState.SUCCESS) {
                        if (response.data.data != undefined && response.data.data !== null) {
                            var token = response.data.data.token;
                            var email = response.data.data.email;
                            localStorage.setItem('token', token);
                            localStorage.setItem('email', email);
                            thiz.props.history.push('/main');
                        }

                    } else {
                        var errorString = "";
                        if (response.data.response_code == Constant.LoginState.ERROR_INVALID_AUTH) {
                            errorString = "Email hoặc mật khẩu không đúng. Nếu bạn quên mật khẩu, bạn có thế bấm vào đây để lấy lại mật khẩu.";
                        }
                        thiz.setState({
                            errorLoginContent: errorString
                        });
                    }
                })
                .catch(function (error) {
                    thiz.setState({
                        errorLoginContent: "Máy chủ đang bảo trì, vui lòng liên lạc với chúng tôi để biết thêm chi tiết."
                    });
                });
        });


    }

    goSignUp() {
        thiz.props.history.push('/signup');
    }

    goForgot() {
        thiz.props.history.push('/forgot_password');
    }

    componentDidMount() {
        // nothing
    }

    isPasswordValid(password) {
        return password.length >= 6;
    }

    isLoginReady() {
        var email = thiz.refs.email.value;
        var password = thiz.refs.pw.value;
        var emailValid = Utility.validateEmail(email);
        var passwordValid = thiz.isPasswordValid(password);
        return emailValid && passwordValid;
    }

    validateEmail() {
        var email = thiz.refs.email.value;
        var emailValid = Utility.validateEmail(email);

        thiz.setState({
            errorEmailContent: ((!emailValid && !thiz.state.emailFirstFocus) ? "Hãy nhập chính xác địa chỉ email" : ""),
            signInReady: thiz.isLoginReady()
        });
    }

    validatePassword() {
        var password = thiz.refs.pw.value;
        var passwordValid = thiz.isPasswordValid(password);

        thiz.setState({
            errorPwContent: ((!passwordValid && !thiz.state.passwordFirstFocus) ? "Mật khẩu phải có ít nhất 6 ký tự" : ""),
            signInReady: thiz.isLoginReady()
        });
    }

    unlockFirstEmail() {
        var email = thiz.refs.email.value;
        if (email.length > 0) {
            thiz.state.emailFirstFocus = false;
            thiz.validateEmail();
        }
    }

    unlockFirstPassword() {
        var password = thiz.refs.pw.value;
        if (password.length > 0) {
            thiz.state.passwordFirstFocus = false;
            thiz.validatePassword();
        }
    }

    handleKeyPress(target) {
        if (target.charCode == 13) {
            if (thiz.state.signInReady) {
                thiz.login();
            }
        }

    }

    render() {

        return (
            <Pane className={styles.main}>
                <Pane className={styles.top_title}>
                    <span className={styles.holder}>
                        <img/>
                        <h3 ref="title" className={styles.title_name}>Lazy Mining</h3>
                    </span>
                </Pane>
                <Pane className={styles.main_content}>
                    <div className={[thiz.state.errorLoginContent ? styles.err_content : appStyles.hidden].join(' ')}>
                        <img src={imageWarning} width="23" height="23"/>
                        <div ref="errorLogin" className={styles.error}>
                            {thiz.state.errorLoginContent}</div>
                    </div>
                    <div className={styles.signin_pane}>
                        <h2>Đăng nhập để giám sát</h2>
                        <h4>Nhập <strong>email</strong> và <strong>mật khẩu</strong> của bạn</h4>

                        <input ref="email" onKeyPress={this.handleKeyPress} onChange={thiz.validateEmail.bind(this)}
                               onBlur={thiz.unlockFirstEmail.bind(this)} type="text"
                               placeholder="you@example.com"/>
                        <h4 ref="errorEmail"
                            className={[styles.error_offline, thiz.state.errorEmailContent ? "" : appStyles.hidden].join(' ')}>
                            {thiz.state.errorEmailContent}</h4>


                        <input ref="pw" onKeyPress={this.handleKeyPress} onChange={thiz.validatePassword.bind(this)}
                               onBlur={thiz.unlockFirstPassword.bind(this)} type="password"
                               placeholder="password"/>
                        <h4 ref="errorPassword"
                            className={[styles.error_offline, thiz.state.errorPwContent ? "" : appStyles.hidden].join(' ')}>
                            {thiz.state.errorPwContent}</h4>


                        <div className={[styles.button, thiz.state.signInReady ? "" : styles.disabled].join(' ')}
                             onClick={thiz.login.bind(this)}>Đăng nhập
                        </div>

                        <div className={styles.break_line}>
                            <div className={styles.small_break_line_left}></div>
                            <div className={styles.separate}>hoặc</div>
                            <div className={styles.small_break_line_right}></div>
                        </div>

                        <div onClick={thiz.goSignUp.bind(this)}
                             className={[styles.button, styles.button_sub].join(' ')}>
                            Tạo mới tài khoản
                        </div>

                        <div onClick={thiz.goForgot.bind(this)}
                             className={[styles.button]}>
                            Quên mật khẩu
                        </div>

                    </div>

                </Pane>
            </Pane>
        );
    }
}

