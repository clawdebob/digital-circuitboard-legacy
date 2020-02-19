import Or from "../elements/Or/Or";
import Nor from "../elements/Nor/Nor";
import And from "../elements/And/And";
import Nand from "../elements/Nand/Nand";
import Xor from "../elements/Xor/Xor";
import Nxor from "../elements/Nxor/Nxor";
import Constant from "../elements/Constant/Constant";
import Button from "../elements/Button/Button";
import Junction from "../elements/Junction/Junction";

class elementBuilder {
    static elementMap = new Map([
        ['Or', (props) => new Or(props)],
        ['And', (props) => new And(props)],
        ['Nor', (props) => new Nor(props)],
        ['Nand', (props) => new Nand(props)],
        ['Xor', (props) => new Xor(props)],
        ['Nxor', (props) => new Nxor(props)],
        ['Constant', (props) => new Constant(props)],
        ['Button', (props) => new Button(props)],
        ['Junction', (props) => new Junction(props)]
    ]);

    static getCreateFuncByName(name){
        return elementBuilder.elementMap.get(name);
    }
}

export default elementBuilder;
