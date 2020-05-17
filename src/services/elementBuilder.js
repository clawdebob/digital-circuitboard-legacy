import Or from "../elements/Or/Or";
import Nor from "../elements/Nor/Nor";
import And from "../elements/And/And";
import Nand from "../elements/Nand/Nand";
import Xor from "../elements/Xor/Xor";
import Nxor from "../elements/Nxor/Nxor";
import Constant from "../elements/Constant/Constant";
import Button from "../elements/Button/Button";
import Junction from "../elements/Junction/Junction";
import Invertor from "../elements/Invertor/Invertor";
import Buffer from "../elements/Buffer/Buffer";
import OutContact from '../elements/Out Contact/OutContact';
import Label from '../elements/Label/Label';
import {ELEMENT} from "../consts/Elements.consts";

class elementBuilder {
    static elementMap = new Map([
        [ELEMENT.OR, {create: (props) => new Or(props), icon: require('../assets/or.svg')}],
        [ELEMENT.AND, {create: (props) => new And(props), icon: require('../assets/and.svg')}],
        [ELEMENT.NOR, {create: (props) => new Nor(props), icon: require('../assets/nor.svg')}],
        [ELEMENT.NAND, {create: (props) => new Nand(props), icon: require('../assets/nand.svg')}],
        [ELEMENT.XOR, {create: (props) => new Xor(props), icon: require('../assets/xor.svg')}],
        [ELEMENT.NXOR, {create: (props) => new Nxor(props), icon: require('../assets/nxor.svg')}],
        [ELEMENT.CONSTANT, {create: (props) => new Constant(props), icon: require('../assets/const.svg')}],
        [ELEMENT.BUTTON, {create: (props) => new Button(props), icon: require('../assets/button.svg')}],
        [ELEMENT.JUNCTION, {create: (props) => new Junction(props), icon: null}],
        [ELEMENT.INVERTOR, {create: (props) => new Invertor(props), icon: require('../assets/invertor.svg')}],
        [ELEMENT.BUFFER, {create: (props) => new Buffer(props), icon: require('../assets/buffer.svg')}],
        [ELEMENT.OUT_CONTACT, {create: (props) => new OutContact(props), icon: require('../assets/out-contact.svg')}],
        [ELEMENT.LABEL, {create: (props) => new Label(props), icon: require('../assets/label.svg')}],
    ]);

    static getCreateFuncByName(name){
        return elementBuilder.elementMap.get(name).create;
    }

    static getIconByName(name) {
        return elementBuilder.elementMap.get(name).icon;
    }
}

export default elementBuilder;
