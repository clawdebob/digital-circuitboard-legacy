class Element {
    constructor(props) {
        this.props = {
            name: props.name,
            inContacts: props.inContacts,
            outContacts: props.outContacts,
            signals: props.signals,
            fill: props.fill,
        };
    }

    setProps(props) {
        this.props = props;
    }
}

export default Element;
