import mongoose from "mongoose";

const ConsultationSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    companyEmail: { type: String, required: true, lowercase: true, trim: true },
    service: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    slot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TimeSlot",
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

// Middleware to sync with TimeSlot model
ConsultationSchema.post("save", async function (doc) {
  if (doc.slot) {
    const TimeSlot = mongoose.model("TimeSlot");

    if (doc.status === "rejected") {
      await TimeSlot.findByIdAndUpdate(doc.slot, {
        $set: {
          isBooked: false,
          consultation: null,
        },
      });
    } else {
      await TimeSlot.findByIdAndUpdate(doc.slot, {
        $set: {
          isBooked: true,
          consultation: doc._id,
        },
      });
    }
  }
});

const Consultation =
  mongoose.models.Consultation ||
  mongoose.model("Consultation", ConsultationSchema);

export default Consultation;
