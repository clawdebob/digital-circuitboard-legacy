import * as React from "react";

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
            {props.text}
        </button>
    );
}

export default Button;
