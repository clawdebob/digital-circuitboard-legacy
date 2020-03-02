import * as React from 'react';
import fileManager from "../../modules/fileManager";
import STATE from "../board/board-states.consts";

class FileInput extends React.Component {

    handleChange(e) {
        const files = e.target.files;
        const file = files[0];

        if(file) {
            this.props.toggleLoading(true, 'Loading scheme');
            fileManager.loadFile(file)
                .subscribe((data) => {
                    this.props.updateData(data);
                    setTimeout(() => {
                        this.props.setBoardState(STATE.LOAD_DATA);
                    }, 100);
                });
        }

        //
        // if(file) {
        //     const observable = ajax({
        //         url: 'http://localhost:3040/upload',
        //         method: 'POST',
        //         body: {file},
        //         headers: {
        //             'Content-Type': file.type,
        //         },
        //     });
        //     observable.subscribe(
        //         (data) => console.log(data),
        //         (err) => console.log(err)
        //     )
        // }
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