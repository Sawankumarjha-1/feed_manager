import axios from "axios";
import { writeJSON, AQI_FILE } from "../utils/fileHelpers.js";

export async function updateAQI() {
  try {
    const { data } = await axios.get(process.env.AQI_API, {
      headers: {
        Authorization: `Bearer ${process.env.AQI_TOKEN}`,
        "Content-Type": "application/json",
      },
      timeout: 15000, // 15 seconds
    });

    writeJSON(AQI_FILE, data);

    console.log("🌫️ AQI updated");
  } catch (e) {
    if (e.code === "ECONNABORTED") {
      console.log("⏱️ AQI request timed out");
    } else {
      console.log("❌ AQI failed:", e.message);
    }
  }
}
