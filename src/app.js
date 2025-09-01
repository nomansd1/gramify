import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { CORS_ORIGIN } from "./utils/constants.js";
import { startCronJobs, stopCronJobs } from "./jobs/cron.js";

const app = express();

app.use(cors({
    origin: CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// importing api router
import apiRouter from "./routes/index.js";

app.use("/api", apiRouter);


// Execute Cron Jobs
startCronJobs();

// Gracefully Shutdown Cron Jobs
process.on('SIGINT', () => {
    console.log("SIGINT recieved gracefully shutting down ...");
    stopCronJobs();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log("SIGTERM recieved gracefully shutting down ...");
    stopCronJobs();
    process.exit(0);
});

export default app;