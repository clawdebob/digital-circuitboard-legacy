import Element from '../Element'
import {BehaviorSubject} from "rxjs";
import _ from 'lodash'

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
        this.outPins = {
            pins: [{
                value: 0,
                wiredTo: null,
                valueUpdate: new BehaviorSubject(false)
            }]
        };
        this.inPins = _.cloneDeep(this.outPins);
    }

    updateState() {
        if (this.inConnector) {
            const element = _.get(this.inConnector, 'el');
            const pinNumber = _.get(this.inConnector, 'pin');
            const signal = element.outPins.pins[pinNumber].value;
            // const pinType = _.get(this.inConnector, 'type');

            this.inPins.pins[0].value = signal;
            this.outPins.pins[0].value = signal;
            this.model.stroke = signal ? '#00FF00' : '#006200';
            this.outPins.pins[0].valueUpdate.next(signal);
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
            this.outPins.pins[0].valueUpdate.subscribe(() => {
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
