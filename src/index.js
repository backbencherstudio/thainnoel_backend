import "dotenv/config";
import express from "express";
import cors from "cors";
import db_connect from "./config/db.config.js";
import messageRoutes from "./routes/message.route_legacy.js";
import emailRoutes from "./routes/email.route_legacy.js";
import consultationRoutes from "./routes/consultation.route.js";
import authRoutes from "./routes/auth.route.js";
import contactRoutes from "./routes/contact.route.js";
import scheduleRoutes from "./routes/schedule.route.js";
import timeSlotRoutes from "./routes/timeSlot.route.js";
import newsLetterRoutes from "./routes/newsletter.route.js";
import "./workers/email.worker.js";

import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/error.middleware.js";

const app = express();

// CORS middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
  }),
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Home route
app.get("/", (req, res) => {
  res.send("Hello World");
});

// Register routes
app.use("/", messageRoutes);
app.use("/", emailRoutes);
app.use("/", consultationRoutes);
app.use("/", scheduleRoutes);
app.use("/", timeSlotRoutes);
app.use("/", newsLetterRoutes);
app.use("/", authRoutes);
app.use("/", contactRoutes);

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Error handling middleware - must be last
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
  db_connect();
});
