import React from 'react';
import Renderer from '../../render.js';

class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ghost: null,
            x: null,
            y: null,
        };
        this.ghost = null;

        this.dragHandler = this.dragHandler.bind(this);
        this.ghostHelper = this.ghostHelper.bind(this);
    }

    getCoords(e) {
        const target = this.board.getBoundingClientRect();

        const x = e.pageX - target.left;
        const y = e.pageY - target.top;

        return {x: x, y: y};
    }

    calcCoords(coords) {
        coords.x = Math.floor(coords.x/22)*22 + 10;
        coords.y = Math.floor(coords.y/22)*22 + 10;

        this.setState(coords);
    }

    dragHandler(e) {
        e.preventDefault();
        const el = this.props.currentEl;

        this.renderer.renderElement(el, this.state.x + el.width/2, this.state.y + el.height/2);
    }

    ghostHelper(e) {
        e.preventDefault();
        const ghost = this.ghost;
        let coords = this.getCoords(e);

        if(ghost) {
            this.calcCoords(coords);

            this.renderer.removeElement(ghost);
            this.renderer.renderElement(ghost, coords.x + ghost.width/2, coords.y + ghost.height/2);
        }
    }

    setBoardState() {
        switch(this.props.state) {
            case 'edit':

                break;
            case 'create':
                this.board.style.cursor = 'crosshair';
                this.board.addEventListener('mousemove', this.ghostHelper);
                this.board.addEventListener('click', this.dragHandler);
                const ghost = JSON.parse(JSON.stringify(this.props.currentEl));

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
        // this.applyPointEvents();
    }

    render() {
        this.setBoardState();
        return (
            <div className="board__container">
                <div className="board" id="board" />
            </div>
        );
    }
}

export default Board;
