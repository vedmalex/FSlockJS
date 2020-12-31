import { CommandNames } from './execCommand';
const EventEmitter = require('events')
export type JobProps = {
  path: string;
  command: CommandNames;
  params: any;
}

export class Job extends EventEmitter {
  public command: CommandNames;
  public params: any;
  public state: 'idle' | 'processing' | 'executed'| 'queued' = 'idle'
  constructor(props: JobProps) {
    super()
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
  async execution() {
    return new Promise((resolve) => {
      if (this.state === 'executed') return resolve(this)
      this.once('executed', () => {
        return resolve(this)
      })
    })
  }
}
