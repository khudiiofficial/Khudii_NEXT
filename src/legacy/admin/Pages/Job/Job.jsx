import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminJobs.css';

const API_URL = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');

const AdminJobs = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchApplications();
  }, [pagination.page, search]);

  const fetchApplications = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/job-applications`, {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: search
        },
        withCredentials: true
      });
      setApplications(response.data.applications);
      setPagination(prev => ({
        ...prev,
        ...response.data.pagination
      }));
    } catch (error) {
      console.error('Error fetching job applications:', error);
      alert('Failed to load job applications');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicationDetails = async (id) => {
    try {
      const response = await axios.get(`${API_URL}/admin/job-applications/${id}`, {
        withCredentials: true
      });
      setSelectedApplication(response.data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching application details:', error);
      alert('Failed to load application details');
    }
  };

  const deleteApplication = async (id) => {
    if (!confirm('Are you sure you want to delete this job application?')) return;

    try {
      await axios.delete(`${API_URL}/admin/job-applications/${id}`, {
        withCredentials: true
      });
      setApplications(applications.filter(app => app.id !== id));
      alert('Job application deleted successfully!');
    } catch (error) {
      console.error('Error deleting job application:', error);
      alert('Failed to delete job application');
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const truncateText = (text, maxLength) => {
    if (!text) return 'Not provided';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="admin-jobs-container">
        <div className="loading">Loading job applications...</div>
      </div>
    );
  }

  return (
    <div className="admin-jobs-container">
      <div className="admin-header">
        <h1>Job Applications Management</h1>
        <p>Manage all job application submissions</p>
      </div>

      <div className="applications-section">
        <div className="section-header">
          <h2>Job Applications ({pagination.total})</h2>
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name, email, phone, or position..."
              value={(search) ?? ''}
              onChange={handleSearch}
            />
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="no-data">No job applications found</div>
        ) : (
          <>
            <div className="applications-table">
              <table>
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Contact</th>
                    <th>Interested Position</th>
                    <th>Experience</th>
                    <th>Qualification</th>
                    <th>Country</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((application) => (
                    <tr key={application.id}>
                      <td>
                        <strong>{application.name}</strong>
                      </td>
                      <td>
                        <div className="contact-info">
                          <div><a href={`mailto:${application.email} target="_blank`}>{application.email}</a></div>
                          {application.phone && (
                            <div><a href={`tel:${application.phone} target="_blank`}>+{application.countryCode} {application.phone}</a></div>
                          )}
                        </div>
                      </td>
                      <td>
                        {application.interestedPost || 'Not specified'}
                      </td>
                      <td>
                        {application.experience} Years
                      </td>
                      <td className="qualification-cell">
                        <div title={application.qualification}>
                          {truncateText(application.qualification, 50)}
                        </div>
                      </td>
                      <td>
                        {application.CountryName}
                      </td>
                      <td>{formatDate(application.created_at)}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-view"
                            onClick={() => fetchApplicationDetails(application.id)}
                          >
                            View
                          </button>
                          <button 
                            className="btn-delete"
                            onClick={() => deleteApplication(application.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Previous
                </button>
                
                <span>
                  Page {pagination.page} of {pagination.pages}
                </span>
                
                <button
                  disabled={pagination.page === pagination.pages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Application Details Popup */}
      {showModal && selectedApplication && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Job Application Details</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="details-grid">
                <div className="detail-group">
                  <label>Applicant Name:</label>
                  <span>{selectedApplication.name}</span>
                </div>
                
                <div className="detail-group">
                  <label>Email:</label>
                  <span>
                    <a href={`mailto:${selectedApplication.email} target="_blank`}>{selectedApplication.email}</a>
                  </span>
                </div>
                
                {selectedApplication.phone && (
                  <div className="detail-group">
                    <label>Phone:</label>
                    <span>
                      <a href={`tel:${selectedApplication.phone} target="_blank`}>
                        +{selectedApplication.countryCode} {selectedApplication.phone}
                      </a>
                    </span>
                  </div>
                )}
                
                <div className="detail-group">
                  <label>Country:</label>
                  <span>{selectedApplication.CountryName} ({selectedApplication.country})</span>
                </div>
                
                <div className="detail-group">
                  <label>Experience:</label>
                  <span>{selectedApplication.experience}</span>
                </div>
                
                {selectedApplication.qualification && (
                  <div className="detail-group">
                    <label>Qualification:</label>
                    <span>{selectedApplication.qualification}</span>
                  </div>
                )}
                
                {selectedApplication.interestedPost && (
                  <div className="detail-group">
                    <label>Interested Position:</label>
                    <span className="position-badge">{selectedApplication.interestedPost}</span>
                  </div>
                )}
                
                {selectedApplication.message && (
                  <div className="detail-group">
                    <label>Cover Message:</label>
                    <div className="message-content">
                      {selectedApplication.message}
                    </div>
                  </div>
                )}
                
                <div className="detail-group">
                  <label>Submitted:</label>
                  <span>{formatDate(selectedApplication.created_at)}</span>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn-close" onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobs;