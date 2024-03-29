import Element from '../Element';
import _ from "lodash";

const defaultProps = {
    name: 'Xor',
    props: {
        inContacts: 3,
        fill: '#ffffff',
    },
    outContacts: 1,
    originY: 5,
    width: 50,
    height: 60,
    signature: '=1'
};

class Xor extends Element {
    constructor(props) {
        props ? super(props) : super(defaultProps);
    }

    operation() {
        this.outPins.pins[0].value = _.countBy(this.inPins.pins, 'value')['1'] === 1 ? 1 : 0;
    }
}

export default Xor;
