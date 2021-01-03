"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.File = void 0;
const fs = __importStar(require("fs-extra"));
const Directory_1 = require("./Directory");
const CannotReadFileNotFound_1 = require("./errors/CannotReadFileNotFound");
const pathLib = __importStar(require("path"));
const download_1 = __importDefault(require("download"));
function stringify(obj, options) {
    let spaces;
    let EOL = '\n';
    if (options === null || options === void 0 ? void 0 : options.spaces) {
        spaces = options.spaces;
    }
    if (options === null || options === void 0 ? void 0 : options.EOL) {
        EOL = options.EOL;
    }
    const str = JSON.stringify(obj, options ? options.replacer : null, spaces);
    return str.replace(/\n/g, EOL) + EOL;
}
class File {
    static async append(p, data) {
        await fs.appendFile(p, data);
        return true;
    }
    static async appendJSON(path, data) {
        let json;
        if (await this.exists(path)) {
            json = await this.read(path);
        }
        return await this.create(path, Object.assign({}, json !== null && json !== void 0 ? json : {}, data));
    }
    static async create(path, data = '') {
        await Directory_1.Directory.ensure(pathLib.dirname(path));
        const exist = await this.exists(path);
        if (exist) {
            try {
                await fs.writeFile(path, stringify(data));
            }
            catch (e) {
                throw e;
            }
        }
        else {
            await fs.writeFile(path, stringify(data));
        }
        return true;
    }
    static async download(uri, outputPath) {
        return await this.create(outputPath, await download_1.default(uri));
    }
    static async exists(path) {
        try {
            if (fs.pathExists(path)) {
                const fi = await fs.stat(path);
                return fi.isFile();
            }
            else {
                return false;
            }
        }
        catch (e) {
            return false;
        }
    }
    static async ensure(path, data = '') {
        const exist = await this.exists(path);
        if (!exist) {
            await Directory_1.Directory.ensure(pathLib.dirname(path));
            await this.create(path, data);
            return this.ensure(path, data);
        }
        return exist;
    }
    static async read(path, options) {
        const isFile = await this.exists(path);
        if (isFile) {
            return await fs.readJSON(path, options !== null && options !== void 0 ? options : undefined);
        }
        else {
            throw new CannotReadFileNotFound_1.CannotReadFileNotFound(`CannotReadFileNotFound({path: ${path}}`);
        }
    }
    static async remove(path) {
        await fs.remove(path);
        return true;
    }
}
exports.File = File;
//# sourceMappingURL=File.js.map