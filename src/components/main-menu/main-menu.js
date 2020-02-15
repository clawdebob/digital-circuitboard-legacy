import React from 'react';
import {fromEvent} from "rxjs";

function SubList(props) {
    const list = props.list.map((entry) => {
        return (
            <li className="suboptions__option" onClick={entry.action}>
                <div className='suboptions__name suboptions__entry'>{entry.name}</div>
                <div className='suboptions__hotkey suboptions__entry'>{entry.hotkey ? entry.hotkey : null}</div>
            </li>
        );
    });

    return (
        <ul className="suboptions">
            {list}
        </ul>
    );
}

class Options extends React.Component {
    render() {
        const component = this.props.options.map((option, idx) => {
            return (
                <li className="main-menu__option-list">
                    <div className="main-menu__option">{option.name}</div>
                    <SubList list={option.suboptions}/>
                </li>
            );
        });

        return <ul className={this.props.className}>{component}</ul>;
    }
}

class mainMenu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            schemeName: 'Scheme',
            inputVisible: false
        };
        this.handleBlur = this.handleBlur.bind(this);
        this.handleTitleClick = this.handleTitleClick.bind(this);
    }

    handleTitleClick() {
        const input = document.getElementsByClassName('scheme-title__input')[0];

        this.setState({
            inputVisible: true
        });

        input.style.display = 'inline-block';
        input.focus();
    }

    handleBlur(e) {
        const input = e.target;
        const name = input.value;

        input.style.display = 'none';

        this.setState({
            schemeName: this.props.defaultSchemeName,
            inputVisible: false
        });

        this.props.setSchemeName(name);
    }

    render() {
        const isVisible = this.state.inputVisible;
        const defaultName = this.props.defaultSchemeName;

        return (
            <div className="main-menu-wrapper">
                <div className="logo-block">
                    <div className="logo"/>
                </div>
                <div className="menu-block">
                    <div className={'scheme-title__wrapper'}>
                        <h3
                            className={`scheme-title scheme-title--${isVisible ? 'hidden' : 'visible'}`}
                            onClick={this.handleTitleClick}
                        >
                            {this.state.schemeName}
                        </h3>
                        <input
                            className={`scheme-title__input`}
                            placeholder={'Scheme'}
                            defaultValue={defaultName}
                            onBlur={(e) => this.handleBlur(e)}
                        />
                    </div>
                    <Options className="main-menu" options={this.props.options} />
                </div>
            </div>
        );
    }
}

export default mainMenu;
