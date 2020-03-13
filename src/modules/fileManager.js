import _ from "lodash";
import * as DATA_CONSTS from "../consts/Parse.consts";
import {Subject} from "rxjs";
import elementBuilder from "./elementBuilder";
import Wire from "../elements/Wire/Wire";
import Element from "../elements/Element";

class fileManager {
    static renderer = null;

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
            const data = JSON.parse(String(reader.result));
            const schemeName = /(.+)\.dcb/.exec(file.name)[1];
            const elements = [];

            this.renderer.clearScene();

            _.forEach(data.elements, (elementTemp) => {
                const create = elementBuilder.getCreateFuncByName(elementTemp.name);
                const element = create(elementTemp);

                if(elementTemp.name === 'Junction') {
                    this.renderer.renderJunction(element, elementTemp.x, elementTemp.y);
                } else {
                    elementTemp.y -= (element.height/2 - element.originY);
                    elementTemp.x -= element.width/2;
                    this.renderer.renderElement(element, elementTemp.x, elementTemp.y);
                }
                elements.push(element);
                element.setId();
                element.updateState();
            });
            const wires = _.map(data.wires, (data) => new Wire(data));

            const findElementById = (id) => {
                return _.find(_.union(wires, elements), {id});
            };

            _.forEach(wires, (wire, idx) => {
                const props = data.wires[idx];
                const coords = props.coords;
                const inConnector = props.inConnector;
                const outConnector = props.outConnector;
                const inConnectorId = _.get(inConnector, 'el', null);
                const outConnectorId = _.get(outConnector, 'el', null);

                if(inConnectorId) {
                    inConnector.el = findElementById(inConnectorId);
                    wire.inConnector = inConnector;
                    if(inConnector.el.name === 'Junction') {
                        inConnector.el.pushWire(wire);
                    }
                }
                if(outConnectorId) {
                    outConnector.el = findElementById(outConnectorId);
                    wire.outConnector = outConnector;
                    if(outConnector.el.name === 'Junction') {
                        outConnector.el.pushWire(wire);
                    }
                }
                wire.className = wire.name;

                this.renderer.renderWire(wire, coords.x1, coords.y1, coords.x2, coords.y2, false);
            });

            _.forEach(wires, (wire) => {
                wire.wire();
            });

            const idStartNumber = _.chain(wires)
                .union(elements)
                .map((val) => Number(/\d+/.exec(val.id)[0]))
                .reduce((res, val) => _.max([res, val]), -1)
                .value();

            Element.setIdCounter(idStartNumber);

            observable.next({
                schemeName,
                elements,
                wires
            });
        };

        reader.onerror = () => {
            console.log(reader.error);
        };

        return observable;
    }

    static newFile() {
        const fileInput = document.getElementById('file-input');

        fileInput.value = '';
        this.renderer.clearScene();
    }
}

export default fileManager;
