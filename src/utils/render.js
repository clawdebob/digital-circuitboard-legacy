import Two from 'two.js';
import _ from 'lodash';
import PubSub from '../services/pubSub';
import {EVENT} from "../consts/events.consts";
import {DIRECTION, ORIENTATION} from "../elements/Orientation.const";
import {ELEMENT} from "../consts/Elements.consts";

class Renderer {
    static init(element) {
        this.board = element;
        const {width, height} = this.board.parentElement.getBoundingClientRect();

        this.svg = new Two({width, height}).appendTo(this.board);
        this.render = this.render.bind(this);
        this.background = this.svg.makeGroup();
        this.middleground = this.svg.makeGroup();
        this.foreground = this.svg.makeGroup();
        PubSub.subscribe(EVENT.BOARD_RESIZE, (data) => {
            const {width, height} = data;

            this.setFieldSize(width, height);
        });
    }

    static getFieldData() {
        const {width, height} = this.board.getBoundingClientRect();

        return {width, height};
    }

    static setFieldSize(width, height) {
        this.svg.width = width;
        this.svg.height = height;
        this.board.style.width = `${width}px`;
        this.board.style.height = `${height}px`;
        this.render();
    }

    static renderWire(wire, x1,y1,x2,y2, instantRender = true) {
        const line = this.svg.makeLine(x1,y1,x2,y2);

        line.fill = wire.fill || '#000000';
        line.opacity = 1;
        line.linewidth = 2;
        if (wire.className) {
            line.classList.push(wire.className);
        }

        wire.model = line;
        if(wire.name) {
            wire.renderFlag.subscribe(() => {
                this.render();
            });
            wire.pinToggleObservable.subscribe((pin) => {
                if(pin.helperEnabled) {
                    this.foreground.add(pin.helper);
                } else {
                    this.background.add(pin.helper);
                }
            });
        }
        if(wire.className === ELEMENT.WIRE) {
            const [inX, inY] = wire.inConnector ? [x1, y1] : [x2, y2];
            const [outX, outY] = wire.inConnector ? [x2, y2] : [x1, y1];
            const inHelper = this.renderHelpCircle(inX, inY);
            const outHelper = this.renderHelpCircle(outX, outY);
            const tempsForJunctions = [];

            this.foreground.add(inHelper);
            this.foreground.add(outHelper);
            if (x1 === x2) {
                // if(wire.inConnector && _.get(wire, 'inConnector.name', null) !== 'Junction') {
                //     tempsForJunctions.push(this.renderHelpCircle(inX + 1, inY));
                // }
                if (y1 < y2) {
                    for(let y = y1 + 13; y < y2 - 12; y += 12) {
                        tempsForJunctions.push(this.renderHelpCircle(x1, y));
                    }
                } else {
                    for(let y = y1 - 13; y > y2 + 12; y -= 12) {
                        tempsForJunctions.push(this.renderHelpCircle(x1, y));
                    }
                }
            } else {
                // if(wire.inConnector && _.get(wire, 'inConnector.name', null) !== 'Junction') {
                //     tempsForJunctions.push(this.renderHelpCircle(inX, inY));
                // }
                if (x1 < x2) {
                    for(let x = x1 + 13; x < x2 - 12; x += 12) {
                        tempsForJunctions.push(this.renderHelpCircle(x, y1));
                    }
                } else {
                    for(let x = x1 - 13; x > x2 + 12; x -= 12) {
                        tempsForJunctions.push(this.renderHelpCircle(x, y1));
                    }
                }
            }
            _.forEach(tempsForJunctions, (model) => {
               wire.junctionHelpers.push(model);
               this.foreground.add(model);
            });
            const jgroup = this.svg.makeGroup(tempsForJunctions);
            wire.modelGroup = this.svg.makeGroup(line, jgroup, inHelper, outHelper);
            // if (wire.id) {
            //     line.classList.push(wire.id);
            //     group.classList.push(wire.id);
            // }
            wire.inPins.pins[0].helper = inHelper;
            wire.outPins.pins[0].helper = outHelper;
        }
        this.background.add(line);

        if(instantRender) {
            this.render();
        }
        return line;
    }

    static makeElement(element, x, y) {
        const props = element.props;
        const className = props.className || element.className;
        const originY = y + element.height/2 - element.originY;
        const originX = x + element.width/2;
        let model = null;

        switch (element.name) {
            case ELEMENT.OUT_CONTACT:
                model = this.svg.makeCircle(originX, originY, element.width/2);
                break;
            case ELEMENT.LABEL:
                model = this.renderText(element.signature, originX, originY);
                model.size = element.signatureSize;
                if(className !== 'ghost') {
                    this.render();

                    const {width, height} = model._renderer.elem.getBoundingClientRect();

                    element.width = width;
                    element.height = height;
                }
                break;
            default:
                model = this.svg.makeRectangle(originX, originY, element.width, element.height);
                break;
        }

        model.fill = props.fill;
        model.opacity = props.opacity || 1;
        element.x = originX;
        element.y = originY;

        if (className) {
            model.classList.push(className);
        }

        return model;
    }

    static renderGhost(element, x, y) {
        const ghost = this.makeElement(element, x, y);

        ghost.className = 'ghost';

        return this.render();
    }

    static renderHelpCircle (x, y) {
        const circle = this.svg.makeCircle(x, y, 5);

        circle.fill = '#00000000';
        circle.stroke = '#14ff53';
        circle.opacity = 0;
        circle.className = 'help-circle';

        return circle;
    }

    static renderInvertCircle(x, y) {
        const circle = this.svg.makeCircle(x, y, 3.5);

        circle.fill = '#ffffff';
        circle.stroke = '#000000';
        circle.classList.push('invert-circle');
        circle.className = 'invert-circle';
        circle.linewidth = 1;

        return circle;
    }

    static renderJunction(junction, x, y) {
        const circle = this.svg.makeCircle(x, y, 3);
        const helper = this.renderHelpCircle(x, y);

        circle.className = 'junction-circle';
        circle.fill = '#000000';
        this.background.add(circle);
        junction.model = circle;
        junction.x = x;
        junction.y = y;
        junction.outPins.pins[0].helper = helper;
        junction.renderFlag.subscribe(() => {
            this.render();
        });
        junction.pinToggleObservable.subscribe((pin) => {
            if(pin.helperEnabled) {
                this.foreground.add(pin.helper);
            } else {
                this.background.add(pin.helper);
            }
        });
        this.foreground.add(helper);

        return circle;
    }

    static renderText(text, x, y, styles) {
        const model = this.svg.makeText(text, x, y, styles);

        model.family = 'roboto';

        return model;
    }

    static renderActiveWireZone(wire) {
        const coords = wire.getCoords();
        const {x1, y1, x2, y2, orientation, direction} = coords;
        let xShift = 0;
        let yShift = 0;

        if(orientation === ORIENTATION.HORIZONTAL) {
            xShift = direction === DIRECTION.L2R ? 3 : -3;
        }
        if(orientation === ORIENTATION.VERTICAL) {
            yShift = direction === DIRECTION.T2B ? 3 : -3;
        }
        const size = 7;
        const rect1 = this.svg.makeRectangle(x1 - xShift, y1 - yShift, size, size);
        const rect2 = this.svg.makeRectangle(x2 + xShift, y2 + yShift, size, size);
        const activeZone = this.svg.makeGroup(rect1, rect2);

        activeZone.classList.push('active-zone');
        this.render();
    }

    static renderActiveZone(element) {
        if(element.width && element.height) {
            const {width, height} = element;
            const x = element.x - element.width/2;
            const y = element.y + element.height/2;
            const [x1, y1, x2, y2, x3, y3, x4, y4] = [x, y, x + width, y, x, y - height, x + width, y - height];
            const shift = 3;
            const size = 7;
            const rect1 = this.svg.makeRectangle(x1 - shift, y1 + shift, size, size);
            const rect2 = this.svg.makeRectangle(x2 + shift, y2 + shift, size, size);
            const rect3 = this.svg.makeRectangle(x3 - shift, y3 - shift, size, size);
            const rect4 = this.svg.makeRectangle(x4 + shift, y4 - shift, size, size);
            const activeZone = this.svg.makeGroup(rect1, rect2, rect3, rect4);

            activeZone.classList.push('active-zone');
            this.render();
        }
    }

    static eraseActiveZone() {
        this.removeElementById('active-zone');
    }

    static renderElement(element, x, y) {
        const rect = this.makeElement(element, x, y);
        const inPins = [];
        const outPins = [];
        const outHelpers = [];
        const inHelpers = [];
        const invertInCircles = [];
        const invertOutCircles = [];
        const signature = [];

        if(element.inPins) {
            element.inPins.pins.forEach((val) => {
                const [x1,y1,x2,y2] = [x + val.coords.x1, y + val.coords.y1, x + val.coords.x2,  y + val.coords.y2];

                inPins.push(this.renderWire({}, x1, y1, x2, y2));
                if(val.invert) {
                    invertInCircles.push(this.renderInvertCircle(x2, y2));
                }
                inHelpers.push(this.renderHelpCircle(x1, y1));
            });
        }
        if(element.outPins) {
            element.outPins.pins.forEach((val) => {
                const [x1,y1,x2,y2] = [x + val.coords.x1, y + val.coords.y1, x + val.coords.x2,  y + val.coords.y2];

                outPins.push(this.renderWire({}, x1, y1, x2, y2));
                if(val.invert) {
                    invertOutCircles.push(this.renderInvertCircle(x1, y1));
                }
                outHelpers.push(this.renderHelpCircle(x2, y2));
            });
        }
        if(element.signature && element.name !== ELEMENT.LABEL) {
            const text = this.renderText(element.signature, x + element.width/2, y + 15);

            text.size = element.signatureSize;
            element.signatureModel = text;

            signature.push(text);
        }
        const bodyGroup = this.svg.makeGroup(rect);
        const inPinsGroup = this.svg.makeGroup(inPins);
        const outPinsGroup = this.svg.makeGroup(outPins);
        const inHelpersGroup = this.svg.makeGroup(inHelpers);
        const outHelpersGroup = this.svg.makeGroup(outHelpers);
        const invertInCirclesGroup = this.svg.makeGroup(invertInCircles);
        const invertOutCirclesGroup = this.svg.makeGroup(invertOutCircles);
        const signatureGroup = this.svg.makeGroup(signature);
        const group = this.svg.makeGroup(
            bodyGroup,
            inPinsGroup,
            outPinsGroup,
            inHelpersGroup,
            outHelpersGroup,
            invertInCirclesGroup,
            invertOutCirclesGroup,
            signatureGroup
        );
        if (element.id) {
            rect.classList.push(element.id);
            group.classList.push(element.id);
        }
        group.className = element.className;
        if (element.interactable) {
            const interactionGroup = this.svg.makeGroup(rect, signatureGroup);

            interactionGroup.className = element.className;
            group.add(interactionGroup);
            element.interactionModel = interactionGroup;
        }

        element.model = group;

        _.forEach(inPins, (val, idx) => {
            element.inPins.pins[idx].model = val;
            element.inPins.pins[idx].helper = inHelpers[idx];
        });
        _.forEach(outPins, (val, idx) => {
            element.outPins.pins[idx].model = val;
            element.outPins.pins[idx].helper = outHelpers[idx];
        });
        element.renderFlag.subscribe(() => {
            this.render();
        });
        this.foreground.add(group);
    }

    static getElement(element) {
        return this.svg.scene.getByClassName(element.props.className || element.className);
    }

    static removeElementById(id) {
        const els = this.svg.scene.getByClassName(id);

        _.forEach(els, (el) => {
            el.remove();
        });
        return this.render();
    }

    static removeElement(element) {
        const els = this.svg.scene.getByClassName(_.get(element, 'props.className', false) || element.className);

        _.forEach(els, (el) => {
            el.remove();
        });
    }

    static clearScene() {
        this.svg.clear();
        this.render();
        this.background = this.svg.makeGroup();
        this.middleground = this.svg.makeGroup();
        this.foreground = this.svg.makeGroup();
    }

    static render() {
        this.svg.update();
    }
}

export default Renderer;
