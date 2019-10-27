import {BehaviorSubject} from 'rxjs'

class Pin {
    constructor(el, out = false) {
        const n = out ? el.props.outContacts : el.props.inContacts;
        const width = el.width;
        const height = el.height;
        const originY = el.originY;
        const pinLength = 12;
        let y1 = 0;
        let availableLen = height - (2 * originY);
        const maxPoints = Math.round(availableLen / 10);
        const pointsArray = new Array(maxPoints);
        const pivotPoint = Math.round(maxPoints / 2);
        for (let i = 0; i < maxPoints; i++) {
            pointsArray[i] = y1;
            y1 += 12;
        }
        const yPositions = [];

        for (let i = 0; i < Math.floor(n / 2); i++) {
            let min = pointsArray[maxPoints - 1] + 1;
            let max = 0;
            for(let c = 0; c < maxPoints; c++) {
                if(pointsArray[c] < min && yPositions.indexOf(pointsArray[c]) < 0) {
                    min = pointsArray[c]
                }
                if(pointsArray[c] > max && yPositions.indexOf(pointsArray[c]) < 0) {
                    max = pointsArray[c];
                }
            }
            yPositions.push(min, max);
        }

        if (n % 2 !== 0) {
            yPositions.push(pointsArray[pivotPoint - 1]);
        }

        const pinPositionsArray = yPositions
            .sort()
            .map((val) => {
                val++;
                return out ?
                    {x1: width, y1: val, x2: width + pinLength, y2: val}
                    : {x1: -pinLength, y1: val, x2: 0, y2: val};
            });
        this.pins = new Array(n)
            .fill(null)
            .map((val, idx) => {
            return {
                coords: pinPositionsArray[idx],
                value: false,
                model: null,
                helper: null,
                wiredTo: null,
                valueUpdate: new BehaviorSubject(false),
            };
        });
    }
}

export default Pin;
