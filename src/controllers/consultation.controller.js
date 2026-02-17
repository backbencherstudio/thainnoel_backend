import catchAsync from "../lib/catchAsync.js";
import TimeSlot from "../models/timeslot.model.js";
import Consultation from "../models/consultation.model.js";
import User from "../models/user.model.js";
import { emailQueue } from "../lib/queue.js";
import { sendConsultationToUser } from "../templates/consultation-user.template.js";
import { sendConsultationToAdmin } from "../templates/consultation-admin.template.js";
import { fromZonedTime } from "date-fns-tz";
import { convertIsoToTimezone } from "../lib/time.js";

const bookConsultation = catchAsync(async (req, res) => {
  const { firstName, lastName, company, companyEmail, service, message, slot } =
    req.body;

  const timezone = req.query.timezone || req.body.timezone || "Etc/UTC";

  // 1. Basic Validation
  const requiredFields = [
    "firstName",
    "lastName",
    "company",
    "companyEmail",
    "service",
    "message",
    "slot",
  ];
  const missingFields = requiredFields.filter((field) => !req.body[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing fields: ${missingFields.join(", ")}`,
    });
  }

  // 2. Handle TimeSlot (Find or Create)
  let targetSlot;

  if (slot.id) {
    targetSlot = await TimeSlot.findById(slot.id);
  } else if (slot.startTime && slot.endTime && slot.date) {
    // Normalize date to UTC midnight to avoid timezone mismatches
    const queryDate = new Date(slot.date);
    queryDate.setUTCHours(0, 0, 0, 0);

    // Convert startTime and endTime from request timezone to UTC
    const start = fromZonedTime(slot.startTime, timezone);
    const end = fromZonedTime(slot.endTime, timezone);

    targetSlot = await TimeSlot.findOne({
      date: queryDate,
      startTime: start,
      endTime: end,
    });

    if (!targetSlot) {
      // Create new slot if it doesn't exist
      targetSlot = await TimeSlot.create({
        date: queryDate,
        startTime: start,
        endTime: end,
      });
    }
  }

  if (!targetSlot) {
    return res.status(400).json({
      success: false,
      message: "Invalid slot information provided",
    });
  }

  // 3. CRITICAL CHECK: Verify if already booked
  if (targetSlot.isBooked || targetSlot.consultation) {
    return res.status(400).json({
      success: false,
      message: "This time slot is already booked and no longer available",
    });
  }

  // 4. Create Consultation
  const consultation = await Consultation.create({
    firstName,
    lastName,
    company,
    companyEmail,
    service,
    message,
    slot: targetSlot._id,
    timezone,
  });

  // 5. Queue Email Notifications
  // Format date and time for emails using the user's timezone
  // We explicitly format the UTC dates from the slot to the user's timezone
  const formattedDate = convertIsoToTimezone(
    targetSlot.startTime,
    timezone,
    "dd/MM/yyyy",
  );
  const formattedStartTime = convertIsoToTimezone(
    targetSlot.startTime,
    timezone,
    "HH:mm",
  );
  const formattedEndTime = convertIsoToTimezone(
    targetSlot.endTime,
    timezone,
    "HH:mm",
  );

  const consultationTime = `${formattedStartTime} - ${formattedEndTime}`;

  // 5a. Send Confirmation to Client
  const clientHtml = sendConsultationToUser({
    firstName,
    lastName,
    company,
    email: companyEmail,
    service,
    timezone,
    date: formattedDate,
    time: consultationTime,
  });

  await emailQueue.add("send-email", {
    to: companyEmail,
    subject: "Consultation Confirmation - Optivo Solutions",
    htmlContent: clientHtml,
  });

  // 5b. Send Notification to Admins
  const admins = await User.find({ role: "admin" });
  if (admins.length > 0) {
    const adminEmails = admins.map((admin) => admin.email);
    const to = adminEmails[0];
    const cc = adminEmails.slice(1);

    const adminHtml = sendConsultationToAdmin({
      firstName,
      lastName,
      company,
      email: companyEmail,
      service,
      date: formattedDate,
      time: consultationTime,
      message,
    });

    await emailQueue.add("send-email", {
      to,
      cc,
      subject: "New Consultation Request - Optivo Solutions",
      htmlContent: adminHtml,
    });
  }

  // 6. Mark Slot as Booked
  targetSlot.isBooked = true;
  targetSlot.consultation = consultation._id;
  await targetSlot.save();

  return res.status(201).json({
    success: true,
    message: "Consultation booked successfully",
    data: consultation,
  });
});

const getAllBookedConsultations = catchAsync(async (req, res) => {
  const {
    status,
    page = 1,
    limit = 10,
    search,
    timezone = "Etc/UTC",
  } = req.query;
  const query = {};
  if (status) {
    query.status = status;
  }
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
      { companyEmail: { $regex: search, $options: "i" } },
      { service: { $regex: search, $options: "i" } },
      { message: { $regex: search, $options: "i" } },
    ];
  }
  const consultations = await Consultation.find(query)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("slot", "startTime endTime isBooked")
    .select("-__v")
    .sort({ createdAt: -1 })
    .lean(); // Use lean to easily modify the result

  const total = await Consultation.countDocuments(query);

  const formattedConsultations = consultations.map((consultation) => {
    if (consultation.slot) {
      consultation.slot.startTime = convertIsoToTimezone(
        consultation.slot.startTime,
        timezone,
      );
      consultation.slot.endTime = convertIsoToTimezone(
        consultation.slot.endTime,
        timezone,
      );
    }
    return consultation;
  });

  return res.status(200).json({
    success: true,
    data: formattedConsultations,
    meta_data: {
      page,
      limit,
      total,
    },
  });
});

export { bookConsultation, getAllBookedConsultations };
