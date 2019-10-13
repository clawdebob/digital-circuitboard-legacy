import Pin from "./Pin/Pin";

class Element {
    constructor(props) {
        this.name = props.name;
        this.width = props.width;
        this.height = props.height;
        this.originY = props.originY || 0;
        this.setProps = this.setProps.bind(this);
        this.setProps(props.props);
    }

    setProps(props) {
        this.props = props;
        if (this.props.inContacts) {
            this.inPins = new Pin(this.props.inContacts, this.width, this.height, this.originY);
        }
        if (this.props.outContacts) {
            this.outPins = new Pin(this.props.outContacts, this.width, this.height, this.originY, true);
        }
    }
}

export default Element;
