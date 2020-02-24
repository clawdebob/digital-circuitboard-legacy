import React from 'react';
import Spinner from "../spinner/spinner";

class LoadingPopup extends React.Component {
    render() {
        return (
            <div className="loading-popup">
                <Spinner/>
                <p className="loading-popup__status">{this.props.status}</p>
            </div>
        );
    }
}

export default LoadingPopup;
