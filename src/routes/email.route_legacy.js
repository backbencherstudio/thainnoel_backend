import express from "express";
import { sendEmail } from "../controllers/email.controller_legacy.js";

const router = express.Router();

router.post("/email", sendEmail);

export default router;
