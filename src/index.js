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
import _ from 'lodash';
import * as DATA_CONSTS from './consts/Parse.consts';

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
        this.save = this.save.bind(this);
        this.options = [
            {
                name: 'File',
                suboptions: [
                    {name: "Save", hotkey: "Ctrl+S", action: this.save},
                    {name: "Open"},
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
        this.data = null;
        this.schemeName = 'Scheme';

        this.handleChange = this.handleChange.bind(this);
        this.updateData = this.updateData.bind(this);
        this.setSchemeName = this.setSchemeName.bind(this);
    }

    save() {
        const name = this.schemeName;
        const data = this.data;
        const elements = _.map(data.elements, (element) => {
                let inPins = null;
                let outPins = null;

                if(element.inPins) {
                    inPins = _.map(element.inPins.pins, (pin) => {
                       return _.pick(pin, DATA_CONSTS.PIN_PROPS_TO_INCLUDE);
                    });
                }
                if(element.outPins) {
                    outPins = _.map(element.outPins.pins, (pin) => {
                        return _.pick(pin, DATA_CONSTS.PIN_PROPS_TO_INCLUDE);
                    });
                }

                return _.chain(element)
                    .pick(DATA_CONSTS.PROPS_TO_INCLUDE)
                    .extend({inPins, outPins})
                    .value();
            });
        const wires = _.map(data.wires, (wire) => {
            let inPins = null;
            let outPins = null;
            let inConnector = null;
            let outConnector = null;
            const coords = wire.getCoords();

            if(wire.inPins) {
                inPins = _.map(
                    wire.inPins.pins,
                    (pin) => _.pick(pin, DATA_CONSTS.PIN_PROPS_TO_INCLUDE)
                );
            }
            if(wire.outPins) {
                outPins = _.map(
                    wire.outPins.pins,
                    (pin) => _.pick(pin, DATA_CONSTS.PIN_PROPS_TO_INCLUDE)
                );
            }
            if(wire.inConnector) {
                inConnector = _.chain(wire.inConnector)
                    .pick(DATA_CONSTS.CONNECTOR_PROPS_TO_INCLUDE)
                    .extend({el: _.get(wire.inConnector, 'el.id', '')})
                    .value();
            }
            if(wire.outConnector) {
                outConnector = _.chain(wire.outConnector)
                    .pick(DATA_CONSTS.CONNECTOR_PROPS_TO_INCLUDE)
                    .extend({el: _.get(wire.outConnector, 'el.id', '')})
                    .value();
            }

            return _.chain(wire)
                .pick(DATA_CONSTS.PROPS_TO_INCLUDE)
                .extend({inPins, outPins, inConnector, outConnector, coords})
                .value();
        });
        const saveData = JSON.stringify({
            name,
            elements,
            wires
        });

        console.log(saveData);
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

    setSchemeName(name) {
        this.schemeName = name;
    }

    updateData(data) {
        this.data = data;
    }

    render() {
        return (
            <div className="app">
                <MainMenu
                    options={this.options}
                    setSchemeName={this.setSchemeName}
                    defaultSchemeName={this.schemeName}
                />
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
                        updateData={(data) => this.updateData(data)}
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
