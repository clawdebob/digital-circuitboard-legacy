import React from 'react';

class sideMenu extends React.Component {
    constructor(props) {
        super(props);

        this.slide = {
            column: null,
            curColumnWidth: null,
            pageX: null,
            width: null,
            mouseMove(e) {
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
                <div
                    className="side-menu__split-bar"
                    onMouseDown={this.handleMouseDown}
                />
                <div className="side-menu__list"></div>
            </div>
        );
    }
}

export default sideMenu;
