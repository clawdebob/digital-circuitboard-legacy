import React from 'react';
import Cookies from 'js-cookie';
import i18n from '../../services/i18n';
import {fromEvent} from "rxjs";

class LanguageSelector extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            visible: false,
            language: ''
        };
        this.clickObserver = fromEvent(document, 'click');
        this.clickSubscription = null;
    }

    changeLanguage(language) {
        i18n.changeLanguage(language);
        Cookies.set('lang', language, {path: '/', expires: 7});
        this.props.setBoardState('edit');
        this.setState({language});
        if(this.state.visible) {
            this.toggleSelector();
        }
    }

    toggleSelector() {
        this.setState({
           visible: !this.state.visible,
        });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(this.state.visible) {
            this.clickSubscription = this.clickObserver.subscribe(() => {
                this.toggleSelector();
            });
        } else if(this.clickSubscription) {
            this.clickSubscription.unsubscribe();
            this.clickSubscription = null;
        }
    }

    componentDidMount() {
        const language = Cookies.get('lang');

        if(language) {
            this.changeLanguage(language);
        } else {
            this.changeLanguage(i18n.language)
        }
    }

    render() {
        const isVisible = this.state.visible;
        const language = this.state.language;

        return (
            <div
                className="language"
                title='Select Language'
            >
                <div
                    className="language--icon"
                    onClick={() => this.toggleSelector()}
                >
                    <span
                        className="iconify"
                        data-icon="ic:baseline-language"
                    />
                </div>
                <li className={`language--list language--list--${isVisible ? 'visible' : 'hidden'}`}>
                    <ul
                        className="language--list--option"
                        onClick={() => this.changeLanguage('en')}
                    >
                        <span>English</span>
                        <span className={`language--check language--check--${language === 'en' ? 'visible' : 'hidden'}`}>
                            <span
                                className="iconify"
                                data-icon="ant-design:check-outlined"
                            />
                        </span>
                    </ul>
                    <ul
                        className="language--list--option"
                        onClick={() => this.changeLanguage('ru')}
                    >
                        <span>Русский</span>
                        <span className={`language--check language--check--${language === 'ru' ? 'visible' : 'hidden'}`}>
                            <span
                                className="iconify"
                                data-icon="ant-design:check-outlined"
                            />
                        </span>
                    </ul>
                </li>
            </div>
        );
    }
}

export default LanguageSelector;
