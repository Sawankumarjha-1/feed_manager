import express from "express";
import { readJSON, AQI_FILE } from "../utils/fileHelpers.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json(readJSON(AQI_FILE) || { status: "waiting_for_data" });
});

export default router;
