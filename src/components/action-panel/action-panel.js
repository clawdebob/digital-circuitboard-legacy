import React from 'react';
import STATE from '../board/board-states.consts';
import PubSub from "../../services/pubSub";
import {EVENT} from "../../consts/events.consts";
import i18next from "i18next";

const t = (str) => i18next.t(str);

class ActionPanel extends React.Component {
    constructor(props) {
        super(props);
        this.actions = [
            {name: STATE.EDIT, icon: 'vaadin:cursor', title: 'action.edit'},
            {name: STATE.INTERACT, icon: 'fa:hand-pointer-o', title: 'action.interact'},
            {name: 'default', icon: null, title: ''},
            {name: 'ac1', icon: null, title: ''},
            {name: 'ac2', icon: null, title: ''}
        ];
    };
    render() {
        const options = this.actions.map((action) => {
            return <div
                className={`action-panel__action ${action.name}`}
                key={action.name}
                title={t(action.title)}
                onClick={() => PubSub.publish(EVENT.SET_BOARD_STATE, action.name)}
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
