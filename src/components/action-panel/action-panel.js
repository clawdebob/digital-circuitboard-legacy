import React from 'react';

class ActionPanel extends React.Component {
    constructor(props) {
        super(props);
        this.actions = [
            'edit',
            'wire',
            'default',
            'ac1',
            'ac2'
        ];
    };
    render() {
        const options = this.actions.map((action) => {
            return <div
                className={`action-panel__action ${action}`}
                key={action}
                title={action}
                onClick={() => this.props.setBoardState(action)}
            />
        });
        return (
            <div className="action-panel">
                {options}
            </div>
        );
    }

}

export default ActionPanel;
