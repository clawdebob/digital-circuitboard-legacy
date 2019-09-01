import React from 'react';
import ReactDOM from 'react-dom';
import './index.less';
import MainMenu from './components/main-menu/main-menu.js';

class App extends React.Component {
    render() {
        return (
            <MainMenu/>
        );
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('root')
);
