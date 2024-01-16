import express, { Express, Request, Response } from "express";
import { executeSampleJobs } from "./example";

const app: Express = express();
const port = 7000;

app.get("/", async (req: Request, res: Response) => {
  res.send("Hello world!!!");
  executeSampleJobs();
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
