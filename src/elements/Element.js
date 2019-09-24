class Element {
    constructor(props) {
        this.props = {
            name: props.name,
            inContacts: props.inContacts,
            outContacts: props.outContacts,
            signals: props.signals,
            color: props.color,
        };
    }
}

export default Element;
