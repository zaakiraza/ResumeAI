import Feedback from "../models/feedback.js";
import { successResponse, errorResponse } from "../utils/responseHandler.js";

// Create new feedback
export const createFeedback = async (req, res) => {
  try {
    const userId = req.user?.id;
    const {
      type,
      category,
      title,
      description,
      priority = "medium",
      rating,
      contactInfo = {},
      browserInfo = {},
      pageInfo = {},
      tags = [],
      isAnonymous = false,
    } = req.body;

    // Validation
    if (!type || !category || !title || !description) {
      return errorResponse(res, 400, "Type, category, title, and description are required");
    }

    // Create feedback
    const feedback = new Feedback({
      userId: isAnonymous ? null : userId,
      type,
      category,
      title,
      description,
      priority,
      rating,
      contactInfo,
      browserInfo,
      pageInfo: {
        ...pageInfo,
        timestamp: new Date(),
      },
      tags,
      isAnonymous,
    });

    const savedFeedback = await feedback.save();

    successResponse(
      res,
      201,
      "Feedback submitted successfully",
      { feedback: savedFeedback },
      true
    );
  } catch (error) {
    console.error("Create Feedback Error:", error);
    errorResponse(res, 500, "Failed to submit feedback", {
      error: error.message,
    });
  }
};

// Get all feedback (admin only)
export const getAllFeedback = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      category,
      status,
      priority,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter
    const filter = {};
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const feedback = await Feedback.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("userId", "userName email")
      .populate("resolution.resolvedBy", "userName email")
      .select("-__v");

    const total = await Feedback.countDocuments(filter);

    successResponse(
      res,
      200,
      "Feedback fetched successfully",
      {
        feedback,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit),
        },
      },
      true
    );
  } catch (error) {
    console.error("Get All Feedback Error:", error);
    errorResponse(res, 500, "Failed to fetch feedback", {
      error: error.message,
    });
  }
};

// Get user's feedback
export const getUserFeedback = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 20,
      type,
      category,
      status,
    } = req.query;

    // Build filter
    const filter = { userId };
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (status) filter.status = status;

    const feedback = await Feedback.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("resolution.resolvedBy", "userName email")
      .select("-__v");

    const total = await Feedback.countDocuments(filter);

    successResponse(
      res,
      200,
      "User feedback fetched successfully",
      {
        feedback,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit),
        },
      },
      true
    );
  } catch (error) {
    console.error("Get User Feedback Error:", error);
    errorResponse(res, 500, "Failed to fetch user feedback", {
      error: error.message,
    });
  }
};

// Get feedback by ID
export const getFeedbackById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Build filter - users can only see their own feedback unless admin
    const filter = { _id: id };
    if (!req.user?.isAdmin) {
      filter.userId = userId;
    }

    const feedback = await Feedback.findOne(filter)
      .populate("userId", "userName email")
      .populate("resolution.resolvedBy", "userName email")
      .populate("adminNotes.addedBy", "userName email");

    if (!feedback) {
      return errorResponse(res, 404, "Feedback not found");
    }

    successResponse(
      res,
      200,
      "Feedback fetched successfully",
      { feedback },
      true
    );
  } catch (error) {
    console.error("Get Feedback Error:", error);
    errorResponse(res, 500, "Failed to fetch feedback", {
      error: error.message,
    });
  }
};

// Update feedback status (admin only)
export const updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["open", "in_progress", "resolved", "closed", "duplicate"].includes(status)) {
      return errorResponse(res, 400, "Invalid status value");
    }

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("userId", "userName email");

    if (!feedback) {
      return errorResponse(res, 404, "Feedback not found");
    }

    successResponse(
      res,
      200,
      "Feedback status updated successfully",
      { feedback },
      true
    );
  } catch (error) {
    console.error("Update Feedback Status Error:", error);
    errorResponse(res, 500, "Failed to update feedback status", {
      error: error.message,
    });
  }
};

// Add admin note to feedback (admin only)
export const addAdminNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const adminId = req.user.id;

    if (!note) {
      return errorResponse(res, 400, "Note is required");
    }

    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return errorResponse(res, 404, "Feedback not found");
    }

    await feedback.addAdminNote(note, adminId);

    const updatedFeedback = await Feedback.findById(id)
      .populate("userId", "userName email")
      .populate("adminNotes.addedBy", "userName email");

    successResponse(
      res,
      200,
      "Admin note added successfully",
      { feedback: updatedFeedback },
      true
    );
  } catch (error) {
    console.error("Add Admin Note Error:", error);
    errorResponse(res, 500, "Failed to add admin note", {
      error: error.message,
    });
  }
};

// Resolve feedback (admin only)
export const resolveFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolutionNote } = req.body;
    const adminId = req.user.id;

    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return errorResponse(res, 404, "Feedback not found");
    }

    await feedback.resolve(adminId, resolutionNote);

    const updatedFeedback = await Feedback.findById(id)
      .populate("userId", "userName email")
      .populate("resolution.resolvedBy", "userName email");

    successResponse(
      res,
      200,
      "Feedback resolved successfully",
      { feedback: updatedFeedback },
      true
    );
  } catch (error) {
    console.error("Resolve Feedback Error:", error);
    errorResponse(res, 500, "Failed to resolve feedback", {
      error: error.message,
    });
  }
};

// Vote on feedback (for public feedback)
export const voteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { voteType } = req.body; // "up" or "down"
    const userId = req.user.id;

    if (!["up", "down"].includes(voteType)) {
      return errorResponse(res, 400, "Invalid vote type. Use 'up' or 'down'");
    }

    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return errorResponse(res, 404, "Feedback not found");
    }

    if (!feedback.isPublic) {
      return errorResponse(res, 400, "Cannot vote on private feedback");
    }

    await feedback.vote(userId, voteType);

    successResponse(
      res,
      200,
      "Vote recorded successfully",
      {
        upvotes: feedback.upvotes,
        downvotes: feedback.downvotes,
        netVotes: feedback.netVotes,
      },
      true
    );
  } catch (error) {
    console.error("Vote Feedback Error:", error);
    errorResponse(res, 500, "Failed to record vote", {
      error: error.message,
    });
  }
};

// Remove vote from feedback
export const removeVote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return errorResponse(res, 404, "Feedback not found");
    }

    await feedback.removeVote(userId);

    successResponse(
      res,
      200,
      "Vote removed successfully",
      {
        upvotes: feedback.upvotes,
        downvotes: feedback.downvotes,
        netVotes: feedback.netVotes,
      },
      true
    );
  } catch (error) {
    console.error("Remove Vote Error:", error);
    errorResponse(res, 500, "Failed to remove vote", {
      error: error.message,
    });
  }
};

// Get feedback statistics (admin only)
export const getFeedbackStats = async (req, res) => {
  try {
    const stats = await Feedback.getStats();

    // Get recent feedback trends
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentStats = await Feedback.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get top feature requests
    const topFeatureRequests = await Feedback.getTopFeatureRequests(5);

    successResponse(
      res,
      200,
      "Feedback statistics fetched successfully",
      {
        ...stats,
        recentTrends: recentStats,
        topFeatureRequests,
      },
      true
    );
  } catch (error) {
    console.error("Get Feedback Stats Error:", error);
    errorResponse(res, 500, "Failed to fetch feedback statistics", {
      error: error.message,
    });
  }
};

// Delete feedback
export const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Users can only delete their own feedback, admins can delete any
    const filter = { _id: id };
    if (!req.user.isAdmin) {
      filter.userId = userId;
    }

    const feedback = await Feedback.findOne(filter);

    if (!feedback) {
      return errorResponse(res, 404, "Feedback not found");
    }

    await Feedback.findByIdAndDelete(id);

    successResponse(res, 200, "Feedback deleted successfully", null, true);
  } catch (error) {
    console.error("Delete Feedback Error:", error);
    errorResponse(res, 500, "Failed to delete feedback", {
      error: error.message,
    });
  }
};