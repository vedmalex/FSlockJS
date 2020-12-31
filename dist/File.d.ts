/// <reference types="node" />
export declare type stringifyOptions = {
    replacer?: (this: any, key: string, value: any) => any;
    spaces: string | number;
    EOL: string;
};
export declare class File {
    static append(p: string, data: string | Uint8Array): Promise<unknown>;
    static appendJSON(path: any, data: any): Promise<unknown>;
    static create(path: string, data?: any): Promise<unknown>;
    static download(uri: string, outputPath: string): Promise<unknown>;
    static exists(path: string): Promise<unknown>;
    static ensure(path: string, data?: any): any;
    static read(path: string, options?: {
        reviver?: (this: any, key: string, value: any) => any;
        encoding?: BufferEncoding;
        flag?: string;
    }): Promise<unknown>;
    static remove(path: string): Promise<unknown>;
}
//# sourceMappingURL=File.d.ts.map