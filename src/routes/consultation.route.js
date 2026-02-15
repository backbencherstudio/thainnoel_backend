import express from "express";
import {
  bookConsultation,
  getAllBookedConsultations,
} from "../controllers/consultation.controller.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/consultation/book", bookConsultation);
router.get("/admin/consultation", verifyAdmin, getAllBookedConsultations);

export default router;
