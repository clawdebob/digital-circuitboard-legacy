import React from 'react';
import ProgressBar from "../progress-bar/progress-bar";
import Spinner from "../spinner/spinner";

class LoadingPopup extends React.Component {
    render() {
        return (
            <div className="loading-popup">
                {/*<ProgressBar*/}
                {/*    progress={this.props.progress}*/}
                {/*/>*/}
                {/*<p className="loading-popup__status">{this.props.status}</p>*/}
                <Spinner/>
            </div>
        );
    }
}

export default LoadingPopup;
