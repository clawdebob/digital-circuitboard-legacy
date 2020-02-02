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
    className: 'button',
    originY: 0,
    width: 26,
    height: 26,
};

class Button extends Element {
    constructor(props) {
        props ? super(props) : super(defaultProps);
    }

    updateState() {
        super.updateState();
        const body = this.model.children[0]._renderer.elem;
        fromEvent(body, 'click').subscribe((e) => {
            e.preventDefault();
            if(Element.boardState === STATE.EDIT){
                this.props.initialSignal = Number(!this.props.initialSignal);
                super.updateState();
            }
        });
        this.updateState = super.updateState();
    }

    operation() {
        this.outPins.pins[0].value = this.props.initialSignal;
    }
}

export default Button;
