import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cron from "node-cron";

import scoreboardRoutes from "./routes/scoreboardRoutes.js";
import aqiRoutes from "./routes/aqiRoutes.js";
import {
  updateUpcoming,
  updatePointTable,
  updateLive,
} from "./jobs/scoreboardJobs.js";

import { updateAQI } from "./jobs/aqiJobs.js";

// ------------------
dotenv.config();
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

// ------------------
// ROUTES
// ------------------
app.use("/api/scoreboard", scoreboardRoutes);
app.use("/api/aqi", aqiRoutes);

// ------------------
// CRONS
// ------------------

// run once on start
updateUpcoming();
updatePointTable();
updateLive();
updateAQI();
// daily
cron.schedule("10 0 * * *", updateUpcoming);
cron.schedule("15 0 * * *", updatePointTable);

// live every 10 sec
cron.schedule("*/10 * * * * *", updateLive);
// Every 1 hour
cron.schedule("0 0 * * * *", updateAQI);
// ------------------
app.get("/", (req, res) => {
  res.send("Middleware API running 🚀");
});

// ------------------
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`🚀 Middleware server running on port ${PORT}`);
});
