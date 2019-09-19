import React from 'react';
import ReactDOM from 'react-dom';
import './index.less';
import MainMenu from './components/main-menu/main-menu.js';
import Board from './components/board/board.js';
import Renderer from './render.js';
import SideMenu from "./components/side-menu/side-menu";

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            renderer: null,
        };


    }

    componentDidMount() {
        console.log(2);
        this.setState({renderer: new Renderer()});
    }

    groups = [
        {
            name: 'Base',
            elements: ['Or', 'And', 'Xor', 'Nand', 'Nor'],
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
                    <SideMenu className="side-menu" groups={this.groups} renderer={this.props.renderer}/>
                    <div id="board-container">
                        {/*<Board renderer={this.state.renderer}/>*/}
                        <div id="test" />
                    </div>
                </div>
            </div>
        );
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('root')
);
