import Element from '../Element';
import _ from 'lodash';

const defaultProps = {
    name: 'Or',
    props: {
        inContacts: 3,
        outContacts: 1,
        signals: 'true/false',
        fill: '#ddff77',
    },
    originY: 5,
    width: 50,
    height: 60,
};

class Or extends Element {
    constructor(props) {
        props ? super(props) : super(defaultProps);
    }

    operation() {
        this.outPins.pins[0].value = Number(_.reduce(this.inPins.pins,(result, pin) => {
            return Boolean(result || pin.value);
        }, 0));
    }
}




export default Or;
