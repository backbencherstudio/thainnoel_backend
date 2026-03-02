import express from "express";
import { login } from "../controllers/auth.controller.js";
import { forgotPasswordRequest } from "../controllers/auth.controller.js";
import { resetPassword } from "../controllers/auth.controller.js";
import { updateProfile } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/auth/login", login);
router.post("/auth/forgot-password-request", forgotPasswordRequest);
router.post("/auth/reset-password", resetPassword);
router.post("/auth/update-profile", updateProfile);


export default router;
