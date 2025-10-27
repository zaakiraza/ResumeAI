import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userName: { type: String, required: false, unique: true, sparse: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // Made optional for Google OAuth users
    isAdmin: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    otp: { type: String, default: null },
    otpExpiresAt: { type: Date, default: null },
    
    // OAuth fields
    googleId: { type: String, unique: true, sparse: true },
    authProvider: { type: String, enum: ["local", "google"], default: "local" },
    isEmailVerified: { type: Boolean, default: false },
    
    // User Profile Information
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    profilePicture: { type: String, default: "" },
    
    // Resume tracking
    resumes: [{
      resumeId: { type: mongoose.Schema.Types.ObjectId, ref: "Resume" },
      title: { type: String },
      status: { type: String, enum: ["draft", "completed", "published"], default: "draft" },
      template: { type: String, default: "modern" },
      lastModified: { type: Date, default: Date.now },
      downloadCount: { type: Number, default: 0 },
      createdAt: { type: Date, default: Date.now }
    }],
    
    // User analytics
    analytics: {
      totalResumesCreated: { type: Number, default: 0 },
      totalDownloads: { type: Number, default: 0 },
      profileCompletion: { type: Number, default: 0 },
      lastActivity: { type: Date, default: Date.now }
    },
    
    // User preferences
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      defaultTemplate: { type: String, default: "modern" },
      language: { type: String, default: "en" },
      timezone: { type: String, default: "UTC" }
    }
  },
  { timestamps: true }
);

// Calculate profile completion percentage
userSchema.methods.calculateProfileCompletion = function() {
  let completionScore = 0;
  const totalFields = 7;
  
  if (this.firstName) completionScore++;
  if (this.lastName) completionScore++;
  if (this.email) completionScore++;
  if (this.phone) completionScore++;
  if (this.location) completionScore++;
  if (this.profilePicture) completionScore++;
  if (this.userName) completionScore++;
  
  const percentage = Math.round((completionScore / totalFields) * 100);
  this.analytics.profileCompletion = percentage;
  return percentage;
};

// Update last activity
userSchema.methods.updateActivity = function() {
  this.analytics.lastActivity = new Date();
  return this.save();
};

const User = mongoose.model("User", userSchema);
export default User;
