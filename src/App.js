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

class App extends React.Component {
    constructor(props) {
        super(props);

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
                    {name: 'main-menu.options.file.save', hotkey: "Ctrl+S", action: this.save},
                ]
            },
            {
                name: 'Google Drive',
                suboptions: [
                    {name: "Manage account", action: this.manageGdrive},
                    {name: "main-menu.options.file.open", action: () => this.toggleFs(true, 'open')},
                    {name: "main-menu.options.file.save", action: () => this.toggleFs(true, 'save')}
                ]
            },
            {
                name: 'View',
                suboptions: [
                    {name: "Save", hotkey: "Ctrl+S"},
                    {name: "Open"},
                    {name: "Delete", hotkey: "Delete"}
                ]
            },
            {
                name: 'Arrange',
                suboptions: [
                    {name: "Sign in google", hotkey: "Ctrl+S"},
                    {name: "Open"},
                    {name: "Delete", hotkey: "Delete"}
                ]
            },
            {
                name: 'Extras',
                suboptions: [
                    {name: "Save", hotkey: "Ctrl+S"},
                    {name: "Open"},
                    {name: "Delete", hotkey: "Delete"}
                ]
            },
            {
                name: 'Help',
                suboptions: [
                    {name: "Save", hotkey: "Ctrl+S"},
                    {name: "Open"},
                    {name: "Delete", hotkey: "Delete"}
                ]
            },
        ];

        this.handleChange = this.handleChange.bind(this);
        this.updateData = this.updateData.bind(this);
        this.setSchemeName = this.setSchemeName.bind(this);
        this.toggleLoading = this.toggleLoading.bind(this);
        this.showNotice = this.showNotice.bind(this);
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
                            description: 'Successfully Logged in Google Account',
                            type: 'success'
                        });
                    }
                },
                () => {
                    this.showNotice({
                        title: 'Warning!',
                        description: 'Google Drive Service is Unavailable',
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

    toggleLoading(toggle, status = 'Loading') {
        this.setState({
            isLoading: toggle,
            loadingStatus: status
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
                        close={() => this.toggleFs(false, '')}
                        updateData={(data) => this.updateData(data)}
                        setBoardState={(state) => this.setBoardState(state)}
                        toggleLoading={(val, status) => this.toggleLoading(val, status)}
                        showNotice={(params) => this.showNotice(params)}
                    />
                    : null
                }
                <LoadingPopup
                    isVisible={this.state.isLoading}
                    status={this.state.loadingStatus}
                />
                <DrivePopup
                    isVisible={this.state.isDrivePopupVisible}
                    showNotice={(params) => this.showNotice(params)}
                    close={() => this.manageGdrive(false)}
                />
                <MainMenu
                    options={this.options}
                    setSchemeName={this.setSchemeName}
                    setBoardState={(state) => this.setBoardState(state)}
                    schemeName={this.state.data.schemeName}
                />
                <ActionPanel setBoardState={(state) => this.setBoardState(state)}/>
                <div className="drawing-area">
                    <SideMenu
                        className="side-menu"
                        groups={GROUPS}
                        currentEl={this.state.currentEl}
                        handleChange={(props) => this.handleChange(props)}
                        setBoardState={(state) => this.setBoardState(state)}
                    />
                    <Board
                        currentEl={this.state.currentEl}
                        state={this.state.boardState}
                        data={this.state.data}
                        setBoardState={(state) => this.setBoardState(state)}
                        updateData={(data) => this.updateData(data)}
                        toggleLoading={(val) => this.toggleLoading(val)}
                    />
                </div>
                <FileInput
                    updateData={(data) => this.updateData(data)}
                    setBoardState={(state) => this.setBoardState(state)}
                    toggleLoading={(val, status) => this.toggleLoading(val, status)}
                />
            </div>
        );
    }
}

export default App;
