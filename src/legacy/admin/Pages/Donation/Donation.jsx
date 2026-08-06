import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDonations.css';

const API_URL = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');

const AdminDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDonations();
  }, [pagination.page, search]);

  const fetchDonations = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/donations`, {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: search
        },
        withCredentials: true
      });
      setDonations(response.data.donations);
      setPagination(prev => ({
        ...prev,
        ...response.data.pagination
      }));
    } catch (error) {
      console.error('Error fetching donations:', error);
      alert('Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

  const fetchDonationDetails = async (id) => {
    try {
      const response = await axios.get(`${API_URL}/admin/donations/${id}`, {
        withCredentials: true
      });
      setSelectedDonation(response.data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching donation details:', error);
      alert('Failed to load donation details');
    }
  };

  const deleteDonation = async (id) => {
    if (!confirm('Are you sure you want to delete this donation?')) return;

    try {
      await axios.delete(`${API_URL}/admin/donations/${id}`, {
        withCredentials: true
      });
      setDonations(donations.filter(donation => donation.id !== id));
      alert('Donation deleted successfully!');
    } catch (error) {
      console.error('Error deleting donation:', error);
      alert('Failed to delete donation');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`${API_URL}/admin/donations/${id}/status`, 
        { status },
        { withCredentials: true }
      );
      setDonations(donations.map(donation => 
        donation.id === id ? { ...donation, status } : donation
      ));
      if (selectedDonation && selectedDonation.id === id) {
        setSelectedDonation({ ...selectedDonation, status });
      }
      alert('Status updated successfully!');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'status-pending',
      processed: 'status-processed',
      completed: 'status-completed',
      cancelled: 'status-cancelled'
    };
    return <span className={`status-badge ${statusColors[status] || 'status-pending'}`}>{status}</span>;
  };

  if (loading) {
    return (
      <div className="admin-donations-container">
        <div className="loading">Loading donations...</div>
      </div>
    );
  }

  return (
    <div className="admin-donations-container">
      <div className="admin-header">
        <h1>Donations Management</h1>
        <p>Manage all donation submissions</p>
      </div>

      <div className="donations-section">
        <div className="section-header">
          <h2>Donations ({pagination.total})</h2>
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name, email, phone, or type..."
              value={(search) ?? ''}
              onChange={handleSearch}
            />
          </div>
        </div>

        {donations.length === 0 ? (
          <div className="no-data">No Donations Found</div>
        ) : (
          <>
            <div className="donations-table">
              <table>
                <thead>
                  <tr>
                    <th>Donor</th>
                    <th>Contact</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((donation) => (
                    <tr key={donation.id}>
                      <td>
                        <strong>{donation.firstName} {donation.lastName}</strong>
                      </td>
                      <td>
                        <div className="contact-info">
                          {donation.email && (
                            <div><a href={`mailto:${donation.email}`}>{donation.email}</a></div>
                          )}
                          {donation.phone && (
                            <div><a href={`tel:${donation.phone}`}>+{donation.countryCode} {donation.phone}</a></div>
                          )}
                        </div>
                      </td>
                      <td className="amount-cell">
                        <strong>{formatCurrency(donation.donationAmount)}</strong>
                      </td>
                      <td>{donation.donationType}</td>
                      <td>
                        {donation.city}, {donation.state}
                        {donation.country && <div className="country">{donation.country}</div>}
                      </td>
                      <td>
                        {getStatusBadge(donation.status || 'pending')}
                      </td>
                      <td>{formatDate(donation.created_at)}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-view"
                            onClick={() => fetchDonationDetails(donation.id)}
                          >
                            View
                          </button>
                          <button 
                            className="btn-delete"
                            onClick={() => deleteDonation(donation.id)}
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

      {/* Donation Details Modal */}
      {showModal && selectedDonation && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Donation Details</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="details-grid">
                <div className="detail-group">
                  <label>Donor Name:</label>
                  <span>{selectedDonation.firstName} {selectedDonation.lastName}</span>
                </div>
                
                <div className="detail-group">
                  <label>Email:</label>
                  <span>
                    {selectedDonation.email ? (
                      <a href={`mailto:${selectedDonation.email}`}>{selectedDonation.email}</a>
                    ) : (
                      'Not provided'
                    )}
                  </span>
                </div>
                
                <div className="detail-group">
                  <label>Phone:</label>
                  <span>
                    <a href={`tel:${selectedDonation.phone}`}>
                      +{selectedDonation.countryCode} {selectedDonation.phone}
                    </a>
                  </span>
                </div>
                
                <div className="detail-group">
                  <label>Donation Amount:</label>
                  <span className="amount">{formatCurrency(selectedDonation.donationAmount)}</span>
                </div>
                
                <div className="detail-group">
                  <label>Donation Type:</label>
                  <span>{selectedDonation.donationType}</span>
                </div>
                
                <div className="detail-group">
                  <label>Address:</label>
                  <span>
                    {selectedDonation.address1}<br />
                    {selectedDonation.city}, {selectedDonation.state}<br />
                    {selectedDonation.country}
                  </span>
                </div>
                
                {selectedDonation.message && (
                  <div className="detail-group full-width">
                    <label>Message:</label>
                    <span>{selectedDonation.message}</span>
                  </div>
                )}
                
                <div className="detail-group">
                  <label>Status:</label>
                  <div className="status-control">
                    {getStatusBadge(selectedDonation.status || 'pending')}
                    <select 
                      value={selectedDonation.status || 'pending'}
                      onChange={(e) => updateStatus(selectedDonation.id, e.target.value)}
                      className="status-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="processed">Processed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                
                <div className="detail-group">
                  <label>Submitted:</label>
                  <span>{formatDate(selectedDonation.created_at)}</span>
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

export default AdminDonations;