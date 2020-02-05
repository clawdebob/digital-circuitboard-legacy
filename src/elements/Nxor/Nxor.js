import Element from '../Element';
import _ from "lodash";

const defaultProps = {
    name: 'Nxor',
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

class Nxor extends Element {
    constructor(props) {
        props ? super(props) : super(defaultProps);
    }

    setProps(props) {
        super.setProps(props);
        this.outPins.pins[0].invert = true;
    }

    operation() {
        this.outPins.pins[0].value = Number(!(_.countBy(this.inPins.pins, 'value')['1'] === 1 ? 1 : 0));
    }
}

export default Nxor;
