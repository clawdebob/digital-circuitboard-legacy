import React from 'react';

function SubList(props) {
    const list = props.list.map((entry, idx) => {
        return (
            <li className="suboptions__option">
                <div className='suboptions__name suboptions__entry'>{entry.name}</div>
                <div className='suboptions__hotkey suboptions__entry'>{entry.hotkey ? entry.hotkey : null}</div>
            </li>
        );
    });

    return (
        <ul className="suboptions">
            {list}
        </ul>
    );
}

class Options extends React.Component {
    render() {
        const component = this.props.options.map((option, idx) => {
            return (
                <li className="main-menu__option-list">
                    <div className="main-menu__option">{option.name}</div>
                    <SubList list={option.suboptions}></SubList>
                </li>
            );
        });

        return <ul className={this.props.className}>{component}</ul>;
    }
}

class mainMenu extends React.Component {
    options = [
        {
            name: 'File',
            suboptions: [
                {name: "Save", hotkey: "Ctrl+S"},
                {name: "Open"},
                {name: "Delete", hotkey: "Delete"}
            ]
        },
        {
            name: 'Edit',
            suboptions: [
                {name: "Save", hotkey: "Ctrl+S"},
                {name: "Open"},
                {name: "Delete", hotkey: "Delete"}
            ]
        },
        {
            name: 'View',
            suboptions: [
                {name: "Save", hotkey: "Ctrl+S"},
                {name: "Open"},
                {name: "Delete", hotkey: "Delete"}
            ]
        },
        ];

    render() {
        return (
            <div className="main-menu-wrapper">
                <h3 className="scheme-title">SchemeName.dcb</h3>
                <Options className="main-menu" options={this.options} />
            </div>
        );
    }
}

export default mainMenu;
