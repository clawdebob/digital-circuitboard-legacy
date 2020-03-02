import Or from '../Or/Or';

const defaultProps = {
    name: 'Invertor',
    props: {
        inContacts: 1,
        fill: '#ffffff',
    },
    originY: 5,
    outContacts: 1,
    width: 38,
    height: 38,
    signature: '1'
};

class Buffer extends Or {
    constructor(props) {
        props ? super(props) : super(defaultProps);
    }
}

export default Buffer;
