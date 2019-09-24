import React from 'react';
import ReactDOM from 'react-dom';
import './index.less';
import MainMenu from './components/main-menu/main-menu.js';
import Board from './components/board/board.js';
import Renderer from './render.js';
import SideMenu from "./components/side-menu/side-menu";
import And from './elements/And/And'

function ElementBase(name, create = () => 0) {
    this.name = name;
    this.create = create;
}

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            renderer: null,
        };
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
                new ElementBase('Xor'), 'Nand', 'Nor'],
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

    render() {
        return (
            <div className="app">
                <MainMenu renderer={this.state.renderer} number={this.number}/>
                <div className="drawing-area">
                    <SideMenu className="side-menu" groups={this.groups} renderer={this.state.renderer}/>
                    <Board renderer={this.state.renderer} />
                </div>
            </div>
        );
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('root')
);
