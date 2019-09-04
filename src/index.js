import React from 'react';
import ReactDOM from 'react-dom';
import './index.less';
import MainMenu from './components/main-menu/main-menu.js';
import Board from './components/board/board.js';

class App extends React.Component {
    render() {
        return (
            <div className="app">
                <MainMenu/>
                <Board/>
            </div>
        );
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('root')
);
