import Pin from "./Pin/Pin";
import _ from 'lodash';
import {BehaviorSubject} from 'rxjs'

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
        this.renderFlag = new BehaviorSubject(false);
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

    wire() {
        if (this.props.inPins) {

        }
    }

    unwire() {

    }

    operation() {}

    updateState() {
        if(this.props.inContacts) {
            this.inPins.pins.forEach((pin, idx) => {
                pin.value = _.get(pin,'wiredTo.signal', undefined);
                console.log(pin.value);
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
