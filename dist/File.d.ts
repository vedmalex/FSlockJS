import * as fs from 'fs-extra';
export declare type stringifyOptions = {
    replacer?: (this: any, key: string, value: any) => any;
    spaces: string | number;
    EOL: string;
};
export declare class File {
    static append(p: string, data: string | Uint8Array): Promise<boolean>;
    static appendJSON(path: any, data: any): Promise<boolean>;
    static create(path: string, data?: any): Promise<boolean>;
    static download(uri: string, outputPath: string): Promise<boolean>;
    static exists(path: string): Promise<boolean>;
    static ensure(path: string, data?: any): Promise<boolean>;
    static read(path: string, options?: fs.ReadOptions): Promise<any>;
    static remove(path: string): Promise<boolean>;
}
//# sourceMappingURL=File.d.ts.map