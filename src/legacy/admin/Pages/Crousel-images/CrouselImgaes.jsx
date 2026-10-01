import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import './CarouselAdmin.css';
import {
  confirmAction,
  showError,
  showSuccessAlert,
  showWarning,
} from '../../SwalPopupAlert/SwalPopupAlert';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_PATH || '';
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const toMobileBoolean = (value) => value === true || value === 1 || value === '1';

const emptyUploadForm = () => ({
  description: '',
  imageFile: null,
  previewUrl: '',
});

const CarouselAdmin = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [notice, setNotice] = useState('');

  const [desktopForm, setDesktopForm] = useState(emptyUploadForm());
  const [mobileForm, setMobileForm] = useState(emptyUploadForm());
  const desktopFileRef = useRef(null);
  const mobileFileRef = useRef(null);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    description: '',
    imageFile: null,
    previewUrl: '',
    isMobile: false,
  });
  const editFileRef = useRef(null);

  const [pendingCreates, setPendingCreates] = useState([]);
  const [pendingUpdates, setPendingUpdates] = useState({});
  const [pendingDeletes, setPendingDeletes] = useState([]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/carousel`, {
        withCredentials: true,
      });
      setImages(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (error) {
      console.error('Error fetching carousel images:', error);
      showError(error.response?.data?.message || 'Failed to fetch carousel images.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const hasPendingChanges =
    pendingCreates.length > 0 ||
    Object.keys(pendingUpdates).length > 0 ||
    pendingDeletes.length > 0;

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!hasPendingChanges) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasPendingChanges]);

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  const validateWebpFile = (file) => {
    if (!file) return 'Please select a WEBP image.';

    const isWebp =
      file.type === 'image/webp' || file.name.toLowerCase().endsWith('.webp');

    if (!isWebp) return 'Only WEBP images are allowed.';
    if (file.size > MAX_FILE_SIZE) return 'Image size must be 5MB or less.';

    return '';
  };

  const readPreview = (file, onComplete) => {
    const reader = new FileReader();
    reader.onload = (event) => onComplete(event.target.result);
    reader.readAsDataURL(file);
  };

  const handleUploadFileSelect = (event, type) => {
    const file = event.target.files?.[0];
    const errorMessage = validateWebpFile(file);

    if (errorMessage) {
      showWarning(errorMessage);
      event.target.value = '';
      return;
    }

    readPreview(file, (previewUrl) => {
      const updater = type === 'mobile' ? setMobileForm : setDesktopForm;
      updater((current) => ({ ...current, imageFile: file, previewUrl }));
    });
  };

  const queueNewImage = (event, isMobile) => {
    event.preventDefault();

    const form = isMobile ? mobileForm : desktopForm;
    const setForm = isMobile ? setMobileForm : setDesktopForm;
    const fileRef = isMobile ? mobileFileRef : desktopFileRef;

    if (!form.imageFile) {
      showWarning(`Please select a ${isMobile ? 'mobile' : 'desktop'} WEBP banner.`);
      return;
    }

    if (!form.description.trim()) {
      showWarning('Slug is required.');
      return;
    }

    const pendingItem = {
      clientId: `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      description: form.description.trim(),
      imageFile: form.imageFile,
      previewUrl: form.previewUrl,
      isMobile,
      created_at: new Date().toISOString(),
    };

    setPendingCreates((current) => [pendingItem, ...current]);
    setForm(emptyUploadForm());
    if (fileRef.current) fileRef.current.value = '';

    setNotice(
      `${isMobile ? 'Mobile' : 'Desktop'} banner queued. Click “Update Carousel” to save it permanently.`
    );
  };

  const handleEditFileSelect = (event) => {
    const file = event.target.files?.[0];
    const errorMessage = validateWebpFile(file);

    if (errorMessage) {
      showWarning(errorMessage);
      event.target.value = '';
      return;
    }

    readPreview(file, (previewUrl) => {
      setEditForm((current) => ({ ...current, imageFile: file, previewUrl }));
    });
  };

  const handleEditImage = (image) => {
    if (image.__pendingCreate || image.__pendingDelete) return;

    setEditingId(image.id);
    setEditForm({
      description: image.description || '',
      imageFile: null,
      previewUrl: image.image_path,
      isMobile: toMobileBoolean(image.isMobile),
    });

    if (editFileRef.current) editFileRef.current.value = '';

    setTimeout(() => {
      document
        .getElementById('carousel-edit-section')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  const queueEdit = (event) => {
    event.preventDefault();

    if (!editingId) return;
    if (!editForm.description.trim()) {
      showWarning('Slug is required.');
      return;
    }

    setPendingUpdates((current) => ({
      ...current,
      [editingId]: {
        description: editForm.description.trim(),
        imageFile: editForm.imageFile,
        previewUrl: editForm.previewUrl,
        isMobile: editForm.isMobile,
      },
    }));

    setNotice('Image changes queued. Click “Update Carousel” to save them permanently.');
    cancelEdit();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      description: '',
      imageFile: null,
      previewUrl: '',
      isMobile: false,
    });
    if (editFileRef.current) editFileRef.current.value = '';
  };

  const handleDeleteImage = async (image) => {
    if (image.__pendingCreate) {
      setPendingCreates((current) =>
        current.filter((item) => item.clientId !== image.clientId)
      );
      setNotice('Unsaved banner removed from the pending changes.');
      return;
    }

    if (image.__pendingDelete) {
      setPendingDeletes((current) => current.filter((id) => id !== image.id));
      setNotice('Pending deletion cancelled.');
      return;
    }

    const confirmed = await confirmAction({
      title: 'Queue this image for deletion?',
      text: 'It will not be deleted until you click “Update Carousel” and confirm the page update.',
      confirmButtonText: 'Queue Delete',
      cancelButtonText: 'Cancel',
    });

    if (!confirmed) return;

    setPendingUpdates((current) => {
      const next = { ...current };
      delete next[image.id];
      return next;
    });
    setPendingDeletes((current) => [...new Set([...current, image.id])]);
    if (editingId === image.id) cancelEdit();
    setNotice('Deletion queued. Click “Update Carousel” to apply it permanently.');
  };

  const discardPendingChanges = async () => {
    if (!hasPendingChanges) return;

    const confirmed = await confirmAction({
      title: 'Discard unsaved carousel changes?',
      text: 'All queued additions, edits, and deletions on this page will be cleared.',
      confirmButtonText: 'Discard Changes',
      cancelButtonText: 'Keep Editing',
    });

    if (!confirmed) return;

    setPendingCreates([]);
    setPendingUpdates({});
    setPendingDeletes([]);
    setNotice('Unsaved changes discarded.');
    cancelEdit();
  };

  const applyCarouselUpdates = async () => {
    if (!hasPendingChanges || saving) return;

    const createCount = pendingCreates.length;
    const updateCount = Object.keys(pendingUpdates).length;
    const deleteCount = pendingDeletes.length;

    const confirmed = await confirmAction({
      title: 'Update carousel images?',
      text: `This will permanently save ${createCount} new, ${updateCount} edited, and ${deleteCount} deleted carousel image${createCount + updateCount + deleteCount === 1 ? '' : 's'}.`,
      confirmButtonText: 'Yes, Update Carousel',
      cancelButtonText: 'Cancel',
      icon: 'question',
      iconColor: '#02236e',
    });

    if (!confirmed) return;

    setSaving(true);

    try {
      for (const id of pendingDeletes) {
        await axios.delete(`${API_BASE_URL}/api/carousel/${id}`, {
          withCredentials: true,
        });
      }

      for (const [id, update] of Object.entries(pendingUpdates)) {
        const requestData = {
          description: update.description,
          isMobile: update.isMobile,
        };

        if (update.imageFile) {
          requestData.imageBase64 = await fileToBase64(update.imageFile);
        }

        await axios.put(`${API_BASE_URL}/api/carousel/${id}`, requestData, {
          withCredentials: true,
        });
      }

      for (const item of pendingCreates) {
        const imageBase64 = await fileToBase64(item.imageFile);
        await axios.post(
          `${API_BASE_URL}/api/carousel`,
          {
            imageBase64,
            description: item.description,
            isMobile: item.isMobile,
          },
          { withCredentials: true }
        );
      }

      setPendingCreates([]);
      setPendingUpdates({});
      setPendingDeletes([]);
      setNotice('');
      cancelEdit();
      await fetchImages();
      await showSuccessAlert('Carousel images updated successfully.');
    } catch (error) {
      console.error('Error applying carousel changes:', error);

      // Avoid replaying requests that may already have succeeded before a later request failed.
      setPendingCreates([]);
      setPendingUpdates({});
      setPendingDeletes([]);
      cancelEdit();
      await fetchImages();

      showError(
        `${error.response?.data?.message || error.message || 'Failed to update carousel images.'} The server list was refreshed because some earlier changes may already have been saved.`
      );
    } finally {
      setSaving(false);
    }
  };

  const displayImages = useMemo(() => {
    const stagedExisting = images.map((image) => {
      const update = pendingUpdates[image.id];
      const isPendingDelete = pendingDeletes.includes(image.id);

      return {
        ...image,
        description: update ? update.description : image.description,
        image_path: update?.previewUrl || image.image_path,
        isMobile: update ? update.isMobile : image.isMobile,
        __pendingUpdate: Boolean(update),
        __pendingDelete: isPendingDelete,
      };
    });

    const stagedCreates = pendingCreates.map((item) => ({
      id: item.clientId,
      clientId: item.clientId,
      image_path: item.previewUrl,
      description: item.description,
      isMobile: item.isMobile,
      created_at: item.created_at,
      __pendingCreate: true,
    }));

    return [...stagedCreates, ...stagedExisting];
  }, [images, pendingCreates, pendingUpdates, pendingDeletes]);

  const filteredImages = useMemo(() => {
    if (activeFilter === 'mobile') {
      return displayImages.filter((image) => toMobileBoolean(image.isMobile));
    }
    if (activeFilter === 'desktop') {
      return displayImages.filter((image) => !toMobileBoolean(image.isMobile));
    }
    return displayImages;
  }, [activeFilter, displayImages]);

  const mobileCount = displayImages.filter((image) => toMobileBoolean(image.isMobile)).length;
  const desktopCount = displayImages.filter((image) => !toMobileBoolean(image.isMobile)).length;

  const formatDate = (dateString) => {
    if (!dateString) return 'Pending';

    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderUploadCard = ({ isMobile }) => {
    const form = isMobile ? mobileForm : desktopForm;
    const setForm = isMobile ? setMobileForm : setDesktopForm;
    const fileRef = isMobile ? mobileFileRef : desktopFileRef;
    const typeLabel = isMobile ? 'Mobile' : 'Desktop';

    return (
      <form
        className={`upload-card ${isMobile ? 'upload-card-mobile' : 'upload-card-desktop'}`}
        onSubmit={(event) => queueNewImage(event, isMobile)}
      >
        <div className="upload-card-heading">
          <div>
            <span className={`type-pill ${isMobile ? 'type-pill-mobile' : 'type-pill-desktop'}`}>
              {isMobile ? '📱' : '🖥️'} {typeLabel}
            </span>
            <h3>{typeLabel} Banner Upload</h3>
          </div>
          <p>Upload a WEBP banner prepared specifically for {typeLabel.toLowerCase()} screens.</p>
        </div>

        <div className="form-group">
          <label htmlFor={`${typeLabel.toLowerCase()}ImageFile`}>Image File *</label>
          <input
            type="file"
            id={`${typeLabel.toLowerCase()}ImageFile`}
            ref={fileRef}
            onChange={(event) =>
              handleUploadFileSelect(event, isMobile ? 'mobile' : 'desktop')
            }
            accept=".webp,image/webp"
            className="file-input"
          />
          <small>WEBP only. Maximum file size: 5MB.</small>
        </div>

        {form.previewUrl && (
          <div className="preview-section">
            <label>Preview</label>
            <div className={`image-preview ${isMobile ? 'image-preview-mobile' : ''}`}>
              <img src={form.previewUrl} alt={`${typeLabel} banner preview`} />
            </div>
          </div>
        )}

        <div className="form-group">
          <label htmlFor={`${typeLabel.toLowerCase()}Description`}>Slug *</label>
          <input
            type="text"
            id={`${typeLabel.toLowerCase()}Description`}
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({ ...current, description: event.target.value }))
            }
            placeholder="Enter organization slug"
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={!form.imageFile || saving}
        >
          Queue {typeLabel} Banner
        </button>
      </form>
    );
  };

  return (
    <div className="carousel-admin">
      <div className="admin-header">
        <h1>Carousel Images Admin</h1>
        <p>Manage desktop and mobile carousel banners separately.</p>
      </div>

      <div className={`page-update-bar ${hasPendingChanges ? 'has-pending' : ''}`}>
        <div>
          <strong>{hasPendingChanges ? 'Unsaved carousel changes' : 'No unsaved changes'}</strong>
          <span>
            {hasPendingChanges
              ? `${pendingCreates.length} new · ${Object.keys(pendingUpdates).length} edited · ${pendingDeletes.length} deleted`
              : 'Add, edit, or delete banners. Nothing is stored until Update Carousel is confirmed.'}
          </span>
        </div>
        <div className="page-update-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={discardPendingChanges}
            disabled={!hasPendingChanges || saving}
          >
            Discard Unsaved
          </button>
          <button
            type="button"
            className="btn btn-update-page"
            onClick={applyCarouselUpdates}
            disabled={!hasPendingChanges || saving}
          >
            {saving ? 'Updating Carousel...' : 'Update Carousel'}
          </button>
        </div>
      </div>

      {notice && <div className="pending-notice">{notice}</div>}

      <section className="image-form-section">
        <div className="section-title-block">
          <h2>Add New Carousel Images</h2>
          <p>Desktop and mobile banners now have separate upload controls.</p>
        </div>
        <div className="upload-grid">
          {renderUploadCard({ isMobile: false })}
          {renderUploadCard({ isMobile: true })}
        </div>
      </section>

      {editingId && (
        <section className="image-form-section edit-section" id="carousel-edit-section">
          <div className="section-title-block">
            <h2>Edit Carousel Image</h2>
            <p>Queue the changes here, then use Update Carousel to store them.</p>
          </div>

          <form onSubmit={queueEdit} className="edit-form">
            <div className="edit-form-grid">
              <div>
                <div className="form-group">
                  <label htmlFor="editImageFile">Replacement Image</label>
                  <input
                    type="file"
                    id="editImageFile"
                    ref={editFileRef}
                    onChange={handleEditFileSelect}
                    accept=".webp,image/webp"
                    className="file-input"
                  />
                  <small>Optional. Leave empty to keep the current image.</small>
                </div>

                <div className="form-group">
                  <label htmlFor="editDescription">Slug *</label>
                  <input
                    type="text"
                    id="editDescription"
                    value={editForm.description}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Banner Type *</label>
                  <div className="type-selector">
                    <button
                      type="button"
                      className={`type-selector-btn ${!editForm.isMobile ? 'active' : ''}`}
                      onClick={() =>
                        setEditForm((current) => ({ ...current, isMobile: false }))
                      }
                    >
                      🖥️ Desktop
                    </button>
                    <button
                      type="button"
                      className={`type-selector-btn ${editForm.isMobile ? 'active' : ''}`}
                      onClick={() =>
                        setEditForm((current) => ({ ...current, isMobile: true }))
                      }
                    >
                      📱 Mobile
                    </button>
                  </div>
                </div>
              </div>

              {editForm.previewUrl && (
                <div className="preview-section edit-preview-section">
                  <label>Current / Replacement Preview</label>
                  <div className={`image-preview ${editForm.isMobile ? 'image-preview-mobile' : ''}`}>
                    <img src={editForm.previewUrl} alt="Carousel edit preview" />
                  </div>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                Queue Image Changes
              </button>
              <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <div className="filter-section">
        <div className="filter-buttons">
          <button
            type="button"
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All ({displayImages.length})
          </button>
          <button
            type="button"
            className={`filter-btn ${activeFilter === 'desktop' ? 'active' : ''}`}
            onClick={() => setActiveFilter('desktop')}
          >
            Desktop ({desktopCount})
          </button>
          <button
            type="button"
            className={`filter-btn ${activeFilter === 'mobile' ? 'active' : ''}`}
            onClick={() => setActiveFilter('mobile')}
          >
            Mobile ({mobileCount})
          </button>
        </div>
      </div>

      <section className="images-list-section">
        <div className="section-header">
          <h2>
            {activeFilter === 'all' && 'All Carousel Images '}
            {activeFilter === 'desktop' && 'Desktop Images '}
            {activeFilter === 'mobile' && 'Mobile Images '}
            ({filteredImages.length})
          </h2>
          <button
            type="button"
            onClick={fetchImages}
            disabled={loading || saving}
            className="btn btn-refresh"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading images...</div>
        ) : filteredImages.length === 0 ? (
          <div className="no-images">
            <p>
              No images found.{' '}
              {activeFilter !== 'all'
                ? 'Try another filter.'
                : 'Queue your first desktop or mobile banner above.'}
            </p>
          </div>
        ) : (
          <div className="images-grid">
            {filteredImages.map((image) => (
              <article
                key={image.id}
                className={`image-card ${image.__pendingDelete ? 'pending-delete-card' : ''}`}
              >
                <div className="image-container">
                  <img src={image.image_path} alt={image.description || 'Carousel image'} />
                  <div
                    className={`image-badge ${
                      image.isMobile ? 'image-badge-mobile' : 'image-badge-desktop'
                    }`}
                  >
                    {image.isMobile ? '📱 Mobile' : '🖥️ Desktop'}
                  </div>

                  {image.__pendingCreate && (
                    <div className="pending-badge pending-badge-create">Pending new</div>
                  )}
                  {image.__pendingUpdate && !image.__pendingDelete && (
                    <div className="pending-badge pending-badge-update">Pending edit</div>
                  )}
                  {image.__pendingDelete && (
                    <div className="pending-badge pending-badge-delete">Pending delete</div>
                  )}
                </div>

                <div className="image-details">
                  <p className="image-description">{image.description || 'No slug'}</p>
                  <div className="image-meta">
                    <p className="image-date">
                      {image.__pendingCreate ? 'Queued: ' : 'Added: '}
                      {formatDate(image.created_at)}
                    </p>
                    <p
                      className={`image-type ${
                        image.isMobile ? 'image-type-mobile' : 'image-type-desktop'
                      }`}
                    >
                      Type: {image.isMobile ? 'Mobile' : 'Desktop'}
                    </p>
                  </div>
                </div>

                <div className="image-actions">
                  {image.__pendingCreate ? (
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(image)}
                      className="btn btn-delete"
                    >
                      Remove Pending
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleEditImage(image)}
                        className="btn btn-edit"
                        disabled={image.__pendingDelete || saving}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(image)}
                        className={`btn ${image.__pendingDelete ? 'btn-undo' : 'btn-delete'}`}
                        disabled={saving}
                      >
                        {image.__pendingDelete ? 'Undo Delete' : 'Delete'}
                      </button>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default CarouselAdmin;
