import _ from "lodash";
import * as DATA_CONSTS from "../consts/Parse.consts";
import {Subject} from "rxjs";

class fileManager {
    static saveFile(data) {
        const schemeName = data.schemeName;
        const elements = _.map(data.elements, (element) => {
            let inPins = null;
            let outPins = null;

            if(element.inPins) {
                inPins = _.map(element.inPins.pins, (pin) => {
                    return _.pick(pin, DATA_CONSTS.PIN_PROPS_TO_INCLUDE);
                });
            }
            if(element.outPins) {
                outPins = _.map(element.outPins.pins, (pin) => {
                    return _.pick(pin, DATA_CONSTS.PIN_PROPS_TO_INCLUDE);
                });
            }

            return _.chain(element)
                .pick(DATA_CONSTS.PROPS_TO_INCLUDE)
                .extend({inPins, outPins})
                .value();
        });
        const wires = _.map(data.wires, (wire) => {
            let inPins = null;
            let outPins = null;
            let inConnector = null;
            let outConnector = null;
            const coords = wire.getCoords();

            if(wire.inPins) {
                inPins = _.map(
                    wire.inPins.pins,
                    (pin) => _.pick(pin, DATA_CONSTS.PIN_PROPS_TO_INCLUDE)
                );
            }
            if(wire.outPins) {
                outPins = _.map(
                    wire.outPins.pins,
                    (pin) => _.pick(pin, DATA_CONSTS.PIN_PROPS_TO_INCLUDE)
                );
            }
            if(wire.inConnector) {
                inConnector = _.chain(wire.inConnector)
                    .pick(DATA_CONSTS.CONNECTOR_PROPS_TO_INCLUDE)
                    .extend({el: _.get(wire.inConnector, 'el.id', '')})
                    .value();
            }
            if(wire.outConnector) {
                outConnector = _.chain(wire.outConnector)
                    .pick(DATA_CONSTS.CONNECTOR_PROPS_TO_INCLUDE)
                    .extend({el: _.get(wire.outConnector, 'el.id', '')})
                    .value();
            }

            return _.chain(wire)
                .pick(DATA_CONSTS.PROPS_TO_INCLUDE)
                .extend({inPins, outPins, inConnector, outConnector, coords})
                .value();
        });
        const saveData = JSON.stringify({
            schemeName,
            elements,
            wires
        }, null, '\t');

        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(saveData));
        element.setAttribute('download', schemeName + '.dcb');

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }
    static openFile() {
        const fileInput = document.getElementById('file-input');

        fileInput.click();
    }
    static loadFile(file) {
        const reader = new FileReader();
        const observable = new Subject();

        reader.readAsText(file);

        reader.onload = () => {
            observable.next(JSON.parse(String(reader.result)));
        };
        reader.onerror = () => {
            console.log(reader.error);
        };

        return observable;
    }
}

export default fileManager;
