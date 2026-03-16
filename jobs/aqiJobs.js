import { writeJSON, AQI_FILE } from "../utils/fileHelpers.js";

export async function updateAQI() {
  try {
    const res = await fetch(process.env.AQI_API, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.AQI_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    writeJSON(AQI_FILE, data);

    console.log("🌫️ AQI updated");
  } catch (e) {
    console.log("❌ AQI failed:", e.message);
  }
}
