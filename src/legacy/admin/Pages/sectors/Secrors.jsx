import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { generateSlug, validateSlug } from './utils.js';
import './sectors.css';

const SectorsList = () => {

  const [cap, setcap] = useState('')

  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSector, setEditingSector] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: ''
  });
  const [slugError, setSlugError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');

  const API_URL = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');

  useEffect(() => {
    fetchSectors();
  }, []);

  const fetchSectors = async () => {
    try {
      const response = await axios.get(`${API_URL}/sectors/admin`, { withCredentials: true });
      setSectors(response.data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch sectors');
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setFileName(file.name);

      // Create preview and base64
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNameChange = (name) => {
    const slug = generateSlug(name);
    setFormData(prev => ({
      ...prev,
      name,
      slug
    }));
    validateSlugField(slug);
  };

  const handleSlugChange = (slug) => {
    const cleanedSlug = generateSlug(slug);
    setFormData(prev => ({
      ...prev,
      slug: cleanedSlug
    }));
    validateSlugField(cleanedSlug);
  };

  const validateSlugField = (slug) => {
    if (!validateSlug(slug)) {
      setSlugError('Slug can only contain lowercase letters, numbers, and hyphens');
    } else {
      setSlugError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cap) {
      console.log('bot detected')
      setcap('')
      return
    }

    if (slugError) {
      setError('Please fix slug errors before submitting');
      return;
    }

    if (!formData.slug) {
      setError('Slug is required');
      return;
    }

    try {
      setUploading(true);

      // Prepare form data
      const submitData = {
        ...formData,
        fileName: imageFile ? fileName : undefined,
        imageBase64: imageFile ? await fileToBase64(imageFile) : undefined
      };

      if (editingSector) {
        const response = await axios.put(`${API_URL}/sectors/admin/${editingSector.id}`, submitData, { withCredentials: true });
        if (response.data.itemsUpdated > 0) {
          setError(`Sector updated successfully! Also updated ${response.data.itemsUpdated} items with the new category name.`);
        }
      } else {
        await axios.post(`${API_URL}/sectors/admin`, submitData, { withCredentials: true });
      }

      setShowForm(false);
      setEditingSector(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        meta_title: '',
        meta_description: '',
        meta_keywords: ''
      });
      setImageFile(null);
      setImagePreview('');
      setFileName('');
      setSlugError('');
      fetchSectors();
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed');
    } finally {
      setUploading(false);
    }
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleEdit = (sector) => {
    setEditingSector(sector);
    setFormData({
      name: sector.name,
      slug: sector.slug,
      description: sector.description,
      meta_title: sector.meta_title || '',
      meta_description: sector.meta_description || '',
      meta_keywords: sector.meta_keywords || ''
    });
    setImagePreview(sector.src);
    setImageFile(null);
    setFileName('');
    setSlugError('');
    setError('');
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sector?')) {
      try {
        await axios.delete(`${API_URL}/sectors/admin/${id}`, { withCredentials: true });
        fetchSectors();
      } catch (err) {
        setError('Failed to delete sector');
      }
    }
  };

  const handleRestore = async (id) => {
    try {
      await axios.patch(`${API_URL}/sectors/admin/restore/${id}`, {}, { withCredentials: true });
      fetchSectors();
    } catch (err) {
      setError('Failed to restore sector');
    }
  };

  const handlePermanentDelete = async (id) => {
    if (window.confirm('This will permanently delete the sector and remove it from all items. Are you sure?')) {
      try {
        await axios.delete(`${API_URL}/sectors/admin/permanent/${id}`, { withCredentials: true });
        fetchSectors();
      } catch (err) {
        setError('Failed to permanently delete sector');
      }
    }
  };

  const generateNewSlug = () => {
    if (formData.name) {
      const newSlug = generateSlug(formData.name);
      setFormData(prev => ({
        ...prev,
        slug: newSlug
      }));
      validateSlugField(newSlug);
    }
  };

  const clearForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      meta_title: '',
      meta_description: '',
      meta_keywords: ''
    });
    setImageFile(null);
    setImagePreview('');
    setFileName('');
    setSlugError('');
    setError('');
    setEditingSector(null);
    setShowForm(false);
  };

  if (loading) return <div className="loading">Loading sectors...</div>;

  return (
    <div className="sectors-admin">
      <div className="header">
        <h1>Sectors Management</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            clearForm();
            setShowForm(true);
          }}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Add New Sector'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingSector ? 'Edit Sector' : 'Add New Sector'}</h2>
            <form onSubmit={handleSubmit}>

              <input type="hidden" onChange={(e) => { setcap(e.target.value) }} />

              <div className="form-group">
                <label>Image:</label>
                <div className="file-upload-container">
                  <input
                    type="file"
                    id="file-input"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="file-input"
                    className={`file-upload-btn ${fileName ? 'has-file' : ''}`}
                  >
                    📁 {fileName ? 'Change Image' : 'Choose Image'}
                  </label>
                </div>
                {fileName && <div className="file-name">Selected: {fileName}</div>}

                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                  </div>
                )}
                {editingSector && !imageFile && (
                  <div className="current-image">
                    <p>Current Image:</p>
                    <img src={editingSector.src} alt="Current" />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={(formData.name) ?? ''}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Sector Name"
                  required
                  disabled={uploading}
                />
              </div>

              <div className="form-group">
                <label>Slug:</label>
                <div className="slug-input-group">
                  <input
                    type="text"
                    value={(formData.slug) ?? ''}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="sector-name"
                    required
                    className={slugError ? 'error' : ''}
                    disabled={uploading}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary generate-slug-btn"
                    onClick={generateNewSlug}
                    disabled={!formData.name || uploading}
                  >
                    Generate
                  </button>
                </div>
                {slugError && <div className="field-error">{slugError}</div>}
                <div className="slug-help">
                  Slug will be used in URLs. Only lowercase letters, numbers, and hyphens allowed.
                </div>
              </div>

              <div className="form-group">
                <label>Description:</label>
                <textarea
                  value={(formData.description) ?? ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Sector description..."
                  required
                  rows="4"
                  disabled={uploading}
                />
              </div>

              {/* Meta Fields */}
              <div className="form-group">
                <label>Meta Title:</label>
                <input
                  type="text"
                  value={(formData.meta_title) ?? ''}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  placeholder="Meta title for SEO"
                  disabled={uploading}
                  maxLength="255"
                />
              </div>

              <div className="form-group">
                <label>Meta Description:</label>
                <textarea
                  value={(formData.meta_description) ?? ''}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  placeholder="Meta description for SEO"
                  rows="3"
                  disabled={uploading}
                />
              </div>

              <div className="form-group">
                <label>Meta Keywords:</label>
                <input
                  type="text"
                  value={(formData.meta_keywords) ?? ''}
                  onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                  placeholder="Keyword1, Keyword2, Keyword3"
                  disabled={uploading}
                />
                <div className="slug-help">Separate keywords with commas</div>
              </div>

              {uploading && <div className="upload-status">Uploading image to server...</div>}

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!!slugError || !formData.slug || uploading}
                >
                  {uploading ? 'Uploading...' : (editingSector ? 'Update' : 'Create')}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={clearForm}
                  disabled={uploading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="sectors-grid">
        {sectors.map(sector => (
          <div key={sector.id} className={`sector-card ${sector.deletestatus ? 'deleted' : ''}`}>
            <div className="sector-image">
              <img src={sector.src} alt={sector.name} />
              {sector.deletestatus === 1 && <div className="deleted-badge">Deleted</div>}

            </div>
            <div className="sector-info">
              <h3>{sector.name}</h3>
              <p>
                {sector.description.length > 125
                  ? sector.description.slice(0, 125) + '…'
                  : sector.description}
              </p>

              {/* Display Meta Information */}
              {(sector.meta_title || sector.meta_description || sector.meta_keywords) && (
                <div className="sector-meta-seo">
                  <h4>SEO Information:</h4>
                  {sector.meta_title && <p><strong>Meta Title:</strong> {sector.meta_title}</p>}
                  {sector.meta_description && <p><strong>Meta Description:</strong> {sector.meta_description}</p>}
                  {sector.meta_keywords && <p><strong>Meta Keywords:</strong> {sector.meta_keywords}</p>}
                </div>
              )}

              <div className="sector-meta">
                <span><strong>Slug:</strong> {sector.slug}</span>
                <span><strong>ID:</strong> {sector.id}</span>
                <span><strong>Status:</strong> {sector.deletestatus ? 'Deleted' : 'Active'}</span>
                <span><strong>Created:</strong> {new Date(sector.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="sector-actions">
              {sector.deletestatus ? (
                <>
                  <button
                    className="btn cursor-pointer bg-[#fcdd2d] text-[#222222] rounded-lg"
                    onClick={() => handleRestore(sector.id)}
                    disabled={uploading}
                  >
                    Restore
                  </button>
                  <button
                    className="btn cursor-pointer bg-[#e7001e] text-white rounded-lg"
                    onClick={() => handlePermanentDelete(sector.id)}
                    disabled={uploading}
                  >
                    Delete Permanently
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn cursor-pointer bg-[#1c5e20] text-white rounded-lg"
                    onClick={() => handleEdit(sector)}
                    disabled={uploading}
                  >
                    Edit
                  </button>
                  <button
                    className="btn cursor-pointer bg-[#e7001e] text-white rounded-lg"
                    onClick={() => handleDelete(sector.id)}
                    disabled={uploading}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectorsList;