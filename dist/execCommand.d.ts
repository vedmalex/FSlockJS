import { File } from './File';
import { Directory } from './Directory';
export declare type CommandNames = `Directory.${keyof typeof Directory}` | `File.${keyof typeof File}`;
export declare function execCommand(command: CommandNames, path: string, params: any): Promise<{
    result: any;
    error: any;
}>;
//# sourceMappingURL=execCommand.d.ts.map