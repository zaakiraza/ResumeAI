import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Allow anonymous feedback
      index: true,
    },
    type: {
      type: String,
      enum: ["bug_report", "feature_request", "general", "ui_ux", "performance", "other"],
      required: true,
    },
    category: {
      type: String,
      enum: [
        "resume_builder",
        "ai_tools",
        "templates",
        "dashboard",
        "profile",
        "authentication",
        "download",
        "general",
        "mobile_app",
        "website",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed", "duplicate"],
      default: "open",
      index: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    contactInfo: {
      email: {
        type: String,
        trim: true,
        lowercase: true,
        default: null,
      },
      phone: {
        type: String,
        trim: true,
        default: null,
      },
      preferredContact: {
        type: String,
        enum: ["email", "phone", "none"],
        default: "email",
      },
    },
    browserInfo: {
      userAgent: String,
      browser: String,
      version: String,
      os: String,
      screen: String,
      viewport: String,
    },
    pageInfo: {
      url: String,
      referrer: String,
      timestamp: Date,
    },
    attachments: [
      {
        filename: String,
        url: String,
        size: Number,
        mimeType: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    adminNotes: [
      {
        note: {
          type: String,
          required: true,
        },
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    resolution: {
      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      resolvedAt: {
        type: Date,
        default: null,
      },
      resolutionNote: {
        type: String,
        maxlength: 1000,
        default: null,
      },
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
    },
    votedUsers: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        voteType: {
          type: String,
          enum: ["up", "down"],
        },
        votedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
feedbackSchema.index({ userId: 1, createdAt: -1 });
feedbackSchema.index({ type: 1, status: 1 });
feedbackSchema.index({ category: 1, status: 1 });
feedbackSchema.index({ status: 1, priority: 1 });
feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ "resolution.resolvedAt": -1 });

// Virtual for net votes
feedbackSchema.virtual("netVotes").get(function () {
  return this.upvotes - this.downvotes;
});

// Virtual for time ago
feedbackSchema.virtual("timeAgo").get(function () {
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
feedbackSchema.methods.addAdminNote = function (note, adminId) {
  this.adminNotes.push({
    note,
    addedBy: adminId,
  });
  return this.save();
};

feedbackSchema.methods.resolve = function (adminId, note) {
  this.status = "resolved";
  this.resolution = {
    resolvedBy: adminId,
    resolvedAt: new Date(),
    resolutionNote: note,
  };
  return this.save();
};

feedbackSchema.methods.vote = function (userId, voteType) {
  // Remove existing vote by this user
  this.votedUsers = this.votedUsers.filter(
    (vote) => vote.userId.toString() !== userId.toString()
  );

  // Add new vote
  this.votedUsers.push({
    userId,
    voteType,
  });

  // Update vote counts
  this.upvotes = this.votedUsers.filter((vote) => vote.voteType === "up").length;
  this.downvotes = this.votedUsers.filter((vote) => vote.voteType === "down").length;

  return this.save();
};

feedbackSchema.methods.removeVote = function (userId) {
  this.votedUsers = this.votedUsers.filter(
    (vote) => vote.userId.toString() !== userId.toString()
  );

  // Update vote counts
  this.upvotes = this.votedUsers.filter((vote) => vote.voteType === "up").length;
  this.downvotes = this.votedUsers.filter((vote) => vote.voteType === "down").length;

  return this.save();
};

// Static methods
feedbackSchema.statics.getStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const typeStats = await this.aggregate([
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
      },
    },
  ]);

  const priorityStats = await this.aggregate([
    {
      $group: {
        _id: "$priority",
        count: { $sum: 1 },
      },
    },
  ]);

  return {
    statusStats: stats,
    typeStats,
    priorityStats,
    total: await this.countDocuments(),
  };
};

feedbackSchema.statics.getTopFeatureRequests = async function (limit = 10) {
  return await this.find({ type: "feature_request", isPublic: true })
    .sort({ netVotes: -1, createdAt: -1 })
    .limit(limit)
    .populate("userId", "userName email");
};

// Pre-save middleware
feedbackSchema.pre("save", function (next) {
  // Set default contact email from user if not provided
  if (this.userId && !this.contactInfo.email) {
    this.populate("userId", "email", (err, feedback) => {
      if (!err && feedback.userId) {
        this.contactInfo.email = feedback.userId.email;
      }
      next();
    });
  } else {
    next();
  }
});

// Post-save middleware to create notification for admin
feedbackSchema.post("save", async function (doc) {
  if (this.isNew) {
    try {
      // Create notification for admins about new feedback
      const User = mongoose.model("User");
      const Notification = mongoose.model("Notification");
      
      const admins = await User.find({ isAdmin: true });
      
      for (const admin of admins) {
        await Notification.createSystemNotification(
          admin._id,
          "New Feedback Received",
          `New ${doc.type.replace("_", " ")} feedback: "${doc.title}"`,
          {
            type: "info",
            category: "system",
            priority: doc.priority === "critical" ? "urgent" : "medium",
            actionUrl: `/admin/feedback/${doc._id}`,
            actionText: "View Feedback",
          }
        );
      }
    } catch (error) {
      console.error("Error creating feedback notification:", error);
    }
  }
});

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;