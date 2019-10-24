import Pin from "./Pin/Pin";
import _ from 'lodash';

class Element {
    static elementCounter = 0;

    constructor(props) {
        this.name = props.name;
        this.width = props.width;
        this.height = props.height;
        this.originY = props.originY || 0;
        this.setProps(props.props);
        this.model = null;
        this.helpers = null;
    }

    setProps(props) {
        this.props = props;
        if (this.props.inContacts) {
            this.inPins = new Pin(this);
        }
        if (this.props.outContacts) {
            this.outPins = new Pin(this, true);
        }
    }

    setId() {
        this.id = this.name + Element.elementCounter;
        Element.elementCounter++;
    }

    operation() {}

    // getHelpers() {
    //     return _.get(this.model, 'children[3]')
    // }


    updateState() {
        this.inPins.pinValues.forEach((pin, idx) => {
            this.model.children[1].children[idx].stroke = pin ? '#00FF00' : '#006200';
        });
        this.operation();
        this.outPins.pinValues.forEach((pin, idx) => {
            this.model.children[2].children[idx].stroke = pin ? '#00FF00' : '#006200';
        });
    }
}

export default Element;
