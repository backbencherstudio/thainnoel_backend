import { Types } from "mongoose";
import catchAsync from "../lib/catchAsync.js";
import SubscriptionMail from "../models/subscriptionmail.model.js";
import { emailQueue } from "../lib/queue.js";
import Subscriber from "../models/subscriber.model.js";
import { convertIsoToTimezone } from "../lib/time.js";

const getAllSubscribers = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  const subscribers = await Subscriber.find({
    email: { $regex: search, $options: "i" },
  })
    .select("-__v")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
  const total = await Subscriber.countDocuments({
    email: { $regex: search, $options: "i" },
  });
  res.status(200).json({
    success: true,
    message: "Subscribers fetched successfully",
    data: subscribers,
    meta_data: {
      page: Number(page),
      limit: Number(limit),
      total,
    },
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

const subscribe = catchAsync(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }
  const existingSubscriber = await Subscriber.findOne({ email });

  const subscriber = existingSubscriber
    ? await Subscriber.findOneAndUpdate(
        { email },
        { $set: { isSubscribed: true } },
        { new: true },
      )
    : await Subscriber.create({ email });
  res.status(200).json({
    success: true,
    message: "Subscribed successfully",
  });
});

const getAllNewsletters = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, timezone = "Etc/UTC" } = req.query;

  const newsletters = await SubscriptionMail.find()
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  const total = await SubscriptionMail.countDocuments();

  const formattedNewsletters = newsletters.map((newsletter) => ({
    ...newsletter,
    sentAt: convertIsoToTimezone(newsletter.sentAt, timezone),
    createdAt: convertIsoToTimezone(newsletter.createdAt, timezone),
  }));

  res.status(200).json({
    success: true,
    message: "Newsletters fetched successfully",
    data: formattedNewsletters,
    meta_data: {
      page: Number(page),
      limit: Number(limit),
      total,
    },
  });
});

export { getAllSubscribers, sendEmail, subscribe, getAllNewsletters };
