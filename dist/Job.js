"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Job = void 0;
const events_1 = require("events");
class Job {
    constructor(props) {
        this.emitter = new events_1.EventEmitter();
        this.listeners = [];
        this.state = 'idle';
        if (!(props === null || props === void 0 ? void 0 : props.command) || !(props === null || props === void 0 ? void 0 : props.path)) {
            throw new Error('Unexpected new job properties');
        }
        this.command = props === null || props === void 0 ? void 0 : props.command;
        this.path = props.path;
        this.params = (props === null || props === void 0 ? void 0 : props.params) || null;
        this.state = 'idle';
        this.result = null;
        this.error = null;
    }
    on(event, listener) {
        this.emitter.on(event, listener);
        this.listeners.push({
            event,
            listener,
            type: 'on'
        });
    }
    once(event, listener) {
        this.emitter.once(event, listener);
        this.listeners.push({
            event,
            listener,
            type: 'once'
        });
    }
    close() {
        this.emit('close');
        setTimeout(() => {
            this.emitter.removeAllListeners();
        }, 10);
    }
    emit(event, ...args) {
        return this.emitter.emit(event, ...args);
    }
    async execution() {
        return new Promise((resolve) => {
            if (this.state === 'executed') {
                resolve(this);
            }
            else {
                this.once('executed', () => {
                    resolve(this);
                });
            }
        });
    }
}
exports.Job = Job;
//# sourceMappingURL=Job.js.map