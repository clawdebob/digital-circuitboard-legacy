import React from 'react';
import fileManager from "./services/fileManager";
import driveManager from './services/driveManager';
import LoadingPopup from "./components/loading-popup/loading-popup";
import DrivePopup from './components/drive-popup/drive-popup';
import MainMenu from "./components/main-menu/main-menu";
import ActionPanel from "./components/action-panel/action-panel";
import SideMenu from "./components/side-menu/side-menu";
import Notification from './components/notification/notification';
import {GROUPS} from "./consts/groups.consts";
import Board from "./components/board/board";
import FileInput from "./components/file-input/file-input";
import FileBrowser from './components/file-browser/file-browser';
import PubSub from "./services/pubSub";
import {EVENT} from "./consts/events.consts";
import _ from 'lodash';
import i18next from 'i18next';

const t = (str) => i18next.t(str);

class App extends React.Component {
    constructor(props) {
        super(props);

        _.forEach(_.values(EVENT), (val) => PubSub.createEvent(val));
        this.state = {
            currentEl: null,
            boardState: null,
            isLoading: false,
            loadingStatus: '',
            isDrivePopupVisible: false,
            fsOpened: false,
            fsMode: '',
            language: 'en',
            notice: {
                title: '',
                description: '',
                type: null,
                visible: false
            },
            data: {
                schemeName: 'Scheme',
                elements: null,
                wires: null
            }
        };
        this.notificationCounter = 0;
        this.save = this.save.bind(this);
        this.newFile = this.newFile.bind(this);
        this.manageGdrive = this.manageGdrive.bind(this);
        this.toggleFs = this.toggleFs.bind(this);
        this.options = [
            {
                name: 'main-menu.file',
                suboptions: [
                    {name: 'main-menu.options.file.new', action: this.newFile},
                    {name: 'main-menu.options.file.open', action: this.open},
                    {name: 'main-menu.options.file.save', action: this.save},
                ]
            },
            {
                name: 'Google Drive',
                suboptions: [
                    {name: "gdrive.manage", action: this.manageGdrive},
                    {name: 'main-menu.options.file.open', action: () => this.toggleFs(true, 'open')},
                    {name: 'main-menu.options.file.save', action: () => this.toggleFs(true, 'save')}
                ]
            },
            {
                name: 'main-menu.export',
                suboptions: [
                    {name: 'main-menu.options.save-as-svg', action: () => fileManager.saveAsSVG(this.state.data.schemeName)},
                    {name: 'main-menu.options.save-as-png', action: () => fileManager.saveAsPNG(this.state.data.schemeName)},
                ]
            },
        ];

        this.handleChange = this.handleChange.bind(this);
        this.updateData = this.updateData.bind(this);
        this.setSchemeName = this.setSchemeName.bind(this);
        this.toggleLoading = this.toggleLoading.bind(this);
        this.showNotice = this.showNotice.bind(this);
        PubSub.subscribe(EVENT.SET_BOARD_STATE, this.setBoardState.bind(this));
        PubSub.subscribe(EVENT.UPDATE_DATA, this.updateData.bind(this));
        PubSub.subscribe(EVENT.TOGGLE_LOADING, (data) => {
           const {toggle, status} = data;

           this.toggleLoading(toggle, status);
        });
        PubSub.subscribe(EVENT.SHOW_NOTICE, this.showNotice.bind(this));
        PubSub.subscribe(EVENT.TOGGLE_GDRIVE_POPUP, this.manageGdrive);
        PubSub.subscribe(EVENT.TOGGLE_FILE_BROWSER, (data) => {
            const {state, mode} = data;

            this.toggleFs(state, mode);
        });
        PubSub.subscribe(EVENT.SET_CURRENT_ELEMENT, this.handleChange.bind(this));
    }

    manageGdrive(val = true) {
        this.setState({
            isDrivePopupVisible: val,
        });
    }

    open() {
        fileManager.openFile();
    }

    toggleFs(state = true, mode) {
        this.setState({
            fsOpened: state,
            fsMode: mode
        });
    }

    componentDidMount() {
        driveManager
            .checkSession()
            .subscribe(
                (data) => {
                    if(data.response.status === 'success') {
                        this.showNotice({
                            description: 'gdrive.success.login',
                            type: 'success'
                        });
                    }
                },
                () => {
                    this.showNotice({
                        title: 'warning',
                        description: 'gdrive.error.unknown',
                        type: 'warning'
                    });
                }
            );
    }

    newFile() {
        this.setState({
            data: {
                schemeName: 'Scheme',
                elements: null,
                wires: null
            }
        });
        fileManager.newFile();
    }

    save() {
        const data = this.state.data;

        fileManager.saveFile(data);
    }

    handleChange(curEl) {
        this.setState({
            currentEl: curEl,
        });
    };

    toggleLoading(toggle, status = 'loading') {
        this.setState({
            isLoading: toggle,
            loadingStatus: t(status || 'loading')
        });
    }

    setBoardState(state) {
        this.setState({boardState: state});
    }

    setSchemeName(schemeName) {
        const {wires, elements} = this.state.data;

        this.setState({
            data: {
                schemeName,
                elements,
                wires
            }
        });
    }

    updateData(data) {
        this.setState({data});
    }

    showNotice(params) {
        const {title, description, type} = params;

        this.setState({
            notice: {
                type,
                title,
                description,
                id: this.notificationCounter++,
                visible: true
            }
        });
    }

    render() {
        return (
            <div className="app">
                {this.state.notice.visible ? (
                    <Notification
                        title={this.state.notice.title}
                        description={this.state.notice.description}
                        type={this.state.notice.type}
                        id={this.state.notice.id}
                    />
                ) : null}
                {
                    this.state.fsOpened ?
                    <FileBrowser
                        mode={this.state.fsMode}
                        schemeData={this.state.data}
                    />
                    : null
                }
                <LoadingPopup
                    isVisible={this.state.isLoading}
                    status={this.state.loadingStatus}
                />
                <DrivePopup
                    isVisible={this.state.isDrivePopupVisible}
                />
                <MainMenu
                    options={this.options}
                    setSchemeName={this.setSchemeName}
                    schemeName={this.state.data.schemeName}
                />
                <ActionPanel/>
                <div className="drawing-area">
                    <SideMenu
                        className="side-menu"
                        groups={GROUPS}
                        currentEl={this.state.currentEl}
                    />
                    <Board
                        currentEl={this.state.currentEl}
                        state={this.state.boardState}
                        data={this.state.data}
                    />
                </div>
                <FileInput/>
            </div>
        );
    }
}

export default App;
