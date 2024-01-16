import express, { Express, Request, Response } from "express";
import { executeSampleJobs } from "./example";
import { executeNotificationSendingExample } from "./notificationSendingExample";

const app: Express = express();
const port = 7000;

app.get("/", async (req: Request, res: Response) => {
  res.send("Hello world!!!");
  executeSampleJobs();
});

app.get("/send-notification", async (req: Request, res: Response) => {
  res.status(200).json({ message: "Notification jobs enqueued successfully" });
  await executeNotificationSendingExample();
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
