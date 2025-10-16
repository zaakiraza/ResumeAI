import NotificationService from "../utils/notificationService.js";

// Achievement tracking service
class AchievementService {
  // Check and award achievements for resume milestones
  static async checkResumeAchievements(userId, userResumeCount, downloadCount = 0) {
    try {
      // First resume achievement
      if (userResumeCount === 1) {
        await NotificationService.createAchievementNotification(
          userId,
          "First Resume Created",
          "🎉 Congratulations! You've created your first resume with ResumeAI. You're on your way to landing your dream job!"
        );
      }

      // Multiple resumes achievement
      if (userResumeCount === 5) {
        await NotificationService.createAchievementNotification(
          userId,
          "Resume Master",
          "🏆 Amazing! You've created 5 resumes. You're becoming a pro at crafting the perfect resume for different opportunities!"
        );
      }

      if (userResumeCount === 10) {
        await NotificationService.createAchievementNotification(
          userId,
          "Resume Expert",
          "🌟 Incredible! 10 resumes created! You're definitely a resume creation expert. Keep building those career opportunities!"
        );
      }

      // Download achievements
      if (downloadCount === 1) {
        await NotificationService.createAchievementNotification(
          userId,
          "First Download",
          "📥 Your first resume download! Your professional journey has officially begun. Best of luck with your applications!"
        );
      }

      if (downloadCount === 10) {
        await NotificationService.createAchievementNotification(
          userId,
          "Download Champion",
          "🚀 10 downloads and counting! You're actively pursuing opportunities. Keep up the great work!"
        );
      }

      if (downloadCount === 50) {
        await NotificationService.createAchievementNotification(
          userId,
          "Career Hunter",
          "🎯 50 downloads! You're seriously committed to finding the right opportunity. Your persistence will pay off!"
        );
      }
    } catch (error) {
      console.error("Error checking resume achievements:", error);
    }
  }

  // Check profile completion achievements
  static async checkProfileAchievements(userId, profileCompletion) {
    try {
      if (profileCompletion >= 50 && profileCompletion < 75) {
        await NotificationService.createAchievementNotification(
          userId,
          "Profile Builder",
          "📝 Great progress! Your profile is 50% complete. A complete profile helps us provide better recommendations!"
        );
      }

      if (profileCompletion >= 75 && profileCompletion < 100) {
        await NotificationService.createAchievementNotification(
          userId,
          "Almost There",
          "🎯 You're 75% done with your profile! Just a few more details to unlock all features and get personalized suggestions."
        );
      }

      if (profileCompletion === 100) {
        await NotificationService.createAchievementNotification(
          userId,
          "Profile Master",
          "✨ Perfect! Your profile is 100% complete. You now have access to all features and personalized AI recommendations!"
        );
      }
    } catch (error) {
      console.error("Error checking profile achievements:", error);
    }
  }

  // Check streak achievements (for future implementation)
  static async checkStreakAchievements(userId, consecutiveDays) {
    try {
      if (consecutiveDays === 3) {
        await NotificationService.createAchievementNotification(
          userId,
          "Getting Started",
          "🔥 3-day streak! You're building a great habit of working on your career development. Keep it up!"
        );
      }

      if (consecutiveDays === 7) {
        await NotificationService.createAchievementNotification(
          userId,
          "Week Warrior",
          "🗓️ One week streak! Your consistency is impressive. Great job staying committed to your career goals!"
        );
      }

      if (consecutiveDays === 30) {
        await NotificationService.createAchievementNotification(
          userId,
          "Month Master",
          "📅 30-day streak! You're showing incredible dedication to your professional development. Amazing work!"
        );
      }
    } catch (error) {
      console.error("Error checking streak achievements:", error);
    }
  }

  // Check special event achievements
  static async checkSpecialAchievements(userId, eventType, eventData) {
    try {
      switch (eventType) {
        case "weekend_worker":
          await NotificationService.createAchievementNotification(
            userId,
            "Weekend Warrior",
            "💪 Working on your resume during the weekend? That's dedication! Your future self will thank you."
          );
          break;

        case "late_night_editor":
          await NotificationService.createAchievementNotification(
            userId,
            "Night Owl",
            "🌙 Burning the midnight oil on your resume? Your commitment to excellence is admirable!"
          );
          break;

        case "early_bird":
          await NotificationService.createAchievementNotification(
            userId,
            "Early Bird",
            "🌅 Starting your day by working on your career? That's the spirit of a high achiever!"
          );
          break;

        case "template_explorer":
          if (eventData.templatesUsed >= 3) {
            await NotificationService.createAchievementNotification(
              userId,
              "Template Explorer",
              "🎨 You've tried multiple templates! Exploring different styles shows you care about finding the perfect fit."
            );
          }
          break;

        default:
          break;
      }
    } catch (error) {
      console.error("Error checking special achievements:", error);
    }
  }
}

export default AchievementService;