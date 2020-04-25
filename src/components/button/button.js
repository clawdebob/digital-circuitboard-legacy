import * as React from "react";
import i18next from 'i18next';

const t = (str) => i18next.t(str);

function Button(props) {
    const type = props.type || 'regular';
    const disabled = props.disabled;

    return (
        <button
            id={props.id}
            className={`button button--${disabled ? 'disabled' : type} ${props.className || ''}`}
            onClick={disabled ? null : props.onClick}
            disabled={disabled}
        >
            {t(props.text)}
        </button>
    );
}

export default Button;
