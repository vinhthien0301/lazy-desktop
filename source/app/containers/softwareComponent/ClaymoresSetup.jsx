import React from "react";
import {Pane, Input, ButtonGroup, Button} from "react-photonkit"
import SoftwareInterface from './SoftwareInterface';


import JsonDefaultLoader from './../JsonDefaultLoader.jsx';

import appStyles from '../../styles/app.scss';
import style from '../../styles/setup.scss';

import {machineIdSync} from 'node-machine-id';

var thiz;


export default class ClaymoresSetup extends SoftwareInterface {

    constructor(props) {
        super(props);
        thiz = this;

        let machineID = machineIdSync({original: true});

        thiz.state = {
            downloadLinks: [],
            rootDirs: [],
            machineID: machineID,
            downloadingSoftware : []
        };

    }


    componentWillReceiveProps(nextProps) {
        if (nextProps.softwareDownloadLinks && nextProps.rootDirs && nextProps.downloadingSoftware) {
            var downloadLinks = [];
            nextProps.softwareDownloadLinks.forEach(function (item, index, arr) {
                if (item.software == JsonDefaultLoader.CLAYMORES_SOFTWARE) {
                    downloadLinks.push(item);
                }
            });

            thiz.setState({
                downloadLinks: downloadLinks,
                rootDirs: nextProps.rootDirs,
                downloadingSoftware: nextProps.downloadingSoftware
            });
        }
    }

    softwareSetupReadyCallback(softwareData) {
        thiz.props.onClaymoreSetupChanged(softwareData);
    }

    render() {
        return (
            <Pane className={this.props.isActive ? '' : [appStyles.hidden].join(' ')}>

                <table ref="main" className="table-striped abc">
                    <thead>
                    <tr>
                        <th>Tên</th>
                        <th>Phiên bản</th>
                        <th>Trạng thái</th>
                        <th>Đường dẫn</th>
                        <th>Thao tác</th>
                    </tr>
                    </thead>
                    <tbody>
                    {thiz.state.downloadLinks.map((item, index) => (
                        <tr disabled={true}  key={index}>
                            <td className={style.medium}><div className={style.directory}>{item.name}</div></td>
                            <td className={style.small}>{item.version}</td>
                            <td className={style.medium}><div className={style.directory}>{thiz.getState(item, thiz.state.rootDirs, thiz.state.downloadingSoftware)}</div></td>
                            <td className={style.larger}><div className={style.directory}>{thiz.getDir(item, thiz.state.rootDirs)}</div></td>
                            <td>
                                <ButtonGroup>
                                    <Button text="Tải về"
                                            glyph="download" onClick={thiz.onDownloadClicked.bind(this,item)}></Button>

                                    <Button text="Đến thư mục"
                                            glyph="home" onClick={thiz.onShow.bind(this,item,thiz.state.machineID,thiz.state.rootDirs)} ></Button>
                                </ButtonGroup>
                            </td>
                        </tr>

                    ))}
                    </tbody>
                </table>
            </Pane>
        );

    }
}

