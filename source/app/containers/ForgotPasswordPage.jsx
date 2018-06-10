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

import configJs from '../config.json';


var AutoLaunch = require('auto-launch');
var spawn = require('process');
var child = require('child_process');

var thiz;

export default class ForgotPasswordPage extends React.Component {

    constructor(props) {
        super(props);
        thiz = this;
        // localStorage.clear();

        // var wshShell = new ActiveXObject("WScript.Shell");
        // wshShell.Run("D:\dir\user.bat");

        var lazyAutoLauncher = new AutoLaunch({
            name: 'LazyDesktop',
            path: spawn.execPath
        });


        // child.exec(".\\resources\\test.bat", function (err, stdout, stderr) {
        //     if (err) {
        //         // Ooops.
        //         // console.log(stderr);
        //         alert(err);
        //     }
        //
        //     // Done.
        //     alert(stdout);
        // });
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
        if (token !== undefined && token !== null && email !== undefined && email !== null) {
            if (token.length > 0 && email.length > 0) {
                thiz.props.history.push('/main');
                // context.props.history.go('/main');
            }
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

    forgot(str) {
        var email = thiz.refs.email.value;

        var url = Constant.getForgorPasswordString();

        axios.post(url,{
            action: "grenade_token",
            email: email
        })
            .then(function (response) {
                var errorString = "";
                if (response.data.response_code == Constant.SUCC_EXEC.SUCCESS) {

                    errorString = "Hãy kiểm tra email để nhận thông tin thay mật khẩu"
                } else {
                    errorString = response.data.description;

                }
                thiz.setState({
                    errorLoginContent: errorString
                });
            })
            .catch(function (error) {
                thiz.setState({
                    errorLoginContent: "Máy chủ đang bảo trì, vui lòng liên lạc với chúng tôi để biết thêm chi tiết."
                });
            });


    }



    goLogin() {
        thiz.props.history.push('/');
    }

    componentDidMount() {
        // nothing
    }

    isPasswordValid(password) {
        return password.length >= 6;
    }

    isLoginReady() {
        var email = thiz.refs.email.value;
        var emailValid = Utility.validateEmail(email);
        return emailValid;
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
                        <h2>Quên mật khẩu</h2>
                        <h4>Nhập <strong>email</strong> để nhận thông tin thay đổi mật khẩu</h4>

                        <input ref="email" onKeyPress={this.handleKeyPress} onChange={thiz.validateEmail.bind(this)}
                               onBlur={thiz.unlockFirstEmail.bind(this)} type="text"
                               placeholder="you@example.com"/>
                        <h4 ref="errorEmail"
                            className={[styles.error_offline, thiz.state.errorEmailContent ? "" : appStyles.hidden].join(' ')}>
                            {thiz.state.errorEmailContent}</h4>

                        <div className={[styles.button, thiz.state.signInReady ? "" : styles.disabled].join(' ')}
                             onClick={thiz.forgot.bind(this)}>Quên mật khẩu
                        </div>

                        <div className={[styles.button]}
                             onClick={thiz.goLogin.bind(this)}>Về trang đăng nhập
                        </div>



                    </div>

                </Pane>
            </Pane>
        );
    }
}

