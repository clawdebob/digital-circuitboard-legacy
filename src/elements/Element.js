import Pin from "./Pin/Pin";
import _ from 'lodash';
import {BehaviorSubject} from 'rxjs'

class Element {
    static elementCounter = 0;
    static boardState;

    constructor(props) {
        this.name = props.name;
        this.width = props.width;
        this.height = props.height;
        this.className = props.className ? `element-${props.className}` : null;
        this.originY = props.originY || 0;
        this.setProps(props.props);
        this.model = null;
        this.helpers = null;
        this.renderFlag = new BehaviorSubject(null);
        this.x = null;
        this.y = null;
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

    getCoords() {
        if(this.model) {
            return {
                x1: this.x,
                y1: this.y,
                orientation: 'horizontal',
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

    updateState() {
        const hasIn = Boolean(this.props.inContacts);

        if(hasIn) {
            this.inPins.pins.forEach((pin, idx) => {
                pin.value = _.get(pin,'wiredTo.outPins.pins[0].value', undefined);
                this.model.children[1].children[idx].stroke = this.getStateColor(pin.value);
            });
        }
        this.operation();
        this.errorCheck();
        this.outPins.pins.forEach((pin, idx) => {
            this.model.children[2].children[idx].stroke = this.getStateColor(pin.value);
            pin.valueUpdate.next(pin.value);
        });
        this.renderFlag.next();
    }
}

export default Element;
