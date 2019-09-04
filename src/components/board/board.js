import React from 'react';

function Board(props) {
    let squares = [];
    for (let c = 0; c < 10000; c++) {
        squares.push(
            <div className="board__square" />
        );
    }
    return (
        <div className="board">
            {squares}
        </div>
    );
}

export default Board;
