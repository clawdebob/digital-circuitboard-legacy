import React from 'react';
import STATE from '../board/board-states.consts';
import PubSub from "../../services/pubSub";
import {EVENT} from "../../consts/events.consts";

class ActionPanel extends React.Component {
    constructor(props) {
        super(props);
        this.actions = [
            {name: STATE.EDIT, icon: 'vaadin:cursor'},
            {name: STATE.INTERACT, icon: 'fa:hand-pointer-o'},
            {name: 'default', icon: null},
            {name: 'ac1', icon: null},
            {name: 'ac2', icon: null}
        ];
    };
    render() {
        const options = this.actions.map((action) => {
            return <div
                className={`action-panel__action ${action.name}`}
                key={action.name}
                title={action.name}
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
