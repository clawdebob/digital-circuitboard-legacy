import Element from '../Element'

const defaultProps = {
    name: 'Wire',
    inContacts: 2,
    outContacts: 1,
    signals: 'true/false',
    fill: '#000000',
};

class Wire extends Element {
    constructor(props) {
        props ? super(props) : super(defaultProps);

        this.out = false;
        this.width = 50;
    }
}

export default Wire;
