import * as fs from 'fs'
import * as  url from 'url';
import * as  http from 'http';
import * as  https from 'https';
import { Directory } from './Directory'
import { CannotReadFileNotFound } from './errors/CannotReadFileNotFound'
import * as pathLib from 'path';

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
    return new Promise((res, rej) => {
      fs.appendFile(p, data, (err) => {
        if (err) rej(err)
        res(true)
      })
    })
  }

  public static async appendJSON(path, data: any) {
    const self = this

    return new Promise(async (resolve, reject) => {
      let json
      if (await this.exists(path)) {
        json = await this.read(path)
      }
      const res = await this.create(path, Object.assign({}, json, data))
      resolve(res)
    })
  }
  public static async create(path:string, data: any = '') {
    const self = this

    return new Promise(async (res, rej) => {
      await Directory.ensure(pathLib.dirname(path))
      const exist = await this.exists(path)
      const write = (resolver:(value:unknown)=>void/*, lock? */) => {
        fs.writeFile(path, stringify(data), (err) => {
          // if (lock) lock.release();
          // else console.log('no lock?')
          if (err) return err
          resolver(true)
        })
      }

      if (exist) {
        // const lock = await slocket(p);
        try {
          write(res /*lock*/)
        } catch (e) {
          rej(e)
          throw e
        }
      } else write(res)
    })
  }

  public static async download(uri:string, outputPath:string) {
    return new Promise((res, rej) => {
      let store = true
      return new Promise(async (resolve, reject) => {
        if (!uri) reject(new Error('Require uri'))
        if (!outputPath) store = false
        if (store) await this.ensure(outputPath)
        const timeout = 20 * 1000 // 20 seconde timeout (time to get the response)
        const { protocol } = url.parse(uri)
        const req = protocol === 'https:' ? https : http

        const URL = protocol === null ? `http://${uri}` : uri

        const request = req
          .get(URL, (response) => {
            const { statusCode } = response
            if (statusCode === 200) {
              if (store) {
                const outputFile = fs.createWriteStream(outputPath)
                response.pipe(outputFile)
                outputFile.on('finish', () => {})
                outputFile.on('close', () => resolve(outputPath))
              } else {
                let buff
                response.on('data', (chunk) => {
                  buff =
                    buff === undefined
                      ? Buffer.from(chunk)
                      : Buffer.concat([buff, chunk])
                })
                response.on('end', () => resolve(buff))
              }
            } else if (
              statusCode === 303 ||
              statusCode === 302 ||
              statusCode === 301
            ) {
              // Redirection
              const newURL = response.headers.location
              // console.log('Redirect to', newURL);
              // throw("Moved to ",newURL)
              return resolve(this.download(newURL, outputPath))
            } else if (statusCode === 404) {
              // throw("Unreachable domain", statusCode);
              return resolve(statusCode)
            } else {
              // throw("Got an statusCode", statusCode);
              return resolve(statusCode)
            }
            return false
          });

          request
          .on('error', (e) => resolve(e))
          .setTimeout(timeout, () => {
            request.abort()
            // Gateway time-out
            return resolve(504)
          })
          .end()
      })
        .then((data) => {
          return res(data)
        })
        .catch((err) => {
          return rej(err)
        })
    })
  }
  public static async exists(path:string) {
    return new Promise((resolve, reject) =>
      fs.stat(path, (err, stats) => {
        if (err && err.code === 'ENOENT') {
          return resolve(false)
        }
        if (err && err.code === 'ENOTDIR') {
          return resolve(false)
        }
        if (err) {
          return reject(err)
        }

        if (stats.isFile() || stats.isDirectory()) {
          return resolve(true)
        }
        return false
      }),
    )
  }

  public static async ensure(path: string, data:any='') {
    const exist = await this.exists(path)
    if (!exist) {
      await Directory.ensure(pathLib.dirname(path))
      await this.create(path, data)
      return this.ensure(path, data)
    }
    return exist
  }
  public static async read(path:string, options:{
    reviver?:(this: any, key: string, value: any) => any
    encoding?: BufferEncoding
    flag?: string;
  } = {}) {
    const isFile = await this.exists(path)
    if (!isFile)
      throw new CannotReadFileNotFound(`CannotReadFileNotFound({path: ${path}}`)
    return new Promise(async (res, rej) => {
      let output
      try {
        // const lock = await slocket(p);
        const data = fs.readFileSync(path, options)
        // lock.release();

        if (Buffer.isBuffer(data)) output = data.toString('utf8')
        output = output.replace(/^\uFEFF/, '')
        let obj
        try {
          obj = JSON.parse(output, options ? options.reviver : null)
        } catch (err2) {
          rej(err2)
        }
        res(obj)
      } catch (e) {
        rej(e)
      }
    })
  }
  public static async remove(path:string) {
    return new Promise((res, rej) => {
      fs.unlink(path, (err) => {
        if (err) rej(err)
        res(true)
      })
    })
  }
}
