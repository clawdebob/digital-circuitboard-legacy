import Element from '../Element'
import STATE from '../../components/board/board-states.consts';
import {fromEvent} from "rxjs";

const defaultProps = {
    name: 'Button',
    props: {
        initialSignal: 0,
        fill: '#ffffff',
    },
    outContacts: 1,
    className: 'button',
    originY: 0,
    width: 26,
    height: 26,
    signature: '0',
    signatureSize: 20,
};

class Button extends Element {
    constructor(props) {
        props ? super(props) : super(defaultProps);
    }

    updateState() {
        super.updateState();
        const body = this.interactionModel._renderer.elem;

        fromEvent(body, 'click').subscribe(() => {
            if(Element.boardState === STATE.EDIT){
                this.props.initialSignal = Number(!this.props.initialSignal);
                super.updateState();
            }
        });
        this.updateState = super.updateState();
    }

    operation() {
        const signal = this.props.initialSignal;

        this.outPins.pins[0].value = signal;
        this.signatureModel.stroke = this.getStateColor(signal);
        this.signatureModel.fill = this.getStateColor(signal);
        this.signatureModel.value = String(signal);
    }
}

export default Button;
