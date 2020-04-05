import React from 'react';
import _ from 'lodash';
import driveManager from "../../services/driveManager";
import Spinner from '../spinner/spinner';
import Button from '../button/button';
import STATE from "../board/board-states.consts";
import fileManager from "../../services/fileManager";

const rootPath = 'drive://';

class FileTree extends React.Component {
    render() {
        const currentEntry = this.props.currentEntry;
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
            return (
                <p>Current folder is empty</p>
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
        };
    }

    openFile() {
        const file = this.state.currentEntry;

        this.props.close();
        this.props.toggleLoading(true, `Loading ${file.name}`);
        driveManager.getFile(file.id).subscribe((data) => {
            const {status, fileData} = data.response;

            if(status === 'success') {
                const scheme = JSON.parse(fileData);

                fileManager.loadData(scheme, file.name).then((data) => {
                    this.props.updateData(data);
                    setTimeout(() => {
                        this.props.setBoardState(STATE.LOAD_DATA);
                    }, 100);
                });
            } else if (status === 'auth') {
                this.props.toggleLoading(false);
                this.props.showNotice({
                    description: 'Please sign in to Google Drive',
                    type: 'warning'
                });
            } else {
                this.props.toggleLoading(false);
                this.props.showNotice({
                    description: 'Error loading file',
                    type: 'error'
                });
            }
        }, () => {
            this.props.toggleLoading(false);
            this.props.showNotice({
                description: 'Error loading file',
                type: 'error'
            });
        });
    }

    saveFile() {
        const data = this.props.schemeData;
        const folder = this.state.currentEntry;

        this.props.close();
        driveManager.saveFile(data, folder.id)
            .subscribe((data) => {
                const {status} = data.response;

                if(status === 'success') {
                    this.props.showNotice({
                        description: 'File saved to Google Drive',
                        type: 'success'
                    });
                } else if (status === 'auth') {
                    this.props.showNotice({
                        description: 'Please sign in to Google Drive',
                        type: 'warning'
                    });
                } else {
                    this.props.showNotice({
                        description: 'Error saving file to Google Drive',
                        type: 'error'
                    });
                }
            }, () => {
                this.props.showNotice({
                    description: 'Error saving file to Google Drive',
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
                        onClick={() => this.props.close()}
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
                                title="To upper level"
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
                                />
                            )}
                        </div>
                        <div className="fs__bottom">
                            {this.props.mode === 'open' ?
                                (
                                    <Button
                                        text={'Open'}
                                        type="primary"
                                        className={'fs__bottom--close'}
                                        onClick={() => this.openFile()}
                                        disabled={currentEntry.type !== entryRestriction}
                                    />
                                ) : (
                                    <Button
                                        text={'Save'}
                                        type="primary"
                                        className={'fs__bottom--close'}
                                        onClick={() => this.saveFile()}
                                        disabled={currentEntry.type !== entryRestriction}
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
