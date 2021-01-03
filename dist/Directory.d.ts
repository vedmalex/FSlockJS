export declare class Directory {
    static create(path: string): Promise<void>;
    static exists(path: string): Promise<boolean>;
    static ensure(path: string): Promise<void>;
    static list(path: string): Promise<Array<string>>;
    static remove(path: string): Promise<void>;
}
//# sourceMappingURL=Directory.d.ts.map