import React, { useState, useEffect } from 'react';
import { useUser } from '../../../hooks/useUser';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faSave,
  faEdit,
  faSpinner,
  faCheckCircle,
  faTimesCircle,
  faChartLine,
  faFileAlt,
  faDownload,
  faCalendarAlt,
} from '@fortawesome/free-solid-svg-icons';
import ImageUpload from '../../../components/ImageUpload/ImageUpload';
import './Profile.css';

const Profile = () => {
  const { user, loading: userLoading, error: userError, updateUser } = useUser();
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    userName: '',
    email: '',
    phone: '',
    location: '',
    profilePicture: '',
  });
  
  // UI states
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  
  // Update form data when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        userName: user.userName || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        profilePicture: user.profilePicture || '',
      });
    }
  }, [user]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle profile picture changes
  const handleProfilePictureChange = (url) => {
    setFormData(prev => ({
      ...prev,
      profilePicture: url
    }));
  };
  
  // Enable edit mode
  const handleEditClick = () => {
    setIsEditing(true);
    setSaveSuccess(false);
    setSaveError(null);
  };
  
  // Cancel editing
  const handleCancelClick = () => {
    setIsEditing(false);
    setSaveSuccess(false);
    setSaveError(null);
    
    // Reset form data to original user data
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        userName: user.userName || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        profilePicture: user.profilePicture || '',
      });
    }
  };
  
  // Save profile changes
  const handleSaveClick = async () => {
    try {
      setSaving(true);
      setSaveError(null);
      
      // Save changes to backend
      await updateUser(formData);
      
      // Show success message
      setSaveSuccess(true);
      setIsEditing(false);
      
      // Clear success message after a delay
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      setSaveError(error.message || 'Failed to save profile changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  // Calculate profile completion
  const calculateProfileCompletion = () => {
    if (!user) return 0;
    
    let score = 0;
    const fields = ['firstName', 'lastName', 'userName', 'email', 'phone', 'location', 'profilePicture'];
    
    fields.forEach(field => {
      if (user[field] && user[field].toString().trim() !== '') {
        score++;
      }
    });
    
    return Math.round((score / fields.length) * 100);
  };
  
  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (userLoading) {
    return (
      <div className="profile-loading">
        <FontAwesomeIcon icon={faSpinner} spin />
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (userError && !user) {
    return (
      <div className="profile-error">
        <FontAwesomeIcon icon={faTimesCircle} />
        <p>Error loading profile: {userError}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <header className="profile-header">
        <h1>My Profile</h1>
        {!isEditing ? (
          <button className="edit-button" onClick={handleEditClick}>
            <FontAwesomeIcon icon={faEdit} /> Edit Profile
          </button>
        ) : (
          <div className="edit-actions">
            <button className="cancel-button" onClick={handleCancelClick}>
              Cancel
            </button>
            <button 
              className="save-button" 
              onClick={handleSaveClick}
              disabled={saving}
            >
              {saving ? (
                <><FontAwesomeIcon icon={faSpinner} spin /> Saving...</>
              ) : (
                <><FontAwesomeIcon icon={faSave} /> Save Changes</>
              )}
            </button>
          </div>
        )}
      </header>
      
      {saveSuccess && (
        <div className="save-success">
          <FontAwesomeIcon icon={faCheckCircle} />
          <p>Profile updated successfully!</p>
        </div>
      )}
      
      {saveError && (
        <div className="save-error">
          <FontAwesomeIcon icon={faTimesCircle} />
          <p>{saveError}</p>
        </div>
      )}
      
      <div className="profile-content">
        <div className="profile-main">
          <div className="profile-photo-container">
            {isEditing ? (
              <ImageUpload 
                value={formData.profilePicture}
                onChange={handleProfilePictureChange}
                placeholder="Upload Profile Picture"
                folder="resumeai/profile-pictures"
                previewSize="150px"
                className="profile-picture-upload"
              />
            ) : (
              <div className="profile-picture">
                {formData.profilePicture ? (
                  <img src={formData.profilePicture} alt={`${formData.firstName} ${formData.lastName}`} />
                ) : (
                  <div className="profile-picture-placeholder">
                    <FontAwesomeIcon icon={faUser} />
                    <span>No Photo</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="profile-details">
            <div className="profile-name-section">
              <div className="profile-fields">
                <div className="field-group">
                  <label htmlFor="firstName">First Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Your first name"
                    />
                  ) : (
                    <p>{formData.firstName || 'Not provided'}</p>
                  )}
                </div>
                
                <div className="field-group">
                  <label htmlFor="lastName">Last Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Your last name"
                    />
                  ) : (
                    <p>{formData.lastName || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="profile-fields">
              <div className="field-group">
                <label htmlFor="userName">
                  <FontAwesomeIcon icon={faUser} /> Username
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    id="userName"
                    name="userName"
                    value={formData.userName}
                    onChange={handleInputChange}
                    placeholder="Choose a username"
                  />
                ) : (
                  <p>{formData.userName || 'Not provided'}</p>
                )}
              </div>
              
              <div className="field-group">
                <label htmlFor="email">
                  <FontAwesomeIcon icon={faEnvelope} /> Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Your email address"
                    disabled={true} // Email should not be editable
                  />
                ) : (
                  <p>{formData.email || 'Not provided'}</p>
                )}
              </div>
              
              <div className="field-group">
                <label htmlFor="phone">
                  <FontAwesomeIcon icon={faPhone} /> Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Your phone number"
                  />
                ) : (
                  <p>{formData.phone || 'Not provided'}</p>
                )}
              </div>
              
              <div className="field-group">
                <label htmlFor="location">
                  <FontAwesomeIcon icon={faMapMarkerAlt} /> Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="City, Country"
                  />
                ) : (
                  <p>{formData.location || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="profile-stats">
          <div className="stats-container">
            <h2>Profile Stats</h2>
            
            <div className="completion-meter">
              <div className="completion-label">
                <span>Profile Completion</span>
                <span className="completion-percentage">{calculateProfileCompletion()}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${calculateProfileCompletion()}%` }}
                ></div>
              </div>
            </div>
            
            <div className="stats-grid">
              <div className="stat-item">
                <FontAwesomeIcon icon={faFileAlt} className="stat-icon resume-icon" />
                <div className="stat-info">
                  <h3>{user?.analytics?.totalResumesCreated || 0}</h3>
                  <p>Resumes Created</p>
                </div>
              </div>
              
              <div className="stat-item">
                <FontAwesomeIcon icon={faDownload} className="stat-icon download-icon" />
                <div className="stat-info">
                  <h3>{user?.analytics?.totalDownloads || 0}</h3>
                  <p>Downloads</p>
                </div>
              </div>
              
              <div className="stat-item">
                <FontAwesomeIcon icon={faCalendarAlt} className="stat-icon date-icon" />
                <div className="stat-info">
                  <h3>{formatDate(user?.createdAt)}</h3>
                  <p>Member Since</p>
                </div>
              </div>
              
              <div className="stat-item">
                <FontAwesomeIcon icon={faChartLine} className="stat-icon activity-icon" />
                <div className="stat-info">
                  <h3>{formatDate(user?.analytics?.lastActivity)}</h3>
                  <p>Last Activity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
