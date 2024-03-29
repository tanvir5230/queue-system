import { RedisClientType, createClient } from "redis";
import {
  DoneCallback,
  EnqueueProps,
  FunctionToExecuteCallback,
  RedisConnection,
} from "../Types";
import Job from "./job";

class Queue {
  // Name of the key to be stored on redis
  private queueName: string = "default-queue";
  // Configuration of the redis connection
  private redisOptions: RedisConnection = {
    host: "127.0.0.1",
    port: 6379,
  };
  // Redis instance
  private redisClient: RedisClientType;

  constructor(queueName: string, redisOptions?: RedisConnection) {
    this.queueName = queueName;
    if (redisOptions) {
      this.redisOptions.host = redisOptions.host;
      this.redisOptions.port = redisOptions.port;
    }

    // Creating the redis client
    this.redisClient = createClient({
      url: `redis://${this.redisOptions.host}:${this.redisOptions.port}`,
    });

    // initializing redis connection
    this.connectToRedis();
  }

  // Connect to redis
  private async connectToRedis() {
    this.redisClient.on("error", (err) => {
      console.log(err, "failed");
    });
    await this.redisClient.connect();
  }

  // Execute a job
  private async jobExecution(
    functionToExecute: ({
      job,
      done,
    }: {
      job: Job;
      done: DoneCallback;
    }) => void,
    enqueueProps: EnqueueProps
  ) {
    await new Promise<void>((resolve) => {
      let maxRetries = enqueueProps?.retry ?? 0;
      let retryNumber = maxRetries;
      let isSuccess = false;

      const executeWithRetry = () => {
        functionToExecute({
          job: enqueueProps.job,
          done: (error, result) => {
            if (error) {
              console.error(
                `Error processing job ${enqueueProps.job.id}: ${error.message}`
              );
            } else {
              console.log(
                `Job ${enqueueProps.job.id} processed successfully. Result:`,
                result
              );
              isSuccess = true;
            }

            if (isSuccess || retryNumber <= 0) {
              if (enqueueProps?.retry && retryNumber === 0) {
                console.log("Max retry attempt reached!!!");
              }
              resolve();
            } else {
              // A delay is added between retries
              setTimeout(() => {
                retryNumber--;
                console.log(`Retrying for ${maxRetries - retryNumber} time`);
                executeWithRetry();
              }, 1000);
            }
          },
        });
      };

      executeWithRetry();
    });
  }

  // Enqueue a job
  enqueue({ job, delay, retry }: EnqueueProps): void {
    this.redisClient.rPush(
      this.queueName,
      JSON.stringify({ job, delay, retry })
    );
  }

  // Dequeue a job
  private async dequeue(): Promise<EnqueueProps | null> {
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
    functionToExecute: FunctionToExecuteCallback
  ): Promise<void> {
    let continueJob: boolean = true;
    while (continueJob) {
      const enqueueProps: EnqueueProps | null = await this.dequeue();

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
        this.redisClient.disconnect();
      }
    }
  }
}

export default Queue;
