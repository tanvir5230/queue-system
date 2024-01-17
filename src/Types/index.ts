import Job from "../job";

export interface RedisConnection {
  host: string;
  port: number;
}

export interface DoneCallback {
  (error: Error | null, result?: any): void;
}

export interface EnqueueProps {
  job: Job;
  delay?: number;
  retry?: number;
}

export interface FunctionToExecuteCallbackProps {
  job: Job;
  done: DoneCallback;
}

export interface FunctionToExecuteCallback {
  ({ job, done }: FunctionToExecuteCallbackProps): void;
}
