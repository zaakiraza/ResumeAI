import Notification from "../models/notification.js";

// Notification service for automatic notifications
class NotificationService {
  // Create welcome notification for new users
  static async createWelcomeNotification(userId, userName) {
    try {
      await Notification.createSystemNotification(
        userId,
        "Welcome to ResumeAI! 🎉",
        `Hi ${userName}! Welcome to ResumeAI - your AI-powered resume builder. We're excited to help you create amazing resumes that stand out!`,
        {
          type: "success",
          category: "welcome",
          priority: "high",
          actionUrl: "/dashboard",
          actionText: "Get Started",
          metadata: {
            isWelcome: true,
            timestamp: new Date(),
          }
        }
      );
    } catch (error) {
      console.error("Error creating welcome notification:", error);
    }
  }

  // Create profile completion reminder
  static async createProfileUpdateReminder(userId, userName) {
    try {
      await Notification.createSystemNotification(
        userId,
        "Complete Your Profile 👤",
        `Hi ${userName}! Complete your profile to get personalized resume suggestions and better AI recommendations. A complete profile helps us serve you better!`,
        {
          type: "info",
          category: "profile",
          priority: "medium",
          actionUrl: "/profile",
          actionText: "Complete Profile",
          metadata: {
            isProfileReminder: true,
            timestamp: new Date(),
          }
        }
      );
    } catch (error) {
      console.error("Error creating profile update reminder:", error);
    }
  }

  // Create resume creation notification
  static async createResumeCreatedNotification(userId, resumeTitle, resumeId) {
    try {
      await Notification.createSystemNotification(
        userId,
        "Resume Created Successfully! 📄",
        `Your resume "${resumeTitle}" has been created successfully. You can now customize it, add content, and download it when ready.`,
        {
          type: "success",
          category: "resume",
          priority: "medium",
          actionUrl: `/create-resume/${resumeId}`,
          actionText: "Edit Resume",
          metadata: {
            resumeId,
            resumeTitle,
            action: "created",
            timestamp: new Date(),
          }
        }
      );
    } catch (error) {
      console.error("Error creating resume created notification:", error);
    }
  }

  // Create resume updated notification
  static async createResumeUpdatedNotification(userId, resumeTitle, resumeId) {
    try {
      await Notification.createSystemNotification(
        userId,
        "Resume Updated! ✏️",
        `Your resume "${resumeTitle}" has been updated successfully. All your changes have been saved automatically.`,
        {
          type: "info",
          category: "resume",
          priority: "low",
          actionUrl: `/create-resume/${resumeId}`,
          actionText: "View Resume",
          metadata: {
            resumeId,
            resumeTitle,
            action: "updated",
            timestamp: new Date(),
          }
        }
      );
    } catch (error) {
      console.error("Error creating resume updated notification:", error);
    }
  }

  // Create resume deleted notification
  static async createResumeDeletedNotification(userId, resumeTitle) {
    try {
      await Notification.createSystemNotification(
        userId,
        "Resume Deleted 🗑️",
        `Your resume "${resumeTitle}" has been deleted successfully. You can create a new resume anytime from your dashboard.`,
        {
          type: "warning",
          category: "resume",
          priority: "medium",
          actionUrl: "/my-resumes",
          actionText: "View My Resumes",
          metadata: {
            resumeTitle,
            action: "deleted",
            timestamp: new Date(),
          }
        }
      );
    } catch (error) {
      console.error("Error creating resume deleted notification:", error);
    }
  }

  // Create resume download notification
  static async createResumeDownloadNotification(userId, resumeTitle, downloadCount) {
    try {
      await Notification.createSystemNotification(
        userId,
        "Resume Downloaded! 📥",
        `Your resume "${resumeTitle}" has been downloaded successfully! This is download #${downloadCount}. Your resume is ready to share with employers.`,
        {
          type: "success",
          category: "download",
          priority: "low",
          actionUrl: "/my-resumes",
          actionText: "View My Resumes",
          metadata: {
            resumeTitle,
            downloadCount,
            action: "downloaded",
            timestamp: new Date(),
          }
        }
      );
    } catch (error) {
      console.error("Error creating resume download notification:", error);
    }
  }

  // Create resume duplicated notification
  static async createResumeDuplicatedNotification(userId, originalTitle, newTitle, newResumeId) {
    try {
      await Notification.createSystemNotification(
        userId,
        "Resume Duplicated! 📋",
        `Your resume "${originalTitle}" has been duplicated successfully as "${newTitle}". You can now edit the copy without affecting the original.`,
        {
          type: "success",
          category: "resume",
          priority: "medium",
          actionUrl: `/create-resume/${newResumeId}`,
          actionText: "Edit Copy",
          metadata: {
            originalTitle,
            newTitle,
            newResumeId,
            action: "duplicated",
            timestamp: new Date(),
          }
        }
      );
    } catch (error) {
      console.error("Error creating resume duplicated notification:", error);
    }
  }

  // Create profile updated notification
  static async createProfileUpdatedNotification(userId, userName) {
    try {
      await Notification.createSystemNotification(
        userId,
        "Profile Updated! 👤",
        `Hi ${userName}! Your profile has been updated successfully. A complete profile helps us provide better AI recommendations and personalized features.`,
        {
          type: "success",
          category: "profile",
          priority: "low",
          actionUrl: "/profile",
          actionText: "View Profile",
          metadata: {
            action: "profile_updated",
            timestamp: new Date(),
          }
        }
      );
    } catch (error) {
      console.error("Error creating profile updated notification:", error);
    }
  }

  // Create resume status changed notification
  static async createResumeStatusChangedNotification(userId, resumeTitle, newStatus, resumeId) {
    try {
      const statusMessages = {
        draft: "Your resume is now saved as a draft. You can continue editing anytime.",
        completed: "Congratulations! Your resume is now marked as completed and ready to download.",
        published: "Your resume is now published and ready to share with employers!"
      };

      const statusEmojis = {
        draft: "📝",
        completed: "✅",
        published: "🚀"
      };

      await Notification.createSystemNotification(
        userId,
        `Resume Status: ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} ${statusEmojis[newStatus]}`,
        `Your resume "${resumeTitle}" status has been updated to ${newStatus}. ${statusMessages[newStatus]}`,
        {
          type: newStatus === "completed" || newStatus === "published" ? "success" : "info",
          category: "resume",
          priority: newStatus === "completed" ? "medium" : "low",
          actionUrl: `/create-resume/${resumeId}`,
          actionText: "View Resume",
          metadata: {
            resumeId,
            resumeTitle,
            newStatus,
            action: "status_changed",
            timestamp: new Date(),
          }
        }
      );
    } catch (error) {
      console.error("Error creating resume status changed notification:", error);
    }
  }

  // Create AI tools usage notification
  static async createAIToolsNotification(userId, toolName, action) {
    try {
      const messages = {
        "resume_analysis": "Your resume has been analyzed successfully! Check out the AI insights and suggestions.",
        "skill_suggestions": "AI has generated personalized skill suggestions for your resume!",
        "content_optimization": "Your resume content has been optimized with AI suggestions!",
        "cover_letter": "Your AI-generated cover letter is ready to download!"
      };

      await Notification.createSystemNotification(
        userId,
        `AI Tools: ${toolName} 🤖`,
        messages[action] || `AI tool "${toolName}" has been used successfully!`,
        {
          type: "info",
          category: "ai_tools",
          priority: "medium",
          actionUrl: "/ai-tools",
          actionText: "View AI Tools",
          metadata: {
            toolName,
            action,
            timestamp: new Date(),
          }
        }
      );
    } catch (error) {
      console.error("Error creating AI tools notification:", error);
    }
  }

  // Create system maintenance notification
  static async createMaintenanceNotification(userId, title, message, scheduledTime) {
    try {
      await Notification.createSystemNotification(
        userId,
        title,
        message,
        {
          type: "warning",
          category: "system",
          priority: "high",
          metadata: {
            scheduledTime,
            isMaintenance: true,
            timestamp: new Date(),
          }
        }
      );
    } catch (error) {
      console.error("Error creating maintenance notification:", error);
    }
  }

  // Create achievement notification
  static async createAchievementNotification(userId, achievement, description) {
    try {
      await Notification.createSystemNotification(
        userId,
        `Achievement Unlocked: ${achievement} 🏆`,
        description,
        {
          type: "success",
          category: "achievement",
          priority: "medium",
          actionUrl: "/dashboard",
          actionText: "View Dashboard",
          metadata: {
            achievement,
            isAchievement: true,
            timestamp: new Date(),
          }
        }
      );
    } catch (error) {
      console.error("Error creating achievement notification:", error);
    }
  }

  // Bulk create notifications for multiple users
  static async createBulkNotifications(userIds, title, message, options = {}) {
    try {
      const notifications = userIds.map(userId => ({
        userId,
        title,
        message,
        type: options.type || "info",
        category: options.category || "system",
        priority: options.priority || "medium",
        actionUrl: options.actionUrl,
        actionText: options.actionText,
        metadata: {
          ...options.metadata,
          isBulk: true,
          timestamp: new Date(),
        }
      }));

      await Notification.insertMany(notifications);
    } catch (error) {
      console.error("Error creating bulk notifications:", error);
    }
  }
}

export default NotificationService;