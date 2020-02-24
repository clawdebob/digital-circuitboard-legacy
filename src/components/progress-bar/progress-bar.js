import React from 'react';

class ProgressBar extends React.Component {
    render() {
        console.log(this.props.progress);

        return (
            <div className="progress__wrapper">
                <div className="progress">
                    <div className="progress__bar" style={{width: `${this.props.progress}%`}}/>
                </div>
            </div>
        )
    }
}

export default ProgressBar;
