import Resume from "../models/resume.js";
import User from "../models/user.js";
import Skill from "../models/skill.js";
import { successResponse, errorResponse } from "../utils/responseHandler.js";
import PDFService from "../utils/pdfService.js";
import NotificationService from "../utils/notificationService.js";
import AchievementService from "../utils/achievementService.js";
import CloudinaryService from "../utils/cloudinaryService.js";

// Helper function to add/update skills in the database
const processSkills = async (skills, userId) => {
  if (!Array.isArray(skills) || skills.length === 0) return;

  for (const skillName of skills) {
    if (!skillName || skillName.trim() === "") continue;

    const normalizedName = skillName.trim().toLowerCase();
    const displayName = skillName.trim();

    let skill = await Skill.findOne({ name: normalizedName });

    if (skill) {
      // Increment usage count
      await skill.incrementUsage();
    } else {
      // Create new skill
      await Skill.create({
        name: normalizedName,
        displayName: displayName,
        category: "other",
        usageCount: 1,
        addedBy: userId,
      });
    }
  }
};

// Create a new resume
export const createResume = async (req, res) => {
  try {
    const userId = req.user.userId; // From authentication middleware
    const { title, ...resumeData } = req.body;

    // Create new resume
    const newResume = new Resume({
      userId,
      title: title || "Untitled Resume",
      ...resumeData,
    });

    const savedResume = await newResume.save();

    // Process skills and add/update them in the skills database
    if (resumeData.skills && Array.isArray(resumeData.skills)) {
      await processSkills(resumeData.skills, userId);
    }

    // Update user's resume array with metadata
    await User.findByIdAndUpdate(userId, {
      $push: {
        resumes: {
          resumeId: savedResume._id,
          title: savedResume.title,
          status: savedResume.status,
          template: savedResume.template || savedResume.selectedTemplate,
          lastModified: savedResume.lastModified,
          downloadCount: savedResume.downloadCount,
          createdAt: savedResume.createdAt,
        },
      },
      $inc: { "analytics.totalResumesCreated": 1 },
    });

    // Create resume created notification
    await NotificationService.createResumeCreatedNotification(
      userId,
      savedResume.title,
      savedResume._id
    );

    // Check for achievements
    const userWithResumes = await User.findById(userId);

    // If this is the user's first resume and the resume contains a profile picture,
    // and the user's profilePicture is not set, copy the resume image to user's profile
    try {
      const isFirstResume =
        Array.isArray(userWithResumes.resumes) &&
        userWithResumes.resumes.length === 1;
      const resumeProfilePic =
        savedResume.personalInfo && savedResume.personalInfo.profilePicture;

      if (
        isFirstResume &&
        resumeProfilePic &&
        (!userWithResumes.profilePicture ||
          userWithResumes.profilePicture === "")
      ) {
        userWithResumes.profilePicture = resumeProfilePic;
        // Recalculate profile completion percentage if method available
        if (typeof userWithResumes.calculateProfileCompletion === "function") {
          userWithResumes.calculateProfileCompletion();
        }
        await userWithResumes.save();

        // Optionally notify the user about profile picture update
        if (
          NotificationService &&
          typeof NotificationService.createProfileUpdatedNotification ===
            "function"
        ) {
          try {
            await NotificationService.createProfileUpdatedNotification(
              userId,
              "We added your resume image to your profile"
            );
          } catch (notifErr) {
            console.error(
              "Failed to send profile updated notification:",
              notifErr
            );
          }
        }
      }
    } catch (picErr) {
      console.error(
        "Error while copying resume image to user profile:",
        picErr
      );
    }

    await AchievementService.checkResumeAchievements(
      userId,
      userWithResumes.resumes.length,
      userWithResumes.analytics?.totalDownloads || 0
    );

    successResponse(
      res,
      201,
      "Resume created successfully",
      { resume: savedResume },
      true
    );
  } catch (error) {
    console.error("Create Resume Error:", error);
    errorResponse(res, 500, "Failed to create resume", {
      error: error.message,
    });
  }
};

// Get all resumes for a user
export const getUserResumes = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, status, template } = req.query;

    // Build filter
    const filter = { userId };
    if (status) filter.status = status;
    if (template) filter.selectedTemplate = template;

    const resumes = await Resume.find(filter)
      .sort({ lastModified: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-__v");

    const total = await Resume.countDocuments(filter);

    successResponse(
      res,
      200,
      "Resumes fetched successfully",
      {
        resumes,
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
    console.error("Get User Resumes Error:", error);
    errorResponse(res, 500, "Failed to fetch resumes", {
      error: error.message,
    });
  }
};

// Get a specific resume by ID
export const getResumeById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const resume = await Resume.findOne({ _id: id, userId }).select("-__v");

    if (!resume) {
      return errorResponse(res, 404, "Resume not found");
    }

    successResponse(res, 200, "Resume fetched successfully", { resume }, true);
  } catch (error) {
    console.error("Get Resume Error:", error);
    errorResponse(res, 500, "Failed to fetch resume", {
      error: error.message,
    });
  }
};

// Update a resume
export const updateResume = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const updateData = req.body;

    const resume = await Resume.findOne({ _id: id, userId });

    if (!resume) {
      return errorResponse(res, 404, "Resume not found");
    }

    // Update resume
    Object.assign(resume, updateData);
    resume.lastModified = new Date();

    const updatedResume = await resume.save();

    // Process skills and add/update them in the skills database
    if (updateData.skills && Array.isArray(updateData.skills)) {
      await processSkills(updateData.skills, userId);
    }

    // Update corresponding entry in user's resumes array
    await User.updateOne(
      { _id: userId, "resumes.resumeId": id },
      {
        $set: {
          "resumes.$.title": updatedResume.title,
          "resumes.$.status": updatedResume.status,
          "resumes.$.template": updatedResume.selectedTemplate,
          "resumes.$.lastModified": updatedResume.lastModified,
        },
      }
    );

    // Create resume updated notification
    await NotificationService.createResumeUpdatedNotification(
      userId,
      updatedResume.title,
      updatedResume._id
    );

    successResponse(
      res,
      200,
      "Resume updated successfully",
      { resume: updatedResume },
      true
    );
  } catch (error) {
    console.error("Update Resume Error:", error);
    errorResponse(res, 500, "Failed to update resume", {
      error: error.message,
    });
  }
};

// Delete a resume
export const deleteResume = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const resume = await Resume.findOne({ _id: id, userId });

    if (!resume) {
      return errorResponse(res, 404, "Resume not found");
    }

    // Delete resume
    await Resume.findByIdAndDelete(id);

    // Remove from user's resumes array
    await User.findByIdAndUpdate(userId, {
      $pull: { resumes: { resumeId: id } },
      $inc: { "analytics.totalResumesCreated": -1 },
    });

    // Create resume deleted notification
    await NotificationService.createResumeDeletedNotification(
      userId,
      resume.title
    );

    successResponse(res, 200, "Resume deleted successfully", null, true);
  } catch (error) {
    console.error("Delete Resume Error:", error);
    errorResponse(res, 500, "Failed to delete resume", {
      error: error.message,
    });
  }
};

// Duplicate a resume
export const duplicateResume = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const originalResume = await Resume.findOne({ _id: id, userId });

    if (!originalResume) {
      return errorResponse(res, 404, "Resume not found");
    }

    // Create duplicate
    const duplicateData = originalResume.toObject();
    delete duplicateData._id;
    delete duplicateData.createdAt;
    delete duplicateData.updatedAt;

    duplicateData.title = `${duplicateData.title} (Copy)`;
    duplicateData.status = "draft";
    duplicateData.downloadCount = 0;
    duplicateData.lastModified = new Date();

    const duplicatedResume = new Resume(duplicateData);
    const savedDuplicate = await duplicatedResume.save();

    // Add to user's resumes array
    await User.findByIdAndUpdate(userId, {
      $push: {
        resumes: {
          resumeId: savedDuplicate._id,
          title: savedDuplicate.title,
          status: savedDuplicate.status,
          template: savedDuplicate.selectedTemplate,
          lastModified: savedDuplicate.lastModified,
          downloadCount: savedDuplicate.downloadCount,
          createdAt: savedDuplicate.createdAt,
        },
      },
      $inc: { "analytics.totalResumesCreated": 1 },
    });

    // Create resume duplicated notification
    await NotificationService.createResumeDuplicatedNotification(
      userId,
      originalResume.title,
      savedDuplicate.title,
      savedDuplicate._id
    );

    successResponse(
      res,
      201,
      "Resume duplicated successfully",
      { resume: savedDuplicate },
      true
    );
  } catch (error) {
    console.error("Duplicate Resume Error:", error);
    errorResponse(res, 500, "Failed to duplicate resume", {
      error: error.message,
    });
  }
};

// Update resume status (draft, completed, published)
export const updateResumeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    if (!["draft", "completed", "published"].includes(status)) {
      return errorResponse(res, 400, "Invalid status value");
    }

    const resume = await Resume.findOne({ _id: id, userId });

    if (!resume) {
      return errorResponse(res, 404, "Resume not found");
    }

    resume.status = status;
    resume.lastModified = new Date();
    await resume.save();

    // Update user's resumes array
    await User.updateOne(
      { _id: userId, "resumes.resumeId": id },
      {
        $set: {
          "resumes.$.status": status,
          "resumes.$.lastModified": resume.lastModified,
        },
      }
    );

    // Create resume status changed notification
    await NotificationService.createResumeStatusChangedNotification(
      userId,
      resume.title,
      status,
      resume._id
    );

    successResponse(
      res,
      200,
      "Resume status updated successfully",
      { resume },
      true
    );
  } catch (error) {
    console.error("Update Resume Status Error:", error);
    errorResponse(res, 500, "Failed to update resume status", {
      error: error.message,
    });
  }
};

// Track resume download
export const trackResumeDownload = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const resume = await Resume.findOne({ _id: id, userId });

    if (!resume) {
      return errorResponse(res, 404, "Resume not found");
    }

    // Increment download count
    resume.downloadCount += 1;
    await resume.save();

    // Update user analytics
    await User.findByIdAndUpdate(
      userId,
      {
        $inc: { "analytics.totalDownloads": 1 },
        $set: {
          "resumes.$[elem].downloadCount": resume.downloadCount,
        },
      },
      {
        arrayFilters: [{ "elem.resumeId": id }],
      }
    );

    // Create resume download notification
    await NotificationService.createResumeDownloadNotification(
      userId,
      resume.title,
      resume.downloadCount
    );

    // Check for download achievements
    const userWithAnalytics = await User.findById(userId);
    await AchievementService.checkResumeAchievements(
      userId,
      userWithAnalytics.resumes.length,
      userWithAnalytics.analytics?.totalDownloads || 0
    );

    successResponse(
      res,
      200,
      "Download tracked successfully",
      { downloadCount: resume.downloadCount },
      true
    );
  } catch (error) {
    console.error("Track Download Error:", error);
    errorResponse(res, 500, "Failed to track download", {
      error: error.message,
    });
  }
};

// Get resume templates
export const getResumeTemplates = async (req, res) => {
  try {
    const templates = [
      {
        id: "modern",
        name: "Modern Professional",
        description:
          "Clean and contemporary design perfect for tech and business professionals",
        preview: "/templates/modern.jpg",
        category: "professional",
        features: ["ATS-friendly", "Clean layout", "Modern typography"],
      },
      {
        id: "classic",
        name: "Classic Traditional",
        description: "Timeless design suitable for conservative industries",
        preview: "/templates/classic.jpg",
        category: "traditional",
        features: ["Traditional format", "Professional", "Conservative"],
      },
      {
        id: "creative",
        name: "Creative Designer",
        description:
          "Bold and creative design for designers and creative professionals",
        preview: "/templates/creative.jpg",
        category: "creative",
        features: ["Eye-catching", "Creative layout", "Designer-friendly"],
      },
      {
        id: "minimal",
        name: "Clean Minimal",
        description: "Minimal and clean design focusing on content",
        preview: "/templates/minimal.jpg",
        category: "minimal",
        features: ["Minimal design", "Content-focused", "Easy to read"],
      },
    ];

    successResponse(
      res,
      200,
      "Templates fetched successfully",
      { templates },
      true
    );
  } catch (error) {
    console.error("Get Templates Error:", error);
    errorResponse(res, 500, "Failed to fetch templates", {
      error: error.message,
    });
  }
};

// Save resume as draft (auto-save functionality)
export const saveResumeAsDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const updateData = req.body;

    let resume;

    if (id && id !== "new") {
      // Update existing resume
      resume = await Resume.findOne({ _id: id, userId });
      if (!resume) {
        return errorResponse(res, 404, "Resume not found");
      }

      Object.assign(resume, updateData);
      resume.status = "draft";
      resume.lastModified = new Date();
      await resume.save();

      // Update user's resumes array
      await User.updateOne(
        { _id: userId, "resumes.resumeId": id },
        {
          $set: {
            "resumes.$.lastModified": resume.lastModified,
            "resumes.$.status": "draft",
          },
        }
      );
    } else {
      // Create new resume as draft
      resume = new Resume({
        userId,
        title: updateData.title || "Untitled Resume",
        status: "draft",
        ...updateData,
      });

      const savedResume = await resume.save();

      // Add to user's resumes array
      await User.findByIdAndUpdate(userId, {
        $push: {
          resumes: {
            resumeId: savedResume._id,
            title: savedResume.title,
            status: "draft",
            template: savedResume.selectedTemplate,
            lastModified: savedResume.lastModified,
            downloadCount: 0,
            createdAt: savedResume.createdAt,
          },
        },
        $inc: { "analytics.totalResumesCreated": 1 },
      });

      // Create resume created notification for new resumes
      await NotificationService.createResumeCreatedNotification(
        userId,
        savedResume.title,
        savedResume._id
      );

      resume = savedResume;
    }

    successResponse(res, 200, "Resume saved as draft", { resume }, true);
  } catch (error) {
    console.error("Save Draft Error:", error);
    errorResponse(res, 500, "Failed to save resume draft", {
      error: error.message,
    });
  }
};

// Download resume as PDF
export const downloadResumePDF = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { template } = req.query;

    // Find the resume
    const resume = await Resume.findOne({ _id: id, userId });

    if (!resume) {
      return errorResponse(res, 404, "Resume not found");
    }

    // Use specified template or resume's template
    const selectedTemplate = template || resume.selectedTemplate || "modern";

    // Generate PDF
    const pdfBuffer = await PDFService.generateResumePDF(
      resume,
      selectedTemplate
    );

      // Log PDF buffer size and environment for diagnostics
      try {
        const sizeBytes = Buffer.byteLength(pdfBuffer);
        // console.info(`Generated PDF buffer size: ${sizeBytes} bytes. ENV: ${process.env.NODE_ENV || 'unknown'}`);
      } catch (logErr) {
        console.warn('Could not determine PDF buffer size:', logErr?.message || logErr);
      }

    // Track download
    resume.downloadCount += 1;
    await resume.save();

    // Update user analytics
    await User.findByIdAndUpdate(
      userId,
      {
        $inc: { "analytics.totalDownloads": 1 },
        $set: {
          "resumes.$[elem].downloadCount": resume.downloadCount,
        },
      },
      {
        arrayFilters: [{ "elem.resumeId": id }],
      }
    );

    // Create resume download notification
    await NotificationService.createResumeDownloadNotification(
      userId,
      resume.title,
      resume.downloadCount
    );

    // Check for download achievements
    const userForAchievements = await User.findById(userId);
    await AchievementService.checkResumeAchievements(
      userId,
      userForAchievements.resumes.length,
      userForAchievements.analytics?.totalDownloads || 0
    );

    // Set response headers for PDF download
    const filename = `${resume.personalInfo?.fullName || 'Resume'}_${selectedTemplate}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    // Use Buffer.byteLength for accurate length
    try {
      const len = Buffer.byteLength(pdfBuffer);
      res.setHeader('Content-Length', len);
    } catch (lenErr) {
      // Fallback if Buffer isn't usable in the environment
      console.warn('Failed to compute PDF buffer length:', lenErr?.message || lenErr);
    }

    // Send PDF buffer
    try {
      res.end(pdfBuffer);
    } catch (sendErr) {
      console.error('Error sending PDF buffer:', sendErr);
      // If sending fails, return an error status to the client
      return errorResponse(res, 500, 'Failed to send PDF');
    }
  } catch (error) {
    console.error("Download PDF Error:", error);
    errorResponse(res, 500, "Failed to generate PDF", {
      error: error.message,
    });
  }
};

// Get PDF URL from Cloudinary or indicate generation needed
export const getResumePDFUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Find the resume
    const resume = await Resume.findOne({ _id: id, userId });

    if (!resume) {
      return errorResponse(res, 404, "Resume not found");
    }

    // Check if PDF URL exists in Cloudinary
    if (resume.pdfUrl) {
      return successResponse(res, 200, "PDF URL retrieved successfully", {
        pdfUrl: resume.pdfUrl,
        fromCloudinary: true,
        resumeTitle: resume.title,
        template: resume.selectedTemplate || resume.template
      });
    }

    // If no PDF URL exists, try to generate and upload to Cloudinary
    const { template } = req.query;
    const selectedTemplate = template || resume.selectedTemplate || "modern";

    // Check if we're in a serverless environment
    const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

    if (isServerless || !CloudinaryService.isConfigured()) {
      // In serverless or if Cloudinary not configured, indicate frontend should generate
      return successResponse(res, 200, "PDF needs to be generated", {
        pdfUrl: null,
        fromCloudinary: false,
        needsGeneration: true,
        resumeData: resume,
        template: selectedTemplate
      });
    }

    // Try to generate PDF locally and upload to Cloudinary
    try {
      const pdfBuffer = await PDFService.generateResumePDF(resume, selectedTemplate);
      
      // Upload to Cloudinary
      const filename = `${resume.personalInfo?.fullName || 'Resume'}_${selectedTemplate}_${Date.now()}`;
      const uploadResult = await CloudinaryService.uploadPDF(pdfBuffer, {
        folder: `resumeai/user-resume/${userId}`,
        filename
      });

      if (uploadResult.success) {
        // Save PDF URL to resume
        resume.pdfUrl = uploadResult.secure_url;
        await resume.save();

        return successResponse(res, 200, "PDF generated and uploaded successfully", {
          pdfUrl: uploadResult.secure_url,
          fromCloudinary: true,
          resumeTitle: resume.title,
          template: selectedTemplate
        });
      } else {
        throw new Error(uploadResult.error || 'Cloudinary upload failed');
      }
    } catch (genError) {
      console.error('PDF generation/upload failed:', genError);
      
      // Fallback: indicate frontend should generate
      return successResponse(res, 200, "PDF needs to be generated on frontend", {
        pdfUrl: null,
        fromCloudinary: false,
        needsGeneration: true,
        resumeData: resume,
        template: selectedTemplate,
        error: genError.message
      });
    }

  } catch (error) {
    console.error("Get PDF URL Error:", error);
    errorResponse(res, 500, "Failed to retrieve PDF URL", {
      error: error.message,
    });
  }
};

// Upload PDF to Cloudinary (called from frontend after generation)
export const uploadResumePDFToCloudinary = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { pdfUrl } = req.body;

    if (!pdfUrl) {
      return errorResponse(res, 400, "PDF URL is required");
    }

    // Find the resume
    const resume = await Resume.findOne({ _id: id, userId });

    if (!resume) {
      return errorResponse(res, 404, "Resume not found");
    }

    // Update resume with PDF URL
    resume.pdfUrl = pdfUrl;
    await resume.save();

    return successResponse(res, 200, "PDF URL saved successfully", {
      resume,
      pdfUrl
    });

  } catch (error) {
    console.error("Upload PDF URL Error:", error);
    errorResponse(res, 500, "Failed to save PDF URL", {
      error: error.message,
    });
  }
};
