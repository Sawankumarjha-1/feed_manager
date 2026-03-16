import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cron from "node-cron";

import scoreboardRoutes from "./routes/scoreboardRoutes.js";

import {
  updateUpcoming,
  updatePointTable,
  updateLive,
} from "./jobs/scoreboardJobs.js";

// ------------------
dotenv.config();
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

// ------------------
// ROUTES
// ------------------
app.use("/api/scoreboard", scoreboardRoutes);

// ------------------
// CRONS
// ------------------

// run once on start
updateUpcoming();
updatePointTable();
updateLive();

// daily
cron.schedule("10 0 * * *", updateUpcoming);
cron.schedule("15 0 * * *", updatePointTable);
//every 1 min
cron.schedule("0 */1 * * * *", updateLive);

// ------------------
app.get("/", (req, res) => {
  res.send("Middleware API running 🚀");
});

// ------------------
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`🚀 Middleware server running on port ${PORT}`);
});
