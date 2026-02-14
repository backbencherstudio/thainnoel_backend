import { Types } from "mongoose";
import catchAsync from "../lib/catchAsync.js";
import Newsletter from "../models/newsletter.model.js";
import Subscriber from "../models/subscribers.model.js";
import SubscriptionMail from "../models/subscriptionmail.model.js";
import { emailQueue } from "../lib/queue.js";

const getAllSubscribers = catchAsync(async (req, res) => {
  const subscribers = await Newsletter.find();
  res.status(200).json({
    success: true,
    message: "Subscribers fetched successfully",
    data: subscribers,
  });
});

const sendEmail = catchAsync(async (req, res) => {
  const {
    subMailId,
    status = "draft",
    subject,
    message,
    subscribers,
  } = req.body;

  // 1. Validation
  if (!subscribers || subscribers.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No subscribers selected",
    });
  }

  // 2. Fetch Subscribers
  const allSubscribers = await Subscriber.find({
    _id: { $in: subscribers.map((id) => new Types.ObjectId(id)) },
  });

  if (!allSubscribers.length) {
    return res.status(404).json({
      success: false,
      message: "No valid subscribers found",
    });
  }

  let newsletter;

  // 3. Handle Draft Logic (Create or Update)
  if (subMailId) {
    // Update existing draft
    newsletter = await SubscriptionMail.findById(subMailId);
    if (!newsletter) {
      return res.status(404).json({
        success: false,
        message: "Draft not found",
      });
    }

    // Check if trying to edit an already sent/queued mail
    if (newsletter.status !== "draft" && status === "draft") {
      return res.status(400).json({
        success: false,
        message: "Cannot revert a sent/queued mail to draft",
      });
    }

    newsletter.subject = subject || newsletter.subject;
    newsletter.body = message || newsletter.body;
    newsletter.subscribers = allSubscribers.map((s) => s._id);
    newsletter.status = status;

    if (status !== "draft") {
      newsletter.sentAt = new Date();
    }

    await newsletter.save();
  } else {
    // Create new draft/mail

    // Check if any other draft exists (Singleton Draft Rule)
    if (status === "draft") {
      const existingDraft = await SubscriptionMail.findOne({ status: "draft" });
      if (existingDraft) {
        return res.status(400).json({
          success: false,
          message: "A draft already exists. Please edit or delete it first.",
          data: existingDraft,
        });
      }
    }

    newsletter = await SubscriptionMail.create({
      subject,
      body: message,
      status: status === "draft" ? "draft" : "queue",
      subscribers: allSubscribers.map((s) => s._id),
      sentAt: status !== "draft" ? new Date() : null,
    });
  }

  // 4. Queue Processing (Only if not draft)
  if (status !== "draft") {
    // Collect all email addresses
    const recipients = allSubscribers.map((s) => s.email);

    // Create a single job with BCC
    const job = {
      name: "send-email",
      data: {
        to: recipients[0],
        bcc: recipients.slice(1),
        subject: newsletter.subject,
        htmlContent: newsletter.body,
      },
    };

    await emailQueue.add(job.name, job.data);

    // Update status to 'queue' if it was sent
    if (newsletter.status !== "queue") {
      newsletter.status = "queue";
      await newsletter.save();
    }

    return res.status(200).json({
      success: true,
      message: `Queued email to ${recipients.length} subscribers (BCC)`,
      data: newsletter,
    });
  }

  // 5. Response for Draft
  res.status(200).json({
    success: true,
    message: "Draft saved successfully",
    data: newsletter,
  });
});

export { getAllSubscribers, sendEmail };
