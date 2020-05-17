import React from 'react';
import Renderer from '../../utils/render';
import Wire from '../../elements/Wire/Wire';
import Junction from '../../elements/Junction/Junction';
import STATE from './board-states.consts';
import _ from 'lodash';
import Element from '../../elements/Element';
import {fromEvent} from "rxjs";
import PubSub from "../../services/pubSub";
import {EVENT} from "../../consts/events.consts";

class Board extends React.Component {
    constructor(props) {
        super(props);
        this.coords = {
            x: null,
            y: null,
            x1: null,
            y1: null,
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
        this.isAnyElementActive = false;
        this.eventSubscriptions = [];

        window.wires = this.wires;
        window.elements = this.elements;
        window.disableWireModels = () => {
            _.forEach (this.wires, (wire) => {
                wire.model.stroke = '#00000000';
            });
            Renderer.render();
        };

        window.getAllWireModels = () => {
            _.forEach (this.wires, (wire) => {
                console.log(wire.getElement());
            });
        };

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
        this.coords.x = coords.x;
        this.coords.y = coords.y;
    }

    calcWireCoords(coords, isWireStart = false) {
        coords.x = Math.floor(coords.x/12)*12 + 5;
        coords.y = Math.floor(coords.y/12)*12 + 5;

        if(isWireStart) {
            this.coords.x1 = coords.x;
            this.coords.y1 = coords.y;
        } else {
            this.coords.x = coords.x;
            this.coords.y = coords.y;
        }
    }

    startWire(e) {
        e.preventDefault();
        let coords = this.getCoords(e);
        this.down = true;
        this.calcWireCoords(coords, true);
    }

    deleteWire(wire, ignoreJunction = false) {
        const idx = _.findIndex(this.wires, wire);

        wire.destroy(ignoreJunction);
        Renderer.removeElementById(wire.id);
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
                this.deleteWire(el, true);
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

    revertChain(wire, chainWire, goal) {
        let wiresToReplace = [chainWire];
        let el = chainWire;
        for (el; el.inConnector && _.get(el, 'inConnector.el.name', null) === 'Wire'; el = el.inConnector.el) {
            wiresToReplace.push(el.inConnector.el);
        }
        // wiresToReplace.push(el);
        if(_.get(goal, 'name', null) === 'Junction') {
            goal.removeWire(wiresToReplace[wiresToReplace.length - 1]);
        }

        const replacementWires = _.map(wiresToReplace, () => {
            const replacement = new Wire();
            replacement.className = 'Wire';

            return replacement;
        });

        const len = replacementWires.length;

        for(let c = 0; c < len; c++) {
            const coords = wiresToReplace[c].getCoords();
            const replacement = replacementWires[c];

            if(c === 0) {
                replacement.inConnector = {el: wire, pin: 0, type: 'out'};
                if(len > 1) {
                    replacement.outConnector = {
                        el: replacementWires[c + 1],
                        pin: 0,
                        type: 'in'
                    };
                } else if (!goal) {
                    replacement.outConnector = null;
                } else {
                    replacement.outConnector = {
                        el: goal,
                        pin: 0,
                        type: 'in'
                    };
                }
            } else if (c === len - 1) {
                replacement.inConnector = {el: replacementWires[c - 1], pin: 0, type: 'out'};
                replacement.outConnector = goal ? {el: goal, pin: 0, type: 'in'} : null;
            } else {
                replacement.inConnector = {el: replacementWires[c - 1], pin: 0, type: 'out'};
                replacement.outConnector = {el: replacementWires[c + 1], pin: 0, type: 'in'};
            }
            this.deleteWire(wiresToReplace[c]);
            Renderer.renderWire(replacement, coords.x1, coords.y1, coords.x2, coords.y2);
            this.wires.push(replacement);
            this.applyHelpers(replacement);
        }
        _.forEach(replacementWires, (wire) => {
            wire.wire();
        });
        wire.outConnector = {el: replacementWires[0], pin: 0, type: 'in'};
        if(_.get(goal, 'name', null) === 'Junction') {
            goal.pushWire(replacementWires[len - 1]);
        }
    }

    endWire(e) {
        e.preventDefault();
        let wire = new Wire();
        let wireBend = new Wire();
        const startingEl = this.startingEl;
        const endingEl = this.endingEl;
        const startJunction = new Junction();
        const endJunction = new Junction();

        wire.className = 'Wire';
        wireBend.className = 'Wire';

        if(this.wiresToBuild) {
            let main = this.wiresToBuild.main;
            let bend = this.wiresToBuild.bend;
            if(main) {
                if (startingEl || endingEl) {
                    if (!((startingEl.el.id === endingEl.el.id)
                        && (startingEl.pin === endingEl.pin)
                        && (startingEl.type === endingEl.type))
                    ) {
                        if (startingEl.type === 'out') {
                            wire.inConnector = _.clone(startingEl);
                        } else if (startingEl.type === 'in') {
                            wire.outConnector = _.clone(startingEl);
                        }
                        if (endingEl.type === 'out') {
                            wire.inConnector = _.clone(endingEl);
                        } else if (endingEl.type === 'in') {
                            wire.outConnector = _.clone(endingEl);
                        }
                        if(startingEl.el.name === 'Junction') {
                            startingEl.el.pushWire(wire);
                        }
                        if (this.junctionStartingFlag) {
                            startJunction.setId();
                            startJunction.pushWire(wire);
                        }
                        if(this.junctionEndingFlag && !bend) {
                            endJunction.setId();
                            endJunction.pushWire(wire);
                        }
                        if(startingEl.type === endingEl.type) {
                            let goal, chainWire;

                            if(_.get(startingEl, 'el.name', null) === 'Wire') {
                                chainWire = startingEl.el;
                                goal = startingEl.el.getCurrentSignalSource();
                                wire.inConnector = _.clone(endingEl);
                            } else if(_.get(endingEl, 'el.name', null) === 'Wire') {
                                chainWire = endingEl.el;
                                goal = endingEl.el.getCurrentSignalSource();
                                wire.inConnector = _.clone(startingEl);
                            }
                            if(goal && chainWire) {
                                if(_.get(goal, 'el.name', null) === 'Junction') {
                                    this.revertChain(wire, chainWire, goal.el);
                                }
                            } else {
                                main = null;
                                bend = null;
                            }
                        }
                    } else {
                        if (startingEl.type === 'out') {
                            wire.inConnector = _.clone(startingEl);
                        } else if (startingEl.type === 'in') {
                            wire.outConnector = _.clone(startingEl);
                        }
                        if(startingEl.el.name === 'Junction') {
                            startingEl.el.pushWire(wire);
                        }
                        if (this.junctionStartingFlag) {
                            startJunction.setId();
                            startJunction.pushWire(wire);
                        }
                        if(this.junctionEndingFlag && !bend) {
                            endJunction.setId();
                            endJunction.pushWire(wire);
                        }
                    }
                    if(main) {
                        if ((main.x1 !== main.x2 && (Math.abs(main.y1 - main.y2) !== 2))
                            || (main.x1 === main.x2 && (main.y1 !== main.y2))) {
                            this.tryProlongWire(wire);
                            Renderer.renderWire(wire, main.x1, main.y1, main.x2, main.y2);
                            this.wires.push(wire);
                            if(!bend) {
                                wire.wire();
                                this.applyHelpers(wire);
                            }
                        }
                    }
                    if (bend) {
                        if (wire.outConnector && wire.inConnector) {
                            if (startingEl.type === 'in') {
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
                        if(this.junctionEndingFlag) {
                            endJunction.setId();
                            endJunction.pushWire(wireBend);
                        }
                        this.wires.push(wireBend);
                        Renderer.renderWire(wireBend, bend.x1, bend.y1, bend.x2, bend.y2);
                        wireBend.wire();
                        wire.wire();
                        this.applyHelpers(wire);
                        this.applyHelpers(wireBend);
                    }
                    if (this.junctionStartingFlag) {
                        const coords = this.startingEl.el.getCoords();

                        Renderer.renderJunction(
                            startJunction,
                            coords.orientation === 'horizontal' ? main.x1 : coords.x1,
                            coords.orientation === 'horizontal' ? coords.y1 : main.y1,
                        );
                        this.elements.push(startJunction);
                        this.sliceWire(this.startingEl.el, startJunction);
                        startJunction.enableOutPinHelper(0);
                        Renderer.render();
                        this.applyHelpers(startJunction);
                    }
                    if(this.junctionEndingFlag) {
                        const coords = this.endingEl.el.getCoords();
                        const wireCoords = bend ? wireBend.getCoords() : wire.getCoords();

                        Renderer.renderJunction(
                            endJunction,
                            coords.orientation === 'horizontal' ? wireCoords.x1 : coords.x1,
                            coords.orientation === 'horizontal' ? coords.y1 : wireCoords.y2,
                        );
                        this.elements.push(endJunction);
                        this.sliceWire(this.endingEl.el, endJunction);
                        endJunction.enableOutPinHelper(0);
                        Renderer.render();
                        this.applyHelpers(endJunction);
                    }
                    Renderer.removeElement({className: 'main'});
                    Renderer.removeElement({className: 'bend'});
                }
            }
            this.updateGlobalData();
        }
        this.down = false;
        // this.board.removeEventListener('mousemove', this.ghostHelper);
        this.startingEl = null;
        this.endingEl = null;
        this.junctionStartingFlag = false;
        this.junctionEndingFlag = false;

        if(this.props.state === STATE.WIRE) {
            PubSub.publish(EVENT.SET_BOARD_STATE, STATE.EDIT);
        }
    }

    updateGlobalData() {
        PubSub.publish(EVENT.UPDATE_DATA, {
            schemeName: this.props.data.schemeName,
            elements: this.elements,
            wires: this.wires
        });
    }

    sliceWire(wire, junction) {
        const inConnector = _.get(wire.inConnector, 'el', null);
        const outConnector = _.get(wire.outConnector, 'el', null);
        const coords = wire.getCoords();
        const jcoords = junction.getCoords();
        const firstWire = new Wire();
        const secondWire = new Wire();
        const idx = _.findIndex(this.wires, wire);
        const applySlice = (inConnectorCoords, outConnectorCoords) => {
            let start = {};
            let end = {};
            const inConnectorName = _.get(inConnector, 'name', null);
            // const outConnectorName = _.get(outConnector, 'name', null);

            if(coords.orientation === 'horizontal') {
                if(inConnectorCoords.x1 > outConnectorCoords.x1) {
                    start = {
                        x1: Math.max(coords.x1, coords.x2),
                        y1: coords.y1,
                        x2: jcoords.x1 - 1,
                        y2: jcoords.y1
                    };
                    end = {
                        x1: jcoords.x1 + 1,
                        y1: jcoords.y1,
                        x2: Math.min(coords.x1, coords.x2),
                        y2: coords.y1,
                    };
                } else {
                    start = {
                        x1: Math.min(coords.x1, coords.x2),
                        y1: coords.y1,
                        x2: jcoords.x1 + 1,
                        y2: jcoords.y1
                    };
                    end = {
                        x1: jcoords.x1 - 1,
                        y1: jcoords.y1,
                        x2: Math.max(coords.x1, coords.x2),
                        y2: coords.y1,
                    };
                }
            } else {
                if(inConnectorCoords.y1 < outConnectorCoords.y1) {
                    start = {
                        x1: coords.x1,
                        y1: Math.min(coords.y1, coords.y2),
                        x2: jcoords.x1,
                        y2: jcoords.y1 + 2,
                    };
                    end = {
                        x1: jcoords.x1,
                        y1: jcoords.y1 - 1,
                        x2: coords.x1,
                        y2: Math.max(coords.y1, coords.y2),
                    };
                } else {
                    start = {
                        x1: coords.x1,
                        y1: Math.max(coords.y1, coords.y2),
                        x2: jcoords.x1,
                        y2: jcoords.y1 - 2
                    };
                    end = {
                        x1: jcoords.x1,
                        y1: jcoords.y1 + 1,
                        x2: coords.x1,
                        y2: Math.min(coords.y1, coords.y2),
                    };
                }
            }
            const slength = Math.max(Math.abs(start.x1 - start.x2), Math.abs(start.y1 - start.y2));
            const elength = Math.max(Math.abs(end.x1 - end.x2), Math.abs(end.y1 - end.y2));

            if((slength > 5 && elength > 5) || (inConnectorName !== 'Wire')) {
                this.deleteWire(wire);

                firstWire.inConnector = wire.inConnector;
                firstWire.outConnector = wire.inConnector ? {el: junction, pin: 0, type: 'in'} : null;
                if(!wire.getCurrentSignalSource() && wire.inConnector) {
                    this.revertChain(firstWire, wire.inConnector.el, null);
                }
                secondWire.inConnector = {el: junction, pin: 0, type: 'out'};
                secondWire.outConnector = wire.outConnector;

                Renderer.renderWire(firstWire, start.x1, start.y1, start.x2, start.y2);
                Renderer.renderWire(secondWire, end.x1, end.y1, end.x2, end.y2);
                this.applyHelpers(firstWire);
                this.applyHelpers(secondWire);
                this.wires.splice(idx, 0, firstWire);
                this.wires.splice(idx, 0, secondWire);
                junction.pushWire(firstWire);
                junction.pushWire(secondWire);
                firstWire.wire();
                secondWire.wire();
                // if((inConnectorName !== 'Wire')) {
                //
                //     console.log(firstWire.junctionHelpers, secondWire.junctionHelpers);
                //     firstWire.junctionHelpers.pop();
                // }
                if(_.get(outConnector, 'name', null) === 'Junction') {
                    outConnector.removeWire(wire);
                    outConnector.pushWire(secondWire);
                }
                junction.updateState();
                return true;
            }
            return false;
        };

        // let isSliced;

        firstWire.className = 'Wire';
        secondWire.className = 'Wire';

        if(inConnector && outConnector) {
            const inConnectorCoords = inConnector.getCoords();
            const outConnectorCoords = outConnector.getCoords();

            applySlice(inConnectorCoords, outConnectorCoords);
            // isSliced =
            // if(!isSliced) {
            //     wire.unsub();
            //     inConnector.unsub();
            //     junction.pushWire(wire);
            //     junction.pushWire(inConnector);
            //     wire.wire();
            //     inConnector.wire();
            //     junction.updateState();
            // }
        } else if(inConnector) {
            const inConnectorCoords = inConnector.getCoords();
            const distanceX1 = Math.abs(inConnectorCoords.x1 - coords.x1);
            const distanceX2 = Math.abs(inConnectorCoords.x1 - coords.x2);
            const distanceY1 = Math.abs(inConnectorCoords.y1 - coords.y1);
            const distanceY2 = Math.abs(inConnectorCoords.y1 - coords.y2);
            const outCoords = {
                x1: Math.max(distanceX1, distanceX2) === distanceX1 ? coords.x1 : coords.x2,
                y1: Math.max(distanceY1, distanceY2) === distanceX1 ? coords.x1 : coords.x2,
            };

            applySlice(inConnectorCoords, outCoords);
            // isSliced =
            // if(!isSliced) {
            //     wire.junctionHelpers.pop();
            //     Renderer.removeElementById(wire.id + 'bend-helper');
            //     wire.unsub();
            //     inConnector.unsub();
            //     junction.pushWire(wire);
            //     junction.pushWire(inConnector);
            //     wire.wire();
            //     inConnector.wire();
            //     junction.updateState();
            // }
        } else if (outConnector) {
            const outConnectorCoords = outConnector.getCoords();
            const distanceX1 = Math.abs(outConnectorCoords.x1 - coords.x1);
            const distanceX2 = Math.abs(outConnectorCoords.x1 - coords.x2);
            const distanceY1 = Math.abs(outConnectorCoords.y1 - coords.y1);
            const distanceY2 = Math.abs(outConnectorCoords.y1 - coords.y2);
            const inCoords = {
                x1: Math.max(distanceX1, distanceX2) === distanceX1 ? coords.x1 : coords.x2,
                y1: Math.max(distanceY1, distanceY2) === distanceX1 ? coords.x1 : coords.x2,
            };

            applySlice(inCoords, outConnectorCoords);
        }

    }

    dragHandler(e) {
        e.preventDefault();
        const el = _.cloneDeep(this.props.currentEl);
        const boardWidth = Renderer.getFieldData().width;
        const boardHeight = Renderer.getFieldData().height;

        Renderer.renderElement(el, this.coords.x, this.coords.y);
        this.elements.push(el);
        el.setId();
        el.updateState();
        this.applyHelpers(el);
        this.updateGlobalData();

        PubSub.publish(EVENT.BOARD_RESIZE, {
            width: el.x + el.width > boardWidth ? boardWidth + el.width * 2 : boardWidth,
            height: el.y + el.height > boardHeight ? boardHeight + el.height * 2 : boardHeight
        });

        el.model._renderer.elem.scrollIntoView();
    }

    applyHelpers(el) {
        const iterFunc = (startFunction, endFunction) => {
            return (pin, idx) => {
                const domEl = _.get(pin, 'helper._renderer.elem', null);

                if (domEl) {
                    const pinMousemove = fromEvent(domEl, 'mousemove')
                        .subscribe(() => {
                            if((this.props.state === STATE.EDIT || this.props.state === STATE.WIRE) && pin.helperEnabled) {
                                pin.helper.opacity = 1;
                                Renderer.render();
                                endFunction(el, idx);
                            }
                        });
                    const pinMousedown = fromEvent(domEl, 'mousedown')
                        .subscribe(() => {
                            if(this.props.state === STATE.EDIT && pin.helperEnabled) {
                                PubSub.publish(EVENT.SET_BOARD_STATE, STATE.WIRE);
                                startFunction(el, idx);
                            }
                        });
                    const pinMouseout = fromEvent(domEl, 'mouseout')
                        .subscribe(() => {
                            if((this.props.state === STATE.EDIT || this.props.state === STATE.WIRE) && pin.helperEnabled) {
                                pin.helper.opacity = 0;
                                Renderer.render();
                                this.endingEl = this.startingEl;
                            }
                        });

                    el.addSubscription(pinMousemove, pinMousedown, pinMouseout);
                }
            };
        };
        const vm = this;

        if(el.outPins) {
            _.forEach(
                el.outPins.pins,
                iterFunc(
                    (el, idx) => {
                        vm.startingEl = {el: el, pin: idx, type: 'out'}
                    },
                    (el, idx) => {
                        vm.endingEl = {el: el, pin: idx, type: 'out'}
                    }
                )
            );
        }
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

            const junctionMousemove = fromEvent(domModel, 'mousemove').subscribe(() => {
                if(this.props.state === STATE.EDIT || this.props.state === STATE.WIRE) {
                    const stId = _.get(this.startingEl, 'el.id', null);
                    const endId = _.get(this.endingEl, 'el.id', null);

                    model.opacity = 1;
                    Renderer.render();
                    this.endingEl = {el: el, pin: 0, type: null};
                    this.junctionEndingFlag = stId && endId && (stId !== endId);
                }
            });
            const junctionMouseout = fromEvent(domModel, 'mouseout').subscribe(() => {
                if(this.props.state === STATE.EDIT || this.props.state === STATE.WIRE) {
                    model.opacity = 0;
                    Renderer.render();
                    this.junctionEndingFlag = false;
                    this.endingEl = this.startingEl;
                }
            });
            const junctionMousedown = fromEvent(domModel, 'mousedown').subscribe(() => {
                    if(this.props.state === STATE.EDIT) {
                        PubSub.publish(EVENT.SET_BOARD_STATE, STATE.WIRE);
                        this.startingEl = {el: el, pin: 0, type: null};
                        this.junctionStartingFlag = true;

                        const junctionMouseup = fromEvent(domModel, 'mouseup')
                            .subscribe(() => {
                                this.junctionStartingFlag = false;
                                this.startingEl = null;
                                this.endingEl = null;
                                junctionMouseup.unsubscribe();
                            });
                    }
                });

            el.addSubscription(junctionMousedown, junctionMousemove, junctionMouseout);
        });

        if(el.name === 'Wire') {
            const wireBounds = el.modelGroup._renderer.elem;

            const wireClick = fromEvent(wireBounds, 'click')
                .subscribe((e) => {
                    e.preventDefault();
                    if(this.props.state === STATE.EDIT) {
                        el.model.className += ' element-active';

                        const handleDelete = fromEvent(document, 'keydown')
                            .subscribe((e) => {
                                if(e.keyCode === 46) {
                                    this.deleteWire(el);
                                    Renderer.eraseActiveZone();
                                    handleDelete.unsubscribe();
                                }
                            });

                        const clickElsewhere = fromEvent(document, 'mousedown')
                            .subscribe((e) => {
                                const parts = '.element-active, .element-active *';

                                if(!e.target.matches(parts)) {
                                    el.model.className = el.model.className.replace(' element-active', '');
                                    el.active = false;
                                    this.isAnyElementActive = false;
                                    Renderer.eraseActiveZone();
                                    clickElsewhere.unsubscribe();
                                    handleDelete.unsubscribe();
                                }
                            });
                        Renderer.renderActiveWireZone(el);
                    }
                });

            el.addSubscription(wireClick);
        }

        if(el.name !== 'Junction' && el.name !== 'Wire') {
            const elementBounds = el.model._renderer.elem;

            const elementClick = fromEvent(elementBounds, 'click')
                .subscribe((e) => {
                    e.preventDefault();
                    if(this.props.state === STATE.EDIT) {
                        el.model.className += ' element-active';
                        el.active = true;
                        this.isAnyElementActive = true;
                        PubSub.publish(EVENT.SET_CURRENT_ELEMENT, el);

                        const handleDelete = fromEvent(document, 'keydown')
                            .subscribe((e) => {
                                if(e.keyCode === 46) {
                                    this.deleteElement(el);
                                    Renderer.eraseActiveZone();
                                    handleDelete.unsubscribe();
                                }
                            });

                        const clickElsewhere = fromEvent(document, 'mousedown')
                            .subscribe((e) => {
                                const parts = '.element-active, .element-active *';

                                if(!e.target.matches(parts)) {
                                    el.model.className = el.model.className.replace(' element-active', '');
                                    elementBounds.style.cursor = 'default';
                                    el.active = false;
                                    this.isAnyElementActive = false;
                                    Renderer.eraseActiveZone();
                                    clickElsewhere.unsubscribe();
                                    handleDelete.unsubscribe();
                                }
                            });
                        Renderer.renderActiveZone(el);
                    }
                });

            const elementMousedown = fromEvent(elementBounds, 'mousedown')
                .subscribe(() => {
                    if(el.active && this.props.state === STATE.EDIT) {
                        const ghost = _.cloneDeep(this.props.currentEl);
                        let move = false;

                        ghost.className = 'ghost';
                        ghost.props.opacity = 0.5;
                        this.ghost = ghost;
                        elementBounds.style.cursor = 'grabbing';

                        const mouseMove = fromEvent(document, 'mousemove')
                            .subscribe((e) => {
                                move = true;
                                this.ghostHelper(e);
                                this.deleteElement(el);
                                Renderer.eraseActiveZone();
                            });

                        const mouseUp = fromEvent(document, 'mouseup')
                            .subscribe((e) => {
                                if(move) {
                                    this.dragHandler(e);
                                } else {
                                    elementBounds.style.cursor = 'grab';
                                }
                                mouseUp.unsubscribe();
                                mouseMove.unsubscribe();
                            });
                    }
                });

            el.addSubscription(elementClick, elementMousedown);
        }
    }

    deleteElement(element) {
        const idx = _.findIndex(this.elements, element);

        element.destroy();
        Renderer.removeElementById(element.id);
        this.elements.splice(idx, 1);
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

        if(ghost && (this.props.state === STATE.CREATE || this.isAnyElementActive)) {
            this.calcCoords(coords);
            Renderer.removeElement(ghost);
            Renderer.renderGhost(ghost, coords.x, coords.y);
        }

        if(this.props.state === STATE.WIRE && this.down) {
            const wire = new Wire();
            const bend = new Wire();
            wire.className = 'main';
            bend.className = 'bend';
            const prev = Renderer.getElement(wire);
            this.calcWireCoords(coords);
            Renderer.removeElement(wire);
            Renderer.removeElement(bend);

            let x1 = this.coords.x1;
            let y1 = this.coords.y1;
            let x2 = this.coords.x;
            let y2 = this.coords.y;

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
                Renderer.renderWire(wire, x1m, y1m, x2m, y2m, false);
                Renderer.renderWire(bend, x1b, y1b, x2b, y2b);
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

                Renderer.renderWire(wire, x1, y1, x2, y2);
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
                Renderer.removeElement(this.ghost);
                Renderer.render();
            }
            this.ghost = null;
            _.forEach(this.eventSubscriptions, (subscription) => {
                subscription.unsubscribe();
            });
            this.eventSubscriptions = [];
        }
    }

    async loadData(data) {
        const elements = data.elements;
        const wires = data.wires;

        _.forEach(elements, (element) => {
            this.applyHelpers(element);
            this.elements.push(element);
        });

        _.forEach(wires, (wire) => {
            this.applyHelpers(wire);
            this.wires.push(wire);
        });

        window.wires = this.wires;
        window.elements = this.elements;
    }

    resetData() {
        this.wires = [];
        this.elements = [];
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
                break;
            case STATE.CREATE:
                this.eventSubscriptions.push(
                    fromEvent(this.board, 'mousemove')
                        .subscribe(this.ghostHelper),
                    fromEvent(this.board, 'click')
                        .subscribe(this.dragHandler)
                );
                const ghost = _.cloneDeep(this.props.currentEl);

                ghost.className = 'ghost';
                ghost.props.opacity = 0.5;
                this.ghost = ghost;
                break;
            case STATE.DISABLE_MODELING:
                const text = document.getElementsByTagName('text');
                const junctions = document.getElementsByClassName('junction-circle');
                const shapes = document.querySelectorAll('#board svg *');
                const shapesColors = [];
                const textColors = [];
                const junctionsColors = [];
                const BLACK_COLOR = '#000';

                _.forEach(text, (shape) => {
                    const fill = window
                        .getComputedStyle(shape)
                        .getPropertyValue('fill');

                    textColors.push(fill);
                    shape.setAttribute('fill', BLACK_COLOR);
                });

                _.forEach(junctions, (junction) => {
                    const fill = window
                        .getComputedStyle(junction)
                        .getPropertyValue('fill');

                    junctionsColors.push(fill);
                    junction.setAttribute('fill', BLACK_COLOR);
                });

                _.forEach(shapes, (shape) => {
                    const stroke = window
                        .getComputedStyle(shape)
                        .getPropertyValue('stroke');

                    shapesColors.push(stroke);

                    if(stroke !== 'none') {
                        shape.setAttribute('stroke', BLACK_COLOR);
                    }
                });
                PubSub.publish(EVENT.MODELING_OFF, true);
                _.forEach(text, (shape, idx) => {
                    shape.setAttribute('fill', textColors[idx]);
                });

                _.forEach(junctions, (junction, idx) => {
                    junction.setAttribute('fill', junctionsColors[idx]);
                });

                _.forEach(shapes, (shape, idx) => {
                    const stroke = window
                        .getComputedStyle(shape)
                        .getPropertyValue('stroke');

                    if(stroke !== 'none') {
                        shape.setAttribute('stroke', shapesColors[idx]);
                    }
                });
                break;
            case STATE.LOAD_DATA:
                this.resetData();
                this.loadData(this.props.data)
                    .then(() => {
                        PubSub.publish(EVENT.SET_BOARD_STATE, STATE.EDIT);
                        PubSub.publish(EVENT.TOGGLE_LOADING, {toggle: false});
                    });
                break;
            default:
                break;
        }
    }

    componentDidMount() {
        this.board = document.getElementById('board');
        Renderer.init(this.board);
        window.renderer = Renderer;
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
