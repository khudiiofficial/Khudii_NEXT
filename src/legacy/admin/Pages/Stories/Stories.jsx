import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminStories.css';

const API_URL = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');

const AdminStories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchStories();
  }, [pagination.page, search]);

  const fetchStories = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/stories`, {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: search
        },
        withCredentials: true
      });
      setStories(response.data.stories);
      setPagination(prev => ({
        ...prev,
        ...response.data.pagination
      }));
    } catch (error) {
      console.error('Error fetching stories:', error);
      alert('Failed to load stories');
    } finally {
      setLoading(false);
    }
  };

  const fetchStoryDetails = async (id) => {
    try {
      const response = await axios.get(`${API_URL}/admin/stories/${id}`, {
        withCredentials: true
      });
      setSelectedStory(response.data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching story details:', error);
      alert('Failed to load story details');
    }
  };

  const deleteStory = async (id) => {
    if (!confirm('Are you sure you want to delete this story?')) return;

    try {
      await axios.delete(`${API_URL}/admin/stories/${id}`, {
        withCredentials: true
      });
      setStories(stories.filter(story => story.id !== id));
      alert('Story deleted successfully!');
    } catch (error) {
      console.error('Error deleting story:', error);
      alert('Failed to delete story');
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
    if (!text) return 'No story provided';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="admin-stories-container">
        <div className="loading">Loading Stories...</div>
      </div>
    );
  }

  return (
    <div className="admin-stories-container">
      <div className="admin-header">
        <h1>Contributed Stories Management</h1>
        <p>Manage All Story Submissions From Contributors</p>
      </div>

      <div className="stories-section">
        <div className="section-header">
          <h2>Stories ({pagination.total})</h2>
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name, email, phone, or company..."
              value={(search) ?? ''}
              onChange={handleSearch}
            />
          </div>
        </div>

        {stories.length === 0 ? (
          <div className="no-data">No stories found</div>
        ) : (
          <>
            <div className="stories-table">
              <table>
                <thead>
                  <tr>
                    <th>Contributor</th>
                    <th>Entity Type</th>
                    <th>Contact</th>
                    <th>Company</th>
                    <th>Country</th>
                    <th>Story Preview</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stories.map((story) => (
                    <tr key={story.id}>
                      <td>
                        <strong>{story.name}</strong>
                      </td>
                      <td>
                        {/* Color Condition */}
                        <span className={`${story.entityType==="Individual"?"entity-type-individual":"entity-type-organization"}`}>{story.entityType}</span>
                      </td>
                      <td>
                        <div className="contact-info">
                          <div><a href={`mailto:${story.email}`}>{story.email}</a></div>
                          <div><a href={`tel:${story.phone}`}>+{story.countryCode} {story.phone}</a></div>
                        </div>
                      </td>
                      <td>
                        {story.company || 'N/A'}
                      </td>
                      <td>
                        {story.CountryName}
                      </td>
                      <td className="story-preview">
                        <div title={story.story}>
                          {truncateText(story.story, 100)}
                        </div>
                      </td>
                      <td>{formatDate(story.created_at)}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-view"
                            onClick={() => fetchStoryDetails(story.id)}
                          >
                            View
                          </button>
                          <button 
                            className="btn-delete"
                            onClick={() => deleteStory(story.id)}
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

      {/* Story Details Popup */}
      {showModal && selectedStory && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Story Details</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="details-grid">
                <div className="detail-group">
                  <label>Contributor Name:</label>
                  <span>{selectedStory.name}</span>
                </div>
                
                <div className="detail-group">
                  <label>Entity Type:</label>
                  {/* <span className="entity-type-badge">{selectedStory.entityType}</span> */}

                  <span className={`${selectedStory.entityType==="Individual"?"entity-type-badge-individual":"entity-type-badge-organization"}`}>{selectedStory.entityType}</span>
                </div>
                
                <div className="detail-group">
                  <label>Email:</label>
                  <span>
                    <a href={`mailto:${selectedStory.email} target="_blank`}>{selectedStory.email}</a>
                  </span>
                </div>
                
                <div className="detail-group">
                  <label>Phone:</label>
                  <span>
                    <a href={`tel:${selectedStory.phone} target="_blank"`}>
                      +{selectedStory.countryCode} {selectedStory.phone}
                    </a>
                  </span>
                </div>
                
                <div className="detail-group">
                  <label>Country:</label>
                  <span>{selectedStory.CountryName} ({selectedStory.country})</span>
                </div>
                
                {selectedStory.company && (
                  <div className="detail-group">
                    <label>Company/Organization:</label>
                    <span>{selectedStory.company}</span>
                  </div>
                )}
                
                <div className="detail-group">
                  <label>Story:</label>
                  <div className="story-content">
                    {selectedStory.story}
                  </div>
                </div>
                
                <div className="detail-group">
                  <label>Submitted:</label>
                  <span>{formatDate(selectedStory.created_at)}</span>
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

export default AdminStories;