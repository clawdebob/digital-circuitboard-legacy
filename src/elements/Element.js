import Pin from "./Pin/Pin";
import _ from 'lodash';
import {BehaviorSubject, Subject} from 'rxjs'
import {ORIENTATION, DIRECTION} from "./Orientation.const";

class Element {
    static elementCounter = 0;
    static boardState;

    static setIdCounter(num) {
        Element.elementCounter = num;
    }

    constructor(props) {
        this.id = props.id;
        this.name = props.name;
        this.outContacts = props.outContacts;
        this.width = props.width;
        this.height = props.height;
        this.signature = props.signature || '';
        this.className = `element-${props.name} element`;
        this.originY = props.originY || 0;
        this.interactable = props.interactable || props.name === 'Button';
        this.signatureSize = props.signatureSize || 24;
        this.setProps(props.props);
        this.model = null;
        this.active = false;
        this.subscriptions = null;
        this.signatureModel = null;
        this.helpers = null;
        this.renderFlag = new BehaviorSubject(null);
        this.x = null;
        this.y = null;
        this.modelGroup = null;
        this.pinToggleObservable = new Subject();
        this.interactionModel = null;
    }

    setProps(props) {
        this.props = props;
        if (this.props.inContacts) {
            this.inPins = new Pin(this);
        }
        if (this.outContacts) {
            this.outPins = new Pin(this, true);
        }
    }

    setInPinInvertState(pinIdx, value) {
        if(this.inPins) {
            this.inPins.pins[pinIdx].invert = value;
        }
    }

    setId() {
        if(!this.id) {
            this.id = this.name + Element.elementCounter;
            Element.elementCounter++;
        }
        if(this.model) {
            this.model.classList.push(this.id);
        }
        if(this.modelGroup) {
            this.modelGroup.classList.push(this.id);
        }
    }

    getCoords() {
        if(this.model) {
            return {
                x1: this.x,
                y1: this.y,
                orientation: ORIENTATION.HORIZONTAL,
                direction: DIRECTION.T2B
            };
        }
    }

    operation() {}

    errorCheck() {
        const inPins = _.get(this.inPins, 'pins', null);
        const outPins = _.get(this.outPins, 'pins', null);

        if(inPins) {
            if(_.countBy(inPins, 'value')['overload']) {
                _.map(outPins, (pin) => {
                    return _.set(pin, 'value', 'overload');
                });
            }
            if (_.countBy(inPins, 'value')['undefined'] === inPins.length || _.countBy(inPins, 'value')['null']){
                _.map(outPins, (pin) => {
                    return _.set(pin, 'value', null);
                });
            }
        }
    }

    getStateColor(signal) {
        let stroke;

        switch (signal) {
            case 0:
                stroke = '#006200';
                break;
            case 1:
                stroke = '#00FF00';
                break;
            case 'overload':
                stroke = '#ff7700';
                break;
            case undefined:
                stroke = '#0077ff';
                break;
            default:
                stroke = '#FF0000';
                break;
        }

        return stroke;
    }

    disableInPinHelper(idx) {
        this.inPins.disablePinHelper(idx);
        this.pinToggleObservable.next(this.inPins.pins[idx]);
        this.renderFlag.next();
    }

    disableOutPinHelper(idx) {
        this.outPins.disablePinHelper(idx);
        this.pinToggleObservable.next(this.outPins.pins[idx]);
        this.renderFlag.next();
    }

    enableInPinHelper(idx) {
        this.inPins.enablePinHelper(idx);
        this.pinToggleObservable.next(this.outPins.pins[idx]);
        this.renderFlag.next();
    }

    enableOutPinHelper(idx) {
        this.outPins.enablePinHelper(idx);
        this.pinToggleObservable.next(this.outPins.pins[idx]);
        this.renderFlag.next();
    }

    addSubscription() {
        _.forEach(arguments, (subscription) => {
            if(!this.subscriptions || _.get(this.subscriptions, 'closed', false)) {
                this.subscriptions = subscription;
            } else {
                this.subscriptions.add(subscription);
            }
        });
    }

    destroy() {
        if(this.outPins){
            _.forEach(this.outPins.pins, (pin) => {
                const wire = pin.wiredTo;

                pin.helperEnabled = true;

                if(wire) {
                    const wirePin = wire.inPins.pins[0];

                    console.log(wire);

                    wire.inSub.unsubscribe();
                    wire.enableInPinHelper(0);
                    wirePin.wiredTo = null;
                    wire.inConnector = null;
                    wirePin.value = undefined;
                    wire.updateState();
                    pin.wiredTo = null;
                }
            });
        }

        if(this.inPins) {
            _.forEach(this.inPins.pins, (pin) => {
                const wire = pin.wiredTo;

                pin.helperEnabled = true;

                if(wire) {
                    const wirePin = wire.outPins.pins[0];

                    wire.outSub.unsubscribe();
                    wirePin.wiredTo = null;
                    wire.outConnector = null;
                    wire.enableOutPinHelper(0);
                    pin.wiredTo = null;
                    wire.updateState();
                }
            });
        }

        this.subscriptions.unsubscribe();
    }

    updateState() {
        const hasIn = Boolean(this.props.inContacts);
        const hasOut = Boolean(this.outContacts);

        if(hasIn) {
            this.inPins.pins.forEach((pin, idx) => {
                pin.value = _.get(pin,'wiredTo.outPins.pins[0].value', undefined);
                this.model.children[1].children[idx].stroke = this.getStateColor(pin.value);
                if(pin.invert && !isNaN(pin.value) && pin.value !== null) {
                    pin.value = Number(!pin.value);
                }
            });
        }
        this.operation();
        this.errorCheck();
        if(hasOut) {
            this.outPins.pins.forEach((pin, idx) => {
                this.model.children[2].children[idx].stroke = this.getStateColor(pin.value);

                pin.valueUpdate.next(pin.value);
            });
        }
        this.renderFlag.next();
    }
}

export default Element;
