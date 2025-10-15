import Resume from "../models/resume.js";
import User from "../models/user.js";
import { successResponse, errorResponse } from "../utils/responseHandler.js";
import PDFService from "../utils/pdfService.js";

// Create a new resume
export const createResume = async (req, res) => {
  try {
    const userId = req.user.id; // From authentication middleware
    const { title, ...resumeData } = req.body;

    // Create new resume
    const newResume = new Resume({
      userId,
      title: title || "Untitled Resume",
      ...resumeData,
    });

    const savedResume = await newResume.save();

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
    const userId = req.user.id;
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
    const userId = req.user.id;

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
    const userId = req.user.id;
    const updateData = req.body;

    const resume = await Resume.findOne({ _id: id, userId });

    if (!resume) {
      return errorResponse(res, 404, "Resume not found");
    }

    // Update resume
    Object.assign(resume, updateData);
    resume.lastModified = new Date();

    const updatedResume = await resume.save();

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
    const userId = req.user.id;

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
    const userId = req.user.id;

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
    const userId = req.user.id;

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
    const userId = req.user.id;

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
    const userId = req.user.id;
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
    const userId = req.user.id;
    const { template } = req.query; // Optional template override

    // Find the resume
    const resume = await Resume.findOne({ _id: id, userId });

    if (!resume) {
      return errorResponse(res, 404, "Resume not found");
    }

    // Use specified template or resume's template
    const selectedTemplate = template || resume.selectedTemplate || 'modern';

    // Generate PDF
    const pdfBuffer = await PDFService.generateResumePDF(resume, selectedTemplate);

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

    // Set response headers for PDF download
    const filename = `${resume.personalInfo?.fullName || 'Resume'}_${selectedTemplate}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    // Send PDF buffer
    res.end(pdfBuffer);

  } catch (error) {
    console.error("Download PDF Error:", error);
    errorResponse(res, 500, "Failed to generate PDF", {
      error: error.message,
    });
  }
};