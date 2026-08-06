import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './StoriesAdmin.css';

const API_BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');

const StoriesAdmin = () => {
  const [storiesData, setStoriesData] = useState({
    title: '',
    description: '',
    image_path: ''
  });
   const [cap,setcap]=useState('')

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageFile: null
  });
  const [previewUrl, setPreviewUrl] = useState('');
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  // Fetch stories data
  const fetchStoriesData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/stories`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setStoriesData(response.data.data);
        setFormData({
          title: response.data.data.title,
          description: response.data.data.description,
          imageFile: null
        });
        setPreviewUrl(response.data.data.image_path || '');
      }
    } catch (error) {
      console.error('Error fetching stories data:', error);
      setMessage('Failed to load stories data');
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setFormData(prev => ({ ...prev, imageFile: file }));
      
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Update stories data
  const handleUpdate = async (e) => {
  
    e.preventDefault();
       if(cap){
      console.log('bot detected')
setcap('')
      return
    }
    if (!formData.title || !formData.description) {
      setMessage('Title and description are required');
      return;
    }

    try {
      setSaving(true);
      setMessage('');
      
      let imageBase64 = null;
      if (formData.imageFile) {
        imageBase64 = await fileToBase64(formData.imageFile);
      }

      const response = await axios.put(`${API_BASE_URL}/api/stories`, {
        title: formData.title,
        description: formData.description,
        imageBase64
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        setMessage('Stories data updated successfully!');
        setStoriesData(response.data.data);
        setPreviewUrl(response.data.data.image_path || '');
        setFormData(prev => ({ ...prev, imageFile: null }));
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error('Error updating stories data:', error);
      setMessage('Failed to update stories data: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, imageFile: null }));
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    fetchStoriesData();
  }, []);

  return (
    <div className="stories-admin">
      <div className="admin-header">
        <h1>Stories Section Admin</h1>
        <p>Manage your stories section content</p>
      </div>

      {message && (
        <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="form-section">
        <h2>Edit Stories Section</h2>
        <form onSubmit={handleUpdate} className="story-form">
             <input type="hidden" onChange={(e)=>{setcap(e.target.value)}} />
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={(formData.title) ?? ''}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter Stories Section Title"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              value={(formData.description) ?? ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter Stories Section Description"
              rows="6"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Background Image</label>
            <div className="file-input-group">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="file-input"
                id="imageFile"
                disabled={loading}
              />
              <label htmlFor="imageFile" className="file-input-label">
                Choose Image File
              </label>
              {formData.imageFile && (
                <span className="file-name">{formData.imageFile.name}</span>
              )}
            </div>
            <small>Supported formats: <b>WebP</b> Only (Max size: 5MB)</small>
          </div>
              {/* Image Preview Section */}
          {(previewUrl || storiesData.image_path) && (
            <div className="preview-section">
              <label>Image Preview:</label>
              <div className="image-preview">
                <img src={previewUrl || storiesData.image_path} alt="Preview" />
                <button 
                  type="button" 
                  onClick={handleRemoveImage}
                  className="btn btn-remove"
                >
                  Remove Image
                </button>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" disabled={saving || loading} className="btn btn-primary">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            
            <button 
              type="button" 
              onClick={fetchStoriesData}
              disabled={loading}
              className="btn btn-secondary"
            >
              {loading ? 'Loading...' : 'Reload Data'}
            </button>
          </div>
        </form>
      </div>

      {/* Live Preview Section */}
      <div className="preview-section">
        <h3>Live Preview</h3>
        <div className="preview-content">
          <h2>{formData.title || 'Stories Title Preview'}</h2>
          <p>{formData.description || 'Stories description will appear here...'}</p>
          {(previewUrl || storiesData.image_path) && (
            <div className="preview-image">
              <img src={previewUrl || storiesData.image_path} alt="Stories preview" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoriesAdmin;