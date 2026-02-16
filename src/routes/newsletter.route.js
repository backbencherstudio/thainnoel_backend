import express from "express";
import {
  getAllSubscribers,
  sendEmail,
  subscribe,
  getAllNewsletters,
} from "../controllers/newsletter.controller.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/newsletter/subscribe", subscribe);
router.post("/admin/newsletter/send", verifyAdmin, sendEmail);
router.get("/admin/newsletter/subscribers", verifyAdmin, getAllSubscribers);
router.get("/admin/newsletter/history", verifyAdmin, getAllNewsletters);

export default router;
