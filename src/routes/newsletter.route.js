import express from "express";
import {
  getAllSubscribers,
  sendEmail,
  subscribe,
} from "../controllers/newsletter.controller.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/newsletter/subscribe", subscribe);
router.post("/admin/newsletter/send", verifyAdmin, sendEmail);
router.get("/admin/newsletter/subscribers", verifyAdmin, getAllSubscribers);

export default router;
