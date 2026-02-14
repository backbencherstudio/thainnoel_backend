import express from "express";
import {
  getAvailableSlots,
  lockTimeSlot,
} from "../controllers/timeslot.controller.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/timeslot", getAvailableSlots);
router.get("/timeslot/all", verifyAdmin, getAvailableSlots);
router.put("/timeslot/:id", verifyAdmin, lockTimeSlot);

export default router;
