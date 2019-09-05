import React from 'react';

var min = 300;
var max = 3600;

class sideMenu extends React.Component {
    handleDrag(e) {
        e.preventDefault();
        console.log(12);
        document.getElementById('side-menu').style.width = 1200;

        // document.addEventListener('mousemove', (e) => {
        //     e.preventDefault();
        //     var x = e.pageX - document.getElementById('side-menu').offsetLeft;
        //     document.getElementById('side-menu').style.width = 1200;
        //     // if (x > min && x < max && e.pageX < window.innerWidth) {
        //     //      = x;
        //     // }
        // });
    }

    render() {
        return (
            <div className="side-menu" id="side-menu">
                <div id="split-bar" onMouseDown={this.handleDrag}/>
            </div>
        );
    }
}

export default sideMenu;
