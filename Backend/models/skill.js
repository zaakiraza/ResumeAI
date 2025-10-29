import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true, // Store in lowercase for case-insensitive matching
    },
    displayName: {
      type: String,
      required: true,
      trim: true, // Original casing for display
    },
    category: {
      type: String,
      enum: [
        "programming",
        "framework",
        "database",
        "tool",
        "soft-skill",
        "language",
        "design",
        "marketing",
        "other",
      ],
      default: "other",
    },
    usageCount: {
      type: Number,
      default: 1, // Track how many times this skill has been used
    },
    isVerified: {
      type: Boolean,
      default: false, // Admin can verify popular/valid skills
    },
    relatedSkills: [
      {
        type: String, // Store related skill names
      },
    ],
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Index for faster searches
skillSchema.index({ name: 1 });
skillSchema.index({ usageCount: -1 });
skillSchema.index({ category: 1 });

// Method to increment usage count
skillSchema.methods.incrementUsage = function () {
  this.usageCount += 1;
  return this.save();
};

const Skill = mongoose.model("Skill", skillSchema);
export default Skill;
