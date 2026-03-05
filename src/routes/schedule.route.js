import express from "express";
import {
  getAllSchedules,
  getAllSchedulesPublic,
  updateSchedule,
} from "../controllers/schedule.controller.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/schedule", getAllSchedulesPublic);
router.get("/admin/schedule", verifyAdmin, getAllSchedules);
router.put("/admin/schedule", verifyAdmin, updateSchedule);

export default router;
