import Two from 'two.js';

class Renderer {
    constructor() {
        const board = document.getElementById('board');
        const params = {width: 2000, height: 2000};

        this.svg = new Two(params).appendTo(board);
        this.render = this.render.bind(this);
    }

    renderWire(props, x1,y1,x2,y2) {
        const wire = this.svg.makeLine(x1,y1,x2,y2);
        wire.fill = props.fill || '#000000';
        wire.opacity = 1;
        wire.linewidth = 2;
        if (props.id) {
            wire.node_id = props.id;
        }
        if (props.className) {
            wire.classList.push(props.className);
        }

        return this.render();
    }

    renderElement(element, x, y, ghost = false) {
        const props = element.props;
        const originY = element.height/2 - element.originY;
        const originX = element.width/2;
        const rect = this.svg.makeRectangle(x + originX, y + originY, element.width, element.height);
        rect.fill = props.fill;
        rect.opacity = props.opacity || 1;
        if(!ghost) {
            element.inPins.pinPositionsArray.forEach((val) => {
                this.renderWire({}, x + val.x1, y + val.y1, x + val.x2,  y + val.y2);
            });
            element.outPins.pinPositionsArray.forEach((val) => {
                this.renderWire({}, x + val.x1, y + val.y1, x + val.x2,  y + val.y2);
            });
        }
        rect.noStroke();
        if (props.id) {
            rect.node_id = props.id;
        }
        if (props.className) {
            rect.classList.push(props.className);
        }
        return this.render();
    }

    getElement(element) {
        const els = this.svg.scene.getByClassName(element.props.className || element.className);
        return els;
    }

    removeElement(element) {
        const els = this.svg.scene.getByClassName(element.props.className || element.className);
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
