import express from "express";
import {
  readJSON,
  UPCOMING_FILE,
  POINTS_FILE,
  LIVE_FILE,
} from "../utils/fileHelpers.js";

const router = express.Router();

router.get("/upcoming", (req, res) => {
  res.json(readJSON(UPCOMING_FILE) || { status: "waiting_for_data" });
});

router.get("/pointtable", (req, res) => {
  res.json(readJSON(POINTS_FILE) || { status: "waiting_for_data" });
});

router.get("/live", (req, res) => {
  res.json(readJSON(LIVE_FILE) || { status: "waiting_for_data" });
});

export default router;
