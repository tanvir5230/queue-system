import { RedisClientType, createClient } from "redis";
import Job from "./job";

interface RedisConnection {
  host: string;
  port: number;
}

export interface DoneCallback {
  (error: Error | null, result?: any): void;
}

interface EnqueueProps {
  job: Job;
  delay?: number;
}

class Queue {
  private queueName: string = "default-queue";
  private redisOptions: RedisConnection = {
    host: "127.0.0.1",
    port: 6379,
  };
  private redisClient: RedisClientType;

  constructor(queueName: string, redisOptions?: RedisConnection) {
    this.queueName = queueName;
    if (redisOptions) {
      this.redisOptions.host = redisOptions.host;
      this.redisOptions.port = redisOptions.port;
    }
    this.redisClient = createClient({
      url: `redis://${this.redisOptions.host}:${this.redisOptions.port}`,
    });

    // initializing redis connection
    this.connectToRedis();
  }

  private async connectToRedis() {
    this.redisClient.on("error", (err) => {
      console.log(err, "failed");
    });
    await this.redisClient.connect();
  }

  private async jobExecution(
    functionToExecute: (job: Job, done: DoneCallback) => void,
    enqueueProps: EnqueueProps
  ) {
    await new Promise<void>((resolve) => {
      functionToExecute(enqueueProps.job, (error, result) => {
        if (error) {
          console.error(
            `Error processing job ${enqueueProps.job.id}: ${error.message}`
          );
        } else {
          console.log(
            `Job ${enqueueProps.job.id} processed successfully. Result:`,
            result
          );
        }
        resolve();
      });
    });
  }

  // Enqueue a job
  enqueue({ job, delay }: EnqueueProps): void {
    this.redisClient.rPush(this.queueName, JSON.stringify({ job, delay }));
  }

  // Dequeue a job
  async dequeue(): Promise<EnqueueProps | null> {
    try {
      const result = await this.redisClient.lPop(this.queueName);

      if (result) {
        return JSON.parse(result) as EnqueueProps;
      } else {
        return null;
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  // Processing the jobs
  async processJobs(
    functionToExecute: (job: Job, done: DoneCallback) => void
  ): Promise<void> {
    let continueJob: boolean = true;
    while (continueJob) {
      const enqueueProps = await this.dequeue();
      if (enqueueProps && enqueueProps.job) {
        if (enqueueProps.delay) {
          setTimeout(async () => {
            this.jobExecution(functionToExecute, enqueueProps);
          }, enqueueProps.delay);
        } else {
          this.jobExecution(functionToExecute, enqueueProps);
        }
      } else {
        continueJob = false;
      }
    }
  }
}

export default Queue;
