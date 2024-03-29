import Element from '../Element';
import _ from 'lodash';

const defaultProps = {
    name: 'Nand',
    props: {
        inContacts: 3,
        fill: '#ffffff',
    },
    originY: 5,
    width: 50,
    outContacts: 1,
    height: 60,
    signature: '&'
};

class Nand extends Element {
    constructor(props) {
        props ? super(props) : super(defaultProps);
    }

    setProps(props) {
        super.setProps(props);
        this.outPins.pins[0].invert = true;
    }

    operation() {
        this.outPins.pins[0].value = Number(!_.reduce(this.inPins.pins,(result, pin) => {
            return Boolean(result && pin.value);
        }, 1));
    }
}

export default Nand;
