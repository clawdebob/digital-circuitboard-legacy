import Element from '../Element'

const defaultProps = {
    name: 'OutContact',
    props: {
        fill: '#fff6fc',
        inContacts: 1,
    },
    interactable: false,
    outContacts: 0,
    originY: 0,
    width: 26,
    height: 26,
    signature: '0',
    signatureSize: 20,
};

class OutContact extends Element {
    constructor(props) {
        props ? super(props) : super(defaultProps);
    }

    operation() {
        const signal = this.inPins.pins[0].value;

        this.signatureModel.stroke = this.getStateColor(signal);
        this.signatureModel.fill = this.getStateColor(signal);
        if(signal === 0 || signal) {
            this.signatureModel.value = String(signal);
        } else {
            this.signatureModel.value = 'x';
        }
    }
}

export default OutContact;
