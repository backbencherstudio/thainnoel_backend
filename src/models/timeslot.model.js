import mongoose from "mongoose";

const TimeSlotSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
    isBooked: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false },
    consultation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Consultation",
      default: null,
    },
  },
  { timestamps: true },
);

const TimeSlot =
  mongoose.models.TimeSlot || mongoose.model("TimeSlot", TimeSlotSchema);

export default TimeSlot;
