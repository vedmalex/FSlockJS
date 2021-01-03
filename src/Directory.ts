import * as fs from 'fs-extra'

export class Directory {
  public static async create(path:string) {
    return fs.createFile(path)
  }

  public static async exists(path: string) {
    try {
      if(fs.pathExists(path)){
        const fi = await fs.stat(path)
        return fi.isDirectory();
      } else {
        return false
      }
    } catch(e){
      return false;
    }
  }

  public static async ensure(path:string) {
    await fs.ensureDir(path)
  }

  public static async list(path: string): Promise<Array<string>> {
    return fs.readdir(path)
  }

  public static async remove(path: string) {
    return fs.rmdir(path)
  }
}
