import Job from "./job";
import Queue, { FunctionToExecuteCallbackProps } from "./queue";

export async function executeNotificationSendingExample() {
  // Sample user data creation logic
  const users = Array.from({ length: 10000 }, (e, i) => i).map((i) => {
    return {
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
    };
  });

  // Create a Queue instance
  const notificationQueue = new Queue("notificationQueue", {
    host: "127.0.0.1",
    port: 6379,
  });

  // Enqueue notification jobs for each user
  for (const user of users) {
    const job = new Job(user.id, user);
    notificationQueue.enqueue({
      job,
    });
  }

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
