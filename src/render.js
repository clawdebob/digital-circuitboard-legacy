import {fabric} from 'fabric';

class Renderer {
    constructor() {
        this.canvas = new fabric.Canvas('board', {
            width: 1680,
            height: 1020
        });

        var rect = new fabric.Rect({
            top : 100,
            left : 1000,
            width : 60,
            height : 70,
            fill : 'red'
        });

        this.canvas.add(rect);
        this.render = this.render.bind(this);
    }

    render() {
        var rect = new fabric.Rect({
            top : 100,
            left : 500,
            width : 60,
            height : 70,
            fill : 'green'
        });

        this.canvas.add(rect);
    }
}

export default Renderer;
