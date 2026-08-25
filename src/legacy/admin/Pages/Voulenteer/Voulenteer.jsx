import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminVolunteers.css';

const API_URL = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');

const AdminVolunteers = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchVolunteers();
  }, [pagination.page, search]);

  const fetchVolunteers = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/volunteers`, {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: search
        },
        withCredentials: true
      });
      setVolunteers(response.data.volunteers);
      setPagination(prev => ({
        ...prev,
        ...response.data.pagination
      }));
    } catch (error) {
      console.error('Error fetching volunteers:', error);
      alert('Failed to load volunteers');
    } finally {
      setLoading(false);
    }
  };

  const fetchVolunteerDetails = async (id) => {
    try {
      const response = await axios.get(`${API_URL}/admin/volunteers/${id}`, {
        withCredentials: true
      });
      setSelectedVolunteer(response.data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching volunteer details:', error);
      alert('Failed to load volunteer details');
    }
  };

  const deleteVolunteer = async (id) => {
    if (!confirm('Are you sure you want to delete this volunteer?')) return;

    try {
      await axios.delete(`${API_URL}/admin/volunteers/${id}`, {
        withCredentials: true
      });
      setVolunteers(volunteers.filter(volunteer => volunteer.id !== id));
      alert('Volunteer deleted successfully!');
    } catch (error) {
      console.error('Error deleting volunteer:', error);
      alert('Failed to delete volunteer');
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
      <div className="admin-volunteers-container">
        <div className="loading">Loading volunteers...</div>
      </div>
    );
  }

  return (
    <div className="admin-volunteers-container">
      <div className="admin-header">
        <h1>Volunteers Management</h1>
        <p>Manage all volunteer applications</p>
      </div>

      <div className="volunteers-section">
        <div className="section-header">
          <h2>Volunteers ({pagination.total})</h2>
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name, email, phone, or country..."
              value={(search) ?? ''}
              onChange={handleSearch}
            />
          </div>
        </div>

        {volunteers.length === 0 ? (
          <div className="no-data">No volunteers found</div>
        ) : (
          <>
            <div className="volunteers-table">
              <table>
                <thead>
                  <tr>
                    <th>Volunteer</th>
                    <th>Contact</th>
                    <th>Country</th>
                    <th>City</th>
                    <th>Contact Date</th>
                    <th>Message</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {volunteers.map((volunteer) => (
                    <tr key={volunteer.id}>
                      <td>
                        <strong>{volunteer.name}</strong>
                      </td>
                      <td>
                        <div className="contact-info">
                          <div><a href={`mailto:${volunteer.email}`}>{volunteer.email}</a></div>
                          <div><a href={`tel:${volunteer.phone}`}>+{volunteer.countryCode} {volunteer.phone}</a></div>
                        </div>
                      </td>
                      <td>
                        {volunteer.CountryName}
                      </td>
                      <td>{volunteer.city || '-'}</td>
                      <td>{volunteer.contactTime}</td>
                      <td className="message-cell">
                        <div title={volunteer.message}>
                          {truncateText(volunteer.message, 80)}
                        </div>
                      </td>
                      <td>{formatDate(volunteer.created_at)}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-view"
                            onClick={() => fetchVolunteerDetails(volunteer.id)}
                          >
                            View
                          </button>
                          <button 
                            className="btn-delete"
                            onClick={() => deleteVolunteer(volunteer.id)}
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

      {/* Volunteer Details Modal */}
      {showModal && selectedVolunteer && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Volunteer Details</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="details-grid">
                <div className="detail-group">
                  <label>Volunteer Name:</label>
                  <span>{selectedVolunteer.name}</span>
                </div>
                
                <div className="detail-group">
                  <label>Email:</label>
                  <span>
                    <a href={`mailto:${selectedVolunteer.email}`}>{selectedVolunteer.email}</a>
                  </span>
                </div>
                
                <div className="detail-group">
                  <label>Phone:</label>
                  <span>
                    <a href={`tel:${selectedVolunteer.phone}`}>
                      +{selectedVolunteer.countryCode} {selectedVolunteer.phone}
                    </a>
                  </span>
                </div>
                
                <div className="detail-group">
                  <label>Country:</label>
                  <span>{selectedVolunteer.CountryName} ({selectedVolunteer.country})</span>
                </div>
                
                <div className="detail-group">
                  <label>City:</label>
                  <span>{selectedVolunteer.city || '-'}</span>
                </div>

                <div className="detail-group">
                  <label>Preferred Contact Date:</label>
                  <span className="contact-time">{selectedVolunteer.contactTime}</span>
                </div>
                
                {selectedVolunteer.message && (
                  <div className="detail-group full-width">
                    <label>Message:</label>
                    <div className="message-content">
                     <span>{selectedVolunteer.message}</span>
                    </div>
                  </div>
                )}
                
                <div className="detail-group">
                  <label>Submitted:</label>
                  <span>{formatDate(selectedVolunteer.created_at)}</span>
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

export default AdminVolunteers;