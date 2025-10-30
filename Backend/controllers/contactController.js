import ContactMessage from "../models/contactMessage.js";
import { sendEmail } from "../utils/nodeMailer.js";
import { successResponse, errorResponse } from "../utils/responseHandler.js";

// POST /api/contact - send a message to support
export const sendMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return errorResponse(res, 400, "Name, email and message are required");
    }

    const contact = new ContactMessage({
      userId: req.user?.id || null,
      name,
      email,
      subject: subject || undefined,
      message,
      meta: {
        ip: req.ip || req.headers["x-forwarded-for"] || null,
        userAgent: req.get("User-Agent") || null,
        referrer: req.get("Referrer") || req.get("Referer") || null,
      },
    });

    const saved = await contact.save();

    // Prepare email content
    const to = process.env.SUPPORT_EMAIL || process.env.EMAIL_USER;
    const emailSubject = `New contact message: ${subject || "Website Message"}`;
    const emailText = `You have received a new message from the website:\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject || "-"}\n\nMessage:\n${message}\n\nMeta:\nIP: ${contact.meta.ip}\nUser-Agent: ${contact.meta.userAgent}\nReferrer: ${contact.meta.referrer}\n\n--\nThis message was stored in the database (id: ${saved._id})`;

    try {
      if (to) {
        await sendEmail(to, emailSubject, emailText);
      }
    } catch (mailErr) {
      console.error("Contact email send failed:", mailErr);
      // don't fail the whole request; just log it
    }

    return successResponse(res, 201, "Message sent successfully", { message: saved });
  } catch (error) {
    console.error("Send Message Error:", error);
    return errorResponse(res, 500, "Failed to send message");
  }
};

export default {
  sendMessage,
};
