import React from 'react';
import ElementDetails from '../element-details/element-details';
import i18next from 'i18next';
import PubSub from "../../services/pubSub";
import {EVENT} from "../../consts/events.consts";
import STATE from "../board/board-states.consts";
import {fromEvent} from "rxjs";
import Renderer from "../../utils/render";

const t = (str) => i18next.t(str);

class GroupElements extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick = (el) => {
        PubSub.publish(EVENT.SET_BOARD_STATE, STATE.CREATE);
        PubSub.publish(EVENT.SET_CURRENT_ELEMENT, el);
    };

    render() {
        const elements = this.props.elements.map((el, idx) => {
            return (
                <div
                    key={idx}
                    className="element"
                    title={t(el.name) || el}
                    onClick={() => this.handleClick(el.create())}
                >
                    <img src={el.icon} alt={t(el.name)}/>
                </div>
            );
        });

        return (
            <div
                className={this.props.className}
            >
                {elements}
            </div>);
    }
}

class Group extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            opened: false,
        };
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(e) {
        this.setState({opened: !this.state.opened});
    }

    render() {
        const {group, index} = this.props;

        return (
            <div className={`${this.props.className}-${this.state.opened ? 'opened' : 'closed'} ${this.props.className}`}>
                <div
                    className={`details detail--${index}`}
                    onClick={this.handleClick}
                >
                    <span>{t(group.name)}</span>
                    <div className={'arrow'}/>
                </div>
                <GroupElements
                    elements={group.elements}
                    className={`elements-list`}
                    currentEl={this.props.currentEl}
                />
            </div>
        );
    }
}

class GroupDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            opened: false,
        };
        this.handleClick = this.handleClick.bind(this);
    }


    handleClick(e) {
        this.setState({opened: !this.state.opened});
    }

    render() {
        const component = this.props.groups.map((group, idx) => {
            return (
                <Group
                    group={group}
                    className={`${this.props.className}__group`}
                    index={idx}
                    key={group.name}
                    currentEl={this.props.currentEl}
                />
            );
        });

        return (
            <div
                className={this.props.className}
            >
                {component}
            </div>
        );
    }
}

class sideMenu extends React.Component {
    constructor(props) {
        super(props);

        this.sliderMoveObservable = fromEvent(document, 'mousemove');
        this.mouseUpSliderObservable = fromEvent(document, 'mouseup');
        this.sliderMoveSubscription = null;
        this.mouseUpSliderSubscription = null;
        this.menuInitialWidth = null;

        this.state = {
            currentEl: null,
            originalData: null,
        };

        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.mouseUp = this.mouseUp.bind(this);
    }

    mouseMove(e, slider) {
        e.preventDefault();
        const diffX = e.pageX - slider.pageX;
        const menuWidth = diffX + slider.curColumnWidth;

        if (e.pageX > slider.width && slider.column.getBoundingClientRect().width > slider.width) {
            slider.column.style.width = `${menuWidth}px`;
        } else {
            slider.column.style.width = `${slider.width}px`;
        }

        if(this.menuInitialWidth > menuWidth) {
            const {width, height} = document.getElementsByClassName('board__container')[0].getBoundingClientRect();
            const boardWidth = Renderer.getFieldData().width;
            const boardHeight = Renderer.getFieldData().height;

            PubSub.publish(EVENT.BOARD_RESIZE, {
                width: boardWidth > width ? boardWidth : width,
                height: boardHeight > height ? boardHeight : height
            });
            this.menuInitialWidth = menuWidth;
        }
    }

    mouseUp(e) {
        e.preventDefault();
        this.sliderMoveSubscription.unsubscribe();
        this.mouseUpSliderSubscription.unsubscribe();
    }

    handleMouseDown(e) {
        e.preventDefault();

        const slider = {
            column: e.target.parentElement,
            curColumnWidth: e.target.parentElement.offsetWidth,
            pageX: e.pageX,
            width: e.target.offsetWidth + 2,
            height: e.target.offsetHeight
        };

        this.sliderMoveSubscription = this.sliderMoveObservable
            .subscribe((e) => this.mouseMove(e, slider));
        this.mouseUpSliderSubscription = this.mouseUpSliderObservable
            .subscribe(this.mouseUp);
    }

    componentDidMount() {
        const menu = document.getElementsByClassName('side-menu')[0];

        this.menuInitialWidth = menu.getBoundingClientRect().width;
        fromEvent(window, 'resize')
            .subscribe((e) => {
                const windowWidth = e.target.innerWidth;
                const menuWidth = menu.getBoundingClientRect().width;
                const menuHeight = menu.getBoundingClientRect().height;
                const boardWidth = Renderer.getFieldData().width;
                const boardHeight = Renderer.getFieldData().height;

                PubSub.publish(EVENT.BOARD_RESIZE, {
                    width: boardWidth + menuWidth > windowWidth ? boardWidth : windowWidth - menuWidth,
                    height: boardHeight > menuHeight ? boardHeight : menuHeight
                });
            });
    }

    render() {
        return (
            <div className="side-menu">
                <div className="side-menu__section__wrapper">
                    <div className="side-menu__section">
                        <GroupDetails
                            groups={this.props.groups}
                            className="side-menu__section__list"
                            currentEl={this.props.currentEl}
                        />
                        <ElementDetails
                            currentEl={this.props.currentEl}
                        />
                    </div>
                </div>
                <div
                    className="side-menu__split-bar"
                    onMouseDown={this.handleMouseDown}
                />
            </div>
        );
    }
}

export default sideMenu;
