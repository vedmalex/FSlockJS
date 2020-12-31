import {File} from './File';
import {Directory} from './Directory';

const utils = {File, Directory}
export type CommandNames = `Directory.${keyof typeof Directory}` | `File.${keyof typeof File}`;

export async function execCommand(command:CommandNames, path:string, params){
  let result, error;
  try{
    const [type,fn] = command.split('.');
    if(!utils[type]){
      throw new Error(`Not handled type ${type} - Expected one of ${Object.keys(utils)}`)
    }
    if(!utils[type][fn]){
      throw new Error(`Not handled method ${type}.${fn} - Expected one of ${Object.keys(utils[type])}`)
    }
    result = await utils[type][fn](path, params);
  } catch(e){
    error = e;
  }
  return {result, error};
}
