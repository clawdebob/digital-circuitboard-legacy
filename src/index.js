import React from 'react';
import ReactDOM from 'react-dom';
import './index.less';
import MainMenu from './components/main-menu/main-menu.js';
import Board from './components/board/board.js';
import SideMenu from "./components/side-menu/side-menu";
import ActionPanel from "./components/action-panel/action-panel";
import And from './elements/And/And';
import Nand from './elements/Nand/Nand';
import Xor from './elements/Xor/Xor';
import Or from './elements/Or/Or';
import Nor from './elements/Nor/Nor';
import Constant from './elements/Constant/Constant';
import Button from './elements/Button/Button';
import Nxor from "./elements/Nxor/Nxor";

function ElementBase(name, create = () => 0) {
    this.name = name;
    this.create = create;
}

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentEl: null,
            boardState: null,
        };

        this.handleChange = this.handleChange.bind(this);
    }

    groups = [
        {
            name: 'Base',
            elements: [
                new ElementBase('Or', (props) => new Or(props)),
                new ElementBase('Nor', (props => new Nor(props))),
                new ElementBase('And', (props) => new And(props)),
                new ElementBase('Nand', (props => new Nand(props))),
                new ElementBase('Xor', (props) => new Xor(props)),
                new ElementBase('Nxor', (props => new Nxor(props))),
                new ElementBase('Constant', (props => new Constant(props))),
                new ElementBase('Button', (props => new Button(props))),
            ],
        },
        {
            name: 'Gates',
            elements: ['Invertor', 'Bus'],
        },
        {
            name: 'Plexers',
            elements: ['Multiplexor', 'Demultiplexor', 'Decoder', 'Coder'],
        },
        {
            name: 'Arithmetic',
            elements: ['Summator']
        },
        {name: 'Memory', elements: ['ROM', 'RAM']},
        {name: 'Input/Output', elements: ['Bulb', 'Button', 'Contact']},
    ];

    handleChange(curEl) {
        this.setState({
            currentEl: curEl,
        });
    };

    setBoardState(state) {
        this.setState({boardState: state});
    }

    render() {
        return (
            <div className="app">
                <MainMenu onClick={() => {this.setBoardState('wire')}}>

                </MainMenu>
                <ActionPanel setBoardState={(state) => this.setBoardState(state)}/>
                <div className="drawing-area">
                    <SideMenu
                        className="side-menu"
                        groups={this.groups}
                        currentEl={this.state.currentEl}
                        handleChange={(props) => this.handleChange(props)}
                        setBoardState={(state) => this.setBoardState(state)}
                    />
                    <Board
                        currentEl={this.state.currentEl}
                        state={this.state.boardState}
                        setBoardState={(state) => this.setBoardState(state)}
                    />
                </div>
            </div>
        );
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('root')
);
