"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FSLock = exports.processQueue = exports.defaultProps = void 0;
const Job_1 = require("./Job");
const execCommand_1 = require("./execCommand");
exports.defaultProps = {
    autoexec: true,
    concurrency: null,
    timeout: 5000,
};
const processQueue = async (self) => {
    if (self.queue.length > 0) {
        await self.processNext();
        await exports.processQueue(self);
    }
};
exports.processQueue = processQueue;
class FSLock {
    constructor(props) {
        this.queue = [];
        this.locks = {};
        this.options = {
            autoexec: (props === null || props === void 0 ? void 0 : props.autoexec) !== undefined ? props === null || props === void 0 ? void 0 : props.autoexec : exports.defaultProps.autoexec,
        };
        this.state = 'idle';
        this.autoExecStarted = false;
        if (this.options.autoexec) {
            this.start();
        }
    }
    add(command, path, params) {
        const job = new Job_1.Job({ command, path, params });
        this.queue.push(job);
        job.state = 'queued';
        return job;
    }
    get(index = 0) {
        return this.queue[index];
    }
    async processAll() {
        this.state = 'processingAll';
        const self = this;
        if (this.queue.length === 0) {
            this.state = 'idle';
            return;
        }
        if (self.options.autoexec && !self.autoExecStarted) {
            return;
        }
        await exports.processQueue(self);
        this.state = 'idle';
    }
    async processNext(index = 0, tries = 0) {
        const self = this;
        return new Promise(async (resolve, reject) => {
            self.state = 'processing';
            if (!self.queue.length) {
                return false;
            }
            const job = (index === 0) ? self.queue.shift() : self.queue.splice(index, 1)[0];
            const { command } = job;
            const { path, params } = job;
            if (self.locks[path] === 1) {
                self.queue.splice(index, 0, job);
                if (self.queue.length > index + 2) {
                    return self.processNext(1);
                }
                else {
                    return await (new Promise(((resolve, reject) => {
                        setTimeout(() => {
                            return resolve(self.processNext(0, tries += 1));
                        }, 50);
                    })));
                }
            }
            self.locks[path] = 1;
            job.state = 'processing';
            job.emit('processing');
            job.error = null;
            job.result = null;
            const executionResult = await execCommand_1.execCommand(command, path, params);
            if (executionResult.error) {
                job.error = executionResult.error;
            }
            else {
                job.result = executionResult.result;
            }
            job.state = 'executed';
            job.emit('executed');
            this.state = 'idle';
            delete self.locks[path];
            return resolve(true);
        });
    }
    ;
    start() {
        const self = this;
        if (!this.autoExecStarted)
            this.autoExecStarted = true;
        const continuouslyExecute = () => {
            if (self.state === 'processingAll') {
                return;
            }
            self.processAll()
                .then(() => {
                if (self.autoExecStarted) {
                    setTimeout(() => {
                        continuouslyExecute();
                    }, 20);
                }
            });
        };
        continuouslyExecute();
    }
    stop() {
        if (!this.autoExecStarted)
            return false;
        this.autoExecStarted = false;
    }
}
exports.FSLock = FSLock;
//# sourceMappingURL=FSLock.js.map