import catchAsync from "../lib/catchAsync.js";
import TimeSlot from "../models/timeslot.model.js";
import Schedule from "../models/schedule.model.js";
import { fromZonedTime } from "date-fns-tz";

const getAvailableSlots = catchAsync(async (req, res) => {
  const { date } = req.query;
  const status = req.query.status;
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

  const dateObj = new Date(date);
  // Normalize date to UTC midnight for database consistency
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
  const dayName = dayNames[dateObj.getDay()];

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

  /* 
     Logic:
     1. Generate all possible slots as Date objects for the given date.
     2. Query DB to find existing slots (Booked/Locked) by matching startTime/endTime.
     3. Merge: If DB has it, use DB slot. Else, use the generated "virtual" slot.
  */

  const slots = generateTimeSlots(
    queryDate, // Pass base date
    daySchedule.openingTime,
    daySchedule.closingTime,
    daySchedule.slotDuration,
    daySchedule.bufferTime,
    schedule.timeZone || "UTC",
  );

  // Query existing slots.
  // Since we are comparing exact Dates, we can use $in.
  const existingSlots = await TimeSlot.find({
    ...query,
    date: queryDate,
    startTime: { $in: slots.map((s) => s.startTime) },
    endTime: { $in: slots.map((s) => s.endTime) },
  });

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

  res.status(200).json({
    success: true,
    message: `Found ${availableSlots.length} available slots`,
    data: user?.role === "admin" ? finalSlots : availableSlots,
  });
});

const generateTimeSlots = (
  baseDate,
  openingTime,
  closingTime,
  slotDuration,
  bufferTime,
  timeZone,
) => {
  const slots = [];

  // Helper to parse "09:00" string into Date object based on baseDate and Timezone
  const getTimeDate = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    // Format the date string as "YYYY-MM-DDTHH:mm:00" for local time in that timezone
    const year = baseDate.getUTCFullYear();
    const month = String(baseDate.getUTCMonth() + 1).padStart(2, "0");
    const day = String(baseDate.getUTCDate()).padStart(2, "0");
    const hourStr = String(hours).padStart(2, "0");
    const minuteStr = String(minutes).padStart(2, "0");

    const dateTimeStr = `${year}-${month}-${day}T${hourStr}:${minuteStr}:00`;

    // Convert this "local" time in the specific timezone to a UTC Date object
    return fromZonedTime(dateTimeStr, timeZone);
  };

  const openTime = getTimeDate(openingTime);
  const closeTime = getTimeDate(closingTime);

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

  let timeSlot;

  if (id) {
    timeSlot = await TimeSlot.findByIdAndUpdate(
      id,
      { $set: { isLocked: true } },
      { new: true },
    );
  } else if (date && startTime && endTime) {
    const queryDate = new Date(date);
    queryDate.setUTCHours(0, 0, 0, 0);

    // Ensure startTime/endTime are Date objects
    const start = new Date(startTime);
    const end = new Date(endTime);

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
