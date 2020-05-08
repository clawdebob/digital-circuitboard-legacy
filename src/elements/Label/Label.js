import Element from '../Element'

const defaultProps = {
    name: 'Label',
    props: {
        name: 'Label',
        fontSize: 20,
        fill: '#000000',
    },
    originY: 0,
    width: 1,
    height: 1,
    signature: '',
    signatureSize: 20,
};

class Label extends Element {
    constructor(props) {
        props ? super(props) : super(defaultProps);
    }

    setProps(props) {
        this.props = props;
        this.signature = this.props.name;
        this.signatureSize = this.props.fontSize;
    }
}

export default Label;
