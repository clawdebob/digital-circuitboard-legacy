import React from 'react';
import _ from 'lodash';
import i18next from 'i18next';

const t = (str) => i18next.t(str);
const TYPES = ['success', 'error', 'warning', 'default'];

function Notification(props) {
    const className = `notification--${_.includes(TYPES, props.type) ? props.type : 'default'}`;

    return (
        <div className={`notification ${className}`} key={props.id}>
            <div className={`notification--title`}>{t(props.title || 'notice') }</div>
            <p className={`notification--description`}>{t(props.description)}</p>
        </div>
    );
}

export default Notification;
