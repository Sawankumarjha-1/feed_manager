// middlewareServer.js

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cron from "node-cron";
import axios from "axios";
import fs from "fs";
import path from "path";

// ------------------
// BASIC SETUP
// ------------------
dotenv.config();
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

// ------------------
// FILE PATHS
// ------------------
const STORE_DIR = path.join(process.cwd(), "store");
if (!fs.existsSync(STORE_DIR)) fs.mkdirSync(STORE_DIR);

const UPCOMING_FILE = path.join(STORE_DIR, "upcoming.json");
const POINTS_FILE = path.join(STORE_DIR, "pointtable.json");
const LIVE_FILE = path.join(STORE_DIR, "live.json");

// ------------------
// HELPERS
// ------------------
async function fetchExternal(url) {
  const { data } = await axios.get(url, { timeout: 15000 });
  return data;
}

function writeJSON(file, data) {
  fs.writeFileSync(
    file,
    JSON.stringify(
      {
        updatedAt: new Date().toISOString(),
        data,
      },
      null,
      2,
    ),
  );
}

function readJSON(file) {
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

// ------------------
// JOBS
// ------------------
async function updateUpcoming() {
  try {
    const data = await fetchExternal(process.env.UPCOMING_API);
    writeJSON(UPCOMING_FILE, data);
    console.log("✅ Upcoming updated");
  } catch (e) {
    console.log("❌ Upcoming failed:", e.message);
  }
}

async function updatePointTable() {
  try {
    const data = await fetchExternal(process.env.POINTTABLE_API);
    writeJSON(POINTS_FILE, data);
    console.log("✅ Point table updated");
  } catch (e) {
    console.log("❌ Point table failed:", e.message);
  }
}

async function updateLive() {
  try {
    const data = await fetchExternal(process.env.LIVE_API);
    writeJSON(LIVE_FILE, data);
    console.log("⚡ Live score updated");
  } catch (e) {
    console.log("❌ Live failed:", e.message);
  }
}

// ------------------
// CRONS
// ------------------

// run once on server start
updateUpcoming();
updatePointTable();
updateLive();

// once per day
cron.schedule("10 0 * * *", updateUpcoming);
cron.schedule("15 0 * * *", updatePointTable);

// live every 10 seconds
cron.schedule("*/10 * * * * *", updateLive);

// ------------------
// ROUTES (for screens)
// ------------------

app.get("/api/scoreboard/upcoming", (req, res) => {
  res.json(readJSON(UPCOMING_FILE) || { status: "waiting_for_data" });
});

app.get("/api/scoreboard/pointtable", (req, res) => {
  res.json(readJSON(POINTS_FILE) || { status: "waiting_for_data" });
});

app.get("/api/scoreboard/live", (req, res) => {
  res.json(readJSON(LIVE_FILE) || { status: "waiting_for_data" });
});

// ------------------
app.get("/", (req, res) => {
  res.send("Middleware API running 🚀");
});

// ------------------
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`🚀 Middleware server running on port ${PORT}`);
});
