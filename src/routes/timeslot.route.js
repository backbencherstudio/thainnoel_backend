import express from "express";
import {
  getAvailableSlots,
  lockTimeSlot,
} from "../controllers/timeslot.controller.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/timeslot", getAvailableSlots);
router.get("/admin/timeslot", verifyAdmin, getAvailableSlots);
router.put("/admin/timeslot/locked", verifyAdmin, lockTimeSlot);

export default router;
