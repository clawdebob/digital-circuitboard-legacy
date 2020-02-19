import React from 'react';
import ReactDOM from 'react-dom';
import './index.less';
import MainMenu from './components/main-menu/main-menu.js';
import Board from './components/board/board.js';
import SideMenu from "./components/side-menu/side-menu";
import ActionPanel from "./components/action-panel/action-panel";
import FileInput from './components/file-input/file-input';
import fileManager from './modules/fileManager';
import {GROUPS} from "./consts/groups.consts";

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentEl: null,
            boardState: null,
            data: {
                schemeName: 'Scheme',
                elements: null,
                wires: null
            }
        };
        this.save = this.save.bind(this);
        this.options = [
            {
                name: 'File',
                suboptions: [
                    {name: "Save", hotkey: "Ctrl+S", action: this.save},
                    {name: "Open", action: this.open},
                    {name: "Delete", hotkey: "Delete"}
                ]
            },
            {
                name: 'Edit',
                suboptions: [
                    {name: "Save", hotkey: "Ctrl+S"},
                    {name: "Open"},
                    {name: "Delete", hotkey: "Delete"}
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
                    {name: "Save", hotkey: "Ctrl+S"},
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
    }

    open() {
        fileManager.openFile();
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

    render() {
        return (
            <div className="app">
                <MainMenu
                    options={this.options}
                    setSchemeName={this.setSchemeName}
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
                    />
                </div>
                <FileInput
                    updateData={(data) => this.updateData(data)}
                    setBoardState={(state) => this.setBoardState(state)}
                />
            </div>
        );
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('root')
);
