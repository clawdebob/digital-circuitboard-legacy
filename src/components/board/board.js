import React from 'react';
import Renderer from '../../render';

class Board extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <canvas id="board" />
        );
    }
}

export default Board;
