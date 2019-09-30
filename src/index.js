import React from 'react';
import ReactDOM from 'react-dom';
import './index.less';
import MainMenu from './components/main-menu/main-menu.js';
import Board from './components/board/board.js';
import Renderer from './render.js';
import SideMenu from "./components/side-menu/side-menu";
import And from './elements/And/And'
import Xor from './elements/Xor/Xor'

function ElementBase(name, create = () => 0) {
    this.name = name;
    this.create = create;
}

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            renderer: null,
            currentEl: null,
            boardState: 'default',
        };

        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        this.setState({renderer: new Renderer()});
    }

    groups = [
        {
            name: 'Base',
            elements: [
                new ElementBase('Or'),
                new ElementBase('And', (props) => new And(props)),
                new ElementBase('Xor', (props) => new Xor(props)), 'Nand', 'Nor'],
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
                <MainMenu renderer={this.state.renderer} number={this.number}/>
                <div className="drawing-area">
                    <SideMenu
                        className="side-menu"
                        groups={this.groups}
                        renderer={this.state.renderer}
                        currentEl={this.state.currentEl}
                        handleChange={(props) => this.handleChange(props)}
                        setBoardState={(state) => this.setBoardState(state)}
                    />
                    <Board
                        renderer={this.state.renderer}
                        currentEl={this.state.currentEl}
                        state={this.state.boardState}
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
