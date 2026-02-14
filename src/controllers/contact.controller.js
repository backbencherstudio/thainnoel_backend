import catchAsync from "../lib/catchAsync.js";
import Contact from "../models/contact.model.js";
import User from "../models/user.model.js";
import { emailQueue } from "../lib/queue.js";
import { getContactNotificationTemplate } from "../templates/contact.template.js";

const submitContactForm = catchAsync(async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "Please provide name, email, and message",
    });
  }

  const contact = await Contact.create({
    name,
    email,
    subject: "New Contact Inquiry from " + name,
    message,
  });

  // Find all admin users
  const admins = await User.find({ role: "admin" });

  if (admins.length > 0) {
    const adminEmails = admins.map((admin) => admin.email);
    const to = adminEmails[0];
    const cc = adminEmails.slice(1);

    const htmlContent = getContactNotificationTemplate(
      name,
      email,
      contact.subject,
      message,
    );

    await emailQueue.add("send-email", {
      to,
      cc,
      subject: `New Contact Inquiry: ${contact.subject}`,
      htmlContent,
    });
  }

  res.status(201).json({
    success: true,
    message: "Thank you for contacting us! We will get back to you soon.",
    data: contact,
  });
});

export { submitContactForm };
