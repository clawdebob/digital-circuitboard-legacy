import React from 'react';
import Renderer from '../../render';
import Wire from '../../elements/Wire/Wire';

class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            x: null,
            y: null,
            x1: null,
            y1: null,
            wiresToBuild: null,
        };
        this.ghost = null;
        this.down = false;
        this.wiresToBuild = null;

        this.dragHandler = this.dragHandler.bind(this);
        this.ghostHelper = this.ghostHelper.bind(this);
        this.startWire = this.startWire.bind(this);
        this.endWire = this.endWire.bind(this);
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

    calcWireCoords(coords, isWireStart = false) {
        coords.x = Math.floor(coords.x/22)*22 + 10;
        coords.y = Math.floor(coords.y/22)*22 + 10;

        if(isWireStart) {
            this.setState({x1: coords.x, y1: coords.y});
        } else {
            this.setState(coords);
        }
    }

    startWire(e) {
        e.preventDefault();
        let coords = this.getCoords(e);
        this.down = true;
        this.calcWireCoords(coords, true);
    }

    endWire(e) {
        e.preventDefault();
        const wire = new Wire();
        wire.className = 'Wire';
        if(this.wiresToBuild) {
            const main = this.wiresToBuild.main;
            const bend = this.wiresToBuild.bend;
            if(main) {
                this.renderer.renderWire(wire, main.x1, main.y1, main.x2, main.y2);
                if(bend) {
                    this.renderer.renderWire(bend, bend.x1, bend.y1, bend.x2, bend.y2);
                }
            }
        }
        this.down = false;
        this.board.removeEventListener('mousemove', this.ghostHelper);
    }

    dragHandler(e) {
        e.preventDefault();
        const el = this.props.currentEl;

        this.renderer.renderElement(el, this.state.x + el.width/2, this.state.y + el.height/2);
    }

    orientationCorrection(x1, y1, x2, y2) {
        if(x1 === x2) {
            x1++;
            x2++;
            if(y1 < y2) {
                y2 += 2;
            } else {
                y1 += 2;
            }
        } else if(y1 === y2) {
            y1++;
            y2++;
            if(x1 < x2) {
                x2 += 2;
            } else {
                x1 += 2;
            }
        }

        return [x1, y1, x2, y2];
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

        if(this.props.state === 'wire' && this.down) {
            const wire = new Wire();
            const bend = new Wire();
            wire.className = 'main';
            bend.className = 'bend';
            const prev = this.renderer.getElement(wire);
            this.calcWireCoords(coords);
            this.renderer.removeElement(wire);
            this.renderer.removeElement(bend);

            let x1 = this.state.x1;
            let y1 = this.state.y1;
            let x2 = this.state.x;
            let y2 = this.state.y;

            if(y1 !== y2 && x1 !== x2) {
                let x1m, y1m, x2m, y2m;
                let x1b, y1b, x2b, y2b;
                if(prev.length > 0 && (prev[0].vertices[0].x === prev[0].vertices[1].x)){
                    [x1m, y1m, x2m, y2m] = [x1, y1, x1, y2];
                    [x1b, y1b, x2b, y2b] = [x1, y2, x2, y2];
                } else {
                    [x1m, y1m, x2m, y2m] = [x1, y1, x2, y1];
                    [x1b, y1b, x2b, y2b] = [x2, y1, x2, y2];
                }
                [x1m, y1m, x2m, y2m] = this.orientationCorrection(x1m, y1m, x2m, y2m);
                [x1b, y1b, x2b, y2b] = this.orientationCorrection(x1b, y1b, x2b, y2b);
                this.renderer.renderWire(wire, x1m, y1m, x2m, y2m);
                this.renderer.renderWire(bend, x1b, y1b, x2b, y2b);
                this.wiresToBuild = {
                    main: {
                        x1: x1m,
                        y1: y1m,
                        x2: x2m,
                        y2: y2m
                    },
                    bend: {
                        x1: x1b,
                        y1: y1b,
                        x2: x2b,
                        y2: y2b
                    }
                };
            } else {
                [x1, y1, x2, y2] = this.orientationCorrection(x1,y1,x2,y2);

                this.renderer.renderWire(wire, x1, y1, x2, y2);
                this.wiresToBuild = {
                    main: {
                        x1: x1,
                        y1: y1,
                        x2: x2,
                        y2: y2
                    }
                };
            }
        }
    }

    resetComponent() {
        if(this.board){
            if(this.ghost) {
                this.renderer.removeElement(this.ghost);
            }
            this.ghost = null;
            this.board.removeEventListener('mousedown', this.startWire);
            this.board.removeEventListener('mousemove', this.ghostHelper);
            this.board.removeEventListener('mouseup', this.endWire);
            this.board.removeEventListener('click', this.dragHandler);
        }
    }

    setBoardState() {
        this.resetComponent();
        switch(this.props.state) {
            case 'wire':
                this.board.style.cursor = 'crosshair';
                this.board.addEventListener('mousedown', this.startWire);
                this.board.addEventListener('mousemove', this.ghostHelper);
                this.board.addEventListener('mouseup', this.endWire);
                break;
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
                // this.resetComponent();
                break;
        }
    }

    componentDidMount() {
        this.board = document.getElementById('board');
        this.renderer = new Renderer();
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
