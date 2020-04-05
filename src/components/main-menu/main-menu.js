import React from 'react';
import i18next from 'i18next';
import { ReactComponent as Logo } from '../../assets/dcb-logo.svg';
import LanguageSelector from '../language-selector/language-selector';

const t = (str) => i18next.t(str);

function SubList(props) {
    const list = props.list.map((entry, idx) => {
        return (
            <li className="suboptions__option" onClick={entry.action} key={idx}>
                <div className='suboptions__name suboptions__entry'>{t(entry.name)}</div>
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
                <li className="main-menu__option-list" key={idx}>
                    <div className="main-menu__option">{t(option.name)}</div>
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
            inputVisible: false
        });

        if(name) {
            this.props.setSchemeName(name);
        }
    }

    render() {
        const isVisible = this.state.inputVisible;

        return (
            <div className="main-menu__wrapper">
                <div className="main-menu__section">
                    <div className="logo-block">
                        <Logo className="logo"/>
                    </div>
                    <div className="menu-block">
                        <div className={'scheme-title__wrapper'} key={this.props.schemeName}>
                            <h3
                                className={`scheme-title scheme-title--${isVisible ? 'hidden' : 'visible'}`}
                                onClick={this.handleTitleClick}
                            >
                                {this.props.schemeName}
                            </h3>
                            <input
                                className={`scheme-title__input`}
                                placeholder={'Scheme'}
                                defaultValue={this.props.schemeName}
                                onBlur={(e) => this.handleBlur(e)}
                            />
                        </div>
                        <Options className="main-menu" options={this.props.options} />
                    </div>
                </div>
                <div className="extras__section">
                    <LanguageSelector setBoardState={(state) => this.props.setBoardState(state)}/>
                </div>
            </div>
        );
    }
}

export default mainMenu;
