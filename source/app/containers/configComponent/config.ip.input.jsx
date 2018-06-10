import React from "react";
import ReactDom from "react-dom";
import { Pane, Input, Button } from "react-photonkit";

require('../../styles/main.scss');
var data = "";

class ConfigIpInput extends React.Component {
    constructor(props) {
        super(props);
        this.circumstances = {
            foundedSpecialCharacter: 1,
            unExpectedLengthString: 2,
            permittedLengthString: 3,
            foundedAlphaBet: 4
        };

        this.input = {
            input1: 1,
            input2: 2,
            input3: 3,
            input4: 4,
            port: 5
        }
    }


    componentDidMount() {
        this.updateInputData();
    }

    selectAllText(text) {
        if (document.activeElement === ReactDom.findDOMNode(this.refs.ip1)) {
            this.refs.ip1.selectionStart = 0;
            this.refs.ip1.selectionEnd = text.length;
        } else if (document.activeElement === ReactDom.findDOMNode(this.refs.ip2)) {
            this.refs.ip2.selectionStart = 0;
            this.refs.ip2.selectionEnd = text.length;
        } else if (document.activeElement === ReactDom.findDOMNode(this.refs.ip3)) {
            this.refs.ip3.selectionStart = 0;
            this.refs.ip3.selectionEnd = text.length;
        } else if (document.activeElement === ReactDom.findDOMNode(this.refs.ip4)) {
            this.refs.ip4.selectionStart = 0;
            this.refs.ip4.selectionEnd = text.length;
        } else if (document.activeElement === ReactDom.findDOMNode(this.refs.port)) {
            this.refs.port.selectionStart = 0;
            this.refs.port.selectionEnd = text.length;
        }
    }

    event(event, text, position) {
        if (event === this.circumstances.foundedSpecialCharacter) {
            if (text.includes(".")) {
                text = text.replace(/[^0-9]/g, '');
                this.setTextToInput(text, null);
                this.checkComponent();
                if (position > 1) {
                    this.moveToNextInput();
                }
                if (position == 1 && text == "") {
                    this.setTextToInput(text, position - 1);
                }
                if (text == "") {
                    this.updateAllInput(null);
                    this.selectAllText(text);
                }
            } else {
                text = text.replace(/[^0-9]/g, '');
                this.setTextToInput(text, null);
            }
        } else if (event === this.circumstances.unExpectedLengthString) {
            if (document.activeElement !== ReactDom.findDOMNode(this.refs.port)) {
                if (text.includes(".")) {
                    text = text.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
                    this.setTextToInput(text, position);
                    this.moveToNextInput();
                } else {
                    this.updateAllInput(position);
                }
            }
        } else if (event === this.circumstances.foundedAlphaBet) {
            //text = text.replace(/\D/g, '');
            this.updateAllInput(position);
        }
    }

    setTextToInput(text, position) {
        if (document.activeElement === ReactDom.findDOMNode(this.refs.ip1)) {
            this.refs.ip1.value = text;
            if (position != null) {
                this.refs.ip1.selectionStart = position;
                this.refs.ip1.selectionEnd = position;
            }
        } else if (document.activeElement === ReactDom.findDOMNode(this.refs.ip2)) {
            this.refs.ip2.value = text;
            if (position != null) {
                this.refs.ip2.selectionStart = position;
                this.refs.ip2.selectionEnd = position;
            }
        } else if (document.activeElement === ReactDom.findDOMNode(this.refs.ip3)) {
            this.refs.ip3.value = text;
            if (position != null) {
                this.refs.ip3.selectionStart = position;
                this.refs.ip3.selectionEnd = position;
            }
        } else if (document.activeElement === ReactDom.findDOMNode(this.refs.ip4)) {
            this.refs.ip4.value = text;
            if (position != null) {
                this.refs.ip4.selectionStart = position;
                this.refs.ip4.selectionEnd = position;
            }
        } else if (document.activeElement === ReactDom.findDOMNode(this.refs.port)) {
            this.refs.port.value = text;
            if (position != null) {
                this.refs.port.selectionStart = position;
                this.refs.port.selectionEnd = position;
            }
        }
    }

    moveToNextInput() {
        if (document.activeElement === ReactDom.findDOMNode(this.refs.ip1)) {
            this.refs.ip2.focus();
            this.refs.ip2.selectionStart = 0;
            this.refs.ip2.selectionEnd = this.refs.ip2.value.length;
        } else if (document.activeElement === ReactDom.findDOMNode(this.refs.ip2)) {
            this.refs.ip3.focus();
            this.refs.ip3.selectionStart = 0;
            this.refs.ip3.selectionEnd = this.refs.ip3.value.length;
        } else if (document.activeElement === ReactDom.findDOMNode(this.refs.ip3)) {
            this.refs.ip4.focus();
            this.refs.ip4.selectionStart = 0;
            this.refs.ip4.selectionEnd = this.refs.ip4.value.length;
        } else if (document.activeElement === ReactDom.findDOMNode(this.refs.ip4)) {
            this.refs.port.focus();
            this.refs.port.selectionStart = 0;
            this.refs.port.selectionEnd = this.refs.port.value.length;
        }
    }

    updateInputValue(evt) {
        var text = evt.target.value;
        if (text !== "") {

            var startPosition = evt.target.selectionStart;
            var enableMoveToNext = false;
            if (startPosition == evt.target.value.length) {
                enableMoveToNext = true;
            }
            var specialCharacter = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
            if (text.includes(":")) {
                if (document.activeElement === ReactDom.findDOMNode(this.refs.ip4)) {
                    //this.event(this.circumstances.foundedSpecialCharacter, text, startPosition);
                    var tempText = text.replace(/[^0-9]/g, '');
                    this.refs.ip4.value = tempText;
                    this.refs.port.focus();
                    return;
                }
            }
            if (specialCharacter.test(text)) {
                enableMoveToNext = false;

                this.event(this.circumstances.foundedSpecialCharacter, text, startPosition);
            } else if (text.length > 3) {
                this.event(this.circumstances.unExpectedLengthString, text, startPosition);
                if (text.match(/[a-z]/i)) {
                    enableMoveToNext = false;
                }
            } else if (text.match(/[a-z]/i)) {
                this.event(this.circumstances.foundedAlphaBet, text, null);
            }

            if (text.length < 3) {
                enableMoveToNext = false;
            }
            if (enableMoveToNext) {
                var success = this.checkComponent();
                if (success) {
                    this.moveToNextInput();
                    this.addSelection(text);
                }
            }
            this.updateInputData();
        }
    }

    addSelection(text) {
        if (document.activeElement === ReactDom.findDOMNode(this.refs.ip1)) {
            this.refs.ip1.selectionStart = 0;
            this.refs.ip1.selectionEnd = text.length;
        } else if (document.activeElement === ReactDom.findDOMNode(this.refs.ip2)) {
            this.refs.ip2.selectionStart = 0;
            this.refs.ip2.selectionEnd = text.length;
        } else if (document.activeElement === ReactDom.findDOMNode(this.refs.ip3)) {
            this.refs.ip3.selectionStart = 0;
            this.refs.ip3.selectionEnd = text.length;
        } else if (document.activeElement === ReactDom.findDOMNode(this.refs.ip4)) {
            this.refs.ip4.selectionStart = 0;
            this.refs.ip4.selectionEnd = text.length;
        }
    }

    updateAllInput(position) {
        if (document.activeElement === ReactDom.findDOMNode(this.refs.ip1)) {
            this.refs.ip1.value = this.input.input1;
            this.refs.ip1.selectionStart = position - 1;
            this.refs.ip1.selectionEnd = position - 1;

        } else if (document.activeElement === ReactDom.findDOMNode(this.refs.ip2)) {
            this.refs.ip2.value = this.input.input2;
            this.refs.ip2.selectionStart = position - 1;
            this.refs.ip2.selectionEnd = position - 1;
        } else if (document.activeElement === ReactDom.findDOMNode(this.refs.ip3)) {
            this.refs.ip3.value = this.input.input3;
            this.refs.ip3.selectionStart = position - 1;
            this.refs.ip3.selectionEnd = position - 1;
        } else if (document.activeElement === ReactDom.findDOMNode(this.refs.ip4)) {
            this.refs.ip4.value = this.input.input4;
            this.refs.ip4.selectionStart = position - 1;
            this.refs.ip4.selectionEnd = position - 1;
        }
    }

    updateInputData() {
        this.input.input1 = this.refs.ip1.value;
        this.input.input2 = this.refs.ip2.value;
        this.input.input3 = this.refs.ip3.value;
        this.input.input4 = this.refs.ip4.value;
        this.input.port = this.refs.port.value;
        this.props.machineName.ip1 = this.input.input1;
        this.props.machineName.ip2 = this.input.input2;
        this.props.machineName.ip3 = this.input.input3;
        this.props.machineName.ip4 = this.input.input4;
        this.props.machineName.port = this.input.port;
    }

    checkInputValue(evt) {
        this.checkComponent();
    }

    checkComponent() {
        var success = false;
        if (document.activeElement === ReactDom.findDOMNode(this.refs.ip1)) {
            success = this.checkSingleConponent(this.refs.ip1, 1, 223);
        } else if (document.activeElement === ReactDom.findDOMNode(this.refs.ip2)) {
            success = this.checkSingleConponent(this.refs.ip2, 0, 255);
        } else if (document.activeElement === ReactDom.findDOMNode(this.refs.ip3)) {
            success = this.checkSingleConponent(this.refs.ip3, 0, 255);
        } else if (document.activeElement === ReactDom.findDOMNode(this.refs.ip4)) {
            success = this.checkSingleConponent(this.refs.ip4, 0, 255);
        }
        return success;
    }

    checkSingleConponent(component, minEntry, maxEntry) {
        var text = component.value;
        if (text !== "") {
            var number = parseInt(text);
            if (!(minEntry <= text && text <= maxEntry)) {
                if (number < minEntry) {
                    component.value = minEntry.toString();
                } else if (number > maxEntry) {
                    component.value = maxEntry.toString();
                }
                alert(number + " is not a valid entry. Please specify a value between " + minEntry.toString() +
                    " and " + maxEntry.toString());
                component.focus();
                return false;
            }
            return true;
        }

    }

    keyPress(evt) {

        if (evt.key == "Backspace") {
             if (document.activeElement === ReactDom.findDOMNode(this.refs.ip2)) {
                if (evt.target.selectionEnd == 0) {
                    this.refs.ip1.focus();
                    var value = this.refs.ip1.value;
                    this.refs.ip1.value = value;
                }
            } else if (document.activeElement === ReactDom.findDOMNode(this.refs.ip3)) {
                if (evt.target.selectionEnd == 0) {
                    this.refs.ip2.focus();
                    var value = this.refs.ip2.value;
                    this.refs.ip2.value = value;
                }
            } else if (document.activeElement === ReactDom.findDOMNode(this.refs.ip4)) {
                if (evt.target.selectionEnd == 0) {
                    this.refs.ip3.focus();
                    var value = this.refs.ip3.value;
                    this.refs.ip3.value = value;
                }
            } else {
                if (evt.target.selectionEnd == 0) {
                    this.refs.ip4.focus();
                    var value = this.refs.ip4.value;
                    this.refs.ip4.value = value;
                }
            }
        }
    }

    render() {
        return (
            <div>
                <input type="text" className="main_content_input_small margin_top"
                       onChange={(evt) => {this.updateInputValue(evt);this.props.onClick()}}
                       onBlur={evt => this.checkInputValue(evt)}
                       defaultValue={this.props.machineName.ip1}
                       onKeyDown={evt => this.keyPress(evt)}
                       id="ip1" ref="ip1" placeholder="127"/>

                <div className="speccial_character padding_top_twenty_five">.</div>
                <input type="text" onChange={evt => {this.updateInputValue(evt);this.props.onClick()}}
                       onBlur={(evt) => this.checkInputValue(evt)}
                       onKeyDown={evt => this.keyPress(evt)}
                       className="main_content_input_small margin_top" ref="ip2"
                       defaultValue={this.props.machineName.ip2} placeholder="0"/>

                <div className="speccial_character padding_top_center">.</div>
                <input onChange={(evt) => {this.updateInputValue(evt);this.props.onClick()}}
                       onBlur={evt => this.checkInputValue(evt)}
                       onKeyDown={evt => this.keyPress(evt)}
                       type="text" className="main_content_input_small margin_top" ref="ip3"
                       defaultValue={this.props.machineName.ip3} placeholder="0"/>

                <div className="speccial_character padding_top_center">.</div>
                <input onChange={(evt) => {this.updateInputValue(evt);this.props.onClick()}}
                       onBlur={evt => this.checkInputValue(evt)}
                       onKeyDown={evt => this.keyPress(evt)}
                       type="text" className="main_content_input_small margin_top" ref="ip4"
                       defaultValue={this.props.machineName.ip4} placeholder="0"/>

                <div className="speccial_character padding_top_center">:</div>
                <input onChange={(evt) => {this.updateInputValue(evt);this.props.onClick()}}
                       onKeyDown={evt => this.keyPress(evt)}
                       type="text" className="main_content_input_small margin_top" ref="port"
                       defaultValue={this.props.machineName.port} placeholder="Port"/>
            </div>

        );

    }
}

export default ConfigIpInput
