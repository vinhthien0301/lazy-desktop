import React from "react";

import {Link} from 'react-router-dom';
import {Window, Content, Button, PaneGroup, Pane} from "react-photonkit";
import {Router, Route, IndexRoute, browserHistory} from "react-router";
import Constant from './EnumCompare';
import Utility from './Utility';

import appStyles from '../styles/app.scss';
import styles from '../styles/signup.scss';
import axios from 'axios';

import imageTitle from '.././icon.png';
import configJs from '../config.json';
var os = require('os');
import {machineIdSync} from 'node-machine-id';
import publicIP from 'react-native-public-ip';

import imageWarning from '.././styles/img/warining.png';
import imageRegister from '.././styles/img/register.png';


var thiz;


export default class SignupPage extends React.Component {

    constructor(props) {
        super(props);

        thiz = this;
        this.state = {
            emailFirstFocus: true,
            passwordFirstFocus: true,
            retypeFirstFocus: true,
            errorEmailContent: "",
            errorPwContent: "",
            errorRetypeContent: "",
            errorSignUpContent: "",
            signUpReady: false
        };

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
    signUp() {
        if (thiz !== null && thiz.refs.pw !== undefined && thiz.refs.pw !== null &&
            thiz.refs.email !== undefined && thiz.refs.email !== null) {
            var email = thiz.refs.email.value;
            var pw = thiz.refs.pw.value;
            var retype = thiz.refs.retype.value;

            if (pw != retype) {
                thiz.setState({
                    errorSignUpContent: "Mật khẩu nhập lại không trùng khớp"
                });
                return;
            }


            publicIP().then(ip => {
                var public_ip = ip;
                var email = thiz.refs.email.value;
                var pw = thiz.refs.pw.value;
                let machineID = machineIdSync({original: true});
                var url = Constant.getSignUpString(email, pw , thiz.getSysInfo(),machineID,public_ip);

                axios.post(url)
                    .then(function (response) {
                        if (response.data.response_code === Constant.SignUpState.SUCCESS) {
                            var token = response.data.data.token;
                            var email = response.data.data.email;
                            localStorage.setItem('token', token);
                            localStorage.setItem('email', email);
                            thiz.props.history.push('/main');
                        } else {
                            var errorString = "";
                            if (response.data.response_code == Constant.SignUpState.ERROR_ACCOUNT_EXISTING) {
                                errorString = "Tài khoản đã tồn tại. Nếu bạn quên mật khẩu, bạn có thế bấm vào đây để lấy lại mật khẩu.";
                            }
                            thiz.setState({
                                errorSignUpContent: errorString
                            });
                        }
                    })
                    .catch(function (error) {
                        thiz.setState({
                            errorSignUpContent: "Máy chủ đang bảo trì, vui lòng liên lạc với chúng tôi để biết thêm chi tiết."
                        });
                    });

            });




        }
    }

    goLogin() {
        thiz.props.history.push('/');
    }

    isPasswordValid(password) {
        return password.length >= 6;
    }

    isRetypeValid(retype) {
        return thiz.isPasswordValid(retype);
    }

    isSignUpReady() {
        var email = thiz.refs.email.value;
        var password = thiz.refs.pw.value;
        var retype = thiz.refs.retype.value;
        var emailValid = Utility.validateEmail(email);
        var passwordValid = thiz.isPasswordValid(password);
        var retypeValid = thiz.isPasswordValid(retype);
        return emailValid && passwordValid && retypeValid;
    }

    validateEmail() {
        var email = thiz.refs.email.value;
        var emailValid = Utility.validateEmail(email);

        thiz.setState({
            errorEmailContent: ((!emailValid && !thiz.state.emailFirstFocus) ? "Hãy nhập chính xác địa chỉ email" : ""),
            signUpReady: thiz.isSignUpReady()
        });
    }

    validatePassword() {
        var password = thiz.refs.pw.value;
        var passwordValid = thiz.isPasswordValid(password);

        thiz.setState({
            errorPwContent: ((!passwordValid  && !thiz.state.passwordFirstFocus) ? "Mật khẩu phải có ít nhất 6 ký tự" : ""),
            signUpReady: thiz.isSignUpReady()
        });
    }

    validateRetype() {
        var retype = thiz.refs.retype.value;
        var retypeValid = thiz.isRetypeValid(retype);

        thiz.setState({
            errorRetypeContent: ((!retypeValid  && !thiz.state.retypeFirstFocus) ? "Mật khẩu phải có ít nhất 6 ký tự" : ""),
            signUpReady: thiz.isSignUpReady()
        });
    }

    unlockFirstEmail() {
        thiz.state.emailFirstFocus = false;
        thiz.validateEmail();
    }

    unlockFirstPassword() {
        thiz.state.passwordFirstFocus = false;
        thiz.validatePassword();
    }

    unlockFirstRetype() {
        thiz.state.retypeFirstFocus = false;
        thiz.validateRetype();
    }

    componentDidMount() {
        // nothing
    }
    handleKeyPress(target) {
        if(target.charCode==13){
            if (thiz.state.signUpReady) {
                thiz.signUp();
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
                    <Pane className={styles.signup_part}>
                        <Pane className={styles.err_holder}>
                            <div className={[thiz.state.errorSignUpContent ? styles.err_content : appStyles.hidden].join(' ')}>
                                <img src={imageWarning} width="23" height="23"/>
                                <div className={styles.error}>{thiz.state.errorSignUpContent}</div>
                            </div>
                        </Pane>

                            <h2>Tạo tài khoản mới</h2>
                            <h4>Nhập <strong>email</strong> và <strong>mật khẩu</strong> của bạn</h4>
                            <input ref="email"
                                   onKeyPress={this.handleKeyPress}
                                   onChange={thiz.validateEmail.bind(this)}
                                   onBlur={thiz.unlockFirstEmail.bind(this)}
                                   type="text"
                                   placeholder="you@example.com"/>
                            <h4 ref="errorEmail"
                                className={[styles.error_offline, thiz.state.errorEmailContent ? "" : appStyles.hidden].join(' ')}>
                                {thiz.state.errorEmailContent}</h4>

                            <input ref="pw"
                                   onKeyPress={this.handleKeyPress}
                                   onChange={thiz.validatePassword}
                                   onBlur={thiz.unlockFirstPassword.bind(this)}
                                   type="password"
                                   placeholder="Mât khẩu"/>
                            <h4 ref="errorPassword"
                                className={[styles.error_offline, thiz.state.errorPwContent ? "" : appStyles.hidden].join(' ')}>
                                {thiz.state.errorPwContent}</h4>

                            <input ref="retype"
                                   onKeyPress={this.handleKeyPress}
                                   onChange={thiz.validateRetype}
                                   onBlur={thiz.unlockFirstRetype.bind(this)}
                                   type="password"
                                   placeholder="Nhập lại mật khẩu"/>
                            <h4 ref="errorRetype"
                                className={[styles.error_offline, thiz.state.errorRetypeContent ? "" : appStyles.hidden].join(' ')}>
                                {thiz.state.errorRetypeContent}</h4>

                            <p className={styles.more_info}>
                                <span>Bạn có thể dùng tài khoản này cho ứng dụng di động</span>
                                <br/>
                                <span>trên <strong>App Store</strong> hoặc <strong>Google Play</strong> của chúng tôi</span>
                            </p>
                            <div className={[styles.button, thiz.state.signUpReady ? "" : styles.disabled].join(' ')}
                                 onClick={thiz.signUp}>Tạo tài khoản</div>

                    </Pane>
                    <Pane className={styles.introduction_part}>

                        <div className={styles.looking}>
                            Tôi có tài khoản rồi!
                            <button onClick={thiz.goLogin}>Trở lại đăng nhập</button>
                        </div>
                        <img src={imageRegister} width="350" height="207.9"/>

                    </Pane>
                    <br className={styles.clear}/>
                </Pane>
            </Pane>
        );
    }
}

