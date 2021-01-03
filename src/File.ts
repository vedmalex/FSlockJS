import * as fs from 'fs-extra'
import * as  url from 'url';
import * as  http from 'http';
import * as  https from 'https';
import { Directory } from './Directory'
import { CannotReadFileNotFound } from './errors/CannotReadFileNotFound'
import * as pathLib from 'path';
import slocket from 'slocket';
import download from 'download';

// https://www.npmjs.com/package/slocket
// slocket --
export type stringifyOptions = {
  replacer?: (this: any, key: string, value: any) => any
  spaces: string | number
  EOL: string
}

function stringify(obj: object, options?: stringifyOptions) {
  let spaces
  let EOL = '\n'
  if (options?.spaces) {
    spaces = options.spaces
  }
  if (options?.EOL) {
    EOL = options.EOL
  }
  const str = JSON.stringify(obj, options ? options.replacer : null, spaces)
  return str.replace(/\n/g, EOL) + EOL
}

export class File {
  public static async append(p: string, data: string | Uint8Array) {
    await fs.appendFile(p,data)
    return true;
  }

  public static async appendJSON(path, data: any) {
    let json;
    if(await this.exists(path)){
      json = await this.read(path)
    }
    return await this.create(path, Object.assign({}, json ?? {}, data))
  }

  public static async create(path:string, data: any = '') {
      await Directory.ensure(pathLib.dirname(path))
      const exist = await this.exists(path)
      if (exist) {
        // const lock = await slocket(path);
        try {
          await fs.writeFile(path, stringify(data))
          // if (lock) lock.release();
          // else console.log('no lock?')
        } catch (e) {
          // if (lock) lock.release();
          throw e;
        }
      } else {
        await fs.writeFile(path, stringify(data))
      }
      return true;
  }

  public static async download(uri:string, outputPath:string) {
    return await this.create(outputPath, await download(uri));
  }

  public static async exists(path:string) {
    try {
      if(fs.pathExists(path)){
        const fi = await fs.stat(path)
        return fi.isFile();
      } else {
        return false
      }
    } catch(e){
      return false;
    }
  }

  public static async ensure(path: string, data:any=''):Promise<boolean> {
    const exist = await this.exists(path)
    if (!exist) {
      await Directory.ensure(pathLib.dirname(path))
      await this.create(path, data)
      return this.ensure(path, data)
    }
    return exist
  }

  public static async read(path:string, options?:fs.ReadOptions) {
    const isFile = await this.exists(path)
    if (isFile){
      // const lock = await slocket(p);
      return await fs.readJSON(path, options??undefined)
      // lock.release();
    } else {
      throw new CannotReadFileNotFound(`CannotReadFileNotFound({path: ${path}}`)
    }
  }

  public static async remove(path:string) {
    await fs.remove(path);
    return true;
  }
}
