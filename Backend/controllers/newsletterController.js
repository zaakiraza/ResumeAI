import Newsletter from "../models/newsletter.js";
import { sendEmail } from "../utils/nodeMailer.js";
import { successResponse, errorResponse } from "../utils/responseHandler.js";

// Subscribe to newsletter
export const subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, 400, "Email is required");
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse(res, 400, "Please provide a valid email address");
    }

    // Check if email already exists
    let subscriber = await Newsletter.findOne({ email });

    if (subscriber) {
      if (subscriber.isSubscribed) {
        return errorResponse(res, 400, "This email is already subscribed");
      } else {
        // Resubscribe if previously unsubscribed
        subscriber.isSubscribed = true;
        subscriber.unsubscribedAt = null;
        await subscriber.save();
        
        return successResponse(
          res,
          200,
          "Welcome back! You have been resubscribed to our newsletter",
          { subscriber }
        );
      }
    }

    // Create new subscriber
    subscriber = new Newsletter({
      email,
      source: req.body.source || "footer",
      meta: {
        ip: req.ip || req.headers["x-forwarded-for"] || null,
        userAgent: req.get("User-Agent") || null,
        referrer: req.get("Referrer") || req.get("Referer") || null,
      },
    });

    await subscriber.save();

    // Send welcome email (optional)
    try {
      const welcomeSubject = "Welcome to ResumeAI Newsletter! 🎉";
      const welcomeText = `Hi there!\n\nThank you for subscribing to the ResumeAI newsletter!\n\nYou'll now receive:\n- Latest resume tips and tricks\n- Career advice from experts\n- Product updates and new features\n- Exclusive offers and discounts\n\nWe're excited to have you on board!\n\nBest regards,\nThe ResumeAI Team\n\n--\nIf you wish to unsubscribe, please reply to this email.`;
      
      await sendEmail(email, welcomeSubject, welcomeText);
    } catch (emailError) {
      console.error("Welcome email failed:", emailError);
      // Don't fail the request if email fails
    }

    return successResponse(
      res,
      201,
      "Successfully subscribed to our newsletter!",
      { subscriber }
    );
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    return errorResponse(res, 500, "Failed to subscribe. Please try again later.");
  }
};

// Unsubscribe from newsletter
export const unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, 400, "Email is required");
    }

    const subscriber = await Newsletter.findOne({ email });

    if (!subscriber) {
      return errorResponse(res, 404, "Email not found in our subscriber list");
    }

    if (!subscriber.isSubscribed) {
      return errorResponse(res, 400, "This email is already unsubscribed");
    }

    await subscriber.unsubscribe();

    return successResponse(
      res,
      200,
      "You have been unsubscribed from our newsletter",
      null
    );
  } catch (error) {
    console.error("Newsletter unsubscribe error:", error);
    return errorResponse(res, 500, "Failed to unsubscribe. Please try again later.");
  }
};

// Get subscriber statistics (admin only)
export const getStats = async (req, res) => {
  try {
    const totalSubscribers = await Newsletter.getSubscriberCount();
    const totalUnsubscribed = await Newsletter.countDocuments({ isSubscribed: false });
    const total = await Newsletter.countDocuments();

    // Get recent signups (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentSignups = await Newsletter.countDocuments({
      isSubscribed: true,
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Group by source
    const bySource = await Newsletter.aggregate([
      { $match: { isSubscribed: true } },
      {
        $group: {
          _id: "$source",
          count: { $sum: 1 },
        },
      },
    ]);

    return successResponse(res, 200, "Newsletter statistics fetched successfully", {
      totalSubscribers,
      totalUnsubscribed,
      total,
      recentSignups,
      bySource,
    });
  } catch (error) {
    console.error("Newsletter stats error:", error);
    return errorResponse(res, 500, "Failed to fetch statistics");
  }
};

export default {
  subscribe,
  unsubscribe,
  getStats,
};
