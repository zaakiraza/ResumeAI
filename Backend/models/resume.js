import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    // Resume Ownership
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Resume Metadata
    title: { type: String, required: true },
    status: {
      type: String,
      enum: ["draft", "completed", "published"],
      default: "draft",
    },
    template: { type: String, default: "modern" },
    downloadCount: { type: Number, default: 0 },

    // Personal Information
    personalInfo: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
      location: { type: String },
      profilePicture: { type: String }, // URL to image
      links: [
        {
          label: { type: String },
          url: { type: String },
        },
      ],
    },

    // Career Summary
    careerObjective: { type: String, required: false },

    // Work Experience
    workExperience: [
      {
        jobTitle: { type: String },
        companyName: { type: String },
        startDate: { type: String },
        endDate: { type: String },
        currentJob: { type: Boolean, default: false },
        responsibilities: { type: String },
      },
    ],

    // Skills
    skills: [{ type: String }],

    // Education
    education: [
      {
        degree: { type: String },
        institution: { type: String },
        graduationYear: { type: String },
      },
    ],

    // Certifications
    certifications: [
      {
        name: { type: String },
        institution: { type: String },
        dateAchieved: { type: String },
      },
    ],

    // Languages
    languages: [
      {
        name: { type: String },
        proficiency: { type: String },
      },
    ],

    // Additional Information
    additionalInfo: {
      volunteerExperience: { type: String },
      hobbies: { type: String },
      projects: { type: String },
    },

    // Template Selection
    selectedTemplate: {
      type: String,
      default: "modern",
      enum: ["modern", "classic", "creative", "minimal"],
    },

    // Tracking
    lastModified: { type: Date, default: Date.now },
    isPublic: { type: Boolean, default: false },
    // PDF URL stored after generating and uploading to Cloudinary
    pdfUrl: { type: String },
  },
  { timestamps: true }
);

// Update lastModified on save
resumeSchema.pre("save", function (next) {
  this.lastModified = new Date();
  next();
});

const Resume = mongoose.model("Resume", resumeSchema);
export default Resume;
