import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminContacts.css';

const API_URL = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');

const AdminContacts = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMessages();
  }, [pagination.page, search]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/contact-messages`, {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: search
        },
        withCredentials: true
      });
      setMessages(response.data.messages);
      setPagination(prev => ({
        ...prev,
        ...response.data.pagination
      }));
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      alert('Failed to load contact messages');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessageDetails = async (id) => {
    try {
      const response = await axios.get(`${API_URL}/admin/contact-messages/${id}`, {
        withCredentials: true
      });
      setSelectedMessage(response.data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching message details:', error);
      alert('Failed to load message details');
    }
  };

  const deleteMessage = async (id) => {
    if (!confirm('Are you sure you want to delete this contact message?')) return;

    try {
      await axios.delete(`${API_URL}/admin/contact-messages/${id}`, {
        withCredentials: true
      });
      setMessages(messages.filter(message => message.id !== id));
      alert('Contact message deleted successfully!');
    } catch (error) {
      console.error('Error deleting contact message:', error);
      alert('Failed to delete contact message');
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
    if (!text) return 'No message';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="admin-contacts-container">
        <div className="loading">Loading contact messages...</div>
      </div>
    );
  }

  return (
    <div className="admin-contacts-container">
      <div className="admin-header">
        <h1>Contact Messages Management</h1>
        <p>Manage all contact form submissions</p>
      </div>

      <div className="messages-section">
        <div className="section-header">
          <h2>Contact Messages ({pagination.total})</h2>
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name, email, phone, or subject..."
              value={(search) ?? ''}
              onChange={handleSearch}
            />
          </div>
        </div>

        {messages.length === 0 ? (
          <div className="no-data">No contact messages found</div>
        ) : (
          <>
            <div className="messages-table">
              <table>
                <thead>
                  <tr>
                    <th>Contact Person</th>
                    <th>Subject</th>
                    <th>Contact Info</th>
                    <th>Country</th>
                    <th>Message Preview</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((message) => (
                    <tr key={message.id}>
                      <td>
                        <strong>{message.name}</strong>
                      </td>
                      <td>
                        <span className="subject-badge">{message.subject}</span>
                      </td>
                      <td>
                        <div className="contact-info">
                          <div><a href={`mailto:${message.email} target="_blank"`}>{message.email}</a></div>
                          <div><a href={`tel:${message.phone} target="_blank"`}>+{message.countryCode} {message.phone}</a></div>
                        </div>
                      </td>
                      <td>
                        {message.countryName}
                      </td>
                      <td className="message-preview">
                        <div title={message.message}>
                          {truncateText(message.message, 80)}
                        </div>
                      </td>
                      <td>{formatDate(message.created_at)}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-view"
                            onClick={() => fetchMessageDetails(message.id)}
                          >
                            View
                          </button>
                          <button 
                            className="btn-delete"
                            onClick={() => deleteMessage(message.id)}
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

      {/* Message Details Modal */}
      {showModal && selectedMessage && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Contact Message Details</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="details-grid">
                <div className="detail-group">
                  <label>Contact Person:</label>
                  <span>{selectedMessage.name}</span>
                </div>
                
                <div className="detail-group">
                  <label>Subject:</label>
                  <span className="subject-badge-large">{selectedMessage.subject}</span>
                </div>
                
                <div className="detail-group">
                  <label>Email:</label>
                  <span>
                    <a href={`mailto:${selectedMessage.email}`}>{selectedMessage.email}</a>
                  </span>
                </div>
                
                <div className="detail-group">
                  <label>Phone:</label>
                  <span>
                    <a href={`tel:${selectedMessage.phone}`}>
                      +{selectedMessage.countryCode} {selectedMessage.phone}
                    </a>
                  </span>
                </div>
                
                <div className="detail-group">
                  <label>Country:</label>
                  <span>{selectedMessage.countryName} ({selectedMessage.country})</span>
                </div>
                
                <div className="detail-group full-width">
                  <label>Message:</label>
                  <div className="message-content">
                    <span>{selectedMessage.message}</span>
                  </div>
                </div>
                
                <div className="detail-group">
                  <label>Submitted:</label>
                  <span>{formatDate(selectedMessage.created_at)}</span>
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

export default AdminContacts;