import Element from '../Element';
import _ from 'lodash';
import Pin from '../Pin/Pin';

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
        this.errorRegistred = false;
    }

    pushWire(wire) {
        const signalSource = wire.getCurrentSignalSource();

        if(signalSource && signalSource.el.id !== this.id) {
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

    setErrorState() {
        _.forEach(this.inSub, (sub) => {
            const globalElObj = sub.getCurrentSignalSource();

            if(globalElObj && this.model) {
                const globalEl = globalElObj.el;
                const globalElPinIdx = globalElObj.pin;
                const pin = _.get(globalEl, `outPins.pins[${globalElPinIdx}]`, null);

                if(globalEl.name === 'Junction') {
                    globalEl.model.stroke = this.getStateColor(null);
                    globalEl.model.fill = this.getStateColor(null);
                    globalEl.setErrorState();
                } else if(globalEl.name !== 'Wire') {
                    globalEl.model.children[2].children[globalElPinIdx].stroke = this.getStateColor(null);
                }

                for (let el = pin.wiredTo; _.get(el, 'name', null) === 'Wire' && el; el = el.outConnector.el) {
                    el.model.stroke = this.getStateColor(null);
                }
            }
        });
    }

    unsetErrorState() {
        _.forEach(this.inSub, (sub) => {
            const globalElObj = sub.getCurrentSignalSource();

            if(globalElObj && this.model) {
                const globalEl = globalElObj.el;
                const globalElPinIdx = globalElObj.pin;
                const pin = _.get(globalEl, `outPins.pins[${globalElPinIdx}]`, null);

                if(globalEl.name === 'Junction') {
                    globalEl.model.stroke = this.getStateColor(pin.value);
                    globalEl.model.fill = this.getStateColor(pin.value);
                    globalEl.unsetErrorState();
                } else if (globalEl.name !== 'Wire') {
                    globalEl.model.children[2].children[globalElPinIdx].stroke = this.getStateColor(pin.value);
                }

                for (let el = pin.wiredTo; _.get(el, 'name', null) === 'Wire'; el = el.outConnector.el) {
                    el.model.stroke = this.getStateColor(pin.value);
                }
            }
        });
    }


    operation() {
        const value = _.get(this.inSub[0],'outPins.pins[0].value', undefined);
        let isError = false;
        let signal = value;

        _.forEach(this.inSub, (sub) => {
            const val = _.get(sub, 'outPins.pins[0].value');

            if(val !== value) {
                isError = true;
            }
        });

        if (isError) {
            signal = null;
            this.errorRegistred = true;
            this.setErrorState();
        }
        this.outPins.pins[0].value = signal;
        if(this.model) {
            _.forEach(this.outSub, (sub) => {
                let lastWire = sub;

                for (let el = lastWire; el.outConnector && _.get(el, 'outConnector.el.name', null) === 'Wire'; el = el.outConnector.el) {
                    lastWire = el.outConnector.el;
                }
                _.set(lastWire, 'outPins.pins[0].value', signal);
            });
        }
        this.outPins.pins[0].valueUpdate.next(signal);
        if(this.model) {
            this.model.fill = this.getStateColor(signal);
            this.model.stroke = this.getStateColor(signal);
        }
    }

    updateState() {
        if(this.errorRegistred) {
            this.errorRegistred = false;
            this.unsetErrorState();
        }
        this.operation();
        this.renderFlag.next();
    }
}

export default Junction;
