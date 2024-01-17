import express, { Express, Request, Response } from "express";
import { executeSampleJobs } from "./Examples/example";
import { executeNotificationSendingExample } from "./Examples/notificationSendingExample";
import { simulateRetry } from "./Examples/retryMechnismExample";

const app: Express = express();
const port = 7000;

app.get("/", async (req: Request, res: Response) => {
  res.send("Hello world!!!");
  executeSampleJobs();
});

app.get("/send-notification", async (req: Request, res: Response) => {
  try {
    // Send an initial response before executing executeNotificationSendingExample
    res.write("Sending notifications...");

    // Execute notification sending example
    await executeNotificationSendingExample();

    // Send a final response after the execution is complete
    res.write("All Notifications sent successfully!!");
    res.end();
  } catch (error) {
    // Handle errors and send an error response
    console.error("Error sending notifications:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Simulation of retry mechanism
app.get("/retry", async (req: Request, res: Response) => {
  res.send("Retry Mechanism simulated");
  await simulateRetry();
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
