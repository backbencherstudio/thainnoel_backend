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
      message,
      timezone,
    } = req.body;

    const missingField = [
      "firstName",
      "lastName",
      "email",
      "service",
      "datetime",
    ].find((field) => !req.body[field]);
    if (missingField) {
      return res.status(400).send({
        success: false,
        message: `${missingField} is required!`,
      });
    }

    consultationEmailToUser(
      firstName,
      lastName,
      company,
      email,
      service,
      datetime,
    );
    consultationEmailToAdmin(
      firstName,
      lastName,
      company,
      email,
      service,
      datetime,
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
        datetime,
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
