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
Object.defineProperty(exports, "__esModule", { value: true });
exports.File = void 0;
const fs = __importStar(require("fs"));
const url = __importStar(require("url"));
const http = __importStar(require("http"));
const https = __importStar(require("https"));
const Directory_1 = require("./Directory");
const CannotReadFileNotFound_1 = require("./errors/CannotReadFileNotFound");
const pathLib = __importStar(require("path"));
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
        return new Promise((res, rej) => {
            fs.appendFile(p, data, (err) => {
                if (err)
                    rej(err);
                res(true);
            });
        });
    }
    static async appendJSON(path, data) {
        const self = this;
        return new Promise(async (resolve, reject) => {
            let json;
            if (await this.exists(path)) {
                json = await this.read(path);
            }
            const res = await this.create(path, Object.assign({}, json, data));
            resolve(res);
        });
    }
    static async create(path, data = '') {
        const self = this;
        return new Promise(async (res, rej) => {
            await Directory_1.Directory.ensure(pathLib.dirname(path));
            const exist = await this.exists(path);
            const write = (resolver) => {
                fs.writeFile(path, stringify(data), (err) => {
                    if (err)
                        return err;
                    resolver(true);
                });
            };
            if (exist) {
                try {
                    write(res);
                }
                catch (e) {
                    rej(e);
                    throw e;
                }
            }
            else
                write(res);
        });
    }
    static async download(uri, outputPath) {
        return new Promise((res, rej) => {
            let store = true;
            return new Promise(async (resolve, reject) => {
                if (!uri)
                    reject(new Error('Require uri'));
                if (!outputPath)
                    store = false;
                if (store)
                    await this.ensure(outputPath);
                const timeout = 20 * 1000;
                const { protocol } = url.parse(uri);
                const req = protocol === 'https:' ? https : http;
                const URL = protocol === null ? `http://${uri}` : uri;
                const request = req
                    .get(URL, (response) => {
                    const { statusCode } = response;
                    if (statusCode === 200) {
                        if (store) {
                            const outputFile = fs.createWriteStream(outputPath);
                            response.pipe(outputFile);
                            outputFile.on('finish', () => { });
                            outputFile.on('close', () => resolve(outputPath));
                        }
                        else {
                            let buff;
                            response.on('data', (chunk) => {
                                buff =
                                    buff === undefined
                                        ? Buffer.from(chunk)
                                        : Buffer.concat([buff, chunk]);
                            });
                            response.on('end', () => resolve(buff));
                        }
                    }
                    else if (statusCode === 303 ||
                        statusCode === 302 ||
                        statusCode === 301) {
                        const newURL = response.headers.location;
                        return resolve(this.download(newURL, outputPath));
                    }
                    else if (statusCode === 404) {
                        return resolve(statusCode);
                    }
                    else {
                        return resolve(statusCode);
                    }
                    return false;
                });
                request
                    .on('error', (e) => resolve(e))
                    .setTimeout(timeout, () => {
                    request.abort();
                    return resolve(504);
                })
                    .end();
            })
                .then((data) => {
                return res(data);
            })
                .catch((err) => {
                return rej(err);
            });
        });
    }
    static async exists(path) {
        return new Promise((resolve, reject) => fs.stat(path, (err, stats) => {
            if (err && err.code === 'ENOENT') {
                return resolve(false);
            }
            if (err && err.code === 'ENOTDIR') {
                return resolve(false);
            }
            if (err) {
                return reject(err);
            }
            if (stats.isFile() || stats.isDirectory()) {
                return resolve(true);
            }
            return false;
        }));
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
    static async read(path, options = {}) {
        const isFile = await this.exists(path);
        if (!isFile)
            throw new CannotReadFileNotFound_1.CannotReadFileNotFound(`CannotReadFileNotFound({path: ${path}}`);
        return new Promise(async (res, rej) => {
            let output;
            try {
                const data = fs.readFileSync(path, options);
                if (Buffer.isBuffer(data))
                    output = data.toString('utf8');
                output = output.replace(/^\uFEFF/, '');
                let obj;
                try {
                    obj = JSON.parse(output, options ? options.reviver : null);
                }
                catch (err2) {
                    rej(err2);
                }
                res(obj);
            }
            catch (e) {
                rej(e);
            }
        });
    }
    static async remove(path) {
        return new Promise((res, rej) => {
            fs.unlink(path, (err) => {
                if (err)
                    rej(err);
                res(true);
            });
        });
    }
}
exports.File = File;
//# sourceMappingURL=File.js.map