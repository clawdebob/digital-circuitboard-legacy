import * as React from 'react';
import fileManager from "../../services/fileManager";
import STATE from "../board/board-states.consts";
import PubSub from "../../services/pubSub";
import {EVENT} from "../../consts/events.consts";

class FileInput extends React.Component {

    handleChange(e) {
        const files = e.target.files;
        const file = files[0];

        if(file) {
            PubSub.publish(EVENT.TOGGLE_LOADING, {
               toggle: true,
               status: 'Loading scheme'
            });
            fileManager.loadFile(file)
                .subscribe((data) => {
                    PubSub.publish(EVENT.UPDATE_DATA, data);
                    setTimeout(() => {
                        PubSub.publish(EVENT.SET_BOARD_STATE, STATE.LOAD_DATA);
                    }, 100);
                });
        }
    }

    render() {
        return (
            <input
                className="file-input"
                id="file-input"
                type="file"
                accept=".dcb"
                onChange={(e) => this.handleChange(e)}
            />);
    }
}

export default FileInput;
