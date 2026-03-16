import { fetchExternal, writeJSON, AQI_FILE } from "../utils/fileHelpers.js";

export async function updateAQI() {
  try {
    const data = await fetchExternal(process.env.AQI_API);
    writeJSON(AQI_FILE, data);
    console.log("🌫️ AQI updated");
  } catch (e) {
    console.log("❌ AQI failed:", e.message);
  }
}
