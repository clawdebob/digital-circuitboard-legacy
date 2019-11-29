import Element from '../Element'
import _ from 'lodash'
import Pin from '../Pin/Pin'
import {distinctUntilChanged} from "rxjs/operators";
import {fromEvent} from "rxjs";

const defaultProps = {
    name: 'Wire',
    props: {
        fill: '#000000',
    }
};

class Wire extends Element {
    constructor(props) {
        props ? super(props) : super(defaultProps);
        this.inConnector = null;
        this.outConnector = null;
        this.model = null;
        this.outPins = new Pin(this);
        this.inPins = new Pin(this);
        this.junctionHelpers = [];
        this.inSub = null;
        this.outSub = null;
    }

    updateState() {
        if (this.inConnector) {
            const element = _.get(this.inConnector, 'el');
            const pinNumber = _.get(this.inConnector, 'pin');
            const signal = element.outPins.pins[pinNumber].value;
            // const pinType = _.get(this.inConnector, 'type');

            this.inPins.pins[0].value = signal;
            this.outPins.pins[0].value = signal;

            this.model.stroke = this.getStateColor(signal);
            this.outPins.pins[0].valueUpdate.next(signal);
        } else {
            this.model.stroke = this.getStateColor(undefined);
        }
        this.renderFlag.next();
    }

    unsub() {
        const inConnector = this.inConnector;
        const outConnector = this.outConnector;
        if(outConnector){
            this.outSub.unsubscribe();
        }
        if(inConnector) {
            this.inSub.unsubscribe();
        }
    }

    wire() {
        const inConnector = this.inConnector;
        const outConnector = this.outConnector;
        if(outConnector){
            outConnector.el.inPins.pins[outConnector.pin].wiredTo = this;
            outConnector.el.inPins.disablePinHelper(outConnector.pin);
            if(outConnector.el.name === 'Wire') {
                outConnector.el.inConnector = {el: this, pin: 0, type: 'out'};
            }
            this.outSub = this.outPins.pins[0].valueUpdate.pipe(distinctUntilChanged()).subscribe(() => {
                outConnector.el.updateState();
            });
        }
        if(inConnector) {
            inConnector.el.outPins.disablePinHelper(inConnector.pin);
            this.inSub = inConnector.el.outPins.pins[inConnector.pin].valueUpdate.pipe(distinctUntilChanged()).subscribe(() => {
                this.updateState();
            });
        } else {
            this.updateState();
        }
    }
}

export default Wire;
