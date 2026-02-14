import express from "express";
import {
  bookConsultation,
  getAllBookedConsultations,
} from "../controllers/consultation.controller.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/consultation/book", bookConsultation);
router.get("/consultation/all", verifyAdmin, getAllBookedConsultations);

export default router;
