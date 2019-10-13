import Element from '../Element'

const defaultProps = {
    name: 'Xor',
    props: {
        inContacts: 2,
        outContacts: 1,
        signals: 'true/false',
        fill: '#453dff',
    },
    width: 50,
    height: 50
};

class Xor extends Element {
    constructor(props) {
        props ? super(props) : super(defaultProps);
    }
}

export default Xor;
