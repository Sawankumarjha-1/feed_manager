import axios from "axios";
import fs from "fs";
import path from "path";

export const STORE_DIR = path.join(process.cwd(), "store");

if (!fs.existsSync(STORE_DIR)) fs.mkdirSync(STORE_DIR);

export const UPCOMING_FILE = path.join(STORE_DIR, "upcoming.json");
export const POINTS_FILE = path.join(STORE_DIR, "pointtable.json");
export const LIVE_FILE = path.join(STORE_DIR, "live.json");
export const AQI_FILE = path.join(STORE_DIR, "weather.json");
export async function fetchExternal(url) {
  const { data } = await axios.get(url, { timeout: 15000 });
  return data;
}

export function writeJSON(file, data) {
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

export function readJSON(file) {
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}
