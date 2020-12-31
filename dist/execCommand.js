"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execCommand = void 0;
const File_1 = require("./File");
const Directory_1 = require("./Directory");
const utils = { File: File_1.File, Directory: Directory_1.Directory };
async function execCommand(command, path, params) {
    let result, error;
    try {
        const [type, fn] = command.split('.');
        if (!utils[type]) {
            throw new Error(`Not handled type ${type} - Expected one of ${Object.keys(utils)}`);
        }
        if (!utils[type][fn]) {
            throw new Error(`Not handled method ${type}.${fn} - Expected one of ${Object.keys(utils[type])}`);
        }
        result = await utils[type][fn](path, params);
    }
    catch (e) {
        error = e;
    }
    return { result, error };
}
exports.execCommand = execCommand;
//# sourceMappingURL=execCommand.js.map