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
exports.Directory = void 0;
const fs = __importStar(require("fs"));
const pathLib = __importStar(require("path"));
class Directory {
    static async create(path) {
        const self = this;
        return new Promise((resolve, reject) => {
            fs.mkdir(path, async (err) => {
                if (!err || err.code === 'EEXIST') {
                    return resolve(true);
                }
                if (err.code === 'ENOENT') {
                    await self.create(pathLib.dirname(path));
                    return resolve(self.create(path));
                }
                return reject(err);
            });
        });
    }
    static async exists(path) {
        return new Promise((resolve, reject) => {
            fs.stat(path, (err, stats) => {
                if (err && err.code === 'ENOENT') {
                    resolve(false);
                }
                if (err) {
                    reject(err);
                }
                if (stats.isFile() || stats.isDirectory()) {
                    resolve(true);
                }
            });
        });
    }
    static async ensure(path) {
        const exist = await this.exists(path);
        if (!exist) {
            await this.create(path);
            return this.ensure(path);
        }
        return exist;
    }
    static async list(path) {
        return new Promise((resolve, reject) => {
            fs.readdir(path, (err, list) => {
                if (err && err.code === 'ENOENT') {
                    reject(err);
                }
                if (err) {
                    reject(err);
                }
                resolve(list);
            });
        });
    }
    static async remove(path) {
        const files = await this.list(path);
        return new Promise((resolve, reject) => {
            Promise.all(files.map(async (file) => {
                try {
                    const filep = pathLib.join(path, file);
                    fs.lstat(filep, (err, stat) => {
                        if (stat && stat.isDirectory()) {
                            fs.rmdir(filep, async (err) => {
                                if (err) {
                                    if (err.message.slice(0, 30) ===
                                        'ENOTEMPTY: directory not empty') {
                                        resolve(await this.remove(filep));
                                    }
                                    if (err.message.slice(0, 33) ===
                                        'ENOENT: no such file or directory') {
                                        resolve(true);
                                    }
                                    else {
                                        reject(err);
                                    }
                                }
                                resolve(true);
                            });
                        }
                        else {
                            fs.unlink(filep, (err) => {
                                if (err)
                                    reject(err);
                                resolve(true);
                            });
                        }
                    });
                }
                catch (err) {
                    reject(err);
                    throw err;
                }
            }))
                .then(() => {
                fs.rmdir(path, async (err) => {
                    if (err) {
                        if (err.message.slice(0, 30) === 'ENOTEMPTY: directory not empty') {
                            resolve(await this.remove(path));
                        }
                        else {
                            if (err.message.slice(0, 33) ===
                                'ENOENT: no such file or directory') {
                                resolve(true);
                            }
                            reject(err);
                        }
                    }
                    resolve(true);
                });
            })
                .catch((err) => {
                reject(err);
            });
        });
    }
}
exports.Directory = Directory;
//# sourceMappingURL=Directory.js.map