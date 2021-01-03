import { CommandNames } from './execCommand';
import {EventEmitter} from 'events'

export type JobProps = {
  path: string;
  command: CommandNames;
  params: any;
}

export type EventListeners = {
  event: string | symbol;
  listener: (...args: any[]) => void;
  type: 'on'|'once'
}
export class Job {
  private emitter = new EventEmitter()
  private listeners: Array<EventListeners> = [];
  public command: CommandNames;
  public params: any;
  public state: 'idle' | 'processing' | 'executed'| 'queued' = 'idle'
  public path: string;
  public result: any
  public error: Error

  constructor(props?: JobProps) {
    if (!props?.command || !props?.path) {
      throw new Error('Unexpected new job properties')
    }
    this.command = props?.command
    this.path = props.path
    this.params = props?.params || null
    this.state = 'idle'
    this.result = null
    this.error = null
  }

  on(event: string | symbol, listener: (...args: any[]) => void){
    this.emitter.on(event, listener)
    this.listeners.push({
      event,
      listener,
      type: 'on'
    })
  }

  once(event: string | symbol, listener: (...args: any[]) => void){
    this.emitter.once(event, listener)
    this.listeners.push({
      event,
      listener,
      type: 'once'
    })
  }

  close(){
    this.emit('close');
    setTimeout(()=>{
      this.emitter.removeAllListeners()
    },10)
  }

  emit(event: string | symbol, ...args: any[]){
    return this.emitter.emit(event, ...args)
  }

  async execution():Promise<Job> {
    return new Promise((resolve) => {
      if (this.state === 'executed') {
        resolve(this)
      } else {
        this.once('executed', () => {
          resolve(this)
        })
      }
    })
  }
}
