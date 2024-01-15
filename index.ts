import Job from "./job";
import Queue from "./queue";

const job1 = new Job("1", { message: "hello world" });
const job2 = new Job("2", { message: "hello world 2" });
const jobQueue = new Queue("test");

jobQueue.enqueue(job1);
jobQueue.enqueue(job2);

jobQueue.processJobs(() => console.log("I am executed each time."));
