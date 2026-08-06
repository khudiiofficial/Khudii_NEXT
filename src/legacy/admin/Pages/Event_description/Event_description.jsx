import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './EventAdmin.css';

const API_BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');

const EventAdmin = () => {
  const [eventData, setEventData] = useState({
    description: '',
    imagepath1: '',
    imagepath2: ''
  });
   const [cap,setcap]=useState('')

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    imageFile1: null,
    imageFile2: null
  });
  const [previewUrls, setPreviewUrls] = useState({
    image1: '',
    image2: ''
  });
  const [message, setMessage] = useState('');
  const fileInputRef1 = useRef(null);
  const fileInputRef2 = useRef(null);

  // Fetch event data
  const fetchEventData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/events`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setEventData(response.data.data);
        setFormData({
          description: response.data.data.description,
          imageFile1: null,
          imageFile2: null
        });
        setPreviewUrls({
          image1: response.data.data.imagepath1 || '',
          image2: response.data.data.imagepath2 || ''
        });
      }
    } catch (error) {
      console.error('Error fetching event data:', error);
      setMessage('Failed to load event data');
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (imageNumber, event) => {
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

      if (imageNumber === 1) {
        setFormData(prev => ({ ...prev, imageFile1: file }));
      } else {
        setFormData(prev => ({ ...prev, imageFile2: file }));
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrls(prev => ({
          ...prev,
          [`image${imageNumber}`]: e.target.result
        }));
      };
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

  // Update event data
  const handleUpdate = async (e) => {
    e.preventDefault();
    
 if(cap){
      console.log('bot detected')
setcap('')
      return
    }
    if (!formData.description) {
      setMessage('Description is required');
      return;
    }

    try {
      setSaving(true);
      setMessage('');
      
      let imageBase641 = null;
      let imageBase642 = null;

      if (formData.imageFile1) {
        imageBase641 = await fileToBase64(formData.imageFile1);
      }
      if (formData.imageFile2) {
        imageBase642 = await fileToBase64(formData.imageFile2);
      }

      const response = await axios.put(`${API_BASE_URL}/api/events`, {
        description: formData.description,
        imageBase641,
        imageBase642
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        setMessage('Event data updated successfully!');
        setEventData(response.data.data);
        setPreviewUrls({
          image1: response.data.data.imagepath1 || '',
          image2: response.data.data.imagepath2 || ''
        });
        setFormData(prev => ({ 
          ...prev, 
          imageFile1: null,
          imageFile2: null 
        }));
        if (fileInputRef1.current) fileInputRef1.current.value = '';
        if (fileInputRef2.current) fileInputRef2.current.value = '';
      }
    } catch (error) {
      console.error('Error updating event data:', error);
      setMessage('Failed to update event data: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  // Remove image
  const handleRemoveImage = (imageNumber) => {
    if (imageNumber === 1) {
      setFormData(prev => ({ ...prev, imageFile1: null }));
      setPreviewUrls(prev => ({ ...prev, image1: eventData.imagepath1 || '' }));
      if (fileInputRef1.current) fileInputRef1.current.value = '';
    } else {
      setFormData(prev => ({ ...prev, imageFile2: null }));
      setPreviewUrls(prev => ({ ...prev, image2: eventData.imagepath2 || '' }));
      if (fileInputRef2.current) fileInputRef2.current.value = '';
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    fetchEventData();
  }, []);

  return (
    <div className="event-admin">
      <div className="admin-header">
        <h1>Events Section Admin</h1>
        <p>Manage your events section content</p>
      </div>

      {message && (
        <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="form-section">
        <h2>Edit Events Section</h2>
        <form onSubmit={handleUpdate} className="event-form">
          

    <input type="hidden" onChange={(e)=>{setcap(e.target.value)}} />


          <div className="form-group">
            <label>Description *</label>
            <textarea
              value={(formData.description) ?? ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter Events Section Description"
              rows="6"
              required
              disabled={loading}
            />
          </div>
          {/* Event Image Section */}
          <div className="images-section">
            <div className="image-group">
              <h3>Image 1</h3>
              <div className="form-group">
                <div className="file-input-group">
                  <input
                    type="file"
                    ref={fileInputRef1}
                    onChange={(e) => handleFileSelect(1, e)}
                    accept="image/*"
                    className="file-input"
                    id="imageFile1"
                    disabled={loading}
                  />
                  <label htmlFor="imageFile1" className="file-input-label">
                    Choose Image 1
                  </label>
                  {formData.imageFile1 && (
                    <span className="file-name">{formData.imageFile1.name}</span>
                  )}
                </div>
              </div>
                  {/* Image Preview Cards */}
              {(previewUrls.image1) && (
                <div className="preview-section">
                  <label>Image 1 Preview:</label>
                  <div className="image-preview">
                    <img src={previewUrls.image1} alt="Preview 1" />
                    {/* <button 
                      type="button" 
                      onClick={() => handleRemoveImage(1)}
                      className="btn btn-remove"
                    >
                      Remove Image 1
                    </button> */}
                  </div>
                </div>
              )}
            </div>

            <div className="image-group">
              <h3>Image 2</h3>
              <div className="form-group">
                <div className="file-input-group">
                  <input
                    type="file"
                    ref={fileInputRef2}
                    onChange={(e) => handleFileSelect(2, e)}
                    accept="image/*"
                    className="file-input"
                    id="imageFile2"
                    disabled={loading}
                  />
                  <label htmlFor="imageFile2" className="file-input-label">
                    Choose Image 2
                  </label>
                  {formData.imageFile2 && (
                    <span className="file-name">{formData.imageFile2.name}</span>
                  )}
                </div>
              </div>

              {(previewUrls.image2) && (
                <div className="preview-section">
                  <label>Image 2 Preview:</label>
                  <div className="image-preview">
                    <img src={previewUrls.image2} alt="Preview 2" />
                    {/* <button 
                      type="button" 
                      onClick={() => handleRemoveImage(2)}
                      className="btn btn-remove"
                    >
                      Remove Image 2
                    </button> */}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={saving || loading} className="bg-[#02236e] btn hover:bg-[#032f95] text-white">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            
            <button 
              type="button" 
              onClick={fetchEventData}
              disabled={loading}
              className="bg-[#fbf137] btn border-[#fbf137] hover:bg-[#f7e029] text-[#222222] ml-3"
            >
              {loading ? 'Loading...' : 'Reload Data'}
            </button>
          </div>
        </form>
      </div>

      {/* Preview Section */}
      <div className="preview-section">
        <h3>Live Preview</h3>
        <div className="preview-content">
          <p>{formData.description || 'Events description will appear here...'}</p>
          <div className="preview-images">
            {previewUrls.image1 && (
              <div className="preview-image">
                <img src={previewUrls.image1} alt="Event preview 1" />
              </div>
            )}
            {previewUrls.image2 && (
              <div className="preview-image">
                <img src={previewUrls.image2} alt="Event preview 2" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventAdmin;