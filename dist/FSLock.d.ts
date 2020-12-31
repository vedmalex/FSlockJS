import { Job } from './Job';
export declare type FSLockOptions = {
    autoexec: boolean;
    concurrency?: number;
    timeout?: number;
};
export declare const defaultProps: FSLockOptions;
export declare const processQueue: (self: any) => Promise<void>;
export declare class FSLock {
    queue: Array<Job>;
    locks: {
        [key: string]: any;
    };
    state: 'idle' | 'processingAll' | 'processing';
    autoExecStarted: boolean;
    options: FSLockOptions;
    constructor(props: FSLockOptions);
    add(command: any, path: any, params: any): Job;
    get(index?: number): Job;
    processAll(): Promise<void>;
    processNext(index?: number, tries?: number): any;
    start(): void;
    stop(): boolean;
}
//# sourceMappingURL=FSLock.d.ts.map