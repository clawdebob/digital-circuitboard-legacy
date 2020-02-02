import Element from '../Element';

const defaultProps = {
    name: 'Constant',
    props: {
        signal: 0,
        fill: '#1e8eff',
    },
    outContacts: 1,
    originY: 0,
    width: 26,
    height: 26,
};

class Constant extends Element {
    constructor(props) {
        props ? super(props) : super(defaultProps);
    }

    operation() {
        this.outPins.pins[0].value = Number(this.props.signal);
    }
}




export default Constant;
