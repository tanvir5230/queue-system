import { FunctionToExecuteCallbackProps } from "./Types";
import Job from "./job";
import Queue from "./queue";

export const simulateRetry = async () => {
  const retryQueue = new Queue("retryQueue");

  // create a job
  const job = new Job(1, { message: "Retry Job" });

  // Enqueue the job
  retryQueue.enqueue({ job: job, delay: 3000, retry: 3 });

  // A function that simulates the job execution which fails and retry works
  const failingFunction = ({ job, done }: FunctionToExecuteCallbackProps) => {
    console.log(`Simulation of the job with id ${job.id}`);

    // simulate an error
    const error = new Error("Simulated error during exec.");
    done(error);
  };

  await retryQueue.processJobs(failingFunction);
};
