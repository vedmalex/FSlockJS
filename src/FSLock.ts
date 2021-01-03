import { Job } from './Job';
import {execCommand} from './execCommand';

export type FSLockOptions = {
  autoexec: boolean
  concurrency?: number
  timeout?: number
}

export const defaultProps: FSLockOptions = {
  autoexec: true,
  concurrency: null, //Infinite concurrent processes
  timeout: 5000, //MS wait for execution
}

export const processQueue = async (self) => {
  if (self.queue.length > 0) {
    await self.processNext()
    // We check if there is other tasks to perform
    await processQueue(self)
  }
}

/**
 * FSQueue
 *
 * Simple Queue system that deals with FS.
 *
 * Ideally, we should have way to add to the
 *
 */
export class FSLock {
  public queue: Array<Job>
  public locks: { [key: string]: any }
  public state: 'idle' | 'processingAll' | 'processing'
  public autoExecStarted: boolean
  public options: FSLockOptions
  constructor(props?: FSLockOptions) {
    this.queue = []
    this.locks = {}
    this.options = {
      autoexec:
        props?.autoexec !== undefined ? props?.autoexec : defaultProps.autoexec,
    }
    this.state = 'idle'
    this.autoExecStarted = false

    if (this.options.autoexec) {
      this.start()
    }
  }
  add(command, path, params?) {
    const job = new Job({ command, path, params })
    this.queue.push(job)
    job.state = 'queued'
    return job
  }
  get(index = 0) {
    return this.queue[index]
  }

  async processAll() {
    this.state = 'processingAll'
    const self = this
    if (this.queue.length === 0) {
      this.state = 'idle'
      return
    }
    if (self.options.autoexec && !self.autoExecStarted) {
      return
    }
    await processQueue(self)
    this.state = 'idle'
  }

async processNext(index=0, tries=0) {
  const self = this;
  return new Promise(async (resolve, reject) => {
    self.state = 'processing';
    if(!self.queue.length){
      return false;
    }
    const job = (index===0) ? self.queue.shift() : self.queue.splice(index,1)[0];
    const {command} = job;

    const {path, params} = job;

    // If there is a lock, we just try to process the next one
    if(self.locks[path]===1){
      // We can't deal with it right now. let's replace the item
      self.queue.splice(index, 0, job);

      if(self.queue.length>index+2){
        return self.processNext(1);
      }else{
        // It's locked. We have to wait. Let's retry in a few
        return await (new Promise(((resolve, reject) => {
          setTimeout(()=>{
            return resolve(self.processNext(0, tries+=1));
          }, 50)
        })));

      }
    }
    self.locks[path] = 1;

    job.state = 'processing';
    job.emit('processing');

    job.error = null;
    job.result = null;

    const executionResult = await execCommand(command, path, params);
    if(executionResult.error){
      job.error = executionResult.error
    }else {
      job.result = executionResult.result;
    }
    job.state = 'executed';
    job.emit('executed');
    this.state = 'idle';

    delete self.locks[path];
    return resolve(true);
  })
};


  start() {
  const self = this;
  if (!this.autoExecStarted) this.autoExecStarted = true;

  const continuouslyExecute = () => {
    if (self.state === 'processingAll') {
      return;
    }
    self.processAll()
        .then(() => {
          if (self.autoExecStarted) {
            setTimeout(() => {
              continuouslyExecute();
            }, 20)
          }
        })
  }
  continuouslyExecute();
}
stop() {
  if(!this.autoExecStarted) return false;
  this.autoExecStarted = false;
}

}
// Elements added to the queue will then need to be executed with manually except if autoexec
// Return a job

// Remove last job in queue
// FSQueue.prototype.pop = require('./methods/pop');

// Get position of job in queue
// FSQueue.prototype.indexOf = require('./methods/indexOf');

// Try to execute a passed job in first
// FSQueue.prototype.exec = require('./methods/exec');
