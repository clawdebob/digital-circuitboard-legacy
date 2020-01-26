import Element from '../Element';
import _ from 'lodash';
import Pin from '../Pin/Pin';
import {distinctUntilChanged} from "rxjs/operators";

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
        this.signalSource = null;
        this.signalGoal = null;
    }

    updateState() {
        if (this.inConnector) {
            const element = _.get(this.inConnector, 'el');
            const pinNumber = _.get(this.inConnector, 'pin');
            const signal = element.outPins.pins[pinNumber].value;

            this.inPins.pins[0].value = signal;
            this.outPins.pins[0].value = signal;
            this.model.stroke = this.getStateColor(signal);
            try {
                this.outPins.pins[0].valueUpdate.next(signal);
            } catch (e) {
                const overload = 'overload';
                const signalSource = this.getCurrentSignalSource().el;
                const sourcePinIdx = this.getCurrentSignalSource().pin;
                const signalGoal = this.getCurrentSignalGoal().el;
                const goalPinIdx = this.getCurrentSignalGoal().pin;

                signalSource.model.children[2].children[sourcePinIdx].stroke = this.getStateColor(overload);
                signalGoal.model.children[1].children[goalPinIdx].stroke = this.getStateColor(overload);
                signalGoal.inPins.pins[goalPinIdx].value = overload;
                signalSource.outPins.pins[sourcePinIdx].value = overload;
                for(let el = signalSource.outPins.pins[sourcePinIdx].wiredTo; el.name === 'Wire'; el = el.outConnector.el) {
                    el.model.stroke = this.getStateColor(overload);
                    el.outPins.pins[0].value = overload;
                }
            }
        } else {
            this.model.stroke = this.getStateColor(undefined);
        }
        this.renderFlag.next();
    }

    unsub() {
        const inConnector = this.inConnector;
        const outConnector = this.outConnector;
        if(outConnector && this.outSub){
            this.outSub.unsubscribe();
        }
        if(inConnector && this.inSub) {
            this.inSub.unsubscribe();
        }
    }

    getCoords() {
        if(this.model) {
            const vertices = _.get(this.model, 'vertices', null);
            const coords = {
                x1: vertices[0].x,
                y1: vertices[0].y,
                x2: vertices[1].x,
                y2: vertices[1].y
            };
            let orientation;

            if(coords.x1 === coords.x2) {
                orientation = 'vertical';
                // if(coords.y1 > coords.y2) {
                //
                // }
            } else if (coords.y1 === coords.y2) {
                orientation = 'horizontal';
            }

            return {
                ...coords,
                orientation
            }
        }
    }

    getCurrentSignalGoal() {
        let signalGoal;

        for(let el = this; el.name === 'Wire' && el.outConnector; el = el.outConnector.el) {
            signalGoal = el.outConnector;
        }

        return signalGoal;
    }

    getCurrentSignalSource() {
        let signalSource;

        for(let el = this; el.name === 'Wire' && el.inConnector; el = el.inConnector.el) {
           signalSource = el.inConnector;
        }

        return signalSource;
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
            this.signalGoal = this.getCurrentSignalGoal();
            if(this.signalGoal && (_.get(this.signalGoal,'id', null) === this.outConnector.el.id)) {
                for(let el = this; el.name === 'Wire' && el.inConnector; el = el.inConnector.el) {
                    el.signalGoal = this.signalGoal;
                }
            }
        }
        if(inConnector) {
            inConnector.el.outPins.disablePinHelper(inConnector.pin);
            inConnector.el.outPins.pins[inConnector.pin].wiredTo = this;
            if(inConnector.el.name === 'Wire') {
                inConnector.el.outConnector = {el: this, pin: 0, type: 'in'};
            }
            this.inSub = inConnector.el.outPins.pins[inConnector.pin].valueUpdate.pipe(distinctUntilChanged()).subscribe(() => {
                this.updateState();
            });
            this.signalSource = this.getCurrentSignalSource();
            if(this.signalSource && (_.get(this.signalSource,'id', null) === this.inConnector.el.id)) {
                for(let el = this; el.name === 'Wire' && el.outConnector; el = el.outConnector.el) {
                    el.signalSource = this.signalSource;
                }
            }
        } else {
            this.updateState();
        }
        this.setId();
    }
}

export default Wire;
