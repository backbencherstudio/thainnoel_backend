import express from "express";
import {
  getMessages,
  createMessage,
  deleteMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/messages", getMessages);
router.post("/message", createMessage);
router.delete("/messages/:id", deleteMessage);

export default router;
