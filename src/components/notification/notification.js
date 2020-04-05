import React from 'react';
import _ from 'lodash';

const TYPES = ['success', 'error', 'warning', 'default'];

function Notification(props) {
    const className = `notification--${_.includes(TYPES, props.type) ? props.type : 'default'}`;

    return (
        <div className={`notification ${className}`} key={props.id}>
            <div className={`notification--title`}>{props.title || 'Notice'}</div>
            <p className={`notification--description`}>{props.description}</p>
        </div>
    );
}

export default Notification;
