import Two from 'two.js';

class Renderer {
    constructor() {
        const board = document.getElementById('board');
        const params = {width: 2000, height: 1000};

        this.svg = new Two(params).appendTo(board);
        this.render = this.render.bind(this);
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

    removeElement(element) {
        const els = this.svg.scene.getByClassName(element.props.className);
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
