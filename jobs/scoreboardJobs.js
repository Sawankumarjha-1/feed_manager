import {
  fetchExternal,
  writeJSON,
  UPCOMING_FILE,
  POINTS_FILE,
  LIVE_FILE,
} from "../utils/fileHelpers.js";

export async function updateUpcoming() {
  try {
    const data = await fetchExternal(process.env.UPCOMING_API);
    writeJSON(UPCOMING_FILE, data);
    console.log("✅ Upcoming updated");
  } catch (e) {
    console.log("❌ Upcoming failed:", e.message);
  }
}

export async function updatePointTable() {
  try {
    const data = await fetchExternal(process.env.POINTTABLE_API);
    writeJSON(POINTS_FILE, data);
    console.log("✅ Point table updated");
  } catch (e) {
    console.log("❌ Point table failed:", e.message);
  }
}

export async function updateLive() {
  try {
    const data = await fetchExternal(process.env.LIVE_API);
    writeJSON(LIVE_FILE, data);
    console.log("⚡ Live score updated");
  } catch (e) {
    console.log("❌ Live failed:", e.message);
  }
}
