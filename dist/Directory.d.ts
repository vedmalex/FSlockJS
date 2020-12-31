export declare class Directory {
    static create(path: string): Promise<unknown>;
    static exists(path: string): Promise<unknown>;
    static ensure(path: string): any;
    static list(path: string): Promise<Array<string>>;
    static remove(path: string): Promise<unknown>;
}
//# sourceMappingURL=Directory.d.ts.map