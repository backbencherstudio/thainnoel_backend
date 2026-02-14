import { sendConsultationToAdmin } from "../templates/consultation-admin.template.js";
import { sendConsultationToUser } from "../templates/consultation-user.template.js";
import nodemailer from "nodemailer";

// Admin email address for receiving consultation notifications
const ADMIN_EMAIL = "tqmhosain@gmail.com";

export const sendEmail = async (
  to,
  subject,
  htmlContent,
  bcc = [],
  cc = [],
) => {
  const mailTransporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    auth: {
      user: "tqmhosain@gmail.com",
      pass: "meie ueco tptd evod",
    },
  });

  const mailOptions = {
    from: `"Optivo Solutions" <tqmhosain@gmail.com>`,
    to,
    bcc,
    cc,
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
  date,
  time,
) => {
  const htmlContent = sendConsultationToUser({
    firstName,
    lastName,
    company,
    email,
    service,
    date,
    time,
  });
  await sendEmail(email, "Optivo Solutions", htmlContent);
};

export const consultationEmailToAdmin = async (
  firstName,
  lastName,
  company,
  email,
  service,
  date,
  time,
  message = "",
  timezone = "",
) => {
  const htmlContent = sendConsultationToAdmin({
    firstName,
    lastName,
    company,
    email,
    service,
    date,
    time,
    message,
    timezone,
  });
  await sendEmail(
    "shurov.bbs@gmail.com",
    "New Consultation Request - Optivo Solutions",
    htmlContent,
  );
};
