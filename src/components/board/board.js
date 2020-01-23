import React from 'react';
import Renderer from '../../render';
import Wire from '../../elements/Wire/Wire';
import Junction from '../../elements/Junction/Junction';
import STATE from './board-states.consts';
import _ from 'lodash';
import Element from '../../elements/Element';
import {fromEvent} from "rxjs";

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
        this.junctionStartingFlag = false;
        this.junctionEndingFlag = false;
        this.wiresToBuild = null;
        this.startingEl = null;
        this.endingEl = null;
        this.elements = [];
        this.wires = [];
        this.eventSubscriptions = [];

        window.wires = this.wires;
        window.elements = this.elements;

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

    deleteWire(wire) {
        const idx = _.findIndex(this.wires, wire);

        wire.unsub();
        this.renderer.removeElementById(wire.id);
        this.wires.splice(idx,1);
    }

    tryProlongWire(wire) {
        const inEl = wire.inConnector;
        const outEl = wire.outConnector;
        const coords = this.wiresToBuild.main;
        let prolonged = false;
        const optimize = (connector) => {
            const el = connector.el;
            const elX1 = _.get(el, 'model.vertices[0].x');
            const elY1 = _.get(el, 'model.vertices[0].y');
            const elX2 = _.get(el, 'model.vertices[1].x');
            const elY2 = _.get(el, 'model.vertices[1].y');
            if (el.className === 'Wire' && (coords.x2 === elX1 || coords.y2 === elY1)) {
                if (coords.x2 === elX1) {
                    const minY = Math.min(coords.y1, coords.y2, elY1, elY2);
                    const maxY = Math.max(coords.y1, coords.y2, elY1, elY2);
                    if(elY1 > elY2) {
                        coords.y2 = minY;
                        coords.y1 = maxY;
                    } else {
                        coords.y1 = minY;
                        coords.y2 = maxY;
                    }

                } else {
                    const minX = Math.min(coords.x1, coords.x2, elX1, elX2);
                    const maxX = Math.max(coords.x1, coords.x2, elX1, elX2);
                    if(elX1 < elX2) {
                        coords.x1 = minX;
                        coords.x2 = maxX;
                    } else {
                        coords.x2 = minX;
                        coords.x1 = maxX;
                    }
                }
                prolonged = true;
                if (connector.type === 'in') {
                    wire.outConnector = el.outConnector;
                } else {
                    wire.inConnector = el.inConnector;
                }
                this.deleteWire(el);
            }
        };
        if(inEl){
            optimize(inEl);
        }
        if(outEl) {
            optimize(outEl);
        }

        return prolonged;
    }

    endWire(e) {
        e.preventDefault();
        // console.log(this.junctionStartingFlag, this.junctionEndingFlag);
        let wire = new Wire();
        let wireBend = new Wire();
        const startingEl = this.startingEl;
        const endingEl = this.endingEl;
        const junction = new Junction();

        console.log(startingEl, this.wiresToBuild);
        wire.className = 'Wire';
        wireBend.className = 'Wire';
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
                        if(this.junctionStartingFlag) {
                            junction.setId();
                            junction.pushWire(wire);
                        }
                    } else {
                        if(startingEl.type === 'out') {
                            wire.inConnector = _.clone(startingEl);
                        } else if(startingEl.type === 'in') {
                            wire.outConnector = _.clone(startingEl);
                        }
                        if(this.junctionStartingFlag) {
                            junction.setId();
                            junction.pushWire(wire);
                        }
                    }
                    if((main.x1 !== main.x2 && (Math.abs(main.y1 - main.y2)!== 2))
                        || (main.x1 === main.x2 && (main.y1 !== main.y2))) {
                        this.tryProlongWire(wire);
                        this.renderer.renderWire(wire, main.x1, main.y1, main.x2, main.y2);
                        this.wires.push(wire);
                        this.applyHelpers(wire);
                        wire.renderFlag.subscribe(() => {
                            this.renderer.render();
                        });
                        wire.wire();
                    } else {
                        this.renderer.removeElement({className: 'main'});
                    }
                    if(bend) {
                        if(wire.outConnector && wire.inConnector) {
                            const onlyStart = this.junctionStartingFlag && !this.junctionEndingFlag;

                            if(startingEl.type === 'in' || onlyStart) {
                                wireBend.inConnector = wire.inConnector;
                                wireBend.outConnector = _.clone({el: wire, pin: 0, type: 'in'});
                                wire.inConnector = _.clone({el: wireBend, pin: 0, type: 'out'});
                            } else {
                                wireBend.outConnector = wire.outConnector;
                                wireBend.inConnector = _.clone({el: wire, pin: 0, type: 'out'});
                                wire.outConnector = _.clone({el: wireBend, pin: 0, type: 'in'});
                            }
                        } else if (wire.outConnector && !wire.inConnector) {
                            wire.inConnector = _.clone({el: wireBend, pin: 0, type: 'out'});
                            wireBend.outConnector = _.clone({el: wire, pin: 0, type: 'in'});
                        } else {
                            wireBend.inConnector = _.clone({el: wire, pin: 0, type: 'out'});
                            wire.outConnector = _.clone({el: wireBend, pin: 0, type: 'in'});
                        }
                        this.wires.push(wireBend);
                        this.renderer.renderWire(wireBend, bend.x1, bend.y1, bend.x2, bend.y2);
                        this.applyHelpers(wireBend);
                        wireBend.renderFlag.subscribe(() => {
                            this.renderer.render();
                        });
                        wireBend.wire();
                    }
                    console.log(wire, wireBend);
                    if(this.junctionStartingFlag) {
                        const coords = this.startingEl.el.getCoords();

                        // wire.unsub();
                        // junction.pushWire(wire);
                        this.renderer.renderJunction(
                            junction,
                            coords.orientation === 'horizontal' ? main.x1 : coords.x1,
                            coords.orientation === 'horizontal' ? coords.y1 : main.y1,
                        );
                        this.elements.push(junction);
                        this.sliceWire(this.startingEl.el, junction);
                        console.log(this.startingEl, this.endingEl);
                        // this.tryProlongWire(wire);
                        // this.renderer.renderWire(wire, main.x1, main.y1, main.x2, main.y2);
                        // this.wires.push(wire);
                        // this.applyHelpers(wire);
                        junction.renderFlag.subscribe(() => {
                            this.renderer.render();
                        });
                        // wire.wire();
                        console.log(this.startingEl, this.endingEl);
                    }
                }
            }
        }
        this.down = false;
        this.board.removeEventListener('mousemove', this.ghostHelper);
        this.startingEl = null;
        this.endingEl = null;
        this.junctionStartingFlag = false;
        this.junctionEndingFlag = false;

        if(this.props.state === STATE.WIRE) {
            this.props.setBoardState(STATE.EDIT);
        }
    }

    sliceWire(wire, junction) {
        const inConnector = _.get(wire.inConnector, 'el', null);
        const outConnector = _.get(wire.outConnector, 'el', null);
        const coords = wire.getCoords();
        const jcoords = junction.getCoords();
        const firstWire = new Wire();
        const secondWire = new Wire();
        const idx = _.findIndex(this.wires, wire);

        firstWire.className = 'Wire';
        secondWire.className = 'Wire';

        if(inConnector && outConnector) {
            const inConnectorCoords = inConnector.getCoords();
            const outConnectorCoords = outConnector.getCoords();

            if(coords.orientation === 'horizontal') {
                if(inConnectorCoords.x1 > outConnectorCoords.x1) {
                    const start = {
                        x1: Math.max(coords.x1, coords.x2),
                        y1: coords.y1,
                        x2: jcoords.x1,
                        y2: jcoords.y1
                    };
                    const end = {
                        x1: jcoords.x1,
                        y1: jcoords.y1,
                        x2: Math.min(coords.x1, coords.x2),
                        y2: coords.y1,
                    };
                    console.log('worst case');
                } else {
                    const start = {
                        x1: Math.min(coords.x1, coords.x2),
                        y1: coords.y1,
                        x2: jcoords.x1,
                        y2: jcoords.y1
                    };
                    const end = {
                        x1: jcoords.x1,
                        y1: jcoords.y1,
                        x2: Math.max(coords.x1, coords.x2),
                        y2: coords.y1,
                    };
                    this.deleteWire(wire);

                    firstWire.inConnector = wire.inConnector;
                    firstWire.outConnector = {el: junction, pin: 0, type: 'in'};
                    secondWire.inConnector = {el: junction, pin: 0, type: 'out'};
                    secondWire.outConnector = wire.outConnector;

                    this.renderer.renderWire(firstWire, start.x1, start.y1, start.x2, start.y2);
                    this.renderer.renderWire(secondWire, end.x1, end.y1, end.x2, end.y2);
                    this.applyHelpers(firstWire);
                    this.applyHelpers(secondWire);
                    this.wires.splice(idx, 0, firstWire);
                    this.wires.splice(idx, 0, secondWire);
                    firstWire.renderFlag.subscribe(() => {
                        this.renderer.render();
                    });
                    secondWire.renderFlag.subscribe(() => {
                        this.renderer.render();
                    });
                    firstWire.wire();
                    secondWire.wire();
                    if(outConnector.name === 'Junction') {
                        outConnector.removeWire(wire);
                        outConnector.pushWire(secondWire);
                    }
                    junction.pushWire(firstWire);
                    junction.pushWire(secondWire);
                    junction.updateState();
                    console.log(start, end);
                }
            }


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
                        if((this.props.state === STATE.EDIT || this.props.state === STATE.WIRE) && pin.helperEnabled) {
                            pin.helper.opacity = 1;
                            this.renderer.render();
                            endFunction(el, idx);
                        }
                    });
                fromEvent(domEl, 'mousedown')
                    .subscribe(() => {
                        if(this.props.state === STATE.EDIT && pin.helperEnabled) {
                            this.props.setBoardState(STATE.WIRE);
                            startFunction(el, idx);
                        }
                    });
                fromEvent(domEl, 'mouseout')
                    .subscribe(() => {
                        if((this.props.state === STATE.EDIT || this.props.state === STATE.WIRE) && pin.helperEnabled) {
                            pin.helper.opacity = 0;
                            this.renderer.render();
                            this.endingEl = this.startingEl;
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
        if(el.inPins) {
            _.forEach(
                el.inPins.pins,
                iterFunc(
                    (el, idx) => {vm.startingEl = {el: el, pin: idx, type: 'in'}},
                    (el, idx) => {vm.endingEl = {el: el, pin: idx, type: 'in'}}
                )
            );
        }
        _.forEach(el.junctionHelpers, (model) => {
            const domModel = model._renderer.elem;

            fromEvent(domModel, 'mousemove').subscribe(() => {
                if(this.props.state === STATE.EDIT || this.props.state === STATE.WIRE) {
                    const stId = _.get(this.startingEl, 'el.id', null);
                    const endId = _.get(this.endingEl, 'el.id', null);

                    model.opacity = 1;
                    this.renderer.render();
                    this.endingEl = {el: el, pin: 0, type: null};
                    this.junctionEndingFlag = stId && endId && (stId !== endId) ;
                }
            });
            fromEvent(domModel, 'mouseout').subscribe(() => {
                if(this.props.state === STATE.EDIT || this.props.state === STATE.WIRE) {
                    model.opacity = 0;
                    this.renderer.render();
                }
            });
            fromEvent(domModel, 'mousedown').subscribe(() => {
                    if(this.props.state === STATE.EDIT) {
                        this.props.setBoardState(STATE.WIRE);
                        this.startingEl = {el: el, pin: 0, type: null};
                        this.junctionStartingFlag = true;
                    }
                });
        });
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
            _.forEach(this.eventSubscriptions, (subscription) => {
                subscription.unsubscribe();
            });
            this.eventSubscriptions = [];
        }
    }

    setBoardState() {
        this.resetComponent();
        Element.boardState = this.props.state;
        switch(this.props.state) {
            case STATE.WIRE:
                this.eventSubscriptions.push(
                    fromEvent(this.board, 'mousemove')
                        .subscribe(this.ghostHelper),
                    fromEvent(this.board, 'mousedown')
                        .subscribe(this.startWire),
                    fromEvent(this.board, 'mouseup')
                        .subscribe(this.endWire),
                );
                break;
            case STATE.EDIT:
                this.eventSubscriptions.push(
                    fromEvent(this.board, 'mousemove')
                        .subscribe(this.ghostHelper)
                );
                break;
            case STATE.CREATE:
                this.eventSubscriptions.push(
                    fromEvent(this.board, 'mousemove')
                        .subscribe(this.ghostHelper),
                    fromEvent(this.board, 'click')
                        .subscribe(this.dragHandler)
                );
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
        fromEvent(this.board, 'mousedown')
            .subscribe((e) => {
                e.preventDefault();
            });
    }

    render() {
        this.setBoardState();
        return (
            <div className="board__container">
                <div className={`board board--${this.props.state}`} id="board" />
            </div>
        );
    }
}

export default Board;
