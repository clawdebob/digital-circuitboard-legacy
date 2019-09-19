import React from 'react';

class GroupElements extends React.Component {
    render() {
        const elements = this.props.elements.map((el, idx) => {
            return (
                <div className="element" title={el}/>
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
                </div>
                <GroupElements
                    elements={group.elements}
                    className={`elements-list`}
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

class ElementDetails extends React.Component{
    getElementData() {
        const data = [];

        for (let c = 0; c < 4; c++) {
            data.push(
                <tr>
                    <td>value {c + 1}</td>
                    <td><input type="text"/></td>
                </tr>
            );
        }

        return data;
    }
    render() {
        const elementData = this.getElementData();

        return (
            <table className="element-details">
                <tbody>
                <tr>
                    <th>Name</th>
                    <th>Value</th>
                </tr>
                {elementData}
                </tbody>
            </table>
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
            mouseUp() {
                this.column = undefined;
                this.pageX = undefined;
                this.curColumnWidth = undefined;
                this.width = undefined;
                document.removeEventListener('mouseup', this.mouseUp);
                document.removeEventListener('mousemove', this.mouseMove);
            },
        };

        let slide = this.slide;

        slide.mouseMove = slide.mouseMove.bind(slide);
        slide.mouseUp = slide.mouseUp.bind(slide);
        this.handleMouseDown = this.handleMouseDown.bind(this);
    }


    handleMouseDown(e) {
        const slide = this.slide;

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
                        <GroupDetails groups={this.props.groups} className="side-menu__section__list"/>
                        <ElementDetails/>
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
