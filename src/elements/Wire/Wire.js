import Element from '../Element'

const defaultProps = {
    name: 'Wire',
    props: {
        signals: 'true/false',
        fill: '#000000',
    }
};

class Wire extends Element {
    constructor(props) {
        props ? super(props) : super(defaultProps);
    }
}

export default Wire;
