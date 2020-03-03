import Element from '../Element';
import _ from 'lodash';
import Pin from '../Pin/Pin';
import {distinctUntilChanged} from "rxjs/operators";
import {ORIENTATION, DIRECTION} from "../Orientation.const";

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
            let orientation, direction;

            if(coords.x1 === coords.x2) {
                orientation = ORIENTATION.VERTICAL;
                direction = coords.y1 > coords.y2 ? DIRECTION.T2B : DIRECTION.B2T;
            } else if (coords.y1 === coords.y2) {
                orientation = ORIENTATION.HORIZONTAL;
                direction = coords.x1 > coords.x2 ? DIRECTION.L2R : DIRECTION.R2L;
            }

            return {
                ...coords,
                orientation,
                direction
            }
        }
    }

    getCurrentSignalGoal() {
        let signalGoal;

        for(let el = this; el.name === 'Wire' && el.outConnector; el = el.outConnector.el) {
            signalGoal = el.outConnector;
        }

        return _.get(signalGoal, 'el.name', null) ? signalGoal : null;
    }

    getCurrentSignalSource() {
        let signalSource;

        for(let el = this; el.name === 'Wire' && el.inConnector; el = el.inConnector.el) {
           signalSource = el.inConnector;
        }

        return _.get(signalSource, 'el.name', null) !== 'Wire' ? signalSource : null;
    }

    wire() {
        const inConnector = this.inConnector;
        const outConnector = this.outConnector;
        // let newHelper = null;

        if(outConnector){
            const outElement = outConnector.el;
            const pinNumber = outConnector.pin;

            outElement.disableInPinHelper(pinNumber);
            this.disableOutPinHelper(0);
            outElement.inPins.pins[pinNumber].wiredTo = this;
            if(outElement.name === 'Wire') {
                outElement.inConnector = {el: this, pin: 0, type: 'out'};
            }
            this.outSub = this.outPins.pins[0].valueUpdate
                .pipe(distinctUntilChanged())
                .subscribe(() => {
                    outElement.updateState();
                });
        }
        if(inConnector) {
            const inElement = inConnector.el;
            const pinNumber = inConnector.pin;

            this.disableInPinHelper(0);
            if (inElement.name !== 'Junction') {
                // newHelper = inElement.outPins.pins[pinNumber].helper;
                inElement.disableOutPinHelper(pinNumber);
                // this.junctionHelpers.push(newHelper);
            } else if (inElement.getTotalWired() === 4) {
                inElement.disableOutPinHelper(pinNumber);
            }

            inElement.outPins.pins[pinNumber].wiredTo = this;
            if(inElement.name === 'Wire') {
                inElement.outConnector = {el: this, pin: 0, type: 'in'};
            }
            this.inSub = inElement.outPins.pins[pinNumber].valueUpdate
                .pipe(distinctUntilChanged())
                .subscribe(() => {
                    this.updateState();
                });
        } else {
            this.updateState();
        }
        if(!this.id) {
            this.setId();
            // if(newHelper) {
            //     newHelper.classList.push(this.id + 'bend-helper');
            // }
            _.forEach(this.junctionHelpers, (helper) => {
                helper.classList.push(this.id);
            });
            _.forEach(this.inPins.pins, (pin) => {
                pin.helper.classList.push(this.id);
            });
            _.forEach(this.outPins.pins, (pin) => {
                pin.helper.classList.push(this.id);
            });
            // console.log(this.id, newHelper);
        }
    }

    //debug function
    getElement() {
        return _.get(this.model, '_renderer.elem', null);
    }
}

export default Wire;
