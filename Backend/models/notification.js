import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    type: {
      type: String,
      enum: ["info", "success", "warning", "error", "reminder", "system"],
      default: "info",
    },
    category: {
      type: String,
      enum: [
        "resume",
        "download",
        "profile",
        "ai_tools",
        "system",
        "promotion",
        "reminder",
        "welcome",
        "security",
        "achievement",
      ],
      default: "system",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    actionUrl: {
      type: String,
      trim: true,
      default: null,
    },
    actionText: {
      type: String,
      trim: true,
      maxlength: 50,
      default: null,
    },
    metadata: {
      resumeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resume",
        default: null,
      },
      templateId: {
        type: String,
        default: null,
      },
      downloadCount: {
        type: Number,
        default: null,
      },
      aiToolUsed: {
        type: String,
        default: null,
      },
    },
    expiresAt: {
      type: Date,
      default: null,
      index: { expireAfterSeconds: 0 },
    },
    isSystemGenerated: {
      type: Boolean,
      default: false,
    },
    sourceApp: {
      type: String,
      enum: ["web", "mobile", "system"],
      default: "system",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, type: 1 });
notificationSchema.index({ userId: 1, category: 1 });
notificationSchema.index({ createdAt: 1 });

// Virtual for time ago
notificationSchema.virtual("timeAgo").get(function () {
  const now = new Date();
  const diff = now - this.createdAt;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else {
    return "Just now";
  }
});

// Instance methods
notificationSchema.methods.markAsRead = function () {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

notificationSchema.methods.markAsUnread = function () {
  this.isRead = false;
  this.readAt = null;
  return this.save();
};

// Static methods
notificationSchema.statics.createSystemNotification = async function (
  userId,
  title,
  message,
  options = {}
) {
  const notification = new this({
    userId,
    title,
    message,
    type: options.type || "system",
    category: options.category || "system",
    priority: options.priority || "medium",
    actionUrl: options.actionUrl,
    actionText: options.actionText,
    metadata: options.metadata || {},
    expiresAt: options.expiresAt,
    isSystemGenerated: true,
    sourceApp: "system",
  });

  return await notification.save();
};

notificationSchema.statics.createResumeNotification = async function (
  userId,
  type,
  resumeId,
  resumeTitle
) {
  const notifications = {
    created: {
      title: "Resume Created",
      message: `Your resume "${resumeTitle}" has been created successfully.`,
      type: "success",
      actionUrl: `/edit-resume/${resumeId}`,
      actionText: "Edit Resume",
    },
    updated: {
      title: "Resume Updated",
      message: `Your resume "${resumeTitle}" has been updated.`,
      type: "info",
      actionUrl: `/edit-resume/${resumeId}`,
      actionText: "View Resume",
    },
    downloaded: {
      title: "Resume Downloaded",
      message: `Your resume "${resumeTitle}" has been downloaded.`,
      type: "success",
      actionUrl: `/my-resumes`,
      actionText: "View Resumes",
    },
    deleted: {
      title: "Resume Deleted",
      message: `Your resume "${resumeTitle}" has been deleted.`,
      type: "warning",
      actionUrl: `/my-resumes`,
      actionText: "View Resumes",
    },
  };

  const notificationData = notifications[type];
  if (!notificationData) return null;

  return await this.createSystemNotification(
    userId,
    notificationData.title,
    notificationData.message,
    {
      type: notificationData.type,
      category: "resume",
      actionUrl: notificationData.actionUrl,
      actionText: notificationData.actionText,
      metadata: { resumeId },
    }
  );
};

notificationSchema.statics.getUnreadCount = async function (userId) {
  return await this.countDocuments({ userId, isRead: false });
};

notificationSchema.statics.markAllAsRead = async function (userId) {
  return await this.updateMany(
    { userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );
};

// Pre-save middleware
notificationSchema.pre("save", function (next) {
  // Set expiresAt to 30 days from now if not specified for non-critical notifications
  if (
    !this.expiresAt &&
    this.priority !== "urgent" &&
    this.priority !== "high"
  ) {
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  }
  next();
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
