import mongoose from "mongoose";

const newsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      index: true,
    },
    isSubscribed: {
      type: Boolean,
      default: true,
    },
    source: {
      type: String,
      default: "footer",
      enum: ["footer", "popup", "checkout", "profile", "other"],
    },
    unsubscribedAt: {
      type: Date,
      default: null,
    },
    meta: {
      ip: String,
      userAgent: String,
      referrer: String,
    },
  },
  { timestamps: true }
);

// Index for querying active subscribers
newsletterSchema.index({ isSubscribed: 1, createdAt: -1 });

// Static method to get subscriber count
newsletterSchema.statics.getSubscriberCount = async function () {
  return await this.countDocuments({ isSubscribed: true });
};

// Instance method to unsubscribe
newsletterSchema.methods.unsubscribe = function () {
  this.isSubscribed = false;
  this.unsubscribedAt = new Date();
  return this.save();
};

const Newsletter = mongoose.model("Newsletter", newsletterSchema);

export default Newsletter;
