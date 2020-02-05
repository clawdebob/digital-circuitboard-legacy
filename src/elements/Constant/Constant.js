import Element from '../Element';

const defaultProps = {
    name: 'Constant',
    props: {
        signal: 0,
        fill: '#ffffff',
    },
    outContacts: 1,
    originY: 0,
    width: 26,
    height: 26,
    signature: '0',
    signatureSize: 20
};

class Constant extends Element {
    constructor(props) {
        props ? super(props) : super(defaultProps);
    }

    setProps(props) {
        super.setProps(props);
        this.signature = String(props.signal);
    }

    operation() {
        this.outPins.pins[0].value = Number(this.props.signal);
        this.signatureModel.stroke = this.getStateColor(this.props.signal);
        this.signatureModel.fill = this.getStateColor(this.props.signal);
    }
}




export default Constant;
