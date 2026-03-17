import axios from "axios";
import { writeJSON, AQI_FILE } from "../utils/fileHelpers.js";

export async function updateAQI() {
  try {
    const { data } = await axios.get(process.env.AQI_API, {
      headers: {
        Authorization: `Bearer ${process.env.AQI_TOKEN}`,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    });

    // ✅ Extract Mumbai data
    const mumbaiData = data?.data?.find(
      (item) => item.slug === "india/maharashtra/mumbai",
    );

    if (!mumbaiData) {
      console.log("⚠️ Mumbai data not found in API response");
      return;
    }

    // ✅ Save only Mumbai data
    writeJSON(AQI_FILE, mumbaiData);

    console.log("🌫️ Mumbai AQI updated");
  } catch (e) {
    if (e.code === "ECONNABORTED") {
      console.log("⏱️ AQI request timed out");
    } else {
      console.log("❌ AQI failed:", e.message);
    }
  }
}
