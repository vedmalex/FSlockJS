import * as fs from 'fs'
import * as pathLib from 'path'

export class Directory {
  public static async create(path:string) {
    const self = this
    return new Promise((resolve, reject) => {
      fs.mkdir(path, async (err) => {
        // if there is no error or if folder already exists
        if (!err || err.code === 'EEXIST') {
          return resolve(true)
        }
        if (err.code === 'ENOENT') {
          // Create parent
          await self.create(pathLib.dirname(path))
          return resolve(self.create(path))
        }
        return reject(err)
      })
    })
  }

  public static async exists(path: string) {
    return new Promise((resolve, reject) => {
      fs.stat(path, (err, stats) => {
        if (err && err.code === 'ENOENT') {
          resolve(false)
        }
        if (err) {
          reject(err)
        }
        if (stats.isFile() || stats.isDirectory()) {
          resolve(true)
        }
      })
    })
  }
  public static async ensure(path:string) {
    const exist = await this.exists(path)

    if (!exist) {
      await this.create(path)

      return this.ensure(path)
    }
    return exist
  }

  public static async list(path: string): Promise<Array<string>> {
    return new Promise((resolve, reject) => {
      fs.readdir(path, (err, list) => {
        if (err && err.code === 'ENOENT') {
          reject(err)
        }
        if (err) {
          reject(err)
        }
        resolve(list)
      })
    })
  }
  public static async remove(path: string) {
    const files = await this.list(path)
    return new Promise((resolve, reject) => {
      // If there is file, we remove them first
      Promise.all(
        files.map(async (file) => {
          try {
            const filep = pathLib.join(path, file)
            fs.lstat(filep, (err, stat) => {
              if (stat && stat.isDirectory()) {
                fs.rmdir(filep, async (err) => {
                  if (err) {
                    if (
                      err.message.slice(0, 30) ===
                      'ENOTEMPTY: directory not empty'
                    ) {
                      resolve(await this.remove(filep))
                    }
                    if (
                      err.message.slice(0, 33) ===
                      'ENOENT: no such file or directory'
                    ) {
                      resolve(true)
                    } else {
                      reject(err)
                    }
                  }
                  resolve(true)
                })
              } else {
                fs.unlink(filep, (err) => {
                  if (err) reject(err)
                  resolve(true)
                })
              }
            })
          } catch (err) {
            reject(err)
            throw err
          }
        }),
      )
        .then(() => {
          fs.rmdir(path, async (err) => {
            if (err) {
              if (
                err.message.slice(0, 30) === 'ENOTEMPTY: directory not empty'
              ) {
                resolve(await this.remove(path))
              } else {
                if (
                  err.message.slice(0, 33) ===
                  'ENOENT: no such file or directory'
                ) {
                  resolve(true)
                }
                reject(err)
              }
            }
            resolve(true)
          })
        })
        .catch((err) => {
          reject(err)
        })
    })
  }
}
