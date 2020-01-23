import Element from '../Element'
import _ from 'lodash'
import Pin from '../Pin/Pin'
import {distinctUntilChanged} from "rxjs/operators";

const defaultProps = {
    name: 'Junction',
    props: {
        fill: '#000000',
    }
};

class Junction extends Element {
    constructor(props) {
        props ? super(props) : super(defaultProps);
        this.inConnector = [];
        this.outConnector = [];
        this.model = null;
        this.outPins = new Pin(this);
        this.inPins = new Pin(this);
        this.junctionHelpers = [];
        this.inSub = [];
        this.outSub = [];
    }

    pushWire(wire) {
        const signalSource = wire.getCurrentSignalSource();

        if(signalSource && signalSource.id !== this.id) {
            this.inSub.push(wire);
            wire.outConnector = {el: this, pin: 0, type: 'in'};
        } else {
            this.outSub.push(wire);
            wire.inConnector = {el: this, pin: 0, type: 'out'};
        }
    }

    removeWire(wire) {
        if(_.find(this.inSub, wire)) {
            _.remove(this.inSub, val => val.id === wire.id);
        }
        if(_.find(this.outSub, wire)) {
            _.remove(this.outSub, val => val.id === wire.id);
        }
    }

    operation() {
        const value = _.get(this.inSub[0],'outPins.pins[0].value', null);
        let isError = false;
        let singal = value;
        _.forEach(this.inSub, (sub) => {
            const val = _.get(sub, 'outPins.pins[0].value');
            console.log(this.id, val);

            if(val !== value) {
                isError = true;
            }
        });

        if (isError) {
            singal = null;
        }
        this.outPins.pins[0].value = singal;
        this.outPins.pins[0].valueUpdate.next(singal);
        if(this.model) {
            this.model.fill = this.getStateColor(singal);
            this.model.stroke = this.getStateColor(singal);
        }
    }

    updateState() {
        this.operation();
        this.renderFlag.next();
    }
}

export default Junction;
