import catchAsync from "../lib/catchAsync.js";
import TimeSlot from "../models/timeslot.model.js";
import Schedule from "../models/schedule.model.js";

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

  const slots = generateTimeSlots(
    daySchedule.openingTime,
    daySchedule.closingTime,
    daySchedule.slotDuration,
    daySchedule.bufferTime,
  );

  const existingSlots = await TimeSlot.find({
    ...query,
    date: queryDate,
    startTime: { $in: slots.map((s) => s.startTime) },
    endTime: { $in: slots.map((s) => s.endTime) },
  });

  const existingSlotMap = {};
  existingSlots.forEach((slot) => {
    const key = `${slot.startTime}-${slot.endTime}`;
    existingSlotMap[key] = slot;
  });

  const finalSlots = [];
  for (const templateSlot of slots) {
    const key = `${templateSlot.startTime}-${templateSlot.endTime}`;

    if (existingSlotMap[key]) {
      finalSlots.push(existingSlotMap[key]);
    } else {
      const newSlot = await TimeSlot.create({
        date: queryDate,
        startTime: templateSlot.startTime,
        endTime: templateSlot.endTime,
      });
      finalSlots.push(newSlot);
    }
  }

  const availableSlots = finalSlots.filter(
    (slot) => !slot.isBooked || slot.isLocked,
  );

  res.status(200).json({
    success: true,
    message: `Found ${availableSlots.length} available slots`,
    data: user.role === "admin" ? finalSlots : availableSlots,
  });
});

const generateTimeSlots = (
  openingTime,
  closingTime,
  slotDuration,
  bufferTime,
) => {
  const slots = [];

  const [openHour, openMin] = openingTime.split(":").map(Number);
  const [closeHour, closeMin] = closingTime.split(":").map(Number);

  let currentTime = openHour * 60 + openMin;
  const endTime = closeHour * 60 + closeMin;

  while (currentTime + slotDuration <= endTime) {
    const startHour = Math.floor(currentTime / 60);
    const startMin = currentTime % 60;

    const endSlotTime = currentTime + slotDuration;
    const endHour = Math.floor(endSlotTime / 60);
    const endMin = endSlotTime % 60;

    slots.push({
      startTime: `${String(startHour).padStart(2, "0")}:${String(startMin).padStart(2, "0")}`,
      endTime: `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`,
    });

    currentTime += slotDuration + bufferTime;
  }

  return slots;
};

const lockTimeSlot = catchAsync(async (req, res) => {
  const { id } = req.params;
  const timeSlot = await TimeSlot.findByIdAndUpdate(
    id,
    { isLocked: true },
    { new: true },
  );
  res.status(200).json({
    success: true,
    message: "Time slot locked successfully",
    data: timeSlot,
  });
});

export { getAvailableSlots, lockTimeSlot };
