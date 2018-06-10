import React from "react";
import ReactDom from "react-dom";
import { Pane, Button, ButtonGroup } from "react-photonkit";
import Config from "./../Config.jsx"

import appStyles from '../../styles/app.scss';
import styles from '../../styles/main.scss';

var thiz;

class ConfigAction extends React.Component {
    constructor(props) {
        super(props);
        thiz = this;
        thiz.state = {
            canSave: thiz.props.canSave
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.canSave != thiz.state.canSave) {
            thiz.setState({
                canSave: nextProps.canSave
            });
        }
    }

    onReset() {
        if (thiz.props.canSave) {
            thiz.props.onReset();
        }
    }
    onSave() {
        if (thiz.props.canSave) {
            thiz.props.onSave();
        }
    }
    onMine() {
        thiz.props.onMine();
    }

    render() {
        return (
            <Pane>
                <ButtonGroup>
                    <Button active={!thiz.state.canSave} text="Xoá thay đổi" glyph="reply" onClick={thiz.onReset.bind(this)}></Button>
                    <Button active={!thiz.state.canSave} text="Lưu thay đổi" glyph="floppy" onClick={thiz.onSave.bind(this)}></Button>
                    <Button text="Khởi động đào" glyph="flight" onClick={thiz.onMine.bind(this)}></Button>
                </ButtonGroup>
            </Pane>
        );
    }
}

export default ConfigAction
