import { CommandNames } from './execCommand';
export declare type JobProps = {
    path: string;
    command: CommandNames;
    params: any;
};
export declare type EventListeners = {
    event: string | symbol;
    listener: (...args: any[]) => void;
    type: 'on' | 'once';
};
export declare class Job {
    private emitter;
    private listeners;
    command: CommandNames;
    params: any;
    state: 'idle' | 'processing' | 'executed' | 'queued';
    path: string;
    result: any;
    error: Error;
    constructor(props?: JobProps);
    on(event: string | symbol, listener: (...args: any[]) => void): void;
    once(event: string | symbol, listener: (...args: any[]) => void): void;
    close(): void;
    emit(event: string | symbol, ...args: any[]): boolean;
    execution(): Promise<Job>;
}
//# sourceMappingURL=Job.d.ts.map