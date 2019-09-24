import Element from '../Element'

const defaultProps = {
    name: 'And',
    inContacts: 2,
    outContacts: 1,
    signals: 'true/false',
    color: 'white'
};

class And extends Element {
    constructor(props) {
        props ? super(props) : super(defaultProps);

        this.out = false;
    }
}

export default And;
