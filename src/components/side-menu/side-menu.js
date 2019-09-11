import React from 'react';

class sideMenu extends React.Component {
    constructor(props) {
        super(props);
        this.slide = {
            column: null,
            curColumnWidth: null,
            pageX: null,
            width: null,
        };
        this.handleMouseDown = this.handleMouseDown.bind(this);

        const slide = this.slide;

        document.addEventListener('mousemove', (e) => {
            console.log(slide.width);
            if (slide.column) {
                let diffX = e.pageX - slide.pageX;
                if (slide.column.getBoundingClientRect().width > slide.width
                || (slide.column.getBoundingClientRect().width === slide.width && diffX > 0)) {
                    slide.column.style.width = `${diffX + slide.curColumnWidth}px`;
                } else {
                    slide.column.style.width = `${slide.width}px`;
                }
            }
        });

        document.addEventListener('mouseup', (e) => {
            slide.column = undefined;
            slide.pageX = undefined;
            slide.curColumnWidth = undefined;
            slide.width = undefined;
        });
    }


    handleMouseDown(e) {
        const slide = this.slide;

        slide.column = e.target.parentElement;
        slide.pageX = e.pageX;
        slide.curColumnWidth = slide.column.offsetWidth;
        slide.width = e.target.offsetWidth + 2;
    }

    render() {
        return (
            <div className="side-menu" id="side-menu">
                <div
                    id="split-bar"
                    onMouseDown={this.handleMouseDown}
                />
            </div>
        );
    }
}

export default sideMenu;
