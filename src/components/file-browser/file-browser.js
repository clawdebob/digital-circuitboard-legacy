import React from 'react';
import _ from 'lodash';
import driveManager from "../../services/driveManager";
import Spinner from '../spinner/spinner';
import Button from '../button/button';
import STATE from "../board/board-states.consts";
import fileManager from "../../services/fileManager";
import PubSub from "../../services/pubSub";
import {EVENT} from "../../consts/events.consts";
import i18next from 'i18next';

const t = (str) => i18next.t(str);
const rootPath = 'drive://';

class FileTree extends React.Component {
    render() {
        const currentEntry = this.props.currentEntry;
        const warning = this.props.warning;
        const files = _.map(this.props.files, (file) => {
            return (
                <tr
                    className={`fs--table--row ${file.id === currentEntry.id ? `fs--table--row--selected` : ''}`}
                    key={file.id}
                    onClick={() => this.props.setCurrentEntry(file)}
                    onDoubleClick={() => this.props.goDeep(file)}
                >
                    <td className="fs--table--icon">
                        <span
                            className="iconify"
                            data-icon={`ant-design:${file.type}-outlined`}
                        />
                    </td>
                    <td className="fs--table--entry">{file.name}</td>
                </tr>
            );
        });

        if(this.props.files.length === 0) {
            if(warning){
                return (<p>{warning}</p>);
            }

            return (
                <p>{t('gdrive.fs.empty')}</p>
            );
        }

        return (
            <table className="fs--table">
                <tbody>{files}</tbody>
            </table>
        );
    }
}

class FileBrowser extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            path: [
                {
                    name: 'drive:/',
                    type: 'folder',
                    id: 'root'
                }
            ],
            currentEntry: {
                name: 'drive:/',
                type: 'folder',
                id: 'root'
            },
            files: [],
            warningMsg: null
        };

        this.navigateToLoginPopup = this.navigateToLoginPopup.bind(this);
    }

    navigateToLoginPopup() {
        this.close();
        PubSub.publish(EVENT.TOGGLE_GDRIVE_POPUP, true);
    }

    close() {
        PubSub.publish(EVENT.TOGGLE_FILE_BROWSER, {
            state: false,
            mode: ''
        });
    }

    openFile() {
        const file = this.state.currentEntry;

        this.close();
        PubSub.publish(EVENT.TOGGLE_LOADING, {
            toggle: true,
            status: i18next.t('loading-file', {file: file.name})
        });
        driveManager.getFile(file.id).subscribe((data) => {
            const {status, fileData} = data.response;

            if(status === 'success') {
                const scheme = JSON.parse(fileData);

                fileManager.loadData(scheme, file.name).then((data) => {
                    PubSub.publish(EVENT.UPDATE_DATA, data);
                    setTimeout(() => {
                        PubSub.publish(EVENT.SET_BOARD_STATE, STATE.LOAD_DATA);
                    }, 100);
                });
            } else if (status === 'auth') {
                PubSub.publish(EVENT.TOGGLE_LOADING, {toggle: false});
                PubSub.publish(EVENT.SHOW_NOTICE,{
                    description: 'gdrive.fs.warning',
                    type: 'warning'
                });
            } else {
                PubSub.publish(EVENT.TOGGLE_LOADING, {toggle: false});
                PubSub.publish(EVENT.SHOW_NOTICE,{
                    description: 'gdrive.error.file-loading',
                    type: 'error'
                });
            }
        }, () => {
            PubSub.publish(EVENT.TOGGLE_LOADING, {toggle: false});
            PubSub.publish(EVENT.SHOW_NOTICE,{
                description: 'gdrive.error.file-loading',
                type: 'error'
            });
        });
    }

    saveFile() {
        const data = this.props.schemeData;
        const folder = this.state.currentEntry;

        this.close();
        driveManager.saveFile(data, folder.id)
            .subscribe((data) => {
                const {status} = data.response;

                if(status === 'success') {
                    PubSub.publish(EVENT.SHOW_NOTICE, {
                        description: 'fs.success-save',
                        type: 'success'
                    });
                } else if (status === 'auth') {
                    PubSub.publish(EVENT.SHOW_NOTICE,{
                        description: 'gdrive.fs.warning',
                        type: 'warning'
                    });
                } else {
                    PubSub.publish(EVENT.SHOW_NOTICE,{
                        description: 'gdrive.error.file-loading',
                        type: 'error'
                    });
                }
            }, () => {
                PubSub.publish(EVENT.SHOW_NOTICE,{
                    description: 'gdrive.error.file-loading',
                    type: 'error'
                });
            });
    }

    goUp() {
        const path = this.state.path;

        path.pop();
        this.setState({
            path
        });
        this.setFolder(_.last(path).id);
        this.setCurrentEntry(_.last(path));
    }

    goDeep(entry) {
        const path = this.state.path;

        if(entry.type === 'file') {
            this.openFile();

            return;
        }

        path.push(entry);
        this.setState({
            path
        });
        this.setFolder(entry.id);
    }

    setCurrentEntry(entry) {
        this.setState({
            currentEntry: entry
        });
    }

    setFolder(folderId) {
        const mode = this.props.mode || 'open';

        this.setState({
            loading: true
        });
        driveManager.listFiles(folderId)
            .subscribe((data) => {
                if(data.response.status === 'success') {
                    let files = _.map(data.response.files, (file) => {
                        const {name, id} = file;
                        const fileRegx = /.+\.dcb/;
                        const type = fileRegx.test(name) ? 'file' : 'folder';

                        return {
                            id,
                            name,
                            type
                        }
                    });

                    if(mode === 'save') {
                        files = _.filter(files, ['type', 'folder'])
                    }

                    this.setState({
                        loading: false,
                        files
                    });
                }
            });
    }

    componentDidMount() {
        if(driveManager.isLoggedIn) {
            this.setFolder(_.last(this.state.path).id);
        } else {
            this.setState({
                warningMsg: (<span className="false-link" onClick={this.navigateToLoginPopup}>{t('gdrive.fs.login-message')}</span>)
            });
        }
    }

    render() {
        const {path, files, loading, currentEntry} = this.state;
        const mode = this.props.mode || 'open';
        const fullPath = _.reduce(path, (acc, folder) => acc += folder.name + '/', '');
        const isRoot = fullPath === rootPath;
        const isLoading = loading;
        const entryRestriction = mode === 'save' ? 'folder' : 'file';

        return (
            <div className="fade-curtain">
                <div className="fs__popup">
                    <span
                        className="close"
                        onClick={() => this.close()}
                    >
                        ✕
                    </span>
                    <div className="fs__area">
                        <div className="fs__top">
                            <div className="fs__top--path">
                                {fullPath}&lrm;
                            </div>
                            <div
                                className={`fs__top--back fs__top--back${isRoot || isLoading ? '--disabled' : '--enabled'}`}
                                title={t('gdrive.fs.upper')}
                                onClick={isRoot ? _.noop : () => this.goUp()}
                            >
                                <span
                                    className="iconify"
                                    data-icon="entypo:back"
                                />
                            </div>
                        </div>
                        <div className={
                            `fs__content fs__content${isLoading || files.length === 0 ? '--center' : ''}`
                        }>
                            {isLoading ? (
                                <Spinner/>
                            ) : (
                                <FileTree
                                    files={files}
                                    currentEntry={currentEntry}
                                    setCurrentEntry={(entry) => this.setCurrentEntry(entry)}
                                    goDeep={(folder) => this.goDeep(folder)}
                                    warning={this.state.warningMsg}
                                />
                            )}
                        </div>
                        <div className="fs__bottom">
                            {this.props.mode === 'open' ?
                                (
                                    <Button
                                        text={'main-menu.options.file.open'}
                                        type="primary"
                                        className={'fs__bottom--close'}
                                        onClick={() => this.openFile()}
                                        disabled={currentEntry.type !== entryRestriction}
                                    />
                                ) : (
                                    <Button
                                        text={'main-menu.options.file.save'}
                                        type="primary"
                                        className={'fs__bottom--close'}
                                        onClick={() => this.saveFile()}
                                        disabled={currentEntry.type !== entryRestriction || !driveManager.isLoggedIn}
                                    />
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default FileBrowser;
