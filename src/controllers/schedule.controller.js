import { convertScheduleTime } from "../lib/time.js";
import catchAsync from "../lib/catchAsync.js";
import Schedule from "../models/schedule.model.js";

const processScheduleForResponse = (schedule, timeZone) => {
  if (!schedule || !timeZone || timeZone === "Etc/UTC") return schedule;

  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  const processed = schedule.toObject ? schedule.toObject() : { ...schedule };

  days.forEach((day) => {
    if (processed[day]) {
      if (processed[day].openingTime) {
        processed[day].openingTime = convertScheduleTime(
          processed[day].openingTime,
          "Etc/UTC",
          timeZone,
        );
      }
      if (processed[day].closingTime) {
        processed[day].closingTime = convertScheduleTime(
          processed[day].closingTime,
          "Etc/UTC",
          timeZone,
        );
      }
    }
  });
  return processed;
};

const getAllSchedules = catchAsync(async (req, res) => {
  const timezone = req.query.timezone;
  const schedules = await Schedule.find();

  let data = schedules;
  if (timezone) {
    data = schedules.map((s) => processScheduleForResponse(s, timezone));
  }

  res.status(200).json({ success: true, data });
});

const getAllSchedulesPublic = catchAsync(async (req, res) => {
  const timezone = req.query.timezone;
  const schedules = await Schedule.find()
    .select(
      "-_id saturday.isOpen sunday.isOpen monday.isOpen tuesday.isOpen wednesday.isOpen thursday.isOpen friday.isOpen",
    )
    .lean();

  let data = schedules[0];
  if (data && timezone) {
    data = processScheduleForResponse(data, timezone);
  }

  res.status(200).json({ success: true, data });
});

const updateSchedule = catchAsync(async (req, res) => {
  const body = req.body;
  const timezone = req.query.timezone || body.timezone || "Etc/UTC";

  if (
    !body.saturday ||
    !body.sunday ||
    !body.monday ||
    !body.tuesday ||
    !body.wednesday ||
    !body.thursday ||
    !body.friday ||
    !timezone
  ) {
    return res.status(400).json({
      success: false,
      message: "invalid data",
    });
  }

  // Helper to process a day object
  const processDay = (dayData) => {
    const processed = { ...dayData };
    if (processed.openingTime) {
      processed.openingTime = convertScheduleTime(
        processed.openingTime,
        timezone,
        "Etc/UTC",
      );
    }
    if (processed.closingTime) {
      processed.closingTime = convertScheduleTime(
        processed.closingTime,
        timezone,
        "Etc/UTC",
      );
    }
    return processed;
  };

  const updateData = { ...body };
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  days.forEach((day) => {
    if (updateData[day]) {
      updateData[day] = processDay(updateData[day]);
    }
  });

  const schedule = await Schedule.findOneAndUpdate(
    {}, // Find any (or the first one)
    { $set: updateData },
    {
      new: true,
      upsert: true, // Create if not exists
      runValidators: true,
    },
  );

  // Return the schedule with times converted back to the requested timezone
  const responseData = processScheduleForResponse(schedule, timezone);

  res.status(200).json({ success: true, data: responseData });
});

export { getAllSchedules, updateSchedule, getAllSchedulesPublic };
