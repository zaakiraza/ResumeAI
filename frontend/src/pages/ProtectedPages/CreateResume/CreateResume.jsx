import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useResume, useTemplates } from "../../../hooks/useResume";
import { useSkills } from "../../../hooks/useSkills";
import useProofreader from "../../../hooks/useProofreader";
import useRewriter from "../../../hooks/useRewriter";
import useSummarizer from "../../../hooks/useSummarizer";
import toast from "react-hot-toast";
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
  FaSpellCheck,
  FaMagic,
  FaCompressAlt,
} from "react-icons/fa";
import Footer from "../../../components/PublicComponents/footer/Footer";
import ImageUpload from "../../../components/ImageUpload/ImageUpload";
import ChromeAIStatus from "../../../components/ChromeAIStatus";
import { buildApiUrl, API_ENDPOINTS } from "../../../config/api";
import axios from "axios";
import "./CreateResume.css";
import "./AIFeatures.css";

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
  const {
    suggestions,
    popularSkills,
    loading: skillsLoading,
    fetchPopularSkills,
    debouncedSearch,
  } = useSkills();
  
  // AI Feature Hooks
  const { proofread, corrections, isProofreading, applyAllCorrections } = useProofreader();
  const { makeProfessional, improveClarity, shorten, isRewriting } = useRewriter();
  const { summarizeWorkExperience, isSummarizing } = useSummarizer();
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
    links: [
      {
        label: "",
        url: "",
      },
    ],

    // Career Summary
    careerObjective: "",
    
    // AI Writer state
    generatingCareerSummary: false,

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
        links: resume.personalInfo?.links?.length
          ? resume.personalInfo.links
          : [{ label: "", url: "" }],
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

  // Fetch popular skills when component mounts
  useEffect(() => {
    fetchPopularSkills(30); // Get top 30 popular skills
  }, [fetchPopularSkills]);

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

  // AI Career Summary Generator
  const generateCareerSummary = async () => {
    // Check if Writer API is available
    if (!('Writer' in self)) {
      toast.error('Writer API is not available. Please use Chrome Canary with the Writer API flag enabled.');
      return;
    }

    // Check if we have enough information to generate
    const hasWorkExp = formData.workExperience.some(exp => exp.jobTitle || exp.companyName);
    const hasSkills = formData.skills.length > 0;
    const hasEducation = formData.education.some(edu => edu.degree || edu.institution);

    if (!hasWorkExp && !hasSkills && !hasEducation) {
      toast.error('Please fill in at least some work experience, skills, or education first.');
      return;
    }

    setFormData(prev => ({ ...prev, generatingCareerSummary: true }));

    try {
      // Check availability
      const availability = await Writer.availability();
      
      if (availability !== 'readily' && availability !== 'available') {
        toast.error(`Writer API is not ready. Status: ${availability}`);
        setFormData(prev => ({ ...prev, generatingCareerSummary: false }));
        return;
      }

      // Build context from existing form data
      let context = '';
      
      // Add work experience
      if (hasWorkExp) {
        context += 'Work Experience:\n';
        formData.workExperience
          .filter(exp => exp.jobTitle || exp.companyName)
          .forEach(exp => {
            if (exp.jobTitle) context += `- ${exp.jobTitle}`;
            if (exp.companyName) context += ` at ${exp.companyName}`;
            if (exp.responsibilities) context += `: ${exp.responsibilities}`;
            context += '\n';
          });
        context += '\n';
      }

      // Add skills
      if (hasSkills) {
        context += `Skills: ${formData.skills.join(', ')}\n\n`;
      }

      // Add education
      if (hasEducation) {
        context += 'Education:\n';
        formData.education
          .filter(edu => edu.degree || edu.institution)
          .forEach(edu => {
            if (edu.degree) context += `- ${edu.degree}`;
            if (edu.institution) context += ` from ${edu.institution}`;
            if (edu.graduationYear) context += ` (${edu.graduationYear})`;
            context += '\n';
          });
        context += '\n';
      }

      // Add certifications
      const hasCerts = formData.certifications.some(cert => cert.name);
      if (hasCerts) {
        context += 'Certifications: ';
        context += formData.certifications
          .filter(cert => cert.name)
          .map(cert => cert.name)
          .join(', ');
        context += '\n\n';
      }

      // Add additional info
      if (formData.volunteerExperience) {
        context += `Volunteer Experience: ${formData.volunteerExperience}\n\n`;
      }
      if (formData.projects) {
        context += `Projects: ${formData.projects}\n\n`;
      }

      console.log('Generating career summary with context:', context);

      // Create writer with options
      const writer = await Writer.create({
        tone: 'formal',
        format: 'plain-text',
        length: 'short',
        sharedContext: context,
        expectedInputLanguages: ['en'],
        expectedContextLanguages: ['en'],
        outputLanguage: 'en',
      });

      // Generate the summary
      const prompt = 'Write a professional career summary/objective for a resume based on the provided experience, skills, and education. Keep it concise (2-3 sentences) and impactful.';
      const result = await writer.write(prompt);

      // Clean up
      writer.destroy();

      console.log('Generated career summary:', result);

      // Update form data
      handleInputChange('careerObjective', result);
      toast.success('Career summary generated successfully!');

    } catch (error) {
      console.error('Error generating career summary:', error);
      toast.error('Failed to generate career summary: ' + error.message);
    } finally {
      setFormData(prev => ({ ...prev, generatingCareerSummary: false }));
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
        links: formData.links.filter((link) => link.label && link.url),
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
          toast.success("Resume saved as draft!");
        } else {
          toast.success("Resume saved successfully!");
          navigate("/dashboard");
        }
      }
    } catch (error) {
      console.error("Error saving resume:", error);
      toast.error("An error occurred while saving. Please try again.");
    }
  };

  const generateAISuggestions = (jobTitle) => {
    return skillSuggestions[jobTitle] || [];
  };

  // Handle resume download
  const handleDownloadResume = async (format = "pdf", template = null) => {
    // Check if resume is saved
    if (!resumeId || resumeId === "new") {
      toast.error("Please save your resume first before downloading.");
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
        toast.success(`Resume downloaded successfully as ${result.filename}!`);
      } else {
        // For Word and Text formats, show coming soon message
        toast.info(
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

      toast.error("Failed to download resume. Please try again.");
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

              {/* Links Section */}
              <div className="create-resume-form-group create-resume-full-width">
                <label>
                  <FaGlobe style={{ marginRight: "8px" }} />
                  Professional Links (LinkedIn, Portfolio, GitHub, etc.)
                </label>
                {formData.links.map((link, index) => (
                  <div key={index} className="create-resume-array-item">
                    <div className="create-resume-form-grid">
                      <div className="create-resume-form-group">
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) =>
                            handleArrayInputChange("links", index, "label", e.target.value)
                          }
                          placeholder="Label (e.g., LinkedIn, Portfolio, GitHub)"
                        />
                      </div>
                      <div className="create-resume-form-group">
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) =>
                            handleArrayInputChange("links", index, "url", e.target.value)
                          }
                          placeholder="https://linkedin.com/in/yourprofile"
                        />
                      </div>
                    </div>
                    {formData.links.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem("links", index)}
                        className="create-resume-remove-btn"
                      >
                        <FaMinus /> Remove Link
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    addArrayItem("links", { label: "", url: "" })
                  }
                  className="create-resume-add-btn"
                >
                  <FaPlus /> Add Another Link
                </button>
                <p className="create-resume-help-text">
                  Add your LinkedIn, portfolio, GitHub, personal website, or other professional profiles
                </p>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label htmlFor="careerObjective">Career Objective *</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="ai-action-btn"
                    onClick={async () => {
                      if (!formData.careerObjective.trim()) {
                        toast.error('Please write some text first');
                        return;
                      }
                      
                      const loadingToast = toast.loading('Checking grammar and spelling...');
                      
                      try {
                        const result = await proofread(formData.careerObjective);
                        toast.dismiss(loadingToast);
                        
                        if (result && result.corrections && result.corrections.length > 0) {
                          handleInputChange('careerObjective', result.corrected);
                          toast.success(`✅ Fixed ${result.corrections.length} error(s)!`);
                        } else {
                          toast.success('✅ No errors found! Your text looks great.');
                        }
                      } catch (error) {
                        toast.dismiss(loadingToast);
                        console.error('Proofread error:', error);
                        toast.error('Failed to proofread. Please check console for details.');
                      }
                    }}
                    disabled={isProofreading || !formData.careerObjective.trim()}
                    title="Check grammar and spelling"
                    style={{
                      padding: '8px 12px',
                      backgroundColor: isProofreading ? '#6c757d' : '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: isProofreading || !formData.careerObjective.trim() ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <FaSpellCheck />
                    {isProofreading ? 'Checking...' : 'Proofread'}
                  </button>
                  
                  <button
                    type="button"
                    className="ai-action-btn"
                    onClick={async () => {
                      if (!formData.careerObjective.trim()) {
                        toast.error('Please write some text first');
                        return;
                      }
                      try {
                        const result = await makeProfessional(formData.careerObjective);
                        handleInputChange('careerObjective', result);
                        toast.success('Text refined!');
                      } catch (error) {
                        console.error('Rewrite error:', error);
                      }
                    }}
                    disabled={isRewriting || !formData.careerObjective.trim()}
                    title="Make text more professional"
                    style={{
                      padding: '8px 12px',
                      backgroundColor: isRewriting ? '#6c757d' : '#17a2b8',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: isRewriting || !formData.careerObjective.trim() ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <FaMagic />
                    {isRewriting ? 'Refining...' : 'Refine'}
                  </button>
                  
                  <button
                    type="button"
                    className="ai-generate-btn"
                    onClick={generateCareerSummary}
                    disabled={formData.generatingCareerSummary}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      backgroundColor: formData.generatingCareerSummary ? '#6c757d' : '#4285f4',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: formData.generatingCareerSummary ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseOver={(e) => {
                      if (!formData.generatingCareerSummary) {
                        e.currentTarget.style.backgroundColor = '#3367d6';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!formData.generatingCareerSummary) {
                        e.currentTarget.style.backgroundColor = '#4285f4';
                      }
                    }}
                  >
                    <FaBrain />
                    {formData.generatingCareerSummary ? 'Generating...' : 'Generate with AI'}
                  </button>
                </div>
              </div>
              <textarea
                id="careerObjective"
                value={formData.careerObjective}
                onChange={(e) =>
                  handleInputChange("careerObjective", e.target.value)
                }
                placeholder="Experienced software developer with 5+ years of expertise in full-stack development. Passionate about creating efficient, scalable solutions and leading development teams to deliver high-quality products."
                rows="6"
                className={errors.careerObjective ? "error" : ""}
                disabled={formData.generatingCareerSummary}
              />
              {errors.careerObjective && (
                <span className="error-message">{errors.careerObjective}</span>
              )}
              <p className="create-resume-help-text">
                <FaBrain style={{ marginRight: '5px' }} />
                AI Tip: Click "Generate with AI" to automatically create a summary based on your work experience, skills, and education. Use "Proofread" to check grammar and "Refine" to make it more professional.
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label>Key Responsibilities</label>
                    {exp.responsibilities && exp.responsibilities.trim().length > 0 && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={async () => {
                            const loadingToast = toast.loading('Checking grammar and spelling...');
                            
                            try {
                              const result = await proofread(exp.responsibilities);
                              toast.dismiss(loadingToast);
                              
                              if (result && result.corrections && result.corrections.length > 0) {
                                handleArrayInputChange("workExperience", index, "responsibilities", result.corrected);
                                toast.success(`✅ Fixed ${result.corrections.length} error(s)!`);
                              } else {
                                toast.success('✅ No errors found! Your text looks great.');
                              }
                            } catch (error) {
                              toast.dismiss(loadingToast);
                              console.error('Proofread error:', error);
                              toast.error('Failed to proofread. Please check console for details.');
                            }
                          }}
                          disabled={isProofreading}
                          title="Check grammar and spelling"
                          style={{
                            padding: '6px 10px',
                            backgroundColor: isProofreading ? '#6c757d' : '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isProofreading ? 'not-allowed' : 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <FaSpellCheck style={{ fontSize: '10px' }} />
                          {isProofreading ? 'Checking...' : 'Proofread'}
                        </button>
                        
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const result = await makeProfessional(exp.responsibilities);
                              handleArrayInputChange("workExperience", index, "responsibilities", result);
                              toast.success('Text refined!');
                            } catch (error) {
                              console.error('Rewrite error:', error);
                            }
                          }}
                          disabled={isRewriting}
                          title="Make text more professional"
                          style={{
                            padding: '6px 10px',
                            backgroundColor: isRewriting ? '#6c757d' : '#17a2b8',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isRewriting ? 'not-allowed' : 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <FaMagic style={{ fontSize: '10px' }} />
                          {isRewriting ? 'Refining...' : 'Refine'}
                        </button>
                        
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const result = await summarizeWorkExperience(exp.responsibilities, 'key-points');
                              handleArrayInputChange("workExperience", index, "responsibilities", result);
                              toast.success('Converted to bullet points!');
                            } catch (error) {
                              console.error('Summarize error:', error);
                            }
                          }}
                          disabled={isSummarizing}
                          title="Summarize as bullet points"
                          style={{
                            padding: '6px 10px',
                            backgroundColor: isSummarizing ? '#6c757d' : '#ffc107',
                            color: '#000',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isSummarizing ? 'not-allowed' : 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <FaCompressAlt style={{ fontSize: '10px' }} />
                          {isSummarizing ? 'Summarizing...' : 'Summarize'}
                        </button>
                      </div>
                    )}
                  </div>
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
                    Use bullet points and start with action verbs. AI can help you proofread, refine, or summarize your text.
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
                  onChange={(e) => {
                    const value = e.target.value;
                    handleInputChange("skillInput", value);
                    // Fetch suggestions as user types
                    if (value.trim().length >= 2) {
                      debouncedSearch(value.trim());
                    }
                  }}
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
              {/* Display live suggestions */}
              {formData.skillInput.trim().length >= 2 && suggestions.length > 0 && (
                <div className="create-resume-skill-autocomplete">
                  {suggestions.slice(0, 8).map((skill) => (
                    <div
                      key={skill._id}
                      className="create-resume-suggestion-item"
                      onClick={() => {
                        addSkill(skill.displayName);
                        handleInputChange("skillInput", "");
                      }}
                    >
                      <span>{skill.displayName}</span>
                      {skill.usageCount > 10 && (
                        <span className="popular-badge">Popular</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
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
              <h4>Popular Skills {skillsLoading && "(Loading...)"}</h4>
              {popularSkills.length > 0 && (
                <div className="create-resume-skill-suggestions">
                  {popularSkills.slice(0, 20).map((skill) => (
                    <button
                      key={skill._id}
                      type="button"
                      className="create-resume-skill-suggestion"
                      onClick={() => addSkill(skill.displayName)}
                    >
                      + {skill.displayName}
                      {skill.usageCount > 50 && <span className="fire-emoji"> 🔥</span>}
                    </button>
                  ))}
                </div>
              )}
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
                    {/* Modern Template Preview */}
                    {template.id === "modern" && (
                      <div className="template-preview-modern">
                        <div className="template-preview-header modern-header">
                          <div className="preview-name"></div>
                          <div className="preview-title"></div>
                        </div>
                        <div className="template-preview-body">
                          <div className="preview-line long"></div>
                          <div className="preview-line medium"></div>
                          <div className="preview-section">
                            <div className="preview-line short"></div>
                            <div className="preview-line long"></div>
                          </div>
                          <div className="preview-section">
                            <div className="preview-line short"></div>
                            <div className="preview-line medium"></div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Classic Template Preview */}
                    {template.id === "classic" && (
                      <div className="template-preview-classic">
                        <div className="template-preview-header classic-header">
                          <div className="preview-name"></div>
                          <div className="preview-contact">
                            <div className="preview-dot"></div>
                            <div className="preview-dot"></div>
                            <div className="preview-dot"></div>
                          </div>
                        </div>
                        <div className="template-preview-body">
                          <div className="preview-line long"></div>
                          <div className="preview-section">
                            <div className="preview-line medium"></div>
                            <div className="preview-line long"></div>
                          </div>
                          <div className="preview-section">
                            <div className="preview-line short"></div>
                            <div className="preview-line medium"></div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Creative Template Preview */}
                    {template.id === "creative" && (
                      <div className="template-preview-creative">
                        <div className="template-preview-sidebar">
                          <div className="preview-circle"></div>
                          <div className="preview-line short"></div>
                          <div className="preview-line short"></div>
                        </div>
                        <div className="template-preview-main">
                          <div className="preview-name"></div>
                          <div className="preview-line long"></div>
                          <div className="preview-section">
                            <div className="preview-line medium"></div>
                            <div className="preview-line long"></div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Minimal Template Preview */}
                    {template.id === "minimal" && (
                      <div className="template-preview-minimal">
                        <div className="template-preview-header minimal-header">
                          <div className="preview-name"></div>
                        </div>
                        <div className="template-preview-body">
                          <div className="preview-line full"></div>
                          <div className="preview-section">
                            <div className="preview-heading"></div>
                            <div className="preview-line long"></div>
                          </div>
                          <div className="preview-section">
                            <div className="preview-heading"></div>
                            <div className="preview-line medium"></div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Fallback for unknown templates */}
                    {!["modern", "classic", "creative", "minimal"].includes(template.id) && (
                      <div className="create-resume-template-placeholder">
                        <span className="template-icon">
                          <FaFileAlt />
                        </span>
                      </div>
                    )}
                  </div>
                  <h3>{template.name}</h3>
                  <p>
                    {template.id === "modern"
                      ? "Clean gradient design with modern layout"
                      : template.id === "classic"
                      ? "Traditional format, perfect for corporate"
                      : template.id === "creative"
                      ? "Sidebar layout with bold visual elements"
                      : template.id === "minimal"
                      ? "Simple and clean, content-focused design"
                      : "Professional and clean design"}
                  </p>
                  {formData.selectedTemplate === template.id && (
                    <div className="template-selected-badge">
                      <FaCheck /> Selected
                    </div>
                  )}
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
              <div className="create-resume-template-selector">
                <label>Preview Template:</label>
                <select
                  value={formData.selectedTemplate || "modern"}
                  onChange={(e) =>
                    handleInputChange("selectedTemplate", e.target.value)
                  }
                  className="template-selector-dropdown"
                >
                  <option value="modern">Modern</option>
                  <option value="classic">Classic</option>
                  <option value="creative">Creative</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>

              {/* Render template based on selection */}
              <div className={`create-resume-preview template-${formData.selectedTemplate || "modern"}`}>
                
                {/* Modern Template */}
                {(formData.selectedTemplate === "modern" || !formData.selectedTemplate) && (
                  <div className="resume-template-modern">
                    <div className="template-header modern-header">
                      <h1 className="template-name">{formData.fullName || "Your Name"}</h1>
                      <div className="template-contact">
                        {formData.email && <span>{formData.email}</span>}
                        {formData.phone && <span> | {formData.phone}</span>}
                        {formData.location && <span> | {formData.location}</span>}
                      </div>
                      {formData.links && formData.links.some(link => link.url) && (
                        <div className="template-links">
                          {formData.links.filter(link => link.url).map((link, idx) => (
                            <span key={idx}>
                              {link.label}: {link.url}
                              {idx < formData.links.filter(l => l.url).length - 1 && " | "}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {formData.careerObjective && (
                      <div className="template-section">
                        <h3 className="section-title">Professional Summary</h3>
                        <p className="section-content">{formData.careerObjective}</p>
                      </div>
                    )}

                    {formData.workExperience.some((exp) => exp.jobTitle) && (
                      <div className="template-section">
                        <h3 className="section-title">Work Experience</h3>
                        {formData.workExperience.map(
                          (exp, index) =>
                            exp.jobTitle && (
                              <div key={index} className="template-item">
                                <div className="item-header">
                                  <strong>{exp.jobTitle}</strong> - {exp.companyName}
                                </div>
                                <div className="item-date">
                                  {exp.startDate} - {exp.currentJob ? "Present" : exp.endDate}
                                </div>
                                {exp.responsibilities && (
                                  <p className="item-content">{exp.responsibilities}</p>
                                )}
                              </div>
                            )
                        )}
                      </div>
                    )}

                    {formData.skills.length > 0 && (
                      <div className="template-section">
                        <h3 className="section-title">Skills</h3>
                        <div className="template-skills">
                          {formData.skills.map((skill, index) => (
                            <span key={index} className="skill-tag">{skill}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {formData.education.some((edu) => edu.degree) && (
                      <div className="template-section">
                        <h3 className="section-title">Education</h3>
                        {formData.education.map(
                          (edu, index) =>
                            edu.degree && (
                              <div key={index} className="template-item">
                                <div className="item-header">
                                  <strong>{edu.degree}</strong>
                                </div>
                                <div className="item-subheader">
                                  {edu.institution} - {edu.graduationYear}
                                </div>
                              </div>
                            )
                        )}
                      </div>
                    )}

                    {formData.certifications.some((cert) => cert.name) && (
                      <div className="template-section">
                        <h3 className="section-title">Certifications</h3>
                        {formData.certifications.map(
                          (cert, index) =>
                            cert.name && (
                              <div key={index} className="template-item">
                                <strong>{cert.name}</strong> - {cert.institution} ({cert.dateAchieved})
                              </div>
                            )
                        )}
                      </div>
                    )}

                    {formData.languages.some((lang) => lang.name) && (
                      <div className="template-section">
                        <h3 className="section-title">Languages</h3>
                        <div className="template-languages">
                          {formData.languages.map(
                            (lang, index) =>
                              lang.name && (
                                <span key={index}>
                                  {lang.name} ({lang.proficiency})
                                  {index < formData.languages.filter(l => l.name).length - 1 && " | "}
                                </span>
                              )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Classic Template */}
                {formData.selectedTemplate === "classic" && (
                  <div className="resume-template-classic">
                    <div className="template-header classic-header">
                      <h1 className="template-name">{formData.fullName || "Your Name"}</h1>
                      <div className="template-contact-classic">
                        {formData.email && <div>{formData.email}</div>}
                        {formData.phone && <div>{formData.phone}</div>}
                        {formData.location && <div>{formData.location}</div>}
                      </div>
                    </div>

                    {formData.careerObjective && (
                      <div className="template-section classic-section">
                        <h3 className="section-title-classic">PROFESSIONAL SUMMARY</h3>
                        <p>{formData.careerObjective}</p>
                      </div>
                    )}

                    {formData.workExperience.some((exp) => exp.jobTitle) && (
                      <div className="template-section classic-section">
                        <h3 className="section-title-classic">WORK EXPERIENCE</h3>
                        {formData.workExperience.map(
                          (exp, index) =>
                            exp.jobTitle && (
                              <div key={index} className="classic-item">
                                <div><strong>{exp.jobTitle}</strong>, {exp.companyName}</div>
                                <div className="classic-date">
                                  {exp.startDate} - {exp.currentJob ? "Present" : exp.endDate}
                                </div>
                                {exp.responsibilities && <p>{exp.responsibilities}</p>}
                              </div>
                            )
                        )}
                      </div>
                    )}

                    {formData.skills.length > 0 && (
                      <div className="template-section classic-section">
                        <h3 className="section-title-classic">SKILLS</h3>
                        <p>{formData.skills.join(", ")}</p>
                      </div>
                    )}

                    {formData.education.some((edu) => edu.degree) && (
                      <div className="template-section classic-section">
                        <h3 className="section-title-classic">EDUCATION</h3>
                        {formData.education.map(
                          (edu, index) =>
                            edu.degree && (
                              <div key={index} className="classic-item">
                                <div><strong>{edu.degree}</strong></div>
                                <div>{edu.institution}, {edu.graduationYear}</div>
                              </div>
                            )
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Creative Template */}
                {formData.selectedTemplate === "creative" && (
                  <div className="resume-template-creative">
                    <div className="creative-sidebar">
                      <div className="sidebar-section">
                        <h2 className="sidebar-name">{formData.fullName || "Your Name"}</h2>
                      </div>

                      <div className="sidebar-section">
                        <h4>CONTACT</h4>
                        {formData.email && <p>{formData.email}</p>}
                        {formData.phone && <p>{formData.phone}</p>}
                        {formData.location && <p>{formData.location}</p>}
                      </div>

                      {formData.skills.length > 0 && (
                        <div className="sidebar-section">
                          <h4>SKILLS</h4>
                          {formData.skills.map((skill, index) => (
                            <p key={index}>• {skill}</p>
                          ))}
                        </div>
                      )}

                      {formData.languages.some((lang) => lang.name) && (
                        <div className="sidebar-section">
                          <h4>LANGUAGES</h4>
                          {formData.languages.map(
                            (lang, index) =>
                              lang.name && (
                                <p key={index}>{lang.name} - {lang.proficiency}</p>
                              )
                          )}
                        </div>
                      )}
                    </div>

                    <div className="creative-main">
                      {formData.careerObjective && (
                        <div className="creative-section">
                          <h3 className="creative-title">About Me</h3>
                          <p>{formData.careerObjective}</p>
                        </div>
                      )}

                      {formData.workExperience.some((exp) => exp.jobTitle) && (
                        <div className="creative-section">
                          <h3 className="creative-title">Experience</h3>
                          {formData.workExperience.map(
                            (exp, index) =>
                              exp.jobTitle && (
                                <div key={index} className="creative-item">
                                  <h4>{exp.jobTitle}</h4>
                                  <p className="creative-company">{exp.companyName} | {exp.startDate} - {exp.currentJob ? "Present" : exp.endDate}</p>
                                  {exp.responsibilities && <p>{exp.responsibilities}</p>}
                                </div>
                              )
                          )}
                        </div>
                      )}

                      {formData.education.some((edu) => edu.degree) && (
                        <div className="creative-section">
                          <h3 className="creative-title">Education</h3>
                          {formData.education.map(
                            (edu, index) =>
                              edu.degree && (
                                <div key={index} className="creative-item">
                                  <h4>{edu.degree}</h4>
                                  <p>{edu.institution}, {edu.graduationYear}</p>
                                </div>
                              )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Minimal Template */}
                {formData.selectedTemplate === "minimal" && (
                  <div className="resume-template-minimal">
                    <div className="template-header minimal-header">
                      <h1 className="minimal-name">{formData.fullName || "Your Name"}</h1>
                      <div className="minimal-contact">
                        {formData.email} {formData.phone && `• ${formData.phone}`} {formData.location && `• ${formData.location}`}
                      </div>
                    </div>

                    {formData.careerObjective && (
                      <div className="minimal-section">
                        <p className="minimal-summary">{formData.careerObjective}</p>
                      </div>
                    )}

                    {formData.workExperience.some((exp) => exp.jobTitle) && (
                      <div className="minimal-section">
                        <h3 className="minimal-title">Experience</h3>
                        {formData.workExperience.map(
                          (exp, index) =>
                            exp.jobTitle && (
                              <div key={index} className="minimal-item">
                                <div className="minimal-item-header">
                                  <span className="minimal-job">{exp.jobTitle}</span>
                                  <span className="minimal-date">{exp.startDate} - {exp.currentJob ? "Present" : exp.endDate}</span>
                                </div>
                                <div className="minimal-company">{exp.companyName}</div>
                                {exp.responsibilities && <p>{exp.responsibilities}</p>}
                              </div>
                            )
                        )}
                      </div>
                    )}

                    {formData.skills.length > 0 && (
                      <div className="minimal-section">
                        <h3 className="minimal-title">Skills</h3>
                        <p>{formData.skills.join(" • ")}</p>
                      </div>
                    )}

                    {formData.education.some((edu) => edu.degree) && (
                      <div className="minimal-section">
                        <h3 className="minimal-title">Education</h3>
                        {formData.education.map(
                          (edu, index) =>
                            edu.degree && (
                              <div key={index} className="minimal-item">
                                <div className="minimal-item-header">
                                  <span className="minimal-job">{edu.degree}</span>
                                  <span className="minimal-date">{edu.graduationYear}</span>
                                </div>
                                <div className="minimal-company">{edu.institution}</div>
                              </div>
                            )
                        )}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>

            {/* <div className="create-resume-download-options">
              <h3>Download Your Resume</h3>

              {resumeId && resumeId !== "new" && (
                <div className="template-selection">
                  <label htmlFor="download-template">Choose Template:</label>
                  <select
                    id="download-template"
                    defaultValue={formData.selectedTemplate || "modern"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        selectedTemplate: e.target.value,
                      }))
                    }
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
            </div> */}
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
      <ChromeAIStatus />
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
