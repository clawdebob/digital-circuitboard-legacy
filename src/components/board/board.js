import React from 'react';

class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            eventType: null,
        };

        this.dragHandler = this.dragHandler.bind(this);
        this.ghostHelper = this.ghostHelper.bind(this);
    }

    getCoords(e) {
        const target = this.board.getBoundingClientRect();

        const x = e.pageX - target.left;
        const y = e.pageY - target.top;

        return {x: x, y: y};
    }

    dragHandler(e) {
        e.preventDefault();
        const coords = this.getCoords(e);
        const el = this.props.currentEl;

        this.props.renderer.renderElement(el, coords.x + el.width/2, coords.y + el.height/2);
    }

    ghostHelper(e) {
        e.preventDefault();
        const coords = this.getCoords(e);
        const ghost = this.props.currentEl;
        const activeGhosts = document.getElementsByClassName('ghost');
        ghost.props.className = 'ghost';
        if (activeGhosts.length > 0) {
            this.props.renderer.removeElement(ghost);
        }
        this.props.renderer.renderElement(ghost, coords.x + ghost.width/2, coords.y + ghost.height/2);
    }

    setBoardState() {
        switch(this.props.state) {
            case 'edit':

                break;
            case 'create':
                this.board.style.cursor = 'crosshair';
                this.board.addEventListener('click', this.dragHandler);
                this.board.addEventListener('mousemove', this.ghostHelper);
                break;
            default:
                break;
        }
    }

    componentDidMount() {
        this.board = document.getElementById('board');
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
