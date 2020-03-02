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

class elementBuilder {
    static elementMap = new Map([
        ['Or', {create: (props) => new Or(props), icon: require('../assets/or.svg')}],
        ['And', {create: (props) => new And(props), icon: require('../assets/and.svg')}],
        ['Nor', {create: (props) => new Nor(props), icon: require('../assets/nor.svg')}],
        ['Nand', {create: (props) => new Nand(props), icon: require('../assets/nand.svg')}],
        ['Xor', {create: (props) => new Xor(props), icon: require('../assets/xor.svg')}],
        ['Nxor', {create: (props) => new Nxor(props), icon: require('../assets/nxor.svg')}],
        ['Constant', {create: (props) => new Constant(props), icon: require('../assets/const.svg')}],
        ['Button', {create: (props) => new Button(props), icon: require('../assets/button.svg')}],
        ['Junction', {create: (props) => new Junction(props), icon: null}],
        ['Invertor', {create: (props) => new Invertor(props), icon: require('../assets/invertor.svg')}],
        ['Buffer', {create: (props) => new Buffer(props), icon: require('../assets/buffer.svg')}]
    ]);

    static getCreateFuncByName(name){
        return elementBuilder.elementMap.get(name).create;
    }

    static getIconByName(name) {
        return elementBuilder.elementMap.get(name).icon;
    }
}

export default elementBuilder;
