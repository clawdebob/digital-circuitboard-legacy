import Element from '../Element'

const defaultProps = {
    name: 'And',
    inContacts: 2,
    outContacts: 1,
    signals: 'true/false',
    fill: '#FF8000',

};

class And extends Element {
    constructor(props) {
        props ? super(props) : super(defaultProps);

        this.out = false;
        this.width = 50;
        this.height = 50;
    }
}

export default And;
