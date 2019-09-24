import * as Two from 'twojs-ts';

class Renderer {
    constructor() {
        const board = document.getElementById('board');
        const params = {width: 2000, height: 2000};
        this.svg = new Two(params).appendTo(board);
        this.render = this.render.bind(this);
    }

    render() {
        const rect = this.svg.makeRectangle(213, 100, 100, 100);
        rect.fill = '#FF8000';
        rect.opacity = 0.75;
        rect.noStroke();
        this.svg.update();
    }
}

export default Renderer;
