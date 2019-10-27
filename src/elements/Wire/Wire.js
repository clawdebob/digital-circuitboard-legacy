import Element from '../Element'
import {BehaviorSubject} from "rxjs";
import _ from 'lodash'

const defaultProps = {
    name: 'Wire',
    props: {
        signal: 0,
        fill: '#000000',
    }
};

class Wire extends Element {
    constructor(props) {
        props ? super(props) : super(defaultProps);
        this.inConnector = null;
        this.outConnector = null;
        this.model = null;
        this.signalUpdate = new BehaviorSubject(null);
    }

    updateState() {
        if (this.inConnector) {
            const element = _.get(this.inConnector, 'el');
            const pinNumber = _.get(this.inConnector, 'pin');
            // const pinType = _.get(this.inConnector, 'type');

            this.signal = element.outPins.pins[pinNumber].value;
            this.model.stroke = this.signal ? '#00FF00' : '#006200';
            this.signalUpdate.next(this.signal);
        } else {
            this.model.stroke = '#0077ff';
        }
        this.renderFlag.next();
    }

    wire() {
        const inConnector = this.inConnector;
        const outConnector = this.outConnector;
        if(outConnector){
            outConnector.el.inPins.pins[outConnector.pin].wiredTo = this;
            this.signalUpdate.subscribe(() => {
                outConnector.el.updateState();
            });
        }
        if(inConnector) {
            inConnector.el.outPins.pins[inConnector.pin].valueUpdate.subscribe(() => {
                this.updateState();
            });
        }
    }
}

export default Wire;
