import { sendConsultationToAdmin } from "../templates/consultation-admin.template.js";
import { sendConsultationToUser } from "../templates/consultation-user.template.js";
import nodemailer from "nodemailer";

// Admin email address for receiving consultation notifications
const MAIL_HOST = process.env.MAIL_HOST;
const MAIL_PORT = process.env.MAIL_PORT;
const MAIL_USERNAME = process.env.MAIL_USERNAME;
const MAIL_PASSWORD = process.env.MAIL_PASSWORD;
const MAIL_FROM = process.env.MAIL_FROM;

export const sendEmail = async (
  to,
  subject,
  htmlContent,
  bcc = [],
  cc = [],
) => {
  const mailTransporter = nodemailer.createTransport({
    host: MAIL_HOST || "smtp.gmail.com",
    port: MAIL_PORT || 587,
    auth: {
      user: MAIL_USERNAME,
      pass: MAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: MAIL_FROM || `Optivo Solutions <${MAIL_USERNAME}>`,
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
