import React, { useState, useEffect } from 'react';
import axios from 'axios';
const API_BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');

const EventsAdminPanel = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
   const [cap,setcap]=useState('')

  // Form states - following the exact schema
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    videoId: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');

  // Create axios instance with credentials
  const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Fetch all events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/events');
      if (response.data.success) {
        setEvents(response.data.data);
        setError('');
      }
    } catch (err) {
      setError('Failed to fetch events.');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Extract video ID from URL or use provided videoId
  const getVideoPreviewUrl = (url, videoId) => {

    if (videoId) {
     
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // // Try to extract from URL if no videoId provided
    // if (url) {
    //   const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    //   const match = url.match(regex);
    //   if (match) {
    //     return `https://www.youtube.com/embed/${match[1]}`;
    //   }
    //   return url; // Return the URL as is if it's already an embed URL
    // }
    
    // return '';
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Update video preview when URL or videoId changes
    if (name === 'url' || name === 'videoId') {
      const previewUrl = getVideoPreviewUrl(
        "",
        // name === 'url' ? value : formData.url,
        name === 'videoId' ? value : formData.videoId
      );
      setVideoPreview(previewUrl);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      url: '',
      videoId: ''
    });
    setEditingId(null);
    setVideoPreview('');
  };

  // Create or Update event
  const handleSubmit = async (e) => {
    e.preventDefault();
 if(cap){
      console.log('bot detected')
setcap('')
      return
    }
    if (!formData.title || !formData.url || !formData.videoId) {
      alert('Please fill in all fields');
      return;
    }

    // Validate field lengths according to schema
    if (formData.title.length > 500) {
      alert('Title must be 500 characters or less');
      return;
    }
    if (formData.url.length > 500) {
      alert('URL must be 500 characters or less');
      return;
    }
    if (formData.videoId.length > 100) {
      alert('Video ID must be 100 characters or less');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        // Update existing event
        const response = await api.put(`/events/${editingId}`, formData);
        if (response.data.success) {
          alert('Event updated successfully!');
          fetchEvents();
          resetForm();
        }
      } else {
        // Create new event
        const response = await api.post('/events', formData);
        if (response.data.success) {
          alert('Event created successfully!');
          fetchEvents();
          resetForm();
        }
      }
    } catch (err) {
      alert(`Failed to ${editingId ? 'update' : 'create'} event`);
      console.error('Error saving event:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit event
  const handleEdit = (event) => {
    setFormData({
      title: event.title,
      url: event.url,
      videoId: event.videoId
    });
    setEditingId(event.id);
    setVideoPreview(getVideoPreviewUrl(event.url, event.videoId));
  };

  // Delete event
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const response = await api.delete(`/events/${id}`);
        if (response.data.success) {
          alert('Event deleted successfully!');
          fetchEvents();
          // If deleting the event being edited, reset form
          if (editingId === id) {
            resetForm();
          }
        }
      } catch (err) {
        alert('Failed to delete event');
        console.error('Error deleting event:', err);
      }
    }
  };

  // Cancel edit
  const handleCancel = () => {
    resetForm();
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading events...
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '1240px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <header style={{ 
        textAlign: 'center', 
        marginBottom: '40px',
        borderBottom: '2px solid #009dc8',
        paddingBottom: '20px'
      }}>
        <h1 style={{ 
          color: '#333', 
          margin: 0,
          fontSize: '2.5rem'
        }}>
          Events Admin Panel
        </h1>
        <p style={{ 
          color: '#666', 
          marginTop: '10px',
          fontSize: '1.1rem'
        }}>
          Manage your events and YouTube videos
        </p>
      </header>

      {/* Error Message */}
      {error && (
        <div style={{
          background: '#f8d7da',
          color: '#721c24',
          padding: '15px',
          borderRadius: '5px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      <div style={{
        background: '#f8f9fa',
        padding: '30px',
        borderRadius: '10px',
        marginBottom: '40px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ 
          color: '#333',
          marginBottom: '25px',
          borderBottom: '2px solid #009dc8',
          paddingBottom: '10px'
        }}>
          {editingId ? 'Edit Event' : 'Add New Event'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          
    <input type="hidden" onChange={(e)=>{setcap(e.target.value)}} />


          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold',
              color: '#333'
            }}>
              Title:
            </label>
            <input
              type="text"
              name="title"
              value={(formData.title) ?? ''}
              onChange={handleInputChange}
              placeholder="Enter Event Title (Max 500 characters)"
              maxLength="500"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ fontSize: '12px', color: '#009dc8', marginTop: '5px' }}>
              {formData.title.length}/500 characters
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold',
              color: '#333'
            }}>
              YouTube Embed URL:
            </label>
            <input
              type="url"
              name="url"
              value={(formData.url) ?? ''}
              onChange={handleInputChange}
              placeholder="Enter YouTube Embeded URL (max 500 characters)"
              maxLength="500"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ fontSize: '12px', color: '#009dc8', marginTop: '5px' }}>
              {formData.url.length}/500 characters
            </div>
          </div>
          
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold',
              color: '#333'
            }}>
              Video ID:
            </label>
            <input
              type="text"
              name="videoId"
              value={(formData.videoId) ?? ''}
              onChange={handleInputChange}
              placeholder="Enter YouTube video ID (max 100 characters)"
              maxLength="100"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ fontSize: '12px', color: '#009dc8', marginTop: '5px' }}>
              {formData.videoId.length}/100 characters
            </div>
          </div>

          {/* Video Preview */}
          {videoPreview && (
            <div style={{ marginBottom: '25px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'bold',
                color: '#333'
              }}>
                Video Preview:
              </label>
              <div style={{
                border: '2px solid #007bff',
                borderRadius: '10px',
                overflow: 'hidden',
                background: '#000'
              }}>
                <iframe
                  width="100%"
                  height="315"
                  src={videoPreview}
                  title="YouTube video preview"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{
                    display: 'block'
                  }}
                ></iframe>
              </div>
              <p style={{
                textAlign: 'center',
                marginTop: '10px',
                color: '#666',
                fontSize: '14px'
              }}>
                Live preview - The video will appear like this on your site
              </p>
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{
                background: '#02236e',
                color: 'white',
                padding: '12px 25px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                opacity: isSubmitting ? 0.6 : 1
              }}
            >
              {isSubmitting ? 'Saving...' : (editingId ? 'Update Event' : 'Create Event')}
            </button>
            
            {editingId && (
              <button 
                type="button" 
                onClick={handleCancel}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  padding: '12px 25px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Events List */}
      <div>
        <h2 style={{ 
          color: '#222222',
          marginBottom: '25px',
          borderBottom: '2px solid #007bff',
          paddingBottom: '10px'
        }}>
          All Events ({events.length})
        </h2>

        {events.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            background: '#f8f9fa',
            borderRadius: '10px',
            color: '#666'
          }}>
            No Events Found. Create your First Event Above!
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
            gap: '25px'
          }}>
            {events.map((event) => (
              <div 
                key={event.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '15px',
                  padding: '15px',
                  background: '#cedcff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s'
                }}
              >
                <h3 style={{ 
                  color: '#02236e', 
                  marginTop: 0,
                  marginBottom: '15px',
                  fontSize: '1.2rem',
                  fontWeight: '600',
                }}
                className="line-clamp-1"
                >
                  {event.title}
                </h3>
                
                {/* Video Embed */}
                <div style={{
                  marginBottom: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  background: '#000'
                }}>
                  <iframe
                    width="100%"
                    height="215"
                    src={`https://www.youtube.com/embed/${event.videoId}`}
                    title={event.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <strong>Video ID:</strong> 
                  <span style={{ 
                    background: '#e9ecef', 
                    padding: '2px 8px', 
                    borderRadius: '5px',
                    marginLeft: '8px',
                    fontFamily: 'monospace'
                  }}>
                    {event.videoId}
                  </span>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <strong>URL:</strong>
                  <div style={{ 
                    wordBreak: 'break-all',
                    color: '#666',
                    fontSize: '12px',
                    marginTop: '5px',
                    background: '#f8f9fa',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #e9ecef'
                  }}>
                    {event.url}
                  </div>
                </div>
                
                <div style={{ marginBottom: '20px', color: '#e7001e', fontSize: '14px' }}>
                  <strong>Created:</strong> {new Date(event.created_at).toLocaleDateString()}
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => window.open(event.url, '_blank')}
                    style={{
                      background: '#31e700',
                      color: 'black',
                      padding: '8px 16px',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      flex: 1
                    }}
                  >
                    View Video
                  </button>
                  
                  <button 
                    onClick={() => handleEdit(event)}
                    style={{
                      background: '#ffe931',
                      color: 'black',
                      padding: '8px 16px',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      flex: 1
                    }}
                  >
                    Edit
                  </button>
                  
                  <button 
                    onClick={() => handleDelete(event.id)}
                    style={{
                      background: '#e7001e',
                      color: 'white',
                      padding: '8px 16px',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      flex: 1
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        marginTop: '50px',
        padding: '20px',
        borderTop: '2px solid #009dc8',
        color: '#222222'
      }}>
        <p>Events Admin Panel &copy; 2025</p>
      </footer>
    </div>
  );
};

export default EventsAdminPanel;