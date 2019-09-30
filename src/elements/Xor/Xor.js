import Element from '../Element'

const defaultProps = {
    name: 'Xor',
    inContacts: 2,
    outContacts: 1,
    signals: 'true/false',
    fill: '#453dff',
};

class Xor extends Element {
    constructor(props) {
        props ? super(props) : super(defaultProps);

        this.out = false;
        this.width = 50;
        this.height = 50;
    }
}

export default Xor;
