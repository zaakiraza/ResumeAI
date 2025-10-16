import Notification from "../models/notification.js";
import { successResponse, errorResponse } from "../utils/responseHandler.js";
import mongoose from "mongoose";

// Get all notifications for a user
export const getUserNotifications = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId); // Convert to ObjectId
    const {
      page = 1,
      limit = 20,
      type,
      category,
      isRead,
      priority,
    } = req.query;

    // Build filter
    const filter = { userId };
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (isRead !== undefined) filter.isRead = isRead === "true";
    if (priority) filter.priority = priority;

    // Get notifications with pagination
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-__v");

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.getUnreadCount(userId);

    successResponse(
      res,
      200,
      "Notifications fetched successfully",
      {
        notifications,
        unreadCount,
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
    console.error("Get Notifications Error:", error);
    errorResponse(res, 500, "Failed to fetch notifications", {
      error: error.message,
    });
  }
};

// Get notification by ID
export const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = new mongoose.Types.ObjectId(req.user.userId); // Convert to ObjectId

    const notification = await Notification.findOne({ _id: id, userId });

    if (!notification) {
      return errorResponse(res, 404, "Notification not found");
    }

    successResponse(
      res,
      200,
      "Notification fetched successfully",
      { notification },
      true
    );
  } catch (error) {
    console.error("Get Notification Error:", error);
    errorResponse(res, 500, "Failed to fetch notification", {
      error: error.message,
    });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = new mongoose.Types.ObjectId(req.user.userId); // Convert to ObjectId

    const notification = await Notification.findOne({ _id: id, userId });

    if (!notification) {
      return errorResponse(res, 404, "Notification not found");
    }

    await notification.markAsRead();

    successResponse(
      res,
      200,
      "Notification marked as read",
      { notification },
      true
    );
  } catch (error) {
    console.error("Mark Read Error:", error);
    errorResponse(res, 500, "Failed to mark notification as read", {
      error: error.message,
    });
  }
};

// Mark notification as unread
export const markNotificationAsUnread = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = new mongoose.Types.ObjectId(req.user.userId); // Convert to ObjectId

    const notification = await Notification.findOne({ _id: id, userId });

    if (!notification) {
      return errorResponse(res, 404, "Notification not found");
    }

    await notification.markAsUnread();

    successResponse(
      res,
      200,
      "Notification marked as unread",
      { notification },
      true
    );
  } catch (error) {
    console.error("Mark Unread Error:", error);
    errorResponse(res, 500, "Failed to mark notification as unread", {
      error: error.message,
    });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId); // Convert to ObjectId

    const result = await Notification.markAllAsRead(userId);

    successResponse(
      res,
      200,
      "All notifications marked as read",
      { modifiedCount: result.modifiedCount },
      true
    );
  } catch (error) {
    console.error("Mark All Read Error:", error);
    errorResponse(res, 500, "Failed to mark all notifications as read", {
      error: error.message,
    });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = new mongoose.Types.ObjectId(req.user.userId); // Convert to ObjectId

    const notification = await Notification.findOne({ _id: id, userId });

    if (!notification) {
      return errorResponse(res, 404, "Notification not found");
    }

    await Notification.findByIdAndDelete(id);

    successResponse(res, 200, "Notification deleted successfully", null, true);
  } catch (error) {
    console.error("Delete Notification Error:", error);
    errorResponse(res, 500, "Failed to delete notification", {
      error: error.message,
    });
  }
};

// Delete all read notifications
export const deleteAllReadNotifications = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId); // Convert to ObjectId

    const result = await Notification.deleteMany({ userId, isRead: true });

    successResponse(
      res,
      200,
      "All read notifications deleted",
      { deletedCount: result.deletedCount },
      true
    );
  } catch (error) {
    console.error("Delete All Read Error:", error);
    errorResponse(res, 500, "Failed to delete read notifications", {
      error: error.message,
    });
  }
};

// Get notification statistics
export const getNotificationStats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId); // Convert to ObjectId

    const stats = await Notification.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: {
            $sum: {
              $cond: [{ $eq: ["$isRead", false] }, 1, 0],
            },
          },
          byType: {
            $push: {
              type: "$type",
              isRead: "$isRead",
            },
          },
          byCategory: {
            $push: {
              category: "$category",
              isRead: "$isRead",
            },
          },
        },
      },
    ]);

    const typeStats = await Notification.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: "$type",
          total: { $sum: 1 },
          unread: {
            $sum: {
              $cond: [{ $eq: ["$isRead", false] }, 1, 0],
            },
          },
        },
      },
    ]);

    const categoryStats = await Notification.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: "$category",
          total: { $sum: 1 },
          unread: {
            $sum: {
              $cond: [{ $eq: ["$isRead", false] }, 1, 0],
            },
          },
        },
      },
    ]);

    successResponse(
      res,
      200,
      "Notification statistics fetched successfully",
      {
        stats: stats[0] || { total: 0, unread: 0 },
        typeStats,
        categoryStats,
      },
      true
    );
  } catch (error) {
    console.error("Get Notification Stats Error:", error);
    errorResponse(res, 500, "Failed to fetch notification statistics", {
      error: error.message,
    });
  }
};

// Create notification (for testing/admin purposes)
export const createNotification = async (req, res) => {
  try {
    const userId = req.user.userId; // Fixed: use userId instead of id
    const {
      title,
      message,
      type = "info",
      category = "system",
      priority = "medium",
      actionUrl,
      actionText,
      metadata = {},
      expiresAt,
    } = req.body;

    if (!title || !message) {
      return errorResponse(res, 400, "Title and message are required");
    }

    const notification = await Notification.createSystemNotification(
      userId,
      title,
      message,
      {
        type,
        category,
        priority,
        actionUrl,
        actionText,
        metadata,
        expiresAt,
      }
    );

    successResponse(
      res,
      201,
      "Notification created successfully",
      { notification },
      true
    );
  } catch (error) {
    console.error("Create Notification Error:", error);
    errorResponse(res, 500, "Failed to create notification", {
      error: error.message,
    });
  }
};

// Get notification preferences (placeholder for future implementation)
export const getNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.userId; // Fixed: use userId instead of id

    // This would typically come from user preferences
    const preferences = {
      email: {
        resume: true,
        download: true,
        ai_tools: true,
        system: true,
        promotion: false,
      },
      push: {
        resume: true,
        download: false,
        ai_tools: true,
        system: true,
        promotion: false,
      },
      frequency: "immediate", // immediate, daily, weekly
    };

    successResponse(
      res,
      200,
      "Notification preferences fetched successfully",
      { preferences },
      true
    );
  } catch (error) {
    console.error("Get Preferences Error:", error);
    errorResponse(res, 500, "Failed to fetch notification preferences", {
      error: error.message,
    });
  }
};

// Update notification preferences (placeholder for future implementation)
export const updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.userId; // Fixed: use userId instead of id
    const { preferences } = req.body;

    // This would typically update user preferences in the database
    
    successResponse(
      res,
      200,
      "Notification preferences updated successfully",
      { preferences },
      true
    );
  } catch (error) {
    console.error("Update Preferences Error:", error);
    errorResponse(res, 500, "Failed to update notification preferences", {
      error: error.message,
    });
  }
};