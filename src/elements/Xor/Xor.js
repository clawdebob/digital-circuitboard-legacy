import Element from '../Element';
import _ from "lodash";

const defaultProps = {
    name: 'Xor',
    props: {
        inContacts: 3,
        fill: '#453dff',
    },
    outContacts: 1,
    originY: 5,
    width: 50,
    height: 60,
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
