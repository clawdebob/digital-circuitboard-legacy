import React from 'react';
import Renderer from '../../render';
import Wire from '../../elements/Wire/Wire';
import STATE from './board-states.consts';
import _ from 'lodash';
import {fromEvent, BehaviorSubject} from "rxjs";

class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            x: null,
            y: null,
            x1: null,
            y1: null,
            wiresToBuild: null,
        };
        this.ghost = null;
        this.down = false;
        this.wiresToBuild = null;
        this.startingEl = null;
        this.endingEl = null;
        this.elements = [];
        this.wires = [];

        this.dragHandler = this.dragHandler.bind(this);
        this.ghostHelper = this.ghostHelper.bind(this);
        this.startWire = this.startWire.bind(this);
        this.endWire = this.endWire.bind(this);
    }

    getCoords(e) {
        const target = this.board.getBoundingClientRect();

        const x = e.pageX - target.left;
        const y = e.pageY - target.top;

        return {x: x, y: y};
    }

    calcCoords(coords) {
        coords.x = Math.floor(coords.x/12)*12 + 5;
        coords.y = Math.floor(coords.y/12)*12 + 5;
        this.setState(coords);
    }

    calcWireCoords(coords, isWireStart = false) {
        coords.x = Math.floor(coords.x/12)*12 + 5;
        coords.y = Math.floor(coords.y/12)*12 + 5;

        if(isWireStart) {
            this.setState({x1: coords.x, y1: coords.y});
        } else {
            this.setState(coords);
        }
    }

    startWire(e) {
        e.preventDefault();
        let coords = this.getCoords(e);
        this.down = true;
        this.calcWireCoords(coords, true);
    }

    endWire(e) {
        e.preventDefault();
        const wire = new Wire();
        const startingEl = this.startingEl;
        const endingEl = this.endingEl;
        wire.className = 'Wire';
        if(this.wiresToBuild) {
            const main = this.wiresToBuild.main;
            const bend = this.wiresToBuild.bend;
            if(main) {
                if (startingEl || endingEl) {
                    if(!((startingEl.el.id === endingEl.el.id)
                        && (startingEl.pin === endingEl.pin)
                        && (startingEl.type === endingEl.type))
                    ) {
                        if(startingEl.type === 'out') {
                            wire.inConnector = _.clone(startingEl);
                        } else if(startingEl.type === 'in') {
                            wire.outConnector = _.clone(startingEl);
                        }
                        if(endingEl.type === 'out') {
                            wire.inConnector = _.clone(endingEl);
                        } else if(endingEl.type === 'in') {
                            wire.outConnector = _.clone(endingEl);
                        }
                    } else {
                        if(startingEl.type === 'out') {
                            wire.inConnector = _.clone(startingEl);
                        } else if(startingEl.type === 'in') {
                            wire.outConnector = _.clone(startingEl);
                        }
                    }
                    if(main.x1 !== main.x2 && (Math.abs(main.y1 - main.y2)!== 2)) {
                        this.renderer.renderWire(wire, main.x1, main.y1, main.x2, main.y2)
                        this.wires.push(wire);
                        wire.renderFlag.subscribe(() => {
                           this.renderer.render();
                        });
                        wire.wire();
                    } else {
                        this.renderer.removeElement({className: 'main'});
                    }
                    // console.log(this.wires, this.elements);
                }
                if(bend) {
                    this.renderer.renderWire(bend, bend.x1, bend.y1, bend.x2, bend.y2);
                }
            }
        }
        this.down = false;
        this.board.removeEventListener('mousemove', this.ghostHelper);
        if(this.props.state === STATE.WIRE) {
            this.props.setBoardState(STATE.EDIT);
        }
    }

    dragHandler(e) {
        e.preventDefault();
        const el = _.cloneDeep(this.props.currentEl);

        this.renderer.renderElement(el, this.state.x, this.state.y);
        this.elements.push(el);
        el.setId();
        el.renderFlag.subscribe(() => {
           this.renderer.render();
        });
        el.updateState();
        this.applyHelpers(el);
    }

    applyHelpers(el) {
        const iterFunc = (startFunction, endFunction) => {
            return (pin, idx) => {
                const domEl = pin.helper._renderer.elem;

                fromEvent(domEl, 'mousemove')
                    .subscribe(() => {
                        if(this.props.state === STATE.EDIT || this.props.state === STATE.WIRE) {
                            pin.helper.opacity = 1;
                            this.renderer.render();
                        }
                        endFunction(el, idx);
                    });
                fromEvent(domEl, 'mousedown')
                    .subscribe(() => {
                        if(this.props.state === STATE.EDIT) {
                            this.props.setBoardState(STATE.WIRE);
                        }
                        startFunction(el, idx);
                    });
                fromEvent(domEl, 'mouseout')
                    .subscribe(() => {
                        if(this.props.state === STATE.EDIT || this.props.state === STATE.WIRE) {
                            pin.helper.opacity = 0;
                            this.renderer.render();
                        }
                    });
            };
        };
        const vm = this;
        _.forEach(
            el.outPins.pins,
            iterFunc(
                (el, idx) => {vm.startingEl = {el: el, pin: idx, type: 'out'}},
                (el, idx) => {vm.endingEl = {el: el, pin: idx, type: 'out'}}
            )
        );
        if(el.props.inContacts) {
            _.forEach(
                el.inPins.pins,
                iterFunc(
                    (el, idx) => {vm.startingEl = {el: el, pin: idx, type: 'in'}},
                    (el, idx) => {vm.endingEl = {el: el, pin: idx, type: 'in'}}
                )
            );
        }
    }

    orientationCorrection(x1, y1, x2, y2) {
        if(x1 === x2) {
            x1++;
            x2++;
            if(y1 < y2) {
                y2 += 2;
            } else {
                y1 += 2;
            }
        } else if(y1 === y2) {
            y1++;
            y2++;
            if(x1 < x2) {
                x2 += 2;
            } else {
                x1 += 2;
            }
        }

        return [x1, y1, x2, y2];
    }

    ghostHelper(e) {
        e.preventDefault();
        const ghost = this.ghost;
        let coords = this.getCoords(e);

        if(ghost && this.props.state === STATE.CREATE) {
            this.calcCoords(coords);
            this.renderer.removeElement(ghost);
            this.renderer.renderGhost(ghost, coords.x, coords.y);
        }

        if(this.props.state === STATE.WIRE && this.down) {
            const wire = new Wire();
            const bend = new Wire();
            wire.className = 'main';
            bend.className = 'bend';
            const prev = this.renderer.getElement(wire);
            this.calcWireCoords(coords);
            this.renderer.removeElement(wire);
            this.renderer.removeElement(bend);

            let x1 = this.state.x1;
            let y1 = this.state.y1;
            let x2 = this.state.x;
            let y2 = this.state.y;

            if(y1 !== y2 && x1 !== x2) {
                let x1m, y1m, x2m, y2m;
                let x1b, y1b, x2b, y2b;
                if(prev.length > 0 && (prev[0].vertices[0].x === prev[0].vertices[1].x)){
                    [x1m, y1m, x2m, y2m] = [x1, y1, x1, y2];
                    [x1b, y1b, x2b, y2b] = [x1, y2, x2, y2];
                } else {
                    [x1m, y1m, x2m, y2m] = [x1, y1, x2, y1];
                    [x1b, y1b, x2b, y2b] = [x2, y1, x2, y2];
                }
                [x1m, y1m, x2m, y2m] = this.orientationCorrection(x1m, y1m, x2m, y2m);
                [x1b, y1b, x2b, y2b] = this.orientationCorrection(x1b, y1b, x2b, y2b);
                this.renderer.renderWire(wire, x1m, y1m, x2m, y2m);
                this.renderer.renderWire(bend, x1b, y1b, x2b, y2b);
                this.wiresToBuild = {
                    main: {
                        x1: x1m,
                        y1: y1m,
                        x2: x2m,
                        y2: y2m
                    },
                    bend: {
                        x1: x1b,
                        y1: y1b,
                        x2: x2b,
                        y2: y2b
                    }
                };
            } else {
                [x1, y1, x2, y2] = this.orientationCorrection(x1,y1,x2,y2);

                this.renderer.renderWire(wire, x1, y1, x2, y2);
                this.wiresToBuild = {
                    main: {
                        x1: x1,
                        y1: y1,
                        x2: x2,
                        y2: y2
                    }
                };
            }
        }
    }

    resetComponent() {
        if(this.board){
            if(this.ghost) {
                this.renderer.removeElement(this.ghost);
            }
            this.ghost = null;
            this.board.removeEventListener('mousedown', this.startWire);
            this.board.removeEventListener('mousemove', this.ghostHelper);
            this.board.removeEventListener('mouseup', this.endWire);
            this.board.removeEventListener('click', this.dragHandler);
        }
    }

    setBoardState() {
        this.resetComponent();
        switch(this.props.state) {
            case STATE.WIRE:
                this.board.style.cursor = 'initial';
                this.board.addEventListener('mousedown', this.startWire);
                this.board.addEventListener('mousemove', this.ghostHelper);
                this.board.addEventListener('mouseup', this.endWire);
                break;
            case STATE.EDIT:
                this.board.style.cursor = 'initial';
                this.board.addEventListener('mousemove', this.ghostHelper);
                break;
            case STATE.CREATE:
                this.board.style.cursor = 'crosshair';
                this.board.addEventListener('mousemove', this.ghostHelper);
                this.board.addEventListener('click', this.dragHandler);
                const ghost = _.cloneDeep(this.props.currentEl);

                ghost.props.className = 'ghost';
                ghost.props.opacity = 0.5;
                this.ghost = ghost;
                break;
            default:
                break;
        }
    }

    componentDidMount() {
        this.board = document.getElementById('board');
        this.renderer = new Renderer();
    }

    render() {
        this.setBoardState();
        return (
            <div className="board__container">
                <div className="board" id="board" />
            </div>
        );
    }
}

export default Board;
