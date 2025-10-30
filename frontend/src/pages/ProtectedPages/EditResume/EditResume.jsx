import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaDownload, FaFileAlt, FaTimes, FaCheck, FaGlobe, FaTrash, FaPlus } from 'react-icons/fa';
import { useResume } from '../../../hooks/useResume';
import ViewPDFModal from '../../../components/ViewPDFModal/ViewPDFModal';
import toast from 'react-hot-toast';
import './EditResume.css';

const EditResume = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { resume, loading, error: resumeError, fetchResume, updateResume, downloadPDF, getPDFUrl } = useResume(id);
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'saved', 'error'
  const [activeTab, setActiveTab] = useState('personal');
  
  // PDF viewer state
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfResumeTitle, setPdfResumeTitle] = useState("");
  
  // We don't need to fetch the resume here because useResume already does it
  useEffect(() => {
    // Just handle loading state synchronization
    if (loading) {
      setIsLoading(true);
      console.log("Loading resume data...");
    } else {
      setIsLoading(false);
      console.log("Loading complete. Resume data:", resume);
      
      // If there was a resume error, set our local error state
      if (resumeError) {
        console.error("Resume error:", resumeError);
        setError(resumeError);
      }
    }
  }, [loading, resumeError, resume]);
  
  // Update formData when resume changes
  useEffect(() => {
    if (resume) {
      console.log("Resume data loaded:", resume);
      
      // Map nested API structure to flat structure needed by form
      const mappedData = {
        // Copy all root level fields
        ...resume,
        
        // Map personalInfo fields to root level
        fullName: resume.personalInfo?.fullName || '',
        email: resume.personalInfo?.email || '',
        phone: resume.personalInfo?.phone || '',
        location: resume.personalInfo?.location || '',
        profilePicture: resume.personalInfo?.profilePicture || '',
        links: resume.personalInfo?.links || [{ label: '', url: '' }],
        
        // Map any other nested fields
        // Example: additionalInfo fields if needed
        volunteerExperience: resume.additionalInfo?.volunteerExperience || '',
        hobbies: resume.additionalInfo?.hobbies || '',
        projects: resume.additionalInfo?.projects || '',
      };
      
      console.log("Mapped form data:", mappedData);
      setFormData(mappedData);
    } else {
      console.log("No resume data available yet");
    }
  }, [resume]); // This is fine since we're only updating formData when resume changes
  
  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle array field changes (like work experience, education, etc.)
  const handleArrayInputChange = (arrayName, index, field, value) => {
    setFormData((prev) => {
      const updatedArray = [...prev[arrayName]];
      updatedArray[index] = {
        ...updatedArray[index],
        [field]: value
      };
      return {
        ...prev,
        [arrayName]: updatedArray
      };
    });
  };
  
  // Add a new item to an array
  const addArrayItem = (arrayName, emptyItem) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], emptyItem]
    }));
  };
  
  // Remove an item from an array
  const removeArrayItem = (arrayName, index) => {
    setFormData((prev) => {
      const updatedArray = [...prev[arrayName]];
      updatedArray.splice(index, 1);
      return {
        ...prev,
        [arrayName]: updatedArray
      };
    });
  };
  
  // Save changes
  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      // Transform flat form data back to the API structure
      const apiData = {
        ...formData,
        personalInfo: {
          fullName: formData.fullName || '',
          email: formData.email || '',
          phone: formData.phone || '',
          location: formData.location || '',
          profilePicture: formData.profilePicture || '',
          links: formData.links?.filter(link => link.label && link.url) || [],
        },
        additionalInfo: {
          volunteerExperience: formData.volunteerExperience || '',
          hobbies: formData.hobbies || '',
          projects: formData.projects || ''
        }
      };
      
      // Remove flat fields that are now in nested objects to avoid duplication
      delete apiData.fullName;
      delete apiData.email;
      delete apiData.phone;
      delete apiData.location;
      delete apiData.profilePicture;
      delete apiData.links;
      delete apiData.volunteerExperience;
      delete apiData.hobbies;
      delete apiData.projects;
      
      console.log("Saving data to API:", apiData);
      await updateResume(id, apiData);
      setSaveStatus('saved');
      // Reset save status after showing success message
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } catch (err) {
      console.error("Error updating resume:", err);
      setSaveStatus('error');
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    }
  };
  
  // Handle resume download
  const handleDownload = async (format = 'pdf') => {
    try {
      // Get template from formData or fallback to modern
      const template = formData?.selectedTemplate || formData?.template || 'modern';
      console.log("Downloading with template:", template);
      
      // First, try to get PDF URL from Cloudinary
      const pdfData = await getPDFUrl(id, template);
      
      if (pdfData && pdfData.pdfUrl) {
        // PDF exists in Cloudinary - show in modal
        setPdfUrl(pdfData.pdfUrl);
        setPdfResumeTitle(formData?.title || "Resume");
        setShowPDFModal(true);
        toast.success("Opening PDF viewer...");
      } else {
        // Fallback to direct download
        await downloadPDF(id, template);
        toast.success("Resume downloaded successfully!");
      }
    } catch (err) {
      console.error("Error viewing/downloading resume:", err);
      
      // Fallback to direct download on error
      try {
        const template = formData?.selectedTemplate || formData?.template || 'modern';
        await downloadPDF(id, template);
        toast.success("Resume downloaded successfully!");
      } catch (downloadErr) {
        console.error("Error downloading resume:", downloadErr);
        toast.error(`Failed to download resume as ${format.toUpperCase()}. Please try again.`);
      }
    }
  };

  const handlePDFDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${pdfResumeTitle}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Resume downloaded successfully!");
    }
  };

  const handleClosePDFModal = () => {
    setShowPDFModal(false);
    setPdfUrl(null);
    setPdfResumeTitle("");
  };
  
  // Go back to My Resumes page
  const handleBack = () => {
    navigate('/my-resumes');
  };

  if (isLoading || loading) {
    return (
      <div className="edit-resume-container">
        <div className="edit-resume-loading">
          <div className="edit-resume-spinner"></div>
          <p>Loading resume data...</p>
        </div>
      </div>
    );
  }

  if (error || resumeError) {
    return (
      <div className="edit-resume-container">
        <div className="edit-resume-error">
          <FaTimes />
          <h2>Something went wrong</h2>
          <p>{error || resumeError || "Failed to load resume data. Please try again."}</p>
          <button onClick={handleBack}>Back to My Resumes</button>
        </div>
      </div>
    );
  }

  if (!formData) {
    console.log("formData is null, resume:", resume);
    return (
      <div className="edit-resume-container">
        <div className="edit-resume-error">
          <FaTimes />
          <h2>Resume Not Found</h2>
          <p>The resume you're looking for doesn't exist or you don't have permission to access it.</p>
          <button onClick={handleBack}>Back to My Resumes</button>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-resume-container">
      {/* Header */}
      <div className="edit-resume-header">
        <div className="edit-resume-left">
          <button onClick={handleBack} className="edit-resume-back-btn">
            <FaArrowLeft /> Back
          </button>
          <h1>Edit Resume</h1>
        </div>
        <div className="edit-resume-actions">
          <div className="save-status">
            {saveStatus === 'saving' && <span className="saving">Saving...</span>}
            {saveStatus === 'saved' && (
              <span className="saved">
                <FaCheck /> Changes saved
              </span>
            )}
            {saveStatus === 'error' && <span className="error">Save failed. Try again.</span>}
          </div>
          <button
            className="edit-resume-download-btn"
            onClick={() => handleDownload('pdf')}
          >
            <FaDownload /> Download
          </button>
          <button
            className="edit-resume-save-btn"
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
          >
            <FaSave /> {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="edit-resume-tabs">
        <button
          className={`edit-resume-tab ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          Personal Details
        </button>
        <button
          className={`edit-resume-tab ${activeTab === 'experience' ? 'active' : ''}`}
          onClick={() => setActiveTab('experience')}
        >
          Work Experience
        </button>
        <button
          className={`edit-resume-tab ${activeTab === 'education' ? 'active' : ''}`}
          onClick={() => setActiveTab('education')}
        >
          Education
        </button>
        <button
          className={`edit-resume-tab ${activeTab === 'skills' ? 'active' : ''}`}
          onClick={() => setActiveTab('skills')}
        >
          Skills
        </button>
        <button
          className={`edit-resume-tab ${activeTab === 'additional' ? 'active' : ''}`}
          onClick={() => setActiveTab('additional')}
        >
          Additional Info
        </button>
        <button
          className={`edit-resume-tab ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          Preview & Template
        </button>
        {/* <button
          className={`edit-resume-tab ${activeTab === 'debug' ? 'active' : ''}`}
          onClick={() => setActiveTab('debug')}
        >
          Debug Data
        </button> */}
      </div>

      {/* Content Area */}
      <div className="edit-resume-content">
        {activeTab === 'personal' && (
          <div className="edit-resume-section">
            <h2>Personal Details</h2>
            <div className="edit-resume-form-grid">
              <div className="edit-resume-form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={formData.fullName || ''}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              
              <div className="edit-resume-form-group">
                <label>Job Title</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Software Developer"
                />
              </div>
              
              <div className="edit-resume-form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="john.doe@example.com"
                />
              </div>
              
              <div className="edit-resume-form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(123) 456-7890"
                />
              </div>
              
              <div className="edit-resume-form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="New York, NY"
                />
              </div>
              
              {/* <div className="edit-resume-form-group">
                <label>LinkedIn URL</label>
                <input
                  type="url"
                  value={formData.linkedin || ''}
                  onChange={(e) => handleInputChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/johndoe"
                />
              </div> */}
            </div>
            
            {/* Professional Links Section */}
            <div className="edit-resume-form-group full-width">
              <label>
                <FaGlobe style={{ marginRight: '8px' }} />
                Professional Links (LinkedIn, Portfolio, GitHub, etc.)
              </label>
              <p className="edit-resume-field-hint">
                Add links to your professional profiles and portfolios
              </p>
              {formData.links && formData.links.map((link, index) => (
                <div key={index} className="edit-resume-link-item">
                  <div className="edit-resume-form-grid">
                    <div className="edit-resume-form-group">
                      <input
                        type="text"
                        value={link.label || ''}
                        onChange={(e) =>
                          handleArrayInputChange('links', index, 'label', e.target.value)
                        }
                        placeholder="Label (e.g., LinkedIn, Portfolio, GitHub)"
                      />
                    </div>
                    <div className="edit-resume-form-group">
                      <input
                        type="url"
                        value={link.url || ''}
                        onChange={(e) =>
                          handleArrayInputChange('links', index, 'url', e.target.value)
                        }
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                  {formData.links.length > 1 && (
                    <button
                      type="button"
                      className="edit-resume-remove-link-btn"
                      onClick={() => removeArrayItem('links', index)}
                      title="Remove link"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="edit-resume-add-link-btn"
                onClick={() => addArrayItem('links', { label: '', url: '' })}
              >
                <FaPlus /> Add Another Link
              </button>
            </div>
            
            <div className="edit-resume-form-group full-width">
              <label>Professional Summary</label>
              <textarea
                value={formData.careerObjective || ''}
                onChange={(e) => handleInputChange('careerObjective', e.target.value)}
                placeholder="Briefly describe your professional background and career goals..."
                rows="4"
              />
            </div>
          </div>
        )}

        {activeTab === 'experience' && (
          <div className="edit-resume-section">
            <h2>Work Experience</h2>
            <p className="edit-resume-section-description">
              Add your work experience, starting with your most recent position.
            </p>
            
            {formData.workExperience && formData.workExperience.map((exp, index) => (
              <div key={index} className="edit-resume-block">
                <div className="edit-resume-block-header">
                  <h3>Experience #{index + 1}</h3>
                  {formData.workExperience.length > 1 && (
                    <button
                      type="button"
                      className="edit-resume-remove-btn"
                      onClick={() => removeArrayItem('workExperience', index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="edit-resume-form-grid">
                  <div className="edit-resume-form-group">
                    <label>Job Title</label>
                    <input
                      type="text"
                      value={exp.jobTitle || ''}
                      onChange={(e) =>
                        handleArrayInputChange(
                          'workExperience',
                          index,
                          'jobTitle',
                          e.target.value
                        )
                      }
                      placeholder="Software Developer"
                    />
                  </div>
                  
                  <div className="edit-resume-form-group">
                    <label>Company Name</label>
                    <input
                      type="text"
                      value={exp.companyName || ''}
                      onChange={(e) =>
                        handleArrayInputChange(
                          'workExperience',
                          index,
                          'companyName',
                          e.target.value
                        )
                      }
                      placeholder="Acme Inc."
                    />
                  </div>
                  
                  <div className="edit-resume-form-group">
                    <label>Start Date</label>
                    <input
                      type="month"
                      value={exp.startDate || ''}
                      onChange={(e) =>
                        handleArrayInputChange(
                          'workExperience',
                          index,
                          'startDate',
                          e.target.value
                        )
                      }
                    />
                  </div>
                  
                  <div className="edit-resume-form-group">
                    <label>End Date</label>
                    <div className="edit-resume-date-wrapper">
                      <input
                        type="month"
                        value={exp.endDate || ''}
                        onChange={(e) =>
                          handleArrayInputChange(
                            'workExperience',
                            index,
                            'endDate',
                            e.target.value
                          )
                        }
                        disabled={exp.currentJob}
                      />
                      <div className="edit-resume-checkbox">
                        <input
                          type="checkbox"
                          id={`current-job-${index}`}
                          checked={exp.currentJob || false}
                          onChange={(e) =>
                            handleArrayInputChange(
                              'workExperience',
                              index,
                              'currentJob',
                              e.target.checked
                            )
                          }
                        />
                        <label htmlFor={`current-job-${index}`}>
                          I currently work here
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="edit-resume-form-group full-width">
                  <label>Responsibilities & Achievements</label>
                  <textarea
                    value={exp.responsibilities || ''}
                    onChange={(e) =>
                      handleArrayInputChange(
                        'workExperience',
                        index,
                        'responsibilities',
                        e.target.value
                      )
                    }
                    placeholder="• Led a team of 5 developers&#10;• Increased site performance by 40%&#10;• Developed new features for client dashboard"
                    rows="4"
                  />
                </div>
              </div>
            ))}
            
            <button
              type="button"
              className="edit-resume-add-btn"
              onClick={() =>
                addArrayItem('workExperience', {
                  jobTitle: '',
                  companyName: '',
                  startDate: '',
                  endDate: '',
                  currentJob: false,
                  responsibilities: ''
                })
              }
            >
              + Add Another Work Experience
            </button>
          </div>
        )}

        {activeTab === 'education' && (
          <div className="edit-resume-section">
            <h2>Education</h2>
            <p className="edit-resume-section-description">
              Add your educational background, starting with the highest level of education.
            </p>
            
            {formData.education && formData.education.map((edu, index) => (
              <div key={index} className="edit-resume-block">
                <div className="edit-resume-block-header">
                  <h3>Education #{index + 1}</h3>
                  {formData.education.length > 1 && (
                    <button
                      type="button"
                      className="edit-resume-remove-btn"
                      onClick={() => removeArrayItem('education', index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="edit-resume-form-grid">
                  <div className="edit-resume-form-group">
                    <label>Degree / Certificate</label>
                    <input
                      type="text"
                      value={edu.degree || ''}
                      onChange={(e) =>
                        handleArrayInputChange(
                          'education',
                          index,
                          'degree',
                          e.target.value
                        )
                      }
                      placeholder="Bachelor of Science in Computer Science"
                    />
                  </div>
                  
                  <div className="edit-resume-form-group">
                    <label>Institution</label>
                    <input
                      type="text"
                      value={edu.institution || ''}
                      onChange={(e) =>
                        handleArrayInputChange(
                          'education',
                          index,
                          'institution',
                          e.target.value
                        )
                      }
                      placeholder="University of Technology"
                    />
                  </div>
                  
                  <div className="edit-resume-form-group">
                    <label>Graduation Year</label>
                    <input
                      type="text"
                      value={edu.graduationYear || ''}
                      onChange={(e) =>
                        handleArrayInputChange(
                          'education',
                          index,
                          'graduationYear',
                          e.target.value
                        )
                      }
                      placeholder="2022"
                    />
                  </div>
                  
                  <div className="edit-resume-form-group">
                    <label>GPA (Optional)</label>
                    <input
                      type="text"
                      value={edu.gpa || ''}
                      onChange={(e) =>
                        handleArrayInputChange(
                          'education',
                          index,
                          'gpa',
                          e.target.value
                        )
                      }
                      placeholder="3.8/4.0"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <button
              type="button"
              className="edit-resume-add-btn"
              onClick={() =>
                addArrayItem('education', {
                  degree: '',
                  institution: '',
                  graduationYear: '',
                  gpa: ''
                })
              }
            >
              + Add Another Education
            </button>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="edit-resume-section">
            <h2>Skills</h2>
            <p className="edit-resume-section-description">
              Add your key skills and competencies that are relevant to your target position.
            </p>
            
            <div className="edit-resume-skills-container">
              <div className="edit-resume-skills-input">
                <label>Skills List</label>
                <p className="edit-resume-help-text">
                  Enter one skill per line or separate multiple skills with commas
                </p>
                <textarea
                  value={formData.skills ? formData.skills.join('\n') : ''}
                  onChange={(e) => {
                    // Split by newline or commas and trim whitespace
                    const skillsArray = e.target.value
                      .split(/[\n,]+/)
                      .map(skill => skill.trim())
                      .filter(skill => skill !== '');
                    handleInputChange('skills', skillsArray);
                  }}
                  placeholder="JavaScript&#10;React&#10;Node.js&#10;UI/UX Design&#10;Project Management"
                  rows="8"
                />
              </div>
              
              <div className="edit-resume-skills-preview">
                <label>Skills Preview</label>
                <div className="edit-resume-skills-tags">
                  {formData.skills && formData.skills.map((skill, index) => (
                    <div key={index} className="edit-resume-skill-tag">
                      {skill}
                      <button
                        onClick={() => {
                          const updatedSkills = [...formData.skills];
                          updatedSkills.splice(index, 1);
                          handleInputChange('skills', updatedSkills);
                        }}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                  {(!formData.skills || formData.skills.length === 0) && (
                    <p className="edit-resume-no-skills">No skills added yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'additional' && (
          <div className="edit-resume-section">
            <h2>Additional Information</h2>
            <p className="edit-resume-section-description">
              Add any additional information that might be relevant to your resume.
            </p>

            <div className="edit-resume-form-group">
              <label>Certifications</label>
              {formData.certifications && formData.certifications.map((cert, index) => (
                <div key={index} className="edit-resume-certification-block">
                  <div className="edit-resume-block-header">
                    <h3>Certification #{index + 1}</h3>
                    {formData.certifications.length > 1 && (
                      <button
                        type="button"
                        className="edit-resume-remove-btn"
                        onClick={() => removeArrayItem('certifications', index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="edit-resume-form-grid">
                    <div className="edit-resume-form-group">
                      <label>Certification Name</label>
                      <input
                        type="text"
                        value={cert.name || ''}
                        onChange={(e) =>
                          handleArrayInputChange(
                            'certifications',
                            index,
                            'name',
                            e.target.value
                          )
                        }
                        placeholder="AWS Certified Solutions Architect"
                      />
                    </div>

                    <div className="edit-resume-form-group">
                      <label>Issuing Organization</label>
                      <input
                        type="text"
                        value={cert.institution || ''}
                        onChange={(e) =>
                          handleArrayInputChange(
                            'certifications',
                            index,
                            'institution',
                            e.target.value
                          )
                        }
                        placeholder="Amazon Web Services"
                      />
                    </div>

                    <div className="edit-resume-form-group">
                      <label>Date Achieved</label>
                      <input
                        type="month"
                        value={cert.dateAchieved || ''}
                        onChange={(e) =>
                          handleArrayInputChange(
                            'certifications',
                            index,
                            'dateAchieved',
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
                className="edit-resume-add-btn"
                onClick={() =>
                  addArrayItem('certifications', {
                    name: '',
                    institution: '',
                    dateAchieved: '',
                  })
                }
              >
                + Add Certification
              </button>
            </div>

            <div className="edit-resume-form-group">
              <label>Languages</label>
              {formData.languages && formData.languages.map((lang, index) => (
                <div key={index} className="edit-resume-language-block">
                  <div className="edit-resume-block-header">
                    <h3>Language #{index + 1}</h3>
                    {formData.languages.length > 1 && (
                      <button
                        type="button"
                        className="edit-resume-remove-btn"
                        onClick={() => removeArrayItem('languages', index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="edit-resume-form-grid">
                    <div className="edit-resume-form-group">
                      <label>Language</label>
                      <input
                        type="text"
                        value={lang.name || ''}
                        onChange={(e) =>
                          handleArrayInputChange(
                            'languages',
                            index,
                            'name',
                            e.target.value
                          )
                        }
                        placeholder="Spanish"
                      />
                    </div>

                    <div className="edit-resume-form-group">
                      <label>Proficiency Level</label>
                      <select
                        value={lang.proficiency || ''}
                        onChange={(e) =>
                          handleArrayInputChange(
                            'languages',
                            index,
                            'proficiency',
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
                className="edit-resume-add-btn"
                onClick={() =>
                  addArrayItem('languages', {
                    name: '',
                    proficiency: '',
                  })
                }
              >
                + Add Language
              </button>
            </div>

            <div className="edit-resume-form-group">
              <label>Projects</label>
              <textarea
                value={formData.projects || ''}
                onChange={(e) => handleInputChange('projects', e.target.value)}
                placeholder="E-commerce Web Application (2023)&#10;• Built using React, Node.js, and MongoDB&#10;• Implemented payment gateway and user authentication"
                rows="4"
              />
            </div>

            <div className="edit-resume-form-group">
              <label>Volunteer Experience</label>
              <textarea
                value={formData.volunteerExperience || ''}
                onChange={(e) => handleInputChange('volunteerExperience', e.target.value)}
                placeholder="Volunteer at local animal shelter (2019-2021)&#10;• Organized fundraising events that raised $5,000&#10;• Managed social media accounts"
                rows="4"
              />
            </div>

            <div className="edit-resume-form-group">
              <label>Hobbies & Interests (Optional)</label>
              <textarea
                value={formData.hobbies || ''}
                onChange={(e) => handleInputChange('hobbies', e.target.value)}
                placeholder="Photography, Hiking, Playing Guitar, Reading Technology Blogs"
                rows="3"
              />
              <p className="edit-resume-help-text">
                Keep it professional and relevant to your career goals
              </p>
            </div>
          </div>
        )}

        {/* {activeTab === 'debug' && (
          <div className="edit-resume-section">
            <h2>Debug Data</h2>
            <p>This section shows the raw data structure to help debug form issues.</p>
            
            <div style={{ marginBottom: '20px' }}>
              <h3>Raw Resume Data (from API)</h3>
              <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', overflow: 'auto', maxHeight: '300px' }}>
                {JSON.stringify(resume, null, 2)}
              </pre>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <h3>Form Data (mapped)</h3>
              <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', overflow: 'auto', maxHeight: '300px' }}>
                {JSON.stringify(formData, null, 2)}
              </pre>
            </div>
          </div>
        )} */}

        {activeTab === 'preview' && (
          <div className="edit-resume-section">
            <h2>Choose Your Template</h2>
            <p className="edit-resume-section-description">
              Select a template style and preview how your resume will look.
            </p>

            <div className="edit-resume-template-selection">
              <div className="edit-resume-template-grid">
                {/* Modern Template */}
                <div
                  className={`edit-resume-template-card ${
                    (formData.selectedTemplate || formData.template || 'modern') === 'modern' ? 'selected' : ''
                  }`}
                  onClick={() => handleInputChange('selectedTemplate', 'modern')}
                >
                  <div className="edit-resume-template-visual modern">
                    <div className="template-visual-header gradient"></div>
                    <div className="template-visual-body">
                      <div className="template-visual-line"></div>
                      <div className="template-visual-line short"></div>
                      <div className="template-visual-section">
                        <div className="template-visual-line"></div>
                        <div className="template-visual-line"></div>
                      </div>
                    </div>
                  </div>
                  <h4>Modern</h4>
                  <p>Clean design with gradient header</p>
                  {(formData.selectedTemplate || formData.template || 'modern') === 'modern' && (
                    <div className="template-selected-badge">
                      <FaCheck /> Selected
                    </div>
                  )}
                </div>

                {/* Classic Template */}
                <div
                  className={`edit-resume-template-card ${
                    (formData.selectedTemplate || formData.template) === 'classic' ? 'selected' : ''
                  }`}
                  onClick={() => handleInputChange('selectedTemplate', 'classic')}
                >
                  <div className="edit-resume-template-visual classic">
                    <div className="template-visual-header bordered"></div>
                    <div className="template-visual-body">
                      <div className="template-visual-line"></div>
                      <div className="template-visual-line short"></div>
                      <div className="template-visual-section">
                        <div className="template-visual-line"></div>
                        <div className="template-visual-line"></div>
                      </div>
                    </div>
                  </div>
                  <h4>Classic</h4>
                  <p>Traditional professional format</p>
                  {(formData.selectedTemplate || formData.template) === 'classic' && (
                    <div className="template-selected-badge">
                      <FaCheck /> Selected
                    </div>
                  )}
                </div>

                {/* Creative Template */}
                <div
                  className={`edit-resume-template-card ${
                    (formData.selectedTemplate || formData.template) === 'creative' ? 'selected' : ''
                  }`}
                  onClick={() => handleInputChange('selectedTemplate', 'creative')}
                >
                  <div className="edit-resume-template-visual creative">
                    <div className="template-visual-sidebar gradient"></div>
                    <div className="template-visual-main">
                      <div className="template-visual-line"></div>
                      <div className="template-visual-line short"></div>
                      <div className="template-visual-section">
                        <div className="template-visual-line"></div>
                      </div>
                    </div>
                  </div>
                  <h4>Creative</h4>
                  <p>Eye-catching sidebar layout</p>
                  {(formData.selectedTemplate || formData.template) === 'creative' && (
                    <div className="template-selected-badge">
                      <FaCheck /> Selected
                    </div>
                  )}
                </div>

                {/* Minimal Template */}
                <div
                  className={`edit-resume-template-card ${
                    (formData.selectedTemplate || formData.template) === 'minimal' ? 'selected' : ''
                  }`}
                  onClick={() => handleInputChange('selectedTemplate', 'minimal')}
                >
                  <div className="edit-resume-template-visual minimal">
                    <div className="template-visual-header simple"></div>
                    <div className="template-visual-body">
                      <div className="template-visual-line"></div>
                      <div className="template-visual-line short"></div>
                      <div className="template-visual-section">
                        <div className="template-visual-line"></div>
                        <div className="template-visual-line"></div>
                      </div>
                    </div>
                  </div>
                  <h4>Minimal</h4>
                  <p>Clean and simple design</p>
                  {(formData.selectedTemplate || formData.template) === 'minimal' && (
                    <div className="template-selected-badge">
                      <FaCheck /> Selected
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="edit-resume-preview-container">
              <h2>Preview with Your Data</h2>
              
              {/* Template Selector Dropdown */}
              <div className="edit-resume-template-selector">
                <label>Current Template:</label>
                <select
                  className="template-selector-dropdown"
                  value={formData.selectedTemplate || formData.template || 'modern'}
                  onChange={(e) => handleInputChange('selectedTemplate', e.target.value)}
                >
                  <option value="modern">Modern</option>
                  <option value="classic">Classic</option>
                  <option value="creative">Creative</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>

              {/* Render selected template with real data */}
              <div className="edit-resume-full-preview">
                {/* Modern Template */}
                {(formData.selectedTemplate || formData.template || 'modern') === 'modern' && (
                  <div className="resume-template-modern">
                    <div className="modern-header">
                      <div className="template-name">{formData.fullName || 'Your Name'}</div>
                      <div className="template-contact">
                        {formData.title && <span>{formData.title}</span>}
                        {formData.email && <span> | {formData.email}</span>}
                        {formData.phone && <span> | {formData.phone}</span>}
                        {formData.location && <span> | {formData.location}</span>}
                      </div>
                      {formData.links && formData.links.some(link => link.label && link.url) && (
                        <div className="template-links">
                          {formData.links.map((link, idx) => 
                            link.label && link.url ? (
                              <span key={idx}>{link.label} | </span>
                            ) : null
                          )}
                        </div>
                      )}
                    </div>

                    {formData.careerObjective && (
                      <div className="template-section">
                        <h3 className="section-title">Professional Summary</h3>
                        <p>{formData.careerObjective}</p>
                      </div>
                    )}

                    {formData.workExperience && formData.workExperience.length > 0 && formData.workExperience[0].jobTitle && (
                      <div className="template-section">
                        <h3 className="section-title">Work Experience</h3>
                        {formData.workExperience.map((exp, idx) => (
                          exp.jobTitle && (
                            <div key={idx} className="template-item">
                              <div className="item-header">{exp.jobTitle} - {exp.companyName}</div>
                              <div className="item-date">
                                {exp.startDate} - {exp.currentJob ? 'Present' : exp.endDate || 'Present'}
                              </div>
                              {exp.responsibilities && <p>{exp.responsibilities}</p>}
                            </div>
                          )
                        ))}
                      </div>
                    )}

                    {formData.skills && formData.skills.length > 0 && (
                      <div className="template-section">
                        <h3 className="section-title">Skills</h3>
                        <div className="template-skills">
                          {formData.skills.map((skill, idx) => (
                            <span key={idx} className="skill-tag">{skill}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {formData.education && formData.education.length > 0 && formData.education[0].degree && (
                      <div className="template-section">
                        <h3 className="section-title">Education</h3>
                        {formData.education.map((edu, idx) => (
                          edu.degree && (
                            <div key={idx} className="template-item">
                              <div className="item-header">{edu.degree}</div>
                              <div className="item-date">{edu.institution} | {edu.graduationYear}</div>
                              {edu.gpa && <p>GPA: {edu.gpa}</p>}
                            </div>
                          )
                        ))}
                      </div>
                    )}

                    {formData.certifications && formData.certifications.length > 0 && formData.certifications[0].name && (
                      <div className="template-section">
                        <h3 className="section-title">Certifications</h3>
                        {formData.certifications.map((cert, idx) => (
                          cert.name && (
                            <div key={idx} className="template-item">
                              <div className="item-header">{cert.name}</div>
                              <div className="item-date">{cert.institution} | {cert.dateAchieved}</div>
                            </div>
                          )
                        ))}
                      </div>
                    )}

                    {formData.languages && formData.languages.length > 0 && formData.languages[0].name && (
                      <div className="template-section">
                        <h3 className="section-title">Languages</h3>
                        <div className="template-languages">
                          {formData.languages.map((lang, idx) => (
                            lang.name && <span key={idx}>{lang.name} ({lang.proficiency}) </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Classic Template */}
                {(formData.selectedTemplate || formData.template) === 'classic' && (
                  <div className="resume-template-classic">
                    <div className="classic-header">
                      <div className="template-name">{formData.fullName || 'Your Name'}</div>
                      <div className="template-contact-classic">
                        {formData.title && <div>{formData.title}</div>}
                        {formData.email && <div>{formData.email}</div>}
                        {formData.phone && <div>{formData.phone}</div>}
                        {formData.location && <div>{formData.location}</div>}
                        {formData.links && formData.links.map((link, idx) => 
                          link.label && link.url ? <div key={idx}>{link.label}</div> : null
                        )}
                      </div>
                    </div>

                    {formData.careerObjective && (
                      <div className="classic-section">
                        <h3 className="section-title-classic">Professional Summary</h3>
                        <p>{formData.careerObjective}</p>
                      </div>
                    )}

                    {formData.workExperience && formData.workExperience.length > 0 && formData.workExperience[0].jobTitle && (
                      <div className="classic-section">
                        <h3 className="section-title-classic">Work Experience</h3>
                        {formData.workExperience.map((exp, idx) => (
                          exp.jobTitle && (
                            <div key={idx} className="classic-item">
                              <strong>{exp.jobTitle}</strong> - {exp.companyName}
                              <div className="classic-date">
                                {exp.startDate} - {exp.currentJob ? 'Present' : exp.endDate || 'Present'}
                              </div>
                              {exp.responsibilities && <p>{exp.responsibilities}</p>}
                            </div>
                          )
                        ))}
                      </div>
                    )}

                    {formData.education && formData.education.length > 0 && formData.education[0].degree && (
                      <div className="classic-section">
                        <h3 className="section-title-classic">Education</h3>
                        {formData.education.map((edu, idx) => (
                          edu.degree && (
                            <div key={idx} className="classic-item">
                              <strong>{edu.degree}</strong>
                              <div>{edu.institution}, {edu.graduationYear}</div>
                              {edu.gpa && <div>GPA: {edu.gpa}</div>}
                            </div>
                          )
                        ))}
                      </div>
                    )}

                    {formData.skills && formData.skills.length > 0 && (
                      <div className="classic-section">
                        <h3 className="section-title-classic">Skills</h3>
                        <p>{formData.skills.join(', ')}</p>
                      </div>
                    )}

                    {formData.certifications && formData.certifications.length > 0 && formData.certifications[0].name && (
                      <div className="classic-section">
                        <h3 className="section-title-classic">Certifications</h3>
                        {formData.certifications.map((cert, idx) => (
                          cert.name && (
                            <div key={idx} className="classic-item">
                              <strong>{cert.name}</strong> - {cert.institution} ({cert.dateAchieved})
                            </div>
                          )
                        ))}
                      </div>
                    )}

                    {formData.languages && formData.languages.length > 0 && formData.languages[0].name && (
                      <div className="classic-section">
                        <h3 className="section-title-classic">Languages</h3>
                        <div className="template-languages">
                          {formData.languages.map((lang, idx) => (
                            lang.name && <span key={idx}>{lang.name} ({lang.proficiency}) </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Creative Template */}
                {(formData.selectedTemplate || formData.template) === 'creative' && (
                  <div className="resume-template-creative">
                    <div className="creative-sidebar">
                      <div className="sidebar-name">{formData.fullName || 'Your Name'}</div>
                      
                      <div className="sidebar-section">
                        <h4>Contact</h4>
                        {formData.email && <p>{formData.email}</p>}
                        {formData.phone && <p>{formData.phone}</p>}
                        {formData.location && <p>{formData.location}</p>}
                      </div>

                      {formData.links && formData.links.some(link => link.label && link.url) && (
                        <div className="sidebar-section">
                          <h4>Links</h4>
                          {formData.links.map((link, idx) => 
                            link.label && link.url ? <p key={idx}>{link.label}</p> : null
                          )}
                        </div>
                      )}

                      {formData.skills && formData.skills.length > 0 && (
                        <div className="sidebar-section">
                          <h4>Skills</h4>
                          {formData.skills.map((skill, idx) => (
                            <p key={idx}>• {skill}</p>
                          ))}
                        </div>
                      )}

                      {formData.languages && formData.languages.length > 0 && formData.languages[0].name && (
                        <div className="sidebar-section">
                          <h4>Languages</h4>
                          {formData.languages.map((lang, idx) => (
                            lang.name && <p key={idx}>{lang.name} - {lang.proficiency}</p>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="creative-main">
                      {formData.title && (
                        <div style={{marginBottom: '1.5rem'}}>
                          <h2 style={{color: '#2563EB', fontSize: '1.5rem', marginBottom: '0.5rem'}}>{formData.title}</h2>
                        </div>
                      )}

                      {formData.careerObjective && (
                        <div className="creative-section">
                          <h3 className="creative-title">About Me</h3>
                          <p>{formData.careerObjective}</p>
                        </div>
                      )}

                      {formData.workExperience && formData.workExperience.length > 0 && formData.workExperience[0].jobTitle && (
                        <div className="creative-section">
                          <h3 className="creative-title">Experience</h3>
                          {formData.workExperience.map((exp, idx) => (
                            exp.jobTitle && (
                              <div key={idx} className="creative-item">
                                <h4>{exp.jobTitle}</h4>
                                <div className="creative-company">
                                  {exp.companyName} | {exp.startDate} - {exp.currentJob ? 'Present' : exp.endDate || 'Present'}
                                </div>
                                {exp.responsibilities && <p>{exp.responsibilities}</p>}
                              </div>
                            )
                          ))}
                        </div>
                      )}

                      {formData.education && formData.education.length > 0 && formData.education[0].degree && (
                        <div className="creative-section">
                          <h3 className="creative-title">Education</h3>
                          {formData.education.map((edu, idx) => (
                            edu.degree && (
                              <div key={idx} className="creative-item">
                                <h4>{edu.degree}</h4>
                                <div className="creative-company">
                                  {edu.institution} | {edu.graduationYear}
                                  {edu.gpa && ` | GPA: ${edu.gpa}`}
                                </div>
                              </div>
                            )
                          ))}
                        </div>
                      )}

                      {formData.certifications && formData.certifications.length > 0 && formData.certifications[0].name && (
                        <div className="creative-section">
                          <h3 className="creative-title">Certifications</h3>
                          {formData.certifications.map((cert, idx) => (
                            cert.name && (
                              <div key={idx} className="creative-item">
                                <h4>{cert.name}</h4>
                                <div className="creative-company">
                                  {cert.institution} | {cert.dateAchieved}
                                </div>
                              </div>
                            )
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Minimal Template */}
                {(formData.selectedTemplate || formData.template) === 'minimal' && (
                  <div className="resume-template-minimal">
                    <div className="minimal-header">
                      <div className="minimal-name">{formData.fullName || 'Your Name'}</div>
                      <div className="minimal-contact">
                        {formData.title && <span>{formData.title}</span>}
                        {formData.email && <span> • {formData.email}</span>}
                        {formData.phone && <span> • {formData.phone}</span>}
                        {formData.location && <span> • {formData.location}</span>}
                        {formData.links && formData.links.map((link, idx) => 
                          link.label && link.url ? <span key={idx}> • {link.label}</span> : null
                        )}
                      </div>
                    </div>

                    {formData.careerObjective && (
                      <div className="minimal-section">
                        <h3 className="minimal-title">Summary</h3>
                        <p className="minimal-summary">{formData.careerObjective}</p>
                      </div>
                    )}

                    {formData.workExperience && formData.workExperience.length > 0 && formData.workExperience[0].jobTitle && (
                      <div className="minimal-section">
                        <h3 className="minimal-title">Experience</h3>
                        {formData.workExperience.map((exp, idx) => (
                          exp.jobTitle && (
                            <div key={idx} className="minimal-item">
                              <div className="minimal-item-header">
                                <span className="minimal-job">{exp.jobTitle}</span>
                                <span className="minimal-date">
                                  {exp.startDate} - {exp.currentJob ? 'Present' : exp.endDate || 'Present'}
                                </span>
                              </div>
                              <div className="minimal-company">{exp.companyName}</div>
                              {exp.responsibilities && <p>{exp.responsibilities}</p>}
                            </div>
                          )
                        ))}
                      </div>
                    )}

                    {formData.education && formData.education.length > 0 && formData.education[0].degree && (
                      <div className="minimal-section">
                        <h3 className="minimal-title">Education</h3>
                        {formData.education.map((edu, idx) => (
                          edu.degree && (
                            <div key={idx} className="minimal-item">
                              <div className="minimal-item-header">
                                <span className="minimal-job">{edu.degree}</span>
                                <span className="minimal-date">{edu.graduationYear}</span>
                              </div>
                              <div className="minimal-company">
                                {edu.institution}
                                {edu.gpa && ` • GPA: ${edu.gpa}`}
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    )}

                    {formData.skills && formData.skills.length > 0 && (
                      <div className="minimal-section">
                        <h3 className="minimal-title">Skills</h3>
                        <p>{formData.skills.join(' • ')}</p>
                      </div>
                    )}

                    {formData.certifications && formData.certifications.length > 0 && formData.certifications[0].name && (
                      <div className="minimal-section">
                        <h3 className="minimal-title">Certifications</h3>
                        {formData.certifications.map((cert, idx) => (
                          cert.name && (
                            <div key={idx} className="minimal-item">
                              <div className="minimal-item-header">
                                <span className="minimal-job">{cert.name}</span>
                                <span className="minimal-date">{cert.dateAchieved}</span>
                              </div>
                              <div className="minimal-company">{cert.institution}</div>
                            </div>
                          )
                        ))}
                      </div>
                    )}

                    {formData.languages && formData.languages.length > 0 && formData.languages[0].name && (
                      <div className="minimal-section">
                        <h3 className="minimal-title">Languages</h3>
                        <div className="template-languages">
                          {formData.languages.map((lang, idx) => (
                            lang.name && <span key={idx}>{lang.name} ({lang.proficiency}) </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="edit-resume-download-options">
                <button
                  className="edit-resume-download-btn pdf"
                  onClick={() => handleDownload('pdf')}
                >
                  <FaDownload /> Download PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Save Button for Mobile */}
      <div className="edit-resume-floating-save">
        <button onClick={handleSave} disabled={saveStatus === 'saving'}>
          <FaSave /> {saveStatus === 'saving' ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* PDF Viewer Modal */}
      {showPDFModal && pdfUrl && (
        <ViewPDFModal
          pdfUrl={pdfUrl}
          resumeTitle={pdfResumeTitle}
          onClose={handleClosePDFModal}
          onDownload={handlePDFDownload}
        />
      )}
    </div>
  );
};

export default EditResume;