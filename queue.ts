import { createClient } from "redis";
import Job from "./job";

interface RedisConnection {
  host: string;
  port: number;
}

class Queue {
  private queueName: string = "default-queue";
  private redisOptions: RedisConnection = {
    host: "127.0.0.1",
    port: 6379,
  };
  private redisClient = createClient();

  constructor(queueName: string, redisOptions?: RedisConnection) {
    this.queueName = queueName;
    if (redisOptions) {
      this.redisOptions.host = redisOptions.host;
      this.redisOptions.port = redisOptions.port;
    }

    // initializing redis connection
    this.connectToRedis();
  }

  private async connectToRedis() {
    this.redisClient.on("error", (err) => {
      console.log(err, "failed");
    });
    await this.redisClient.connect();
  }

  // Enqueue a job
  enqueue(job: Job): void {
    this.redisClient.rPush(this.queueName, JSON.stringify(job));
  }

  // Dequeue a job
  async dequeue(): Promise<Job | null> {
    try {
      const result = await this.redisClient.lPop(this.queueName);
      console.log(result, "from dequeue");

      if (result) {
        return JSON.parse(result) as Job;
      } else {
        return null;
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  // Processing the jobs
  async processJobs(functionToExecute: Function): Promise<void> {
    let continueJob: boolean = true;
    while (continueJob) {
      const job = await this.dequeue();
      if (job) {
        functionToExecute();
      } else {
        continueJob = false;
      }
    }
  }
}

export default Queue;
