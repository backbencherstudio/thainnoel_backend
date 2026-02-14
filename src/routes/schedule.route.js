import express from "express";
import {
  getAllSchedules,
  updateSchedule,
} from "../controllers/schedule.controller.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/schedule", verifyAdmin, getAllSchedules);
router.put("/schedule/:id", verifyAdmin, updateSchedule);

export default router;
