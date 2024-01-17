import Job from "./job";
import Queue, { FunctionToExecuteCallbackProps } from "./queue";

export function executeSampleJobs() {
  const job1 = new Job(1, { message: "hello world" });
  const job2 = new Job(2, { message: "hello world 2" });

  const jobQueue = new Queue("test", { host: "127.0.0.1", port: 6379 });

  jobQueue.enqueue({ job: job1, delay: 1000, retry: 3 });
  jobQueue.enqueue({ job: job2, delay: 2000 });

  jobQueue.processJobs(({ job, done }: FunctionToExecuteCallbackProps) => {
    try {
      console.log(
        `Job number ${job.id} is executed with the message ${job.data.message}`
      );
      done(null, "successfull");
    } catch (error) {
      done(error as Error);
    }
  });
}
