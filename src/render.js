import Two from 'two.js';
import _ from 'lodash';

class Renderer {
    constructor() {
        const board = document.getElementById('board');
        const params = {width: 2000, height: 2000};

        this.svg = new Two(params).appendTo(board);
        this.render = this.render.bind(this);
        this.background = this.svg.makeGroup();
        this.middleground = this.svg.makeGroup();
        this.foreground = this.svg.makeGroup();
    }

    renderWire(wire, x1,y1,x2,y2) {
        const line = this.svg.makeLine(x1,y1,x2,y2);
        line.fill = wire.fill || '#000000';
        line.opacity = 1;
        line.linewidth = 2;
        if (wire.className) {
            line.classList.push(wire.className);
        }

        wire.model = line;
        if(wire.className === 'Wire') {
            const inHelper = wire.inConnector ? this.renderHelpCircle(x1, y1) : this.renderHelpCircle(x2, y2);
            const outHelper = wire.inConnector ? this.renderHelpCircle(x2, y2) : this.renderHelpCircle(x1, y1);
            const tempsForJunctions = [];

            this.foreground.add(inHelper);
            this.foreground.add(outHelper);
            if (x1 === x2) {
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
            this.svg.makeGroup(line, jgroup, inHelper, outHelper);
            // if (wire.id) {
            //     line.classList.push(wire.id);
            //     group.classList.push(wire.id);
            // }
            wire.inPins.pins[0].helper = inHelper;
            wire.outPins.pins[0].helper = outHelper;
        }
        this.background.add(line);

        this.render();
        return line;
    }

    makeElement(element, x, y) {
        const props = element.props;
        const originY = y + element.height/2 - element.originY;
        const originX = x + element.width/2;
        const rect = this.svg.makeRectangle(originX, originY, element.width, element.height);

        rect.fill = props.fill;
        rect.opacity = props.opacity || 1;
        element.x = originX;
        element.y = originY;

        if (props.className) {
            rect.classList.push(props.className);
        }

        return rect;
    }

    renderGhost(element, x, y) {
        this.makeElement(element, x, y);

        return this.render();
    }

    renderHelpCircle (x, y) {
        const circle = this.svg.makeCircle(x, y, 5);

        circle.fill = '#00000000';
        circle.stroke = '#14ff53';
        circle.classList.push('help-circle');
        circle.opacity = 0;
        circle.className = 'help-circle';
        this.render();

        return circle;
    }

    renderInvertCircle(x, y) {
        const circle = this.svg.makeCircle(x, y, 3.5);

        circle.fill = '#ffffff';
        circle.stroke = '#000000';
        circle.classList.push('invert-circle');
        circle.className = 'invert-circle';
        circle.linewidth = 2;
        this.render();
        console.log(circle);

        return circle;
    }

    renderJunction(junction, x,y) {
        const circle = this.svg.makeCircle(x, y, 3);

        circle.classList.push('junction-circle');
        circle.className = 'junction-circle';
        circle.fill = '#000000';
        this.foreground.add(circle);
        this.render();
        junction.model = circle;
        junction.x = x;
        junction.y = y;

        return circle;
    }

    renderElement(element, x, y) {
        const rect = this.makeElement(element, x, y);
        const inPins = [];
        const outPins = [];
        const outHelpers = [];
        const inHelpers = [];
        const invertInCircles = [];
        const invertOutCircles = [];

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
        const inPinsGroup = this.svg.makeGroup(inPins);
        const outPinsGroup = this.svg.makeGroup(outPins);
        const inHelpersGroup = this.svg.makeGroup(inHelpers);
        const outHelpersGroup = this.svg.makeGroup(outHelpers);
        const invertInCirclesGroup = this.svg.makeGroup(invertInCircles);
        const invertOutCirclesGroup = this.svg.makeGroup(invertOutCircles);
        const group = this.svg.makeGroup(
            rect,
            inPinsGroup,
            outPinsGroup,
            inHelpersGroup,
            outHelpersGroup,
            invertInCirclesGroup,
            invertOutCirclesGroup
        );
        if (element.id) {
            rect.classList.push(element.id);
        }
        if (element.className) {
            rect.className = element.className;
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
        this.foreground.add(group);

        return this.render();
    }

    getElement(element) {
        return this.svg.scene.getByClassName(element.props.className || element.className);
    }

    removeElementById(id) {
        const els = this.svg.scene.getByClassName(id);

        _.forEach(els, (el) => {
            el.remove();
        });
        return this.render();
    }

    removeElement(element) {
        const els = this.svg.scene.getByClassName(_.get(element, 'props.className', false) || element.className);

        _.forEach(els, (el) => {
            el.remove();
        });
        return this.render();
    }

    render() {
        this.svg.update();
    }
}

export default Renderer;
