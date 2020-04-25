import React from 'react';
import Spinner from "../spinner/spinner";

function LoadingPopup(props) {
    const {isVisible, status} = props;

    return isVisible ? (
        <div className="fade-curtain">
            <div className="loading-popup">
                <Spinner/>
                <p className="loading-popup__status">{status}</p>
            </div>
        </div>
    ) : null;
}

export default LoadingPopup;
