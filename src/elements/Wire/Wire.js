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
        this.signalSource = null;
        this.signalGoal = null;
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
        // console.log(this.getCoords());
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
            signalGoal = el.outConnector.el;
        }

        return signalGoal;
    }

    getCurrentSignalSource() {
        let signalSource;

        for(let el = this; el.name === 'Wire' && el.inConnector; el = el.inConnector.el) {
           signalSource = el.inConnector.el;
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
