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
const fs = __importStar(require("fs-extra"));
class Directory {
    static async create(path) {
        return fs.createFile(path);
    }
    static async exists(path) {
        try {
            if (fs.pathExists(path)) {
                const fi = await fs.stat(path);
                return fi.isDirectory();
            }
            else {
                return false;
            }
        }
        catch (e) {
            return false;
        }
    }
    static async ensure(path) {
        await fs.ensureDir(path);
    }
    static async list(path) {
        return fs.readdir(path);
    }
    static async remove(path) {
        return fs.rmdir(path);
    }
}
exports.Directory = Directory;
//# sourceMappingURL=Directory.js.map