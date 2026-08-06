// components/TestimonialAdmin.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TestimonialAdmin.css';

const API_URL = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');

const TestimonialAdmin = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(false);
  
 const [cap,setcap]=useState('')


  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    role: '',
    video_base64: null,
    thumbnail_base64: null,
    existing_video_url: '', // Track existing video URL
    existing_thumbnail_url: '' // Track existing thumbnail URL
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
  });

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const response = await api.get('/testimonials');
      if (response.data.success) {
        setTestimonials(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      showMessage('Error fetching testimonials', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        showMessage('Please select a video file', 'error');
        return;
      }
      
      if (file.size > 50 * 1024 * 1024) {
        showMessage('Video size must be less than 50MB', 'error');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          video_base64: event.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showMessage('Please select an image file', 'error');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        showMessage('Image size must be less than 5MB', 'error');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          thumbnail_base64: event.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      showMessage('Name is Required', 'error');
      return false;
    }
    if (!formData.position.trim()) {
      showMessage('Position is Required', 'error');
      return false;
    }
    if (!formData.role.trim()) {
      showMessage('Role is Required', 'error');
      return false;
    }
    // For edit mode, we have existing video, so don't require new video
    if (!editingTestimonial && !formData.video_base64) {
      showMessage('Video is Required', 'error');
      return false;
    }
    return true;
  };

  // Check if form has valid video data (either existing or new)
  const hasValidVideoData = () => {
    return formData.video_base64 || formData.existing_video_url;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
 if(cap){
      console.log('bot detected')
setcap('')
      return
    }

    if (!validateForm()) return;

    try {
      setUploadProgress(0);
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await api.post('/testimonials', formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (response.data.success) {
        showMessage('Testimonial Created Successfully!');
        resetForm();
        fetchTestimonials();
        
        setTimeout(() => setUploadProgress(0), 1000);
      }
    } catch (error) {
      console.error('Error Creating Testimonial:', error);
      showMessage('Error Creating Testimonial', 'error');
      setUploadProgress(0);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
 if(cap){
      console.log('Bot Detected')
setcap('')
      return
    }

    if (!validateForm()) return;

    try {
      setUploadProgress(0);
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Prepare data for update - only send base64 if new files are selected
      const updateData = {
        name: formData.name,
        position: formData.position,
        role: formData.role,
        video_base64: formData.video_base64 || null, // Send null if no new video
        thumbnail_base64: formData.thumbnail_base64 || null // Send null if no new thumbnail
      };

      const response = await api.put(`/testimonials/${editingTestimonial.id}`, updateData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (response.data.success) {
        showMessage('Testimonial Updated Successfully!');
        resetForm();
        fetchTestimonials();
        
        setTimeout(() => setUploadProgress(0), 1000);
      }
    } catch (error) {
      console.error('Error Updating Testimonial:', error);
      showMessage('Error Updating Testimonial', 'error');
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to Delete this Testimonial?')) {
      return;
    }

    try {
      const response = await api.delete(`/testimonials/${id}`);
      if (response.data.success) {
        showMessage('Testimonial Deleted Successfully!');
        fetchTestimonials();
      }
    } catch (error) {
      console.error('Error Deleting Testimonial:', error);
      showMessage('Error Deleting Testimonial', 'error');
    }
  };

  const startEdit = (testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      position: testimonial.position,
      role: testimonial.role,
      video_base64: null, // Don't pre-fill with base64, but track URLs
      thumbnail_base64: null,
      existing_video_url: testimonial.video_url,
      existing_thumbnail_url: testimonial.thumbnail
    });
  };

  const cancelEdit = () => {
    setEditingTestimonial(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      position: '',
      role: '',
      video_base64: null,
      thumbnail_base64: null,
      existing_video_url: '',
      existing_thumbnail_url: ''
    });
    setEditingTestimonial(null);
    setUploadProgress(0);
  };

  return (
    <div className="testimonial-admin">
      <div className="admin-header">
        <h1 className="admin-title">Testimonial Management</h1>
        <p className="admin-subtitle">Manage Video Testimonials for Your Platform</p>
      </div>
      
      {message && (
        <div className={`message ${messageType === 'error' ? 'message-error' : 'message-success'}`}>
          <div className="message-content">
            <span className="message-icon">
              {messageType === 'error' ? '⚠️' : '✅'}
            </span>
            {message}
          </div>
        </div>
      )}

      <div className="form-container">
        <form onSubmit={editingTestimonial ? handleUpdate : handleCreate} className="testimonial-form">
            <input type="hidden" onChange={(e)=>{setcap(e.target.value)}} />
          <div className="form-header">
            <h2>{editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}</h2>
            {editingTestimonial && (
              <span className="editing-badge">Editing: #{editingTestimonial.id}</span>
            )}
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Name *</label>
              <input
                id="name"
                name="name"
                type="text"
                value={(formData.name) ?? ''}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter Person's Name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="position" className="form-label">Position *</label>
              <input
                id="position"
                name="position"
                type="text"
                value={(formData.position) ?? ''}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter Position/Company"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="role" className="form-label">Role *</label>
              <input
                id="role"
                name="role"
                type="text"
                value={(formData.role) ?? ''}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter Role (e.g., Plant Manager)"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="thumbnail-upload" className="file-input-label">
              <div className="file-input-content">
                <div className="file-input-icon">🖼️</div>
                <div className="file-input-text">
                  <div className="file-input-title">
                    {formData.thumbnail_base64 ? 'New Thumbnail Selected' : 
                     formData.existing_thumbnail_url ? 'Current Thumbnail (Click to change)' : 'Choose Thumbnail Image'}
                  </div>
                  <div className="file-input-subtitle">
                    {formData.existing_thumbnail_url ? 'Click to Upload New Thumbnail' : 'WEBP Only (up to 5MB)'}
                  </div>
                </div>
              </div>
              <input
                id="thumbnail-upload"
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="file-input"
              />
            </label>
            
            {/* Show current thumbnail in edit mode */}
            {editingTestimonial && formData.existing_thumbnail_url && !formData.thumbnail_base64 && (
              <div className="image-preview-container">
                <div className="preview-header">
                  <span>Current Thumbnail</span>
                  <span className="preview-info">(Select new file above to change)</span>
                </div>
                <img 
                  src={formData.existing_thumbnail_url} 
                  alt="Current thumbnail" 
                  className="image-preview"
                />
              </div>
            )}
            
            {/* Show new thumbnail preview when selected */}
            {formData.thumbnail_base64 && (
              <div className="image-preview-container">
                <div className="preview-header">
                  <span>New Thumbnail Preview</span>
                  <button 
                    type="button" 
                    onClick={() => setFormData(prev => ({ ...prev, thumbnail_base64: null }))}
                    className="preview-close"
                  >
                    ×
                  </button>
                </div>
                <img 
                  src={formData.thumbnail_base64} 
                  alt="New thumbnail preview" 
                  className="image-preview"
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="video-upload" className="file-input-label">
              <div className="file-input-content">
                <div className="file-input-icon">📹</div>
                <div className="file-input-text">
                  <div className="file-input-title">
                    {formData.video_base64 ? 'New Video Selected' : 
                     editingTestimonial ? 'Change Video (Optional)' : 'Choose Video File *'}
                  </div>
                  <div className="file-input-subtitle">
                    {editingTestimonial ? 'Select new video to replace current one' : 'MP4, MOV, AVI up to 50MB'}
                  </div>
                </div>
              </div>
              <input
                id="video-upload"
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="file-input"
                required={!editingTestimonial} // Only required for new testimonials
              />
            </label>
            
            {uploadProgress > 0 && (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <div className="progress-text">Uploading... {uploadProgress}%</div>
              </div>
            )}
            
            {/* Show current video in edit mode */}
            {editingTestimonial && formData.existing_video_url && !formData.video_base64 && (
              <div className="video-preview-container">
                <div className="preview-header">
                  <span>Current Video</span>
                  <span className="preview-info">(Select new file above to change)</span>
                </div>
                <video controls className="video-preview">
                  <source src={formData.existing_video_url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
            
            {/* Show new video preview when selected */}
            {formData.video_base64 && (
              <div className="video-preview-container">
                <div className="preview-header">
                  <span>New Video Preview</span>
                  <button 
                    type="button" 
                    onClick={() => setFormData(prev => ({ ...prev, video_base64: null }))}
                    className="preview-close"
                  >
                    ×
                  </button>
                </div>
                <video controls className="video-preview">
                  <source src={formData.video_base64} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="cursor-pointer bg-[#02236e] hover:bg-[#2563eb] text-white p-2 rounded-lg btn-primary"
              disabled={uploadProgress > 0 || (!editingTestimonial && !formData.video_base64)}
            >
              {uploadProgress > 0 ? (
                <>
                  <span className="btn-spinner"></span>
                  {editingTestimonial ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                editingTestimonial ? 'Update Testimonial' : 'Create Testimonial'
              )}
            </button>
            {editingTestimonial && (
              <button 
                type="button" 
                onClick={cancelEdit}
                className="btn btn-secondary"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="testimonials-section">
        <div className="section-header">
          <h2>Existing Testimonials</h2>
          <span className="testimonials-count">
            {testimonials.length} Testimonial{testimonials.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading testimonials...</p>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎬</div>
            <h3>No Testimonials Yet</h3>
            <p>Get started by uploading your first video testimonial above.</p>
          </div>
        ) : (
          <div className="testimonials-grid">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="testimonial-card">
                <div className="card-header">
                  <div className="testimonial-info">
                    {/* <span className="testimonial-id">Testimonial #{testimonial.id}</span> */}
                    <span className="upload-date">
                      {new Date(testimonial.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="person-info">
                    <h4 className="text-[#222222] person-name">{testimonial.name}</h4>
                    <p className="person-position">{testimonial.position}</p>
                    <p className="person-role">{testimonial.role}</p>
                  </div>
                </div>
                
                <div className="media-container">
                  {testimonial.thumbnail && (
                    <div className="thumbnail-preview">
                      <img 
                        src={testimonial.thumbnail} 
                        alt={`${testimonial.name} thumbnail`}
                        className="thumbnail-image"
                      />
                    </div>
                  )}
                  <div className="video-container">
                    <video controls className="testimonial-video">
                      <source src={testimonial.video_url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
                
                <div className="card-actions">
                  <button 
                    onClick={() => startEdit(testimonial)}
                    className="cursor-pointer bg-[#1c5e20] text-white px-4 py-2 rounded-lg"
                  >
                    <span className="btn-icon">✏️</span>
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(testimonial.id)}
                    className="cursor-pointer bg-[#e7001e] text-white px-4 py-2 rounded-lg"
                  >
                    <span className="btn-icon">🗑️</span>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestimonialAdmin;