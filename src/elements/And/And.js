import Element from '../Element'

const defaultProps = {
    name: 'And',
    props: {
        inContacts: 3,
        outContacts: 1,
        signals: 'true/false',
        fill: '#FF8000',
    },
    originY: 5,
    width: 50,
    height: 60,
};

class And extends Element {
    constructor(props) {
        props ? super(props) : super(defaultProps);
    }

    operation() {
        this.outPins.pinValues[0] = true;
    }
}




export default And;
