import React from 'react';
import ElementDetails from '../element-details/element-details';

class GroupElements extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick = (el) => {
        this.props.setBoardState('create');
        return this.props.handleChange(el);
    };

    render() {
        const elements = this.props.elements.map((el, idx) => {
            return (
                <div
                    className="element"
                    title={el.name || el}
                    onClick={() => this.handleClick(el.create())}
                    key={el.name}
                />
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
        const group = this.props.group;
        const idx = this.props.index;

        return (
            <div className={`${this.props.className}-${this.state.opened ? 'opened' : 'closed'} ${this.props.className}`}>
                <div
                    className={
                        `details detail--${idx}`
                    }
                    onClick={this.handleClick}
                >
                    <span>{group.name}</span>
                    <div className={'arrow'}/>
                </div>
                <GroupElements
                    elements={group.elements}
                    className={`elements-list`}
                    handleChange={(props) => this.props.handleChange(props)}
                    setBoardState={(state) => this.props.setBoardState(state)}
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
                    handleChange={(props) => this.props.handleChange(props)}
                    setBoardState={(state) => this.props.setBoardState(state)}
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

        this.slide = {
            column: null,
            curColumnWidth: null,
            pageX: null,
            width: null,
            mouseMove(e) {
                e.preventDefault();
                if (this.column) {
                    let diffX = e.pageX - this.pageX;

                    if (this.column.getBoundingClientRect().width > this.width
                        || (this.column.getBoundingClientRect().width === this.width && diffX > 0)) {
                        this.column.style.width = `${diffX + this.curColumnWidth}px`;
                    } else {
                        this.column.style.width = `${this.width}px`;
                    }
                }
            },
            mouseUp(e) {
                e.preventDefault();
                this.column = undefined;
                this.pageX = undefined;
                this.curColumnWidth = undefined;
                this.width = undefined;
                document.removeEventListener('mouseup', this.mouseUp);
                document.removeEventListener('mousemove', this.mouseMove);
            },
        };
        this.state = {
            currentEl: null,
            originalData: null,
        };

        let slide = this.slide;

        slide.mouseMove = slide.mouseMove.bind(slide);
        slide.mouseUp = slide.mouseUp.bind(slide);
        this.handleMouseDown = this.handleMouseDown.bind(this);
    }


    handleMouseDown(e) {
        const slide = this.slide;

        e.preventDefault();
        slide.column = e.target.parentElement;
        slide.pageX = e.pageX;
        slide.curColumnWidth = slide.column.offsetWidth;
        slide.width = e.target.offsetWidth + 2;

        document.addEventListener('mousemove', slide.mouseMove);
        document.addEventListener('mouseup', slide.mouseUp);
    }

    render() {
        return (
            <div className="side-menu">
                <div className="side-menu__section__wrapper">
                    <div className="side-menu__section">
                        <GroupDetails
                            groups={this.props.groups}
                            handleChange={(props) => this.props.handleChange(props)}
                            className="side-menu__section__list"
                            currentEl={this.props.currentEl}
                            setBoardState={(state) => this.props.setBoardState(state)}
                        />
                        <ElementDetails
                            currentEl={this.props.currentEl}
                            handleChange={(props) => this.props.handleChange(props)}
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
