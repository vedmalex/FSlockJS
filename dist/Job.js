"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Job = void 0;
const EventEmitter = require('events');
class Job extends EventEmitter {
    constructor(props) {
        super();
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
    async execution() {
        return new Promise((resolve) => {
            if (this.state === 'executed')
                return resolve(this);
            this.once('executed', () => {
                return resolve(this);
            });
        });
    }
}
exports.Job = Job;
//# sourceMappingURL=Job.js.map