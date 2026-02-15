import catchAsync from "../lib/catchAsync.js";
import Schedule from "../models/schedule.model.js";

const getAllSchedules = catchAsync(async (req, res) => {
  const schedules = await Schedule.find();
  res.status(200).json({ success: true, data: schedules });
});

const getAllSchedulesPublic = catchAsync(async (req, res) => {
  const schedules = await Schedule.find()
    .select(
      "-_id saturday.isOpen sunday.isOpen monday.isOpen tuesday.isOpen wednesday.isOpen thursday.isOpen friday.isOpen",
    )
    .lean();
  res.status(200).json({ success: true, data: schedules[0] });
});

const updateSchedule = catchAsync(async (req, res) => {
  const body = req.body;
  if (
    !body.saturday ||
    !body.sunday ||
    !body.monday ||
    !body.tuesday ||
    !body.wednesday ||
    !body.thursday ||
    !body.friday ||
    !body.timezone
  ) {
    return res.status(400).json({
      success: false,
      message: "invalid data",
    });
  }
  const schedule = await Schedule.findByIdAndUpdate(
    req.params.id,
    { $set: body },
    {
      new: true,
      runValidators: true,
    },
  );
  res.status(200).json({ success: true, data: schedule });
});

export { getAllSchedules, updateSchedule, getAllSchedulesPublic };
