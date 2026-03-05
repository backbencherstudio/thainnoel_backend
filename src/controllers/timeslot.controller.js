import catchAsync from "../lib/catchAsync.js";
import TimeSlot from "../models/timeslot.model.js";
import Schedule from "../models/schedule.model.js";
import { fromZonedTime } from "date-fns-tz";
import { convertScheduleTime, convertIsoToTimezone } from "../lib/time.js";

const getAvailableSlots = catchAsync(async (req, res) => {
  const { date } = req.query;
  const status = req.query.status;
  const timezone = req.query.timezone || "Etc/UTC";
  const user = req.user;
  let query = {};

  if (status) {
    status == "booked"
      ? (query.isBooked = true)
      : "locked" && (query.isLocked = true);
  }

  if (!date) {
    return res.status(400).json({
      success: false,
      message: "Date parameter is required",
    });
  }

  // Parse the input date (which is usually local date "YYYY-MM-DD")
  // We want to find the day of week FOR THAT DATE in the REQUESTED TIMEZONE.
  // E.g. "2026-02-16" is Monday.
  const dateObj = new Date(date);

  // Normalize date to UTC midnight for database consistency query
  // This is used for querying the TimeSlot collection
  const queryDate = new Date(date);
  queryDate.setUTCHours(0, 0, 0, 0);

  const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const dayName = dayNames[dateObj.getUTCDay()];

  const schedule = await Schedule.findOne();
  if (!schedule || !schedule[dayName]) {
    return res.status(404).json({
      success: false,
      message: "Schedule not configured",
    });
  }

  const daySchedule = schedule[dayName];

  if (!daySchedule.isOpen) {
    return res.status(200).json({
      success: true,
      message: `Office is closed on ${dayName}s`,
      data: [],
    });
  }

  // Ensure dateStr is just YYYY-MM-DD
  const dateStr = date.includes("T") ? date.split("T")[0] : date;

  /* 
     Logic:
     1. Stored openingTime/closingTime are in UTC (e.g., "03:00" for 9am Dhaka).
     2. We need to generate slots for the requested "date" in the requested "timezone".
     3. Convert UTC times back to the requested timezone to get local hours.
     4. Construct the full Date objects for start/end in UTC.
  */

  const slots = generateTimeSlots(
    dateStr, // "YYYY-MM-DD" string
    daySchedule.openingTime, // UTC "HH:mm"
    daySchedule.closingTime, // UTC "HH:mm"
    daySchedule.slotDuration,
    daySchedule.bufferTime,
    timezone,
  );

  // Query existing slots.
  // Since we are comparing exact Dates, we can use $in.
  const existingSlots = await TimeSlot.find({
    ...query,
    date: queryDate,
    startTime: { $in: slots.map((s) => s.startTime) },
    endTime: { $in: slots.map((s) => s.endTime) },
  }).select("-__v");

  const existingSlotMap = {};
  existingSlots.forEach((slot) => {
    // create a key based on time (ISO string or getTime)
    const key = `${slot.startTime.toISOString()}-${slot.endTime.toISOString()}`;
    existingSlotMap[key] = slot;
  });

  const finalSlots = [];
  for (const templateSlot of slots) {
    const key = `${templateSlot.startTime.toISOString()}-${templateSlot.endTime.toISOString()}`;

    if (existingSlotMap[key]) {
      finalSlots.push(existingSlotMap[key]);
    } else {
      // Return a virtual slot object
      finalSlots.push({
        startTime: templateSlot.startTime,
        endTime: templateSlot.endTime,
        isBooked: false,
        isLocked: false,
        date: queryDate,
      });
    }
  }

  const availableSlots = finalSlots.filter(
    (slot) => !slot.isBooked || slot.isLocked,
  );

  const formatResponseSlot = (slot) => {
    const s = slot.toObject ? slot.toObject() : { ...slot };
    return {
      ...s,
      startTime: convertIsoToTimezone(s.startTime, timezone),
      endTime: convertIsoToTimezone(s.endTime, timezone),
    };
  };

  const responseData = (
    user?.role === "admin" ? finalSlots : availableSlots
  ).map(formatResponseSlot);

  res.status(200).json({
    success: true,
    message: `Found ${availableSlots.length} available slots`,
    data: responseData,
  });
});

const generateTimeSlots = (
  dateStr,
  openingTimeUtc,
  closingTimeUtc,
  slotDuration,
  bufferTime,
  timeZone,
) => {
  const slots = [];

  // Convert stored UTC times to local times in the target timezone
  // e.g. "03:00" (UTC) -> "09:00" (Dhaka)
  const localOpeningTime = convertScheduleTime(
    openingTimeUtc,
    "Etc/UTC",
    timeZone,
  );
  const localClosingTime = convertScheduleTime(
    closingTimeUtc,
    "Etc/UTC",
    timeZone,
  );

  // Helper to parse "09:00" string into Date object based on baseDate and Timezone
  const getTimeDate = (timeStr) => {
    // Construct "YYYY-MM-DDTHH:mm:00"
    const dateTimeStr = `${dateStr}T${timeStr}:00`;
    // Parse it as being in the target timezone -> returns UTC Date
    return fromZonedTime(dateTimeStr, timeZone);
  };

  const openTime = getTimeDate(localOpeningTime);
  let closeTime = getTimeDate(localClosingTime);

  if (closeTime < openTime) {
    closeTime = new Date(closeTime.getTime() + 24 * 60 * 60 * 1000);
  }

  let currentTime = new Date(openTime);

  while (currentTime.getTime() + slotDuration * 60000 <= closeTime.getTime()) {
    const startTime = new Date(currentTime);
    const endTime = new Date(currentTime.getTime() + slotDuration * 60000);

    slots.push({
      startTime: startTime,
      endTime: endTime,
    });

    currentTime = new Date(
      currentTime.getTime() + (slotDuration + bufferTime) * 60000,
    );
  }

  return slots;
};

const lockTimeSlot = catchAsync(async (req, res) => {
  const { id, date, startTime, endTime } = req.body;
  const timezone = req.body.timezone || "Etc/UTC";

  let timeSlot;

  if (id) {
    timeSlot = await TimeSlot.findByIdAndUpdate(
      id,
      { $set: { isLocked: true } },
      { new: true },
    );
  } else if (date && startTime && endTime) {
    // Parse the date (assume incoming date is for the requested timezone)
    // We need to store the UTC midnight for querying

    // However, the `date` field in TimeSlot is stored as normalized UTC date (midnight UTC).
    // The incoming `date` string (formatted YYYY-MM-DD) represents the local "day".
    // Let's rely on the date string itself for now, but really we should probably derive it from startTime if possible.
    // For now, let's stick to existing logic for `date` field query:
    const queryDate = new Date(date);
    queryDate.setUTCHours(0, 0, 0, 0);

    // Convert startTime and endTime (assumed to be in `timezone`) to UTC Date objects
    // If they come as ISO strings like "2026-02-16T09:00:00", fromZonedTime handles them.
    const start = fromZonedTime(startTime, timezone);
    const end = fromZonedTime(endTime, timezone);

    timeSlot = await TimeSlot.findOneAndUpdate(
      { date: queryDate, startTime: start, endTime: end },
      { $set: { isLocked: true } },
      { new: true },
    );

    if (!timeSlot) {
      timeSlot = await TimeSlot.create({
        date: queryDate,
        startTime: start,
        endTime: end,
        isLocked: true,
      });
      return res.status(200).json({
        success: true,
        message: "Time slot created and locked successfully",
        data: timeSlot,
      });
    }
  }

  if (!timeSlot) {
    return res.status(404).json({
      success: false,
      message: "Time slot not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Time slot locked successfully",
    data: timeSlot,
  });
});

export { getAvailableSlots, lockTimeSlot };
