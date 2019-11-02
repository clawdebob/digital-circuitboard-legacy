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

    renderWire(props, x1,y1,x2,y2) {
        const line = this.svg.makeLine(x1,y1,x2,y2);
        line.fill = props.fill || '#000000';
        line.opacity = 1;
        line.linewidth = 2;
        if (props.id) {
            line.node_id = props.id;
        }
        if (props.className) {
            line.classList.push(props.className);
        }

        props.model = line;
        this.background.add(line);
        if(props.className === 'Wire') {
            console.log(x1, y1, x2, y2);
            const inHelper = props.inConnector ? this.renderHelpCircle(x1, y1) : this.renderHelpCircle(x2, y2);
            const outHelper = props.inConnector ? this.renderHelpCircle(x2, y2) : this.renderHelpCircle(x1, y1);
            this.foreground.add(inHelper);
            this.foreground.add(outHelper);

            props.inPins.pins[0].helper = inHelper;
            props.outPins.pins[0].helper = outHelper;
        }
        this.render();
        return line;
    }

    makeElement(element, x, y) {
        const props = element.props;
        const originY = element.height/2 - element.originY;
        const originX = element.width/2;
        const rect = this.svg.makeRectangle(x + originX, y + originY, element.width, element.height);

        rect.fill = props.fill;
        rect.opacity = props.opacity || 1;

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

    renderElement(element, x, y) {
        const rect = this.makeElement(element, x, y);
        const inPins = [];
        const outPins = [];
        const outHelpers = [];
        const inHelpers = [];
        if(element.inPins) {
            element.inPins.pins.forEach((val) => {
                inPins.push(this.renderWire({}, x + val.coords.x1, y + val.coords.y1, x + val.coords.x2,  y + val.coords.y2));
                inHelpers.push(this.renderHelpCircle(x + val.coords.x1, y + val.coords.y1));
            });
        }
        element.outPins.pins.forEach((val) => {
            outPins.push(this.renderWire({}, x + val.coords.x1, y + val.coords.y1, x + val.coords.x2,  y + val.coords.y2));
            outHelpers.push(this.renderHelpCircle(x + val.coords.x2,  y + val.coords.y2));
        });
        const inPinsGroup = this.svg.makeGroup(inPins);
        const outPinsGroup = this.svg.makeGroup(outPins);
        const inHelpersGroup = this.svg.makeGroup(inHelpers);
        const outHelpersGroup = this.svg.makeGroup(outHelpers);
        const group = this.svg.makeGroup(rect, inPinsGroup, outPinsGroup, inHelpersGroup, outHelpersGroup);
        if (element.id) {
            rect.classList.push(element.id);
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

    removeElement(element) {
        const els = this.svg.scene.getByClassName(_.get(element, 'props.className', false) || element.className);
        for (let c = 0; c < els.length; c++) {
            let elem = els[c];
            elem.remove();
        }
        return this.render();
    }

    render() {
        this.svg.update();
    }
}

export default Renderer;
