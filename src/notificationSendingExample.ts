import Job from "./job";
import Queue, { FunctionToExecuteCallbackProps } from "./queue";

export async function executeNotificationSendingExample() {
  // Sample user data creation logic
  const users = Array.from({ length: 10000 }, (e, i) => i + 1).map((i) => {
    return {
      id: i,
      name: `User ${i}`,
      email: `user${i}@example.com`,
    };
  });

  // Create a Queue instance
  const notificationQueue = new Queue("notificationQueue", {
    host: "127.0.0.1",
    port: 6379,
  });

  // Enqueue notification jobs for each user
  users.map(async (user, i) => {
    const job = new Job(i + 1, user);
    notificationQueue.enqueue({
      job,
    });
  });

  notificationQueue.processJobs(sendNotification);
}

// Function to simulate sending a notification to a user
const sendNotification = async ({
  job,
  done,
}: FunctionToExecuteCallbackProps) => {
  try {
    // Simulate sending a notification to the user
    console.log(
      `Sending notification to ${job.data?.name} (${job.data?.email})`
    );

    // Notify that the job is successful
    done(null, "Notification sent successfully");
  } catch (error) {
    // Notify that an error occurred
    done(error as Error);
  }
};
