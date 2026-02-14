import { Worker } from "bullmq";
import IORedis from "ioredis";
import { sendEmail } from "../services/email.service.js";

const connection = new IORedis(
  process.env.REDIS_URL || "redis://localhost:6379",
  {
    maxRetriesPerRequest: null,
  },
);

const emailWorker = new Worker(
  "email-queue",
  async (job) => {
    const { to, bcc, cc, subject, htmlContent } = job.data;
    console.log(
      `Processing email job for ${to} (CC: ${cc?.length || 0}, BCC: ${bcc?.length || 0})`,
    );
    try {
      // Pass BCC and CC to sendEmail function
      await sendEmail(to, subject, htmlContent, bcc, cc);
      console.log(`Email sent successfully`);
    } catch (error) {
      console.error(`Failed to send email:`, error);
      throw error;
    }
  },
  { connection },
);

emailWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed!`);
});

emailWorker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed with ${err.message}`);
});

export default emailWorker;
