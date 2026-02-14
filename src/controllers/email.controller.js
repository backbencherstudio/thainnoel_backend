import {
  consultationEmailToUser,
  consultationEmailToAdmin,
} from "../services/email.service.js";

export const sendEmail = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      company,
      email,
      service,
      datetime,
      date,
      time,
      message,
      timezone,
    } = req.body;

    const missingField = ["firstName", "lastName", "email", "service"].find(
      (field) => !req.body[field],
    );

    if (missingField) {
      return res.status(400).send({
        success: false,
        message: `${missingField} is required!`,
      });
    }

    // Handle legacy datetime or separate date/time
    let finalDate = date;
    let finalTime = time;

    if (!finalDate && datetime) {
      // specific logic if needed, or just use datetime string as date
      finalDate = datetime;
      finalTime = "";
    }

    consultationEmailToUser(
      firstName,
      lastName,
      company,
      email,
      service,
      finalDate,
      finalTime,
    );
    consultationEmailToAdmin(
      firstName,
      lastName,
      company,
      email,
      service,
      finalDate,
      finalTime,
      message || "",
      timezone || "",
    );

    res.status(200).json({
      success: true,
      data: {
        firstName,
        lastName,
        company,
        email,
        service,
        date: finalDate,
        time: finalTime,
        message: message || "",
        timezone: timezone || "",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "internal server error",
      error: error.message,
    });
  }
};
