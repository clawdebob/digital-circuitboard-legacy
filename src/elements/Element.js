import Pin from "./Pin/Pin";
import _ from 'lodash';
import {BehaviorSubject} from 'rxjs'

class Element {
    static elementCounter = 0;
    static boardState;

    constructor(props) {
        this.name = props.name;
        this.width = props.width;
        this.height = props.height;
        this.className = props.className ? `element-${props.className}` : null;
        this.originY = props.originY || 0;
        this.setProps(props.props);
        this.model = null;
        this.helpers = null;
        this.renderFlag = new BehaviorSubject(null);
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

    updateState() {
        const hasIn = Boolean(this.props.inContacts);
        if(hasIn) {
            this.inPins.pins.forEach((pin, idx) => {
                pin.value = _.get(pin,'wiredTo.outPins.pins[0].value', undefined);
                this.model.children[1].children[idx].stroke = pin.value ? '#00FF00' : '#006200';
            });
        }
        this.operation();
        this.outPins.pins.forEach((pin, idx) => {
            this.model.children[2].children[idx].stroke = pin.value ? '#00FF00' : '#006200';
            pin.valueUpdate.next(pin.value);
        });
        this.renderFlag.next();
    }
}

export default Element;
