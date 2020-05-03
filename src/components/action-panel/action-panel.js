import React from 'react';
import STATE from '../board/board-states.consts';
import PubSub from "../../services/pubSub";
import {EVENT} from "../../consts/events.consts";
import i18next from "i18next";
import Button from "../../elements/Button/Button";
import OutContact from "../../elements/Out Contact/OutContact";

const t = (str) => i18next.t(str);

class ActionPanel extends React.Component {
    constructor(props) {
        super(props);
        this.actions = [
            {name: STATE.EDIT, icon: 'vaadin:cursor', title: 'action.edit'},
            {name: STATE.INTERACT, icon: 'fa:hand-pointer-o', title: 'action.interact'},
            {name: 'create-button', icon: 'twemoji:black-square-button', title: 'action.create-button'},
            {name: 'create-outContact', icon: 'fxemoji:radiobutton', title: 'action.create-out-contact'},
        ];
    };

    execAction(name) {
        if(name === 'create-button') {
            PubSub.publish(EVENT.SET_BOARD_STATE, STATE.CREATE);
            PubSub.publish(EVENT.SET_CURRENT_ELEMENT, new Button());
        } else if (name === 'create-outContact') {
            PubSub.publish(EVENT.SET_BOARD_STATE, STATE.CREATE);
            PubSub.publish(EVENT.SET_CURRENT_ELEMENT, new OutContact());
        } else {
            PubSub.publish(EVENT.SET_BOARD_STATE, name);
        }
    }

    render() {
        const options = this.actions.map((action) => {
            return <div
                className={`action-panel__action ${action.name}`}
                key={action.name}
                title={t(action.title)}
                onClick={() => this.execAction(action.name)}
            >
                <div
                    className="iconify"
                    data-icon={action.icon}
                />
            </div>
        });
        return (
            <div className="action-panel">
                {options}
            </div>
        );
    }

}

export default ActionPanel;
