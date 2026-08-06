import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './CarouselAdmin.css';

const API_BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');

const CarouselAdmin = () => {
  const [images, setImages] = useState([]);
  const [cap, setcap] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    imageFile: null,
    isMobile: false
  });
  const [previewUrl, setPreviewUrl] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'mobile', 'desktop'
  const fileInputRef = useRef(null);

  // Fetch all carousel images
  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/carousel`, {
        withCredentials: true
      });
      setImages(response.data.data);
    } catch (error) {
      console.error('Error fetching images:', error);
      alert('Failed to fetch images');
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setFormData(prev => ({ ...prev, imageFile: file }));

      // Create preview
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

  // Add new carousel image
  const handleAddImage = async (e) => {
    e.preventDefault();
    if (cap) {
      console.log('bot detected');
      setcap('');
      return;
    }

    if (!formData.imageFile) {
      alert('Please select an image file');
      return;
    }

    try {
      setUploading(true);
      const imageBase64 = await fileToBase64(formData.imageFile);

      const response = await axios.post(`${API_BASE_URL}/api/carousel`, {
        imageBase64,
        description: formData.description,
        isMobile: formData.isMobile
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        alert('Image added successfully!');
        resetForm();
        fetchImages(); // Refresh the list
      }
    } catch (error) {
      console.error('Error adding image:', error);
      alert('Failed to add image: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  // Update carousel image
  const handleUpdateImage = async (e) => {
    e.preventDefault();
    if (cap) {
      console.log('bot detected');
      setcap('');
      return;
    }

    try {
      setUploading(true);
      let requestData = {
        description: formData.description,
        isMobile: formData.isMobile
      };

      // Only include image if a new one was selected
      if (formData.imageFile) {
        requestData.imageBase64 = await fileToBase64(formData.imageFile);
      }

      const response = await axios.put(
        `${API_BASE_URL}/api/carousel/${editingId}`,
        requestData,
        { withCredentials: true }
      );

      if (response.data.success) {
        alert('Image updated successfully!');
        resetForm();
        fetchImages(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating image:', error);
      alert('Failed to update image: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  // Delete carousel image
  const handleDeleteImage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const response = await axios.delete(`${API_BASE_URL}/api/carousel/${id}`, {
        withCredentials: true
      });

      if (response.data.success) {
        alert('Image deleted successfully!');
        fetchImages(); // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image: ' + (error.response?.data?.message || error.message));
    }
  };

  // Edit carousel image
  const handleEditImage = (image) => {
    setEditingId(image.id);
    setFormData({
      description: image.description || '',
      imageFile: null,
      isMobile: Boolean(image.isMobile)
    });
    setPreviewUrl(image.image_path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      description: '',
      imageFile: null,
      isMobile: false
    });
    setPreviewUrl('');
    setEditingId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    resetForm();
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get filtered images based on active filter
  const getFilteredImages = () => {
    if (activeFilter === 'all') return images;
    if (activeFilter === 'mobile') return images.filter(img => img.isMobile === 1 || img.isMobile === true);
    if (activeFilter === 'desktop') return images.filter(img => img.isMobile === 0 || img.isMobile === false);
    return images;
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const filteredImages = getFilteredImages();
  const mobileCount = images.filter(img => img.isMobile === 1 || img.isMobile === true).length;
  const desktopCount = images.filter(img => img.isMobile === 0 || img.isMobile === false).length;

  return (
    <div className="carousel-admin">
      <div className="admin-header">
        <h1>Carousel Images Admin</h1>
        <p>Manage your Website Carousel Images</p>
      </div>

      {/* Add/Edit Form */}
      <div className="image-form-section">
        <h2>{editingId ? 'Edit Image' : 'Add New Image'}</h2>
        <form onSubmit={editingId ? handleUpdateImage : handleAddImage} className="image-form">
          <input type="hidden" onChange={(e) => { setcap(e.target.value) }} />

          <div className="form-group">
            <label htmlFor="imageFile">Image File *</label>
            <input
              type="file"
              id="imageFile"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="file-input"
            />
            <small>Only <b>WEBP</b> (Max size: 5MB)</small>
          </div>

          {previewUrl && (
            <div className="preview-section">
              <label>Preview:</label>
              <div className="image-preview">
                <img src={previewUrl} alt="Preview" />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="description">Slug</label>
            <input
              required
              id="description"
              value={(formData.description) ?? ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter Slug of Organization of which you are Uploading the Image"
            />
          </div>

          <div className="">
            <div className="checkbox-group">
              <input
                required
                type="checkbox"
                id="isMobile"
                checked={formData.isMobile}
                onChange={(e) => setFormData(prev => ({ ...prev, isMobile: e.target.checked }))}
                className="checkbox-input"
              />
              <label htmlFor="isMobile" className="checkbox-label">
                Mobile Image
                <span className="checkbox-help">
                  (Check this if this Image is Optimized for Mobile Devices)
                </span>
              </label>
            </div>
          </div>

          <div className="form-actions">
            {editingId ? (
              <>
                <button
                  type="submit"
                  disabled={uploading}
                  className="btn btn-primary"
                >
                  {uploading ? 'Updating...' : 'Update Image'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="submit"
                disabled={uploading || !formData.imageFile}
                className="btn btn-primary"
              >
                {uploading ? 'Uploading...' : 'Add Image'}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-buttons">
          <button
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All ({images.length})
          </button>
          <button
            className={`filter-btn ${activeFilter === 'desktop' ? 'active' : ''}`}
            onClick={() => setActiveFilter('desktop')}
          >
            Desktop ({desktopCount})
          </button>
          <button
            className={`filter-btn ${activeFilter === 'mobile' ? 'active' : ''}`}
            onClick={() => setActiveFilter('mobile')}
          >
            Mobile ({mobileCount})
          </button>
        </div>
      </div>

      {/* Images List */}
      <div className="images-list-section">
        <div className="section-header">
          <h2>
            {activeFilter === 'all' && 'All Carousel Images'}
            {activeFilter === 'desktop' && 'Desktop Images'}
            {activeFilter === 'mobile' && 'Mobile Images'}
            ({filteredImages.length})
          </h2>
          <button
            onClick={fetchImages}
            disabled={loading}
            className="btn cursor-pointer bg-[#fcdd2d] text-[#222222] rounded-lg"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading images...</div>
        ) : filteredImages.length === 0 ? (
          <div className="no-images">
            <p>No images found. {activeFilter !== 'all' ? 'Try switching to "All" filter.' : 'Add your first image above.'}</p>
          </div>
        ) : (
          <div className="images-grid">
            {filteredImages.map((image) => (
              <div key={image.id} className="image-card">
                <div className="image-container">
                  <img src={image.image_path} alt={image.description || 'Carousel image'} />
                  <div className={`image-badge ${image.isMobile ? 'image-badge-mobile' : 'image-badge-desktop'}`}
                  >
                    {image.isMobile ? '📱 Mobile' : '🖥️ Desktop'}
                  </div>
                </div>
                <div className="image-details">
                  <p className="image-description">
                    {image.description || 'No description'}
                  </p>
                  <div className="image-meta">
                    <p className="image-date">
                      Added: {formatDate(image.created_at)}
                    </p>
                    <p
                      className={`image-type ${image.isMobile ? 'image-type-mobile' : 'image-type-desktop'}`}
                    >
                      Type: {image.isMobile ? 'Mobile' : 'Desktop'}
                    </p>
                  </div>
                </div>
                <div className="image-actions">
                  <button
                    onClick={() => handleEditImage(image)}
                    className="btn cursor-pointer bg-[#1c5e20] text-white rounded-lg"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteImage(image.id)}
                    className="btn btn-delete"
                  >
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

export default CarouselAdmin;