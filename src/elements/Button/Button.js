import Element from '../Element'
import STATE from '../../components/board/board-states.consts';
import {fromEvent} from "rxjs";

const defaultProps = {
    name: 'Button',
    props: {
        initialSignal: 0,
        fill: '#fff6fc',
    },
    outContacts: 1,
    interactable: true,
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

    setInteractions() {
        const body = this.interactionModel._renderer.elem;
        const onClick = fromEvent(body, 'click')
            .subscribe(() => {
                if(Element.boardState === STATE.INTERACT){
                    this.props.initialSignal = Number(!this.props.initialSignal);
                    super.updateState();
                }
            });

        this.addSubscription(onClick);
    }

    updateState() {
        super.updateState();
        this.setInteractions();
        this.updateState = super.updateState;
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
