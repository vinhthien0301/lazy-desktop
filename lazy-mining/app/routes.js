/* eslint flowtype-errors/show-errors: 0 */
import React from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import App from './containers/App';
import LoginPage from './containers/LoginPage';
import SignupPage from './containers/SignupPage';
import MainPage from './containers/MainPage';
import ForgotPasswordPage from './containers/ForgotPasswordPage';


export default () => (
    <App>
        <BrowserRouter>
            <Switch>
                <Route path="/forgot_password" component={ForgotPasswordPage}/>
                <Route path="/main" component={MainPage}/>
                <Route path="/signup" component={SignupPage}/>
                <Route path="/" component={LoginPage}/>
                <Route path="/login" component={LoginPage}/>
            </Switch>
        </BrowserRouter>

    </App>
);
