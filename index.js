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
// POINT TABLE (PER MATCH)
// ------------------
async function updatePointTable(matchid) {
  if (!matchid) return;

  try {
    const url = process.env.POINTTABLE_API + matchid + "_table?json=1";

    const data = await fetchExternal(url);

    const file = path.join(STORE_DIR, `pointtable_${matchid}.json`);

    writeJSON(file, data);
    console.log(`✅ Point table updated (${matchid})`);
  } catch (e) {
    console.log(`❌ Point table failed (${matchid}):`, e.message);
  }
}

// ------------------
// CRONS
// ------------------

// run once on server start
updateUpcoming();
updateLive();

// once per day
cron.schedule("10 0 * * *", updateUpcoming);

// live every 10 seconds
cron.schedule("*/10 * * * * *", updateLive);

// OPTIONAL: auto-update point table from live match
cron.schedule("*/30 * * * *", async () => {
  const live = readJSON(LIVE_FILE);
  const matchid = live?.data?.match_id;

  if (matchid) {
    updatePointTable(matchid);
  }
});

// ------------------
// ROUTES (for screens)
// ------------------

app.get("/api/scoreboard/upcoming", (req, res) => {
  res.json(readJSON(UPCOMING_FILE) || { status: "waiting_for_data" });
});

app.get("/api/scoreboard/live", (req, res) => {
  res.json(readJSON(LIVE_FILE) || { status: "waiting_for_data" });
});

app.get("/api/scoreboard/pointtable/:matchid", async (req, res) => {
  const { matchid } = req.params;

  const file = path.join(STORE_DIR, `pointtable_${matchid}.json`);

  // serve cached if exists
  if (fs.existsSync(file)) {
    return res.json(readJSON(file));
  }

  // else fetch fresh
  try {
    await updatePointTable(matchid);
    res.json(readJSON(file) || { status: "waiting_for_data" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
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
