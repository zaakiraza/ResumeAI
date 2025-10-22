import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSearch,
  faSort,
  faFileAlt,
  faTrash,
  faCopy,
  faDownload,
  faEye,
  faEllipsisV,
  faSortAmountDown,
  faSortAmountUp,
  faSpinner,
  faExclamationCircle,
  faFilter,
  faCalendarAlt,
  faEdit,
  faChartLine,
  faCheckCircle,
  faDraftingCompass,
  faFileExport,
  faLayerGroup,
  faChartBar,
} from "@fortawesome/free-solid-svg-icons";
import { useResumes } from "../../../hooks/useResume";
import "./MyResumes.css";

const MyResumes = () => {
  const navigate = useNavigate();
  const {
    resumes,
    loading,
    error,
    fetchResumes,
    deleteResume,
    duplicateResume,
    downloadPDF,
  } = useResumes();

  // State for filtering and sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [sortDirection, setSortDirection] = useState("desc");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [duplicateInProgress, setDuplicateInProgress] = useState(false);
  const [downloadInProgress, setDownloadInProgress] = useState(false);

  // Load resumes on component mount
  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  // Filter and sort resumes
  const filteredResumes = resumes
    .filter((resume) => {
      // Filter by search term
      if (
        searchTerm &&
        !resume.title.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Filter by status
      if (filterStatus !== "all" && resume.status !== filterStatus) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "newest":
          comparison = new Date(b.createdAt) - new Date(a.createdAt);
          break;
        case "oldest":
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
          break;
        case "updated":
          comparison = new Date(b.lastModified) - new Date(a.lastModified);
          break;
        case "downloads":
          comparison = b.downloadCount - a.downloadCount;
          break;
        default:
          comparison = new Date(b.createdAt) - new Date(a.createdAt);
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

  // Handle sort change
  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      // Toggle direction if clicking the same sort option
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new sort option with default direction
      setSortBy(newSortBy);
      setSortDirection("desc");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Resume actions handlers
  const handleDeleteClick = (resume) => {
    setResumeToDelete(resume);
    setShowDeleteModal(true);
    setActionMenuOpen(null);
  };

  const handleDeleteConfirm = async () => {
    if (!resumeToDelete) return;

    try {
      setDeleteInProgress(true);
      await deleteResume(resumeToDelete._id);
      setShowDeleteModal(false);
      setResumeToDelete(null);
    } catch (error) {
      console.error("Error deleting resume:", error);
    } finally {
      setDeleteInProgress(false);
    }
  };

  const handleDuplicateResume = async (resumeId) => {
    try {
      setDuplicateInProgress(resumeId);
      await duplicateResume(resumeId);
      setActionMenuOpen(null);
    } catch (error) {
      console.error("Error duplicating resume:", error);
    } finally {
      setDuplicateInProgress(null);
    }
  };

  const handleDownloadResume = async (resumeId, template) => {
    try {
      setDownloadInProgress(resumeId);
      await downloadPDF(resumeId, template);
      setActionMenuOpen(null);
    } catch (error) {
      console.error("Error downloading resume:", error);
    } finally {
      setDownloadInProgress(null);
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "draft":
        return "status-badge-draft";
      case "completed":
        return "status-badge-completed";
      case "published":
        return "status-badge-published";
      default:
        return "";
    }
  };

  return (
    <div className="my-resumes-container">
      <div className="my-resumes-header">
        <div className="my-resumes-title">
          <h1>My Resumes</h1>
          <p>
            {resumes.length} {resumes.length === 1 ? "resume" : "resumes"}{" "}
            created
          </p>
        </div>
        <button
          className="create-resume-button"
          onClick={() => navigate("/create-resume")}
        >
          <FontAwesomeIcon icon={faPlus} />
          Create New Resume
        </button>
      </div>

      {/* Filters and search */}
      <div className="my-resumes-filters">
        <div className="search-bar">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder="Search resumes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-options">
          <div className="filter-group">
            <label>
              <FontAwesomeIcon icon={faFilter} />
              Status:
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All</option>
              <option value="draft">Draft</option>
              <option value="completed">Completed</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="filter-group">
            <label>
              <FontAwesomeIcon icon={faSort} />
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="newest">Date Created (Newest)</option>
              <option value="oldest">Date Created (Oldest)</option>
              <option value="updated">Last Updated</option>
              <option value="title">Title (A-Z)</option>
              <option value="downloads">Most Downloads</option>
            </select>
            <button
              className="sort-direction-button"
              onClick={() =>
                setSortDirection(sortDirection === "asc" ? "desc" : "asc")
              }
              title={sortDirection === "asc" ? "Ascending" : "Descending"}
            >
              <FontAwesomeIcon
                icon={
                  sortDirection === "asc" ? faSortAmountUp : faSortAmountDown
                }
              />
            </button>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="my-resumes-error">
          <FontAwesomeIcon icon={faExclamationCircle} />
          <p>Error loading resumes: {error}</p>
          <button onClick={() => fetchResumes()}>Try Again</button>
        </div>
      )}

      {/* Loading state */}
      {loading && !error && (
        <div className="my-resumes-loading">
          <FontAwesomeIcon icon={faSpinner} spin />
          <p>Loading your resumes...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && resumes.length === 0 && (
        <div className="my-resumes-empty">
          <div className="empty-illustration">
            <FontAwesomeIcon icon={faFileAlt} />
          </div>
          <h2>No resumes yet</h2>
          <p>Create your first resume to get started on your career journey!</p>
          <button
            className="create-first-resume"
            onClick={() => navigate("/create-resume")}
          >
            <FontAwesomeIcon icon={faPlus} />
            Create Your First Resume
          </button>
        </div>
      )}

      {/* Resumes grid */}
      {!loading && !error && filteredResumes.length > 0 && (
        <div className="my-resumes-grid">
          {filteredResumes.map((resume) => (
            <div key={resume._id} className="resume-card">
              <div className="resume-card-header">
                <span
                  className={`status-badge ${getStatusBadgeClass(
                    resume.status
                  )}`}
                >
                  {resume.status}
                </span>
                <div className="resume-actions">
                  <button
                    className="action-menu-button"
                    onClick={() =>
                      setActionMenuOpen(
                        actionMenuOpen === resume._id ? null : resume._id
                      )
                    }
                  >
                    <FontAwesomeIcon icon={faEllipsisV} />
                  </button>

                  {/* Action menu dropdown */}
                  {actionMenuOpen === resume._id && (
                    <div className="action-menu-dropdown">
                      <button
                        onClick={() => navigate(`/edit-resume/${resume._id}`)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                        Edit Resume
                      </button>
                      <button onClick={() => handleDuplicateResume(resume._id)}>
                        <FontAwesomeIcon
                          icon={
                            duplicateInProgress === resume._id
                              ? faSpinner
                              : faCopy
                          }
                          spin={duplicateInProgress === resume._id}
                        />
                        Duplicate
                      </button>
                      <button
                        onClick={() =>
                          handleDownloadResume(
                            resume._id,
                            resume.selectedTemplate || resume.template
                          )
                        }
                      >
                        <FontAwesomeIcon
                          icon={
                            downloadInProgress === resume._id
                              ? faSpinner
                              : faDownload
                          }
                          spin={downloadInProgress === resume._id}
                        />
                        Download PDF
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/preview-resume/${resume._id}`)
                        }
                      >
                        <FontAwesomeIcon icon={faEye} />
                        Preview
                      </button>
                      <button
                        className="delete-action"
                        onClick={() => handleDeleteClick(resume)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div
                className="resume-card-content"
                onClick={() => navigate(`/edit-resume/${resume._id}`)}
              >
                <div className="resume-icon">
                  <FontAwesomeIcon icon={faFileAlt} />
                </div>
                <h3 className="resume-title">{resume.title}</h3>
                <div className="resume-info">
                  <div className="resume-info-item">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <span>Created: {formatDate(resume.createdAt)}</span>
                  </div>
                  {resume.lastModified && (
                    <div className="resume-info-item">
                      <FontAwesomeIcon icon={faEdit} />
                      <span>Updated: {formatDate(resume.lastModified)}</span>
                    </div>
                  )}
                  <div className="resume-info-item">
                    <FontAwesomeIcon icon={faDownload} />
                    <span>{resume.downloadCount || 0} Downloads</span>
                  </div>
                </div>
              </div>

              <div className="resume-card-footer">
                <div className="resume-template">
                  <span>
                    Template:{" "}
                    {resume.selectedTemplate || resume.template || "Modern"}
                  </span>
                </div>
                <div className="resume-quick-actions">
                  <button
                    className="quick-action-button"
                    onClick={() => navigate(`/edit-resume/${resume._id}`)}
                    title="Edit Resume"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    className="quick-action-button"
                    onClick={() =>
                      handleDownloadResume(
                        resume._id,
                        resume.selectedTemplate || resume.template
                      )
                    }
                    title="Download PDF"
                    disabled={downloadInProgress === resume._id}
                  >
                    <FontAwesomeIcon
                      icon={
                        downloadInProgress === resume._id
                          ? faSpinner
                          : faDownload
                      }
                      spin={downloadInProgress === resume._id}
                    />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty search results */}
      {!loading &&
        !error &&
        resumes.length > 0 &&
        filteredResumes.length === 0 && (
          <div className="my-resumes-empty-search">
            <h2>No matching resumes found</h2>
            <p>
              Try adjusting your search or filters to find what you're looking
              for.
            </p>
            <button
              className="clear-filters"
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("all");
              }}
            >
              Clear Filters
            </button>
          </div>
        )}

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div
          className="delete-modal-overlay"
          onClick={() => !deleteInProgress && setShowDeleteModal(false)}
        >
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Resume</h2>
            <p>
              Are you sure you want to delete the resume "
              {resumeToDelete?.title}"?
            </p>
            <p className="warning-text">This action cannot be undone.</p>

            <div className="delete-modal-actions">
              <button
                className="cancel-button"
                onClick={() => !deleteInProgress && setShowDeleteModal(false)}
                disabled={deleteInProgress}
              >
                Cancel
              </button>
              <button
                className="delete-button"
                onClick={handleDeleteConfirm}
                disabled={deleteInProgress}
              >
                {deleteInProgress ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin /> Deleting...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faTrash} /> Delete Resume
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resume Analytics Section */}
      {!loading && !error && resumes.length > 0 && (
        <section className="resume-analytics-section">
          <div className="analytics-header">
            <FontAwesomeIcon icon={faChartLine} className="analytics-icon" />
            <h2>Resume Analytics</h2>
          </div>

          <div className="analytics-grid">
            {/* Total Resumes Card */}
            <div className="analytics-card">
              <div className="analytics-icon-wrapper">
                <FontAwesomeIcon icon={faFileAlt} />
              </div>
              <div className="analytics-number">{resumes.length}</div>
              <div className="analytics-label">Total Resumes</div>
            </div>

            {/* Completed Resumes Card */}
            <div className="analytics-card">
              <div className="analytics-icon-wrapper completed">
                <FontAwesomeIcon icon={faCheckCircle} />
              </div>
              <div className="analytics-number">
                {resumes.filter(resume => resume.status === 'completed' || resume.status === 'published').length}
              </div>
              <div className="analytics-label">Completed Resumes</div>
            </div>

            {/* Draft Resumes Card */}
            <div className="analytics-card">
              <div className="analytics-icon-wrapper draft">
                <FontAwesomeIcon icon={faDraftingCompass} />
              </div>
              <div className="analytics-number">
                {resumes.filter(resume => resume.status === 'draft').length}
              </div>
              <div className="analytics-label">Drafts</div>
            </div>

            {/* Total Downloads Card */}
            <div className="analytics-card">
              <div className="analytics-icon-wrapper downloads">
                <FontAwesomeIcon icon={faFileExport} />
              </div>
              <div className="analytics-number">
                {resumes.reduce((total, resume) => total + (resume.downloadCount || 0), 0)}
              </div>
              <div className="analytics-label">Total Downloads</div>
            </div>

            {/* Templates Used Card */}
            <div className="analytics-card">
              <div className="analytics-icon-wrapper templates">
                <FontAwesomeIcon icon={faLayerGroup} />
              </div>
              <div className="analytics-number">
                {new Set(resumes.map(resume => resume.selectedTemplate || resume.template || 'Modern')).size}
              </div>
              <div className="analytics-label">Templates Used</div>
            </div>
          </div>

          {/* Chart Section Placeholder */}
          <div className="analytics-chart-container">
            <div className="chart-placeholder">
              <FontAwesomeIcon icon={faChartBar} className="analytics-icon" />
              <h3>Activity Insights</h3>
              <p>Visualized data about your resume activity will appear here as you create, edit, and download your resumes.</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default MyResumes;
