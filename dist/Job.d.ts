import { CommandNames } from './execCommand';
declare const EventEmitter: any;
export declare type JobProps = {
    path: string;
    command: CommandNames;
    params: any;
};
export declare class Job extends EventEmitter {
    command: CommandNames;
    params: any;
    state: 'idle' | 'processing' | 'executed' | 'queued';
    constructor(props: JobProps);
    execution(): Promise<unknown>;
}
export {};
//# sourceMappingURL=Job.d.ts.map