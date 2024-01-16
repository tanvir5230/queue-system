import Job from "./job";
import Queue, { DoneCallback } from "./queue";

const job1 = new Job("1", { message: "hello world" });
const job2 = new Job("2", { message: "hello world 2" });

const jobQueue = new Queue("test", { host: "127.0.0.1", port: 6379 });

jobQueue.enqueue(job1);
jobQueue.enqueue(job2);

jobQueue.processJobs((job: Job, done: DoneCallback) => {
  try {
    console.log(
      `Job number ${job.id} is executed with the message ${job.data.message}`
    );
    done(null, "successfull");
  } catch (error) {
    done(error as Error);
  }
});
