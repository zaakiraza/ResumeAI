import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useResume, useTemplates } from "../../../hooks/useResume";
import {
  FaUser,
  FaPen,
  FaBriefcase,
  FaBullseye,
  FaGraduationCap,
  FaTrophy,
  FaGlobe,
  FaPlus,
  FaPalette,
  FaEye,
  FaCheck,
  FaFilePdf,
  FaFileWord,
  FaFileAlt,
  FaSave,
  FaRocket,
  FaBrain,
  FaChevronLeft,
  FaChevronRight,
  FaStepForward,
  FaMinus,
} from "react-icons/fa";
import DashboardNavbar from "../../../components/ProtectedComponents/dashboardNavbar/DashboardNavbar";
import Footer from "../../../components/PublicComponents/footer/Footer";
import ImageUpload from "../../../components/ImageUpload/ImageUpload";
import { buildApiUrl, API_ENDPOINTS } from "../../../config/api";
import axios from "axios";
import "./CreateResume.css";

const CreateResume = () => {
  const navigate = useNavigate();
  //   const [user, setUser] = useState({});
  //   const fetchUser = async () => {
  //     try {
  //       const response = await axios.get(buildApiUrl(API_ENDPOINTS.GET_USER), {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("token")}`,
  //         },
  //       });
  //       if (!response.data.status) throw new Error("Failed to fetch user");
  //       setUser(response.data.data);
  //       //   console.log(user.firstName);
  //     } catch (error) {
  //       console.error("Fetch User Error:", error);
  //     }
  //   };
  //   useEffect(() => {
  //     fetchUser();
  //   }, []);
  const { id: resumeId } = useParams(); // Get resume ID from URL if editing
  const {
    resume,
    loading: resumeLoading,
    saving,
    createResume,
    updateResume,
    saveAsDraft,
    fetchResume,
    downloadPDF,
  } = useResume(resumeId);
  const { templates, loading: templatesLoading } = useTemplates();
  const [currentStep, setCurrentStep] = useState(1);
  const [resumeTitle, setResumeTitle] = useState("My Resume");
  const [stepStatus, setStepStatus] = useState({
    // Track status of each step: 'completed', 'skipped', 'not-started'
    1: "not-started",
    2: "not-started",
    3: "not-started",
    4: "not-started",
    5: "not-started",
    6: "not-started",
    7: "not-started",
    8: "not-started",
    9: "not-started",
    10: "not-started",
  });

  const [formData, setFormData] = useState({
    // Personal Information
    fullName: "",
    email: "",
    phone: "",
    location: "",
    profilePicture: "",

    // Career Summary
    careerObjective: "",

    // Work Experience
    workExperience: [
      {
        jobTitle: "",
        companyName: "",
        startDate: "",
        endDate: "",
        currentJob: false,
        responsibilities: "",
      },
    ],

    // Skills
    skills: [],
    skillInput: "",

    // Education
    education: [
      {
        degree: "",
        institution: "",
        graduationYear: "",
      },
    ],

    // Certifications
    certifications: [
      {
        name: "",
        institution: "",
        dateAchieved: "",
      },
    ],

    // Languages
    languages: [
      {
        name: "",
        proficiency: "",
      },
    ],

    // Additional Sections
    volunteerExperience: "",
    hobbies: "",
    projects: "",

    // Template Selection
    selectedTemplate: "modern",
  });
  const [errors, setErrors] = useState({});
  const isLoading = saving || resumeLoading || templatesLoading;

  //   console.log(formData);
  // Load existing resume data if editing
  useEffect(() => {
    if (resume) {
      // Convert resume data from API to form format
      const resumeFormData = {
        fullName: resume.personalInfo?.fullName || "",
        email: resume.personalInfo?.email || "",
        phone: resume.personalInfo?.phone || "",
        location: resume.personalInfo?.location || "",
        profilePicture: resume.personalInfo?.profilePicture || "",
        careerObjective: resume.careerObjective || "",
        workExperience: resume.workExperience?.length
          ? resume.workExperience
          : [
              {
                jobTitle: "",
                companyName: "",
                startDate: "",
                endDate: "",
                currentJob: false,
                responsibilities: "",
              },
            ],
        skills: resume.skills || [],
        skillInput: "",
        education: resume.education?.length
          ? resume.education
          : [
              {
                degree: "",
                institution: "",
                graduationYear: "",
              },
            ],
        certifications: resume.certifications?.length
          ? resume.certifications
          : [
              {
                name: "",
                institution: "",
                dateAchieved: "",
              },
            ],
        languages: resume.languages?.length
          ? resume.languages
          : [
              {
                name: "",
                proficiency: "",
              },
            ],
        volunteerExperience: resume.additionalInfo?.volunteerExperience || "",
        hobbies: resume.additionalInfo?.hobbies || "",
        projects: resume.additionalInfo?.projects || "",
        selectedTemplate: resume.selectedTemplate || "modern",
      };

      setFormData(resumeFormData);
      setResumeTitle(resume.title || "My Resume");
    }
  }, [resume]);

  // Auto-save functionality
  useEffect(() => {
    if (!resumeId || currentStep === 1) return; // Don't auto-save on first step or new resumes

    const autoSaveTimer = setTimeout(() => {
      handleAutoSave();
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [formData, resumeId]);

  const steps = [
    { id: 1, title: "Personal Info", icon: <FaUser /> },
    { id: 2, title: "Work Experience", icon: <FaBriefcase /> },
    { id: 3, title: "Skills", icon: <FaBullseye /> },
    { id: 4, title: "Education", icon: <FaGraduationCap /> },
    { id: 5, title: "Certifications", icon: <FaTrophy /> },
    { id: 6, title: "Additional Info", icon: <FaPlus /> },
    { id: 7, title: "Career Summary", icon: <FaPen /> },
    { id: 8, title: "Languages", icon: <FaGlobe /> },
    { id: 9, title: "Template", icon: <FaPalette /> },
    { id: 10, title: "Preview", icon: <FaEye /> },
  ];

  // Templates now come from useTemplates hook
  // const templates = [...] - removed, using dynamic templates

  const skillSuggestions = {
    "Software Developer": [
      "JavaScript",
      "React",
      "Node.js",
      "Python",
      "Git",
      "SQL",
    ],
    "Marketing Manager": [
      "Digital Marketing",
      "SEO",
      "Google Analytics",
      "Social Media",
      "Content Strategy",
    ],
    "Data Analyst": [
      "Python",
      "SQL",
      "Excel",
      "Tableau",
      "Statistics",
      "Data Visualization",
    ],
    "Project Manager": [
      "Agile",
      "Scrum",
      "Project Planning",
      "Risk Management",
      "Leadership",
    ],
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleArrayInputChange = (arrayName, index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addArrayItem = (arrayName, defaultItem) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], defaultItem],
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index),
    }));
  };

  const addSkill = (skill) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
        skillInput: "",
      }));
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.fullName.trim())
          newErrors.fullName = "Full name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = "Please enter a valid email";
        }
        break;
      case 7:
        if (!formData.careerObjective.trim()) {
          newErrors.careerObjective = "Career objective is required";
        }
        break;
      // All other steps are optional - no validation required
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSkipSection = () => {
    // Allow skipping all steps except step 1 (Personal Info) and step 7 (Career Summary)
    if (currentStep !== 1 && currentStep !== 7 && currentStep < steps.length) {
      // Mark current step as skipped
      setStepStatus((prev) => ({
        ...prev,
        [currentStep]: "skipped",
      }));
      setCurrentStep((prev) => prev + 1);
    }
  };

  const getSkippedSections = () => {
    return Object.entries(stepStatus)
      .filter(([stepId, status]) => status === "skipped")
      .map(([stepId]) => steps.find((step) => step.id === parseInt(stepId)))
      .filter(Boolean);
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      // Mark current step as completed
      setStepStatus((prev) => ({
        ...prev,
        [currentStep]: "completed",
      }));
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    const prevStepNum = Math.max(currentStep - 1, 1);
    // Reset status of previous step if going back to it
    if (stepStatus[prevStepNum] === "skipped") {
      setStepStatus((prev) => ({
        ...prev,
        [prevStepNum]: "not-started",
      }));
    }
    setCurrentStep(prevStepNum);
  };

  const handleAutoSave = async () => {
    if (!formData.fullName || !formData.email) return; // Don't auto-save if basic info is missing

    try {
      const resumeData = convertFormDataToResumeFormat();
      await saveAsDraft(resumeId, { title: resumeTitle, ...resumeData });
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  };

  const convertFormDataToResumeFormat = () => {
    return {
      personalInfo: {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        profilePicture: formData.profilePicture,
      },
      careerObjective: formData.careerObjective,
      workExperience: formData.workExperience.filter(
        (exp) => exp.jobTitle || exp.companyName
      ),
      skills: formData.skills,
      education: formData.education.filter(
        (edu) => edu.degree || edu.institution
      ),
      certifications: formData.certifications.filter(
        (cert) => cert.name || cert.institution
      ),
      languages: formData.languages.filter((lang) => lang.name),
      additionalInfo: {
        volunteerExperience: formData.volunteerExperience,
        hobbies: formData.hobbies,
        projects: formData.projects,
      },
      selectedTemplate: formData.selectedTemplate,
    };
  };

  const saveResume = async (isDraft = true) => {
    try {
      const resumeData = convertFormDataToResumeFormat();
      const payload = {
        title: resumeTitle,
        status: isDraft ? "draft" : "completed",
        ...resumeData,
      };

      let result;
      if (resumeId && resumeId !== "new") {
        // Update existing resume
        result = await updateResume(resumeId, payload);
      } else {
        // Create new resume
        result = await createResume(payload);
      }

      if (result) {
        if (isDraft) {
          alert("Resume saved as draft!");
        } else {
          alert("Resume saved successfully!");
          navigate("/dashboard");
        }
      }
    } catch (error) {
      console.error("Error saving resume:", error);
      alert("An error occurred while saving. Please try again.");
    }
  };

  const generateAISuggestions = (jobTitle) => {
    return skillSuggestions[jobTitle] || [];
  };

  // Handle resume download
  const handleDownloadResume = async (format = "pdf", template = null) => {
    // Check if resume is saved
    if (!resumeId || resumeId === "new") {
      alert("Please save your resume first before downloading.");
      return;
    }

    try {
      if (format === "pdf") {
        // Show loading notification
        const notification = document.createElement("div");
        notification.className = "download-notification";
        notification.innerHTML = `
          <div class="notification-content">
            <div class="loading-spinner"></div>
            <span>Generating PDF...</span>
          </div>
        `;
        document.body.appendChild(notification);

        // Use the selected template or current form template
        const selectedTemplate =
          template || formData.selectedTemplate || "modern";

        // Download PDF
        const result = await downloadPDF(resumeId, selectedTemplate);

        // Remove loading notification
        document.body.removeChild(notification);

        // Show success message
        alert(`Resume downloaded successfully as ${result.filename}!`);
      } else {
        // For Word and Text formats, show coming soon message
        alert(
          `${format.toUpperCase()} download will be available soon! PDF download is currently available.`
        );
      }
    } catch (error) {
      console.error("Download failed:", error);

      // Remove loading notification if it exists
      const notification = document.querySelector(".download-notification");
      if (notification) {
        document.body.removeChild(notification);
      }

      alert("Failed to download resume. Please try again.");
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="create-resume-step">
            <div className="create-resume-step-header">
              <h2>
                Personal Information{" "}
                <span className="required-indicator">*Required</span>
              </h2>
              <p>This information will be visible at the top of your resume.</p>
            </div>

            <div className="create-resume-form-grid">
              <div className="create-resume-form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  type="text"
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
                  placeholder="John Doe"
                  className={errors.fullName ? "error" : ""}
                />
                {errors.fullName && (
                  <span className="error-message">{errors.fullName}</span>
                )}
              </div>

              <div className="create-resume-form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="john.doe@example.com"
                  className={errors.email ? "error" : ""}
                />
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>

              <div className="create-resume-form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="create-resume-form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                  placeholder="City, Country"
                />
              </div>

              <div className="create-resume-form-group create-resume-full-width">
                <label>Profile Picture (Optional)</label>
                <ImageUpload
                  value={formData.profilePicture}
                  onChange={(url) => handleInputChange("profilePicture", url)}
                  placeholder="Upload your professional headshot"
                  previewSize="150px"
                  folder="resumeai/profile-pictures"
                  onUploadStart={() => {
                    console.log("Upload started...");
                  }}
                  onUploadComplete={(result) => {
                    console.log("Upload completed:", result.secure_url);
                  }}
                  onUploadError={(error) => {
                    console.error("Upload error:", error);
                  }}
                />
                <p className="create-resume-help-text">
                  Upload a professional headshot (JPG, PNG, WEBP). Recommended
                  size: 400x400px
                </p>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="create-resume-step">
            <div className="create-resume-step-header">
              <h2>
                Career Summary{" "}
                <span className="required-indicator">*Required</span>
              </h2>
              <p>
                Write a short summary of your professional experience and career
                goals.
              </p>
            </div>

            <div className="create-resume-form-group">
              <label htmlFor="careerObjective">Career Objective *</label>
              <textarea
                id="careerObjective"
                value={formData.careerObjective}
                onChange={(e) =>
                  handleInputChange("careerObjective", e.target.value)
                }
                placeholder="Experienced software developer with 5+ years of expertise in full-stack development. Passionate about creating efficient, scalable solutions and leading development teams to deliver high-quality products."
                rows="6"
                className={errors.careerObjective ? "error" : ""}
              />
              {errors.careerObjective && (
                <span className="error-message">{errors.careerObjective}</span>
              )}
              <p className="create-resume-help-text">
                AI Tip: Keep it concise (2-3 sentences) and highlight your key
                strengths
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="create-resume-step">
            <div className="create-resume-step-header">
              <h2>
                Work Experience{" "}
                <span className="optional-indicator">Optional</span>
              </h2>
              <p>
                Enter your most recent work experience. Start with your current
                or most recent job. You can skip this section if you don't have
                work experience yet.
              </p>
            </div>

            {formData.workExperience.map((exp, index) => (
              <div key={index} className="create-resume-experience-block">
                <div className="create-resume-block-header">
                  <h3>Job #{index + 1}</h3>
                  {formData.workExperience.length > 1 && (
                    <button
                      type="button"
                      className="create-resume-remove-btn"
                      onClick={() => removeArrayItem("workExperience", index)}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="create-resume-form-grid">
                  <div className="create-resume-form-group">
                    <label>Job Title *</label>
                    <input
                      type="text"
                      value={exp.jobTitle}
                      onChange={(e) =>
                        handleArrayInputChange(
                          "workExperience",
                          index,
                          "jobTitle",
                          e.target.value
                        )
                      }
                      placeholder="Software Developer"
                      className={
                        errors[`workExperience_${index}_jobTitle`]
                          ? "error"
                          : ""
                      }
                    />
                    {errors[`workExperience_${index}_jobTitle`] && (
                      <span className="error-message">
                        {errors[`workExperience_${index}_jobTitle`]}
                      </span>
                    )}
                  </div>

                  <div className="create-resume-form-group">
                    <label>Company Name *</label>
                    <input
                      type="text"
                      value={exp.companyName}
                      onChange={(e) =>
                        handleArrayInputChange(
                          "workExperience",
                          index,
                          "companyName",
                          e.target.value
                        )
                      }
                      placeholder="Tech Company Inc."
                      className={
                        errors[`workExperience_${index}_companyName`]
                          ? "error"
                          : ""
                      }
                    />
                    {errors[`workExperience_${index}_companyName`] && (
                      <span className="error-message">
                        {errors[`workExperience_${index}_companyName`]}
                      </span>
                    )}
                  </div>

                  <div className="create-resume-form-group">
                    <label>Start Date</label>
                    <input
                      type="month"
                      value={exp.startDate}
                      onChange={(e) =>
                        handleArrayInputChange(
                          "workExperience",
                          index,
                          "startDate",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="create-resume-form-group">
                    <label>End Date</label>
                    <input
                      type="month"
                      value={exp.endDate}
                      onChange={(e) =>
                        handleArrayInputChange(
                          "workExperience",
                          index,
                          "endDate",
                          e.target.value
                        )
                      }
                      disabled={exp.currentJob}
                    />
                    <label className="create-resume-checkbox">
                      <input
                        type="checkbox"
                        checked={exp.currentJob}
                        onChange={(e) =>
                          handleArrayInputChange(
                            "workExperience",
                            index,
                            "currentJob",
                            e.target.checked
                          )
                        }
                      />
                      Current Job
                    </label>
                  </div>
                </div>

                <div className="create-resume-form-group">
                  <label>Key Responsibilities</label>
                  <textarea
                    value={exp.responsibilities}
                    onChange={(e) =>
                      handleArrayInputChange(
                        "workExperience",
                        index,
                        "responsibilities",
                        e.target.value
                      )
                    }
                    placeholder="• Developed and maintained web applications using React and Node.js&#10;• Led a team of 3 developers on multiple projects&#10;• Improved application performance by 40%"
                    rows="4"
                  />
                  <p className="create-resume-help-text">
                    Use bullet points and start with action verbs
                  </p>
                </div>

                {exp.jobTitle &&
                  generateAISuggestions(exp.jobTitle).length > 0 && (
                    <div className="create-resume-ai-suggestions">
                      <p>
                        <FaBrain /> AI Suggested Skills for {exp.jobTitle}:
                      </p>
                      <div className="create-resume-skill-suggestions">
                        {generateAISuggestions(exp.jobTitle).map((skill) => (
                          <button
                            key={skill}
                            type="button"
                            className="create-resume-skill-suggestion"
                            onClick={() => addSkill(skill)}
                          >
                            + {skill}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ))}

            <button
              type="button"
              className="create-resume-add-btn"
              onClick={() =>
                addArrayItem("workExperience", {
                  jobTitle: "",
                  companyName: "",
                  startDate: "",
                  endDate: "",
                  currentJob: false,
                  responsibilities: "",
                })
              }
            >
              + Add Another Job
            </button>
          </div>
        );

      case 3:
        return (
          <div className="create-resume-step">
            <div className="create-resume-step-header">
              <h2>
                Skills & Competencies{" "}
                <span className="optional-indicator">Optional</span>
              </h2>
              <p>
                Enter the key skills you want to showcase. AI will suggest
                relevant skills based on your work experience. You can skip this
                section and add skills later.
              </p>
            </div>

            <div className="create-resume-form-group">
              <label>Add Skills *</label>
              <div className="create-resume-skill-input">
                <input
                  type="text"
                  value={formData.skillInput}
                  onChange={(e) =>
                    handleInputChange("skillInput", e.target.value)
                  }
                  placeholder="Type a skill and press Enter"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill(formData.skillInput.trim());
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => addSkill(formData.skillInput.trim())}
                  className="create-resume-add-skill-btn"
                >
                  Add
                </button>
              </div>
              {errors.skills && (
                <span className="error-message">{errors.skills}</span>
              )}
            </div>

            <div className="create-resume-skills-display">
              {formData.skills.map((skill, index) => (
                <div key={index} className="create-resume-skill-tag">
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="create-resume-remove-skill"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="create-resume-skill-categories">
              <h4>Popular Skills by Category:</h4>
              <div className="create-resume-skill-category">
                <h5>Technical Skills</h5>
                <div className="create-resume-skill-suggestions">
                  {[
                    "JavaScript",
                    "Python",
                    "React",
                    "Node.js",
                    "SQL",
                    "Git",
                  ].map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      className="create-resume-skill-suggestion"
                      onClick={() => addSkill(skill)}
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>
              <div className="create-resume-skill-category">
                <h5>Soft Skills</h5>
                <div className="create-resume-skill-suggestions">
                  {[
                    "Leadership",
                    "Communication",
                    "Problem Solving",
                    "Teamwork",
                    "Project Management",
                    "Time Management",
                  ].map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      className="create-resume-skill-suggestion"
                      onClick={() => addSkill(skill)}
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="create-resume-step">
            <div className="create-resume-step-header">
              <h2>
                Education Details{" "}
                <span className="optional-indicator">Optional</span>
              </h2>
              <p>
                Please enter your most recent degree. Add additional
                certifications or courses if relevant. You can skip this section
                if not applicable.
              </p>
            </div>

            {formData.education.map((edu, index) => (
              <div key={index} className="create-resume-education-block">
                <div className="create-resume-block-header">
                  <h3>Education #{index + 1}</h3>
                  {formData.education.length > 1 && (
                    <button
                      type="button"
                      className="create-resume-remove-btn"
                      onClick={() => removeArrayItem("education", index)}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="create-resume-form-grid">
                  <div className="create-resume-form-group">
                    <label>Degree *</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) =>
                        handleArrayInputChange(
                          "education",
                          index,
                          "degree",
                          e.target.value
                        )
                      }
                      placeholder="Bachelor of Science in Computer Science"
                      className={
                        errors[`education_${index}_degree`] ? "error" : ""
                      }
                    />
                    {errors[`education_${index}_degree`] && (
                      <span className="error-message">
                        {errors[`education_${index}_degree`]}
                      </span>
                    )}
                  </div>

                  <div className="create-resume-form-group">
                    <label>Institution *</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) =>
                        handleArrayInputChange(
                          "education",
                          index,
                          "institution",
                          e.target.value
                        )
                      }
                      placeholder="University of Technology"
                      className={
                        errors[`education_${index}_institution`] ? "error" : ""
                      }
                    />
                    {errors[`education_${index}_institution`] && (
                      <span className="error-message">
                        {errors[`education_${index}_institution`]}
                      </span>
                    )}
                  </div>

                  <div className="create-resume-form-group">
                    <label>Graduation Year</label>
                    <input
                      type="number"
                      value={edu.graduationYear}
                      onChange={(e) =>
                        handleArrayInputChange(
                          "education",
                          index,
                          "graduationYear",
                          e.target.value
                        )
                      }
                      placeholder="2020"
                      min="1950"
                      max="2030"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="create-resume-add-btn"
              onClick={() =>
                addArrayItem("education", {
                  degree: "",
                  institution: "",
                  graduationYear: "",
                })
              }
            >
              + Add Another Education
            </button>
          </div>
        );

      case 5:
        return (
          <div className="create-resume-step">
            <div className="create-resume-step-header">
              <h2>
                Certifications & Achievements{" "}
                <span className="optional-indicator">Optional</span>
              </h2>
              <p>
                Add any certifications, licenses, or awards relevant to your
                career. You can skip this section if you don't have any yet.
              </p>
            </div>

            {formData.certifications.map((cert, index) => (
              <div key={index} className="create-resume-certification-block">
                <div className="create-resume-block-header">
                  <h3>Certification #{index + 1}</h3>
                  {formData.certifications.length > 1 && (
                    <button
                      type="button"
                      className="create-resume-remove-btn"
                      onClick={() => removeArrayItem("certifications", index)}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="create-resume-form-grid">
                  <div className="create-resume-form-group">
                    <label>Certification Name</label>
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) =>
                        handleArrayInputChange(
                          "certifications",
                          index,
                          "name",
                          e.target.value
                        )
                      }
                      placeholder="AWS Certified Solutions Architect"
                    />
                  </div>

                  <div className="create-resume-form-group">
                    <label>Issuing Organization</label>
                    <input
                      type="text"
                      value={cert.institution}
                      onChange={(e) =>
                        handleArrayInputChange(
                          "certifications",
                          index,
                          "institution",
                          e.target.value
                        )
                      }
                      placeholder="Amazon Web Services"
                    />
                  </div>

                  <div className="create-resume-form-group">
                    <label>Date Achieved</label>
                    <input
                      type="month"
                      value={cert.dateAchieved}
                      onChange={(e) =>
                        handleArrayInputChange(
                          "certifications",
                          index,
                          "dateAchieved",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="create-resume-add-btn"
              onClick={() =>
                addArrayItem("certifications", {
                  name: "",
                  institution: "",
                  dateAchieved: "",
                })
              }
            >
              + Add Another Certification
            </button>
          </div>
        );

      case 8:
        return (
          <div className="create-resume-step">
            <div className="create-resume-step-header">
              <h2>
                Language Proficiency{" "}
                <span className="optional-indicator">Optional</span>
              </h2>
              <p>
                Enter any languages you know, along with your proficiency level.
                You can skip this section if you only speak one language.
              </p>
            </div>

            {formData.languages.map((lang, index) => (
              <div key={index} className="create-resume-language-block">
                <div className="create-resume-block-header">
                  <h3>Language #{index + 1}</h3>
                  {formData.languages.length > 1 && (
                    <button
                      type="button"
                      className="create-resume-remove-btn"
                      onClick={() => removeArrayItem("languages", index)}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="create-resume-form-grid">
                  <div className="create-resume-form-group">
                    <label>Language</label>
                    <input
                      type="text"
                      value={lang.name}
                      onChange={(e) =>
                        handleArrayInputChange(
                          "languages",
                          index,
                          "name",
                          e.target.value
                        )
                      }
                      placeholder="Spanish"
                    />
                  </div>

                  <div className="create-resume-form-group">
                    <label>Proficiency Level</label>
                    <select
                      value={lang.proficiency}
                      onChange={(e) =>
                        handleArrayInputChange(
                          "languages",
                          index,
                          "proficiency",
                          e.target.value
                        )
                      }
                    >
                      <option value="">Select Level</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Fluent">Fluent</option>
                      <option value="Native">Native</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="create-resume-add-btn"
              onClick={() =>
                addArrayItem("languages", {
                  name: "",
                  proficiency: "",
                })
              }
            >
              + Add Another Language
            </button>
          </div>
        );

      case 6:
        return (
          <div className="create-resume-step">
            <div className="create-resume-step-header">
              <h2>
                Additional Information{" "}
                <span className="optional-indicator">Optional</span>
              </h2>
              <p>
                Feel free to add any extra sections that will make your resume
                stand out. This section is completely optional.
              </p>
            </div>

            <div className="create-resume-form-group">
              <label>Volunteer Experience</label>
              <textarea
                value={formData.volunteerExperience}
                onChange={(e) =>
                  handleInputChange("volunteerExperience", e.target.value)
                }
                placeholder="Volunteer at local animal shelter (2019-2021)&#10;• Organized fundraising events that raised $5,000&#10;• Managed social media accounts"
                rows="4"
              />
            </div>

            <div className="create-resume-form-group">
              <label>Notable Projects</label>
              <textarea
                value={formData.projects}
                onChange={(e) => handleInputChange("projects", e.target.value)}
                placeholder="E-commerce Web Application (2023)&#10;• Built using React, Node.js, and MongoDB&#10;• Implemented payment gateway and user authentication"
                rows="4"
              />
            </div>

            <div className="create-resume-form-group">
              <label>Hobbies & Interests</label>
              <textarea
                value={formData.hobbies}
                onChange={(e) => handleInputChange("hobbies", e.target.value)}
                placeholder="Photography, Hiking, Playing Guitar, Reading Technology Blogs"
                rows="3"
              />
              <p className="create-resume-help-text">
                Keep it professional and relevant to your career goals
              </p>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="create-resume-step">
            <div className="create-resume-step-header">
              <h2>
                Choose Your Template{" "}
                <span className="optional-indicator">Optional</span>
              </h2>
              <p>
                Select a template that best suits your style. You can switch it
                anytime! A default template will be used if you skip this step.
              </p>
            </div>

            <div className="create-resume-template-grid">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`create-resume-template-card ${
                    formData.selectedTemplate === template.id ? "selected" : ""
                  }`}
                  onClick={() =>
                    handleInputChange("selectedTemplate", template.id)
                  }
                >
                  <div className="create-resume-template-preview">
                    <div className="create-resume-template-placeholder">
                      <span className="template-icon">
                        <FaFileAlt />
                      </span>
                    </div>
                  </div>
                  <h3>{template.name}</h3>
                  <p>Professional and clean design</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 10:
        return (
          <div className="create-resume-step">
            <div className="create-resume-step-header">
              <h2>Preview & Download</h2>
              <p>
                Review your resume and make any final adjustments before
                downloading.
              </p>
            </div>

            {/* Reminder about skipped sections */}
            {getSkippedSections().length > 0 && (
              <div className="create-resume-skipped-reminder">
                <div className="create-resume-skipped-icon">
                  <FaMinus />
                </div>
                <div className="create-resume-skipped-content">
                  <h3>Sections You Skipped</h3>
                  <p>
                    You skipped the following sections. You can always add them
                    later:
                  </p>
                  <ul>
                    {getSkippedSections().map((section) => (
                      <li key={section.id}>
                        {section.icon} {section.title}
                      </li>
                    ))}
                  </ul>
                  <p className="create-resume-skipped-note">
                    <em>
                      These sections can help make your resume more
                      comprehensive, but are not required.
                    </em>
                  </p>
                </div>
              </div>
            )}

            <div className="create-resume-preview-container">
              <div className="create-resume-preview">
                <div className="create-resume-preview-header">
                  <h1>{formData.fullName}</h1>
                  <div className="create-resume-preview-contact">
                    <p>{formData.email}</p>
                    {formData.phone && <p>{formData.phone}</p>}
                    {formData.location && <p>{formData.location}</p>}
                  </div>
                </div>

                {formData.careerObjective && (
                  <div className="create-resume-preview-section">
                    <h3>Professional Summary</h3>
                    <p>{formData.careerObjective}</p>
                  </div>
                )}

                {formData.workExperience.some((exp) => exp.jobTitle) && (
                  <div className="create-resume-preview-section">
                    <h3>Work Experience</h3>
                    {formData.workExperience.map(
                      (exp, index) =>
                        exp.jobTitle && (
                          <div
                            key={index}
                            className="create-resume-preview-item"
                          >
                            <h4>
                              {exp.jobTitle} - {exp.companyName}
                            </h4>
                            <p className="create-resume-preview-date">
                              {exp.startDate} -{" "}
                              {exp.currentJob ? "Present" : exp.endDate}
                            </p>
                            {exp.responsibilities && (
                              <p>{exp.responsibilities}</p>
                            )}
                          </div>
                        )
                    )}
                  </div>
                )}

                {formData.skills.length > 0 && (
                  <div className="create-resume-preview-section">
                    <h3>Skills</h3>
                    <div className="create-resume-preview-skills">
                      {formData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="create-resume-preview-skill"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {formData.education.some((edu) => edu.degree) && (
                  <div className="create-resume-preview-section">
                    <h3>Education</h3>
                    {formData.education.map(
                      (edu, index) =>
                        edu.degree && (
                          <div
                            key={index}
                            className="create-resume-preview-item"
                          >
                            <h4>{edu.degree}</h4>
                            <p>
                              {edu.institution} - {edu.graduationYear}
                            </p>
                          </div>
                        )
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="create-resume-download-options">
              <h3>Download Your Resume</h3>
              
              {/* Template Selection for PDF */}
              {(resumeId && resumeId !== "new") && (
                <div className="template-selection">
                  <label htmlFor="download-template">Choose Template:</label>
                  <select 
                    id="download-template" 
                    defaultValue={formData.selectedTemplate || "modern"}
                    onChange={(e) => setFormData(prev => ({...prev, selectedTemplate: e.target.value}))}
                  >
                    <option value="modern">Modern Professional</option>
                    <option value="classic">Classic Traditional</option>
                    <option value="creative">Creative Designer</option>
                    <option value="minimal">Clean Minimal</option>
                  </select>
                </div>
              )}

              <div className="create-resume-download-buttons">
                <button
                  className="create-resume-download-btn pdf"
                  onClick={() => handleDownloadResume("pdf")}
                  disabled={!resumeId || resumeId === "new"}
                >
                  <FaFilePdf /> Download PDF
                </button>
                <button
                  className="create-resume-download-btn word"
                  onClick={() => handleDownloadResume("word")}
                  disabled={!resumeId || resumeId === "new"}
                >
                  <FaFileWord /> Download Word
                </button>
                <button
                  className="create-resume-download-btn txt"
                  onClick={() => handleDownloadResume("txt")}
                  disabled={!resumeId || resumeId === "new"}
                >
                  <FaFileAlt /> Download Text
                </button>
              </div>
              {(!resumeId || resumeId === "new") && (
                <p className="download-note">
                  Please save your resume first to enable downloads.
                </p>
              )}
            </div>
          </div>
        );

      default:
        return <div>Step not found</div>;
    }
  };

  // Show loading screen while fetching data
  if (resumeLoading && resumeId) {
    return (
      <>
        <DashboardNavbar />
        <div className="create-resume-page">
          <div className="loading-container">
            <div className="loading-content">
              <div className="loading-spinner"></div>
              <h2>Loading Resume...</h2>
              <p>Please wait while we fetch your resume data.</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardNavbar />
      <div className="create-resume-page">
        {/* Hero Section */}
        <section className="create-resume-hero">
          <div className="create-resume-container">
            <div className="create-resume-hero-content">
              <h1 className="create-resume-hero-title">
                Create Your Perfect Resume
              </h1>
              <p className="create-resume-hero-subtitle">
                Step-by-step guidance to help you create a professional resume
                that gets you hired.
              </p>
            </div>
          </div>
        </section>

        {/* Progress Bar */}
        <section className="create-resume-progress">
          <div className="create-resume-container">
            <div className="create-resume-progress-bar">
              {steps.map((step) => {
                const status = stepStatus[step.id];
                const isActive = step.id === currentStep;

                return (
                  <div
                    key={step.id}
                    className={`create-resume-progress-step ${
                      isActive
                        ? "active"
                        : status === "completed"
                        ? "completed"
                        : status === "skipped"
                        ? "skipped"
                        : ""
                    }`}
                  >
                    <div className="create-resume-progress-circle">
                      {status === "completed" ? (
                        <FaCheck />
                      ) : status === "skipped" ? (
                        <FaMinus />
                      ) : (
                        step.icon
                      )}
                    </div>
                    <span className="create-resume-progress-label">
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Main Form */}
        <section className="create-resume-main">
          <div className="create-resume-container">
            <div className="create-resume-form-container">
              {renderStepContent()}

              {/* Navigation Buttons */}
              <div className="create-resume-navigation">
                <div className="create-resume-nav-left">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      className="create-resume-nav-btn create-resume-nav-prev"
                      onClick={prevStep}
                    >
                      <FaChevronLeft /> Previous
                    </button>
                  )}
                </div>

                <div className="create-resume-nav-center">
                  <button
                    type="button"
                    className="create-resume-nav-btn create-resume-nav-save"
                    onClick={() => saveResume(true)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      "Saving..."
                    ) : (
                      <>
                        <FaSave /> Save Draft
                      </>
                    )}
                  </button>
                </div>

                <div className="create-resume-nav-right">
                  {currentStep < steps.length ? (
                    <div className="create-resume-nav-buttons">
                      {/* Skip button for optional sections (all except steps 1 and 7) */}
                      {currentStep !== 1 && currentStep !== 7 && (
                        <button
                          type="button"
                          className="create-resume-nav-btn create-resume-nav-skip"
                          onClick={handleSkipSection}
                        >
                          <FaStepForward /> Skip
                        </button>
                      )}
                      <button
                        type="button"
                        className="create-resume-nav-btn create-resume-nav-next"
                        onClick={nextStep}
                      >
                        Next <FaChevronRight />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="create-resume-nav-btn create-resume-nav-finish"
                      onClick={() => saveResume(false)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        "Finishing..."
                      ) : (
                        <>
                          <FaRocket /> Complete Resume
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default CreateResume;
