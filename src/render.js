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
        wire.fill = props.fill;
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

    renderElement(element, x, y) {
        const props = element.props;
        const rect = this.svg.makeRectangle(x, y, element.width, element.height);
        rect.fill = props.fill;
        rect.opacity = props.opacity || 1;
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
