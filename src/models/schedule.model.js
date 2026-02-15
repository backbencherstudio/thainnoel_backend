import mongoose from "mongoose";

const DayScheduleSchema = new mongoose.Schema(
  {
    isOpen: { type: Boolean, default: true },
    openingTime: { type: String, trim: true, default: "09:00" },
    closingTime: { type: String, trim: true, default: "18:00" },
    slotDuration: { type: Number, default: 30 },
    bufferTime: { type: Number, default: 15 },
  },
  { _id: false },
);

const ScheduleSchema = new mongoose.Schema(
  {
    timeZone: { type: String, trim: true, default: "UTC" },
    sunday: {
      type: DayScheduleSchema,
      default: {
        isOpen: false,
        openingTime: "",
        closingTime: "",
        slotDuration: 0,
        bufferTime: 0,
      },
    },
    monday: { type: DayScheduleSchema, default: {} },
    tuesday: { type: DayScheduleSchema, default: {} },
    wednesday: { type: DayScheduleSchema, default: {} },
    thursday: { type: DayScheduleSchema, default: {} },
    friday: { type: DayScheduleSchema, default: {} },
    saturday: { type: DayScheduleSchema, default: {} },
  },
  { timestamps: true },
);

const Schedule =
  mongoose.models.Schedule || mongoose.model("Schedule", ScheduleSchema);

export default Schedule;
