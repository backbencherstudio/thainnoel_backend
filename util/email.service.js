import {
  sendConsultationToAdmin,
  sendConsultationToUser,
} from "./email_templates.js";
import nodemailer from "nodemailer";

// Admin email address for receiving consultation notifications
const ADMIN_EMAIL = "tqmhosain@gmail.com";

export const sendEmail = async (to, subject, htmlContent) => {
  const mailTransporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    auth: {
      user: "tqmhosain@gmail.com",
      pass: "meie ueco tptd evod",
    },
  });

  const mailOptions = {
    from: `"Consultation Confirmation" <tqmhosain@gmail.com>`,
    to,
    subject,
    html: htmlContent,
  };

  await mailTransporter.sendMail(mailOptions);
};

export const consultationEmailToUser = async (
  firstName,
  lastName,
  company,
  email,
  service,
  datetime
) => {
  const htmlContent = sendConsultationToUser(
    firstName,
    lastName,
    company,
    email,
    service,
    datetime
  );
  await sendEmail(email, "Optivo Solutions", htmlContent);
};

export const consultationEmailToAdmin = async (
  firstName,
  lastName,
  company,
  email,
  service,
  datetime,
  message = "",
  timezone = ""
) => {
  const htmlContent = sendConsultationToAdmin(
    firstName,
    lastName,
    company,
    email,
    service,
    datetime,
    message,
    timezone
  );
  await sendEmail(
    'shurov.bbs@gmail.com',
    "New Consultation Request - Optivo Solutions",
    htmlContent
  );
};
