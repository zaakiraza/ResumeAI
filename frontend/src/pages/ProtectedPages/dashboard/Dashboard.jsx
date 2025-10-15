import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus,
  faFileAlt,
  faDownload,
  faEdit,
  faTrash,
  faBullseye,
  faSpellCheck,
  faLanguage,
  faUser,
  faChartLine,
  faBriefcase,
  faBell,
  faCheck,
  faArrowRight,
  faRocket,
  faStar
} from '@fortawesome/free-solid-svg-icons';
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: "raaza.zaakir",
    resumesCount: 3,
    downloadsCount: 10,
    profileCompletion: 75
  });

  const [resumes, setResumes] = useState([
    {
      id: 1,
      title: "Software Developer Resume",
      lastModified: "2024-10-15",
      downloads: 5,
      status: "Completed"
    },
    {
      id: 2,
      title: "Marketing Manager Resume",
      lastModified: "2024-10-08",
      downloads: 2,
      status: "Draft"
    },
    {
      id: 3,
      title: "Data Analyst Resume",
      lastModified: "2024-10-05",
      downloads: 3,
      status: "Completed"
    }
  ]);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "Your resume was successfully proofread by AI",
      time: "2 hours ago",
      type: "success"
    },
    {
      id: 2,
      message: "New professional templates are now available for your resume",
      time: "1 day ago",
      type: "info"
    },
    {
      id: 3,
      message: "Remember to apply for jobs with your latest resume",
      time: "3 days ago",
      type: "reminder"
    }
  ]);

  const handleCreateResume = () => {
    navigate("/create-resume");
  };

  const handleEditResume = (resumeId) => {
    navigate(`/edit-resume/${resumeId}`);
  };

  const handleDownloadResume = (resumeId) => {
    // Handle resume download
    console.log("Downloading resume:", resumeId);
  };

  const handleDeleteResume = (resumeId) => {
    setResumes(resumes.filter(resume => resume.id !== resumeId));
  };

  const handleNavigateToAITools = () => {
    navigate("/ai-tools");
  };

  const handleCompleteProfile = () => {
    navigate("/profile");
  };

  const handleViewAllNotifications = () => {
    navigate("/notifications");
  };

  return (
    <div className="dashboard-page">
      
      <div className="dashboard-container">
        {/* Welcome Section */}
        <section className="welcome-section">
          <div className="welcome-content">
            <h1 className="welcome-title">
              Welcome back, {userData.name}! 
              <span className="wave-emoji">👋</span>
            </h1>
            <p className="welcome-subtitle">
              Let's update your resume and get you closer to your next opportunity!
            </p>
            <button className="create-resume-btn" onClick={handleCreateResume}>
              <FontAwesomeIcon icon={faPlus} />
              Create a New Resume
            </button>
          </div>
          
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-number">{userData.resumesCount}</div>
              <div className="stat-label">Resumes</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{userData.downloadsCount}</div>
              <div className="stat-label">Downloads</div>
            </div>
          </div>
        </section>

        <div className="dashboard-grid">
          {/* Resume Management Section */}
          <section className="resumes-section">
            <div className="section-header">
              <h2>
                <FontAwesomeIcon icon={faFileAlt} className="section-icon" />
                Your Resumes
              </h2>
              <button className="new-resume-btn" onClick={handleCreateResume}>
                <FontAwesomeIcon icon={faPlus} />
                New Resume
              </button>
            </div>
            
            <div className="resumes-list">
              {resumes.map((resume) => (
                <div key={resume.id} className="resume-card">
                  <div className="resume-info">
                    <h3 className="resume-title">{resume.title}</h3>
                    <p className="resume-meta">
                      Last modified: {new Date(resume.lastModified).toLocaleDateString()} • Downloaded {resume.downloads} times
                    </p>
                    <span className={`resume-status ${resume.status.toLowerCase()}`}>
                      {resume.status}
                    </span>
                  </div>
                  
                  <div className="resume-actions">
                    <button 
                      className="action-btn edit-btn"
                      onClick={() => handleEditResume(resume.id)}
                      title="Edit Resume"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      className="action-btn download-btn"
                      onClick={() => handleDownloadResume(resume.id)}
                      title="Download Resume"
                    >
                      <FontAwesomeIcon icon={faDownload} />
                    </button>
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteResume(resume.id)}
                      title="Delete Resume"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* AI Tools Section */}
          <section className="ai-tools-section">
            <div className="section-header">
              <h2>
                <FontAwesomeIcon icon={faStar} className="section-icon" />
                Powerful AI Tools
              </h2>
            </div>
            
            <div className="ai-tools-grid">
              <div className="ai-tool-card">
                <div className="tool-icon tailor-icon">
                  <FontAwesomeIcon icon={faBullseye} />
                </div>
                <h3>Tailor Your Resume</h3>
                <p>AI-powered tool that tailors your resume based on job descriptions</p>
              </div>
              
              <div className="ai-tool-card">
                <div className="tool-icon proofread-icon">
                  <FontAwesomeIcon icon={faSpellCheck} />
                </div>
                <h3>Proofreading & Grammar</h3>
                <p>Ensure there are no grammar or spelling mistakes in your resume</p>
              </div>
              
              <div className="ai-tool-card">
                <div className="tool-icon translate-icon">
                  <FontAwesomeIcon icon={faLanguage} />
                </div>
                <h3>Translate Resume</h3>
                <p>AI tool that translates resumes into other languages</p>
              </div>
            </div>
            
            <button className="try-ai-tools-btn" onClick={handleNavigateToAITools}>
              <FontAwesomeIcon icon={faRocket} />
              Try All AI Tools
            </button>
          </section>

          {/* Progress Section */}
          <section className="progress-section">
            <div className="section-header">
              <h2>
                <FontAwesomeIcon icon={faChartLine} className="section-icon" />
                Your Progress
              </h2>
            </div>
            
            <div className="progress-content">
              <div className="progress-stats">
                <div className="progress-stat">
                  <FontAwesomeIcon icon={faFileAlt} className="progress-icon" />
                  <div className="progress-info">
                    <div className="progress-number">{userData.resumesCount}</div>
                    <div className="progress-label">Resumes Created</div>
                  </div>
                </div>
                
                <div className="progress-stat">
                  <FontAwesomeIcon icon={faDownload} className="progress-icon" />
                  <div className="progress-info">
                    <div className="progress-number">{userData.downloadsCount}</div>
                    <div className="progress-label">Downloads This Month</div>
                  </div>
                </div>
              </div>
              
              <div className="profile-completion">
                <h4>Profile Completion</h4>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${userData.profileCompletion}%` }}
                  ></div>
                </div>
                <p className="completion-text">{userData.profileCompletion}% Complete</p>
              </div>
            </div>
          </section>

          {/* Notifications Section */}
          <section className="notifications-section">
            <div className="section-header">
              <h2>
                <FontAwesomeIcon icon={faBell} className="section-icon" />
                Recent Notifications
              </h2>
              <button className="view-all-btn" onClick={handleViewAllNotifications}>
                View All
              </button>
            </div>
            
            <div className="notifications-list">
              {notifications.slice(0, 3).map((notification) => (
                <div key={notification.id} className={`notification-item ${notification.type}`}>
                  <div className="notification-content">
                    <p>{notification.message}</p>
                    <span className="notification-time">{notification.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Next Steps Section */}
          <section className="next-steps-section">
            <div className="section-header">
              <h2>
                <FontAwesomeIcon icon={faArrowRight} className="section-icon" />
                Next Steps
              </h2>
            </div>
            
            <div className="next-steps-list">
              <div className="next-step-item">
                <FontAwesomeIcon icon={faUser} className="step-icon" />
                <div className="step-content">
                  <h4>Complete Your Profile</h4>
                  <p>Finish filling out missing profile information</p>
                </div>
                <button className="step-action-btn" onClick={handleCompleteProfile}>
                  Complete
                </button>
              </div>
              
              <div className="next-step-item">
                <FontAwesomeIcon icon={faFileAlt} className="step-icon" />
                <div className="step-content">
                  <h4>Create a New Resume</h4>
                  <p>Start building a new resume for different opportunities</p>
                </div>
                <button className="step-action-btn" onClick={handleCreateResume}>
                  Create
                </button>
              </div>
              
              <div className="next-step-item">
                <FontAwesomeIcon icon={faDownload} className="step-icon" />
                <div className="step-content">
                  <h4>Download Your Resume</h4>
                  <p>Get your most recent resume in multiple formats</p>
                </div>
                <button className="step-action-btn" onClick={() => handleDownloadResume(resumes[0]?.id)}>
                  Download
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-content">
            <h2>Ready to Build Your Perfect Resume?</h2>
            <p>Join thousands of professionals who have transformed their resumes with ResumeAI.</p>
            <button className="cta-btn" onClick={handleCreateResume}>
              <FontAwesomeIcon icon={faRocket} />
              Start Building Your Resume
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;


