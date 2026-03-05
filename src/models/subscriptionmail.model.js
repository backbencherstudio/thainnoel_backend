import mongoose from "mongoose";

const SubscriptionMailSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["draft", "queue", "sent", "failed"],
      default: "draft",
    },
    sentAt: { type: Date, default: null },
    subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subscriber" }],
  },
  { timestamps: true },
);

const SubscriptionMail =
  mongoose.models.SubscriptionMail ||
  mongoose.model("SubscriptionMail", SubscriptionMailSchema);

export default SubscriptionMail;
