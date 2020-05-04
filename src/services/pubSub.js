import {Subject} from "rxjs";

class PubSub {
    static subsBuffer = {};

    static createEvent(name) {
        this.subsBuffer[name] = new Subject();
    }

    static publish(name, params) {
        this.subsBuffer[name].next(params);
    }

    static subscribe(name, callback) {
        this.subsBuffer[name].subscribe(callback);
    }

    static unsubscribe(name) {
        this.subsBuffer[name].unsubscribe();
        this.createEvent(name);
    }
}

export default PubSub;
