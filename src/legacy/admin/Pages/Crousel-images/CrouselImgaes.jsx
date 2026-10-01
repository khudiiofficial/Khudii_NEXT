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
const MAX_BULK_IMAGES = 20;

const toMobileBoolean = (value) => value === true || value === 1 || value === '1';
const toBoolean = (value) => value === true || value === 1 || value === '1';

const normalizeSlug = (value) => {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  return `/${trimmed.replace(/^\/+/, '')}`;
};

const emptyUploadForm = () => ({
  files: [],
  previews: [],
});

const getImageKey = (image) =>
  image.__pendingCreate ? String(image.clientId) : String(image.id);

const CarouselAdmin = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [notice, setNotice] = useState('');

  const [sharedLink, setSharedLink] = useState({
    description: '/',
    openNewTab: false,
  });

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
    openNewTab: false,
    sortOrder: 0,
  });
  const editFileRef = useRef(null);

  const [pendingCreates, setPendingCreates] = useState([]);
  const [pendingUpdates, setPendingUpdates] = useState({});
  const [pendingDeletes, setPendingDeletes] = useState([]);

  const [draggedKey, setDraggedKey] = useState(null);
  const [dragOverKey, setDragOverKey] = useState(null);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/carousel`, {
        withCredentials: true,
      });

      const rows = Array.isArray(response.data?.data) ? response.data.data : [];
      const typeCounters = { desktop: 0, mobile: 0 };
      const normalized = rows.map((row) => {
        const isMobile = toMobileBoolean(row.isMobile);
        const typeKey = isMobile ? 'mobile' : 'desktop';
        typeCounters[typeKey] += 1;

        return {
          ...row,
          isMobile,
          open_new_tab: toBoolean(row.open_new_tab),
          sort_order:
            Number.isFinite(Number(row.sort_order)) && Number(row.sort_order) > 0
              ? Number(row.sort_order)
              : typeCounters[typeKey],
        };
      });

      setImages(normalized);
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

    if (!isWebp) return `${file.name}: only WEBP images are allowed.`;
    if (file.size > MAX_FILE_SIZE) return `${file.name}: image size must be 5MB or less.`;

    return '';
  };

  const revokePreview = (url) => {
    if (url && String(url).startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  };

  const handleUploadFileSelect = (event, type) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (selectedFiles.length < 1) return;

    if (selectedFiles.length > MAX_BULK_IMAGES) {
      showWarning(`Select between 1 and ${MAX_BULK_IMAGES} images at a time.`);
      event.target.value = '';
      return;
    }

    const firstError = selectedFiles.map(validateWebpFile).find(Boolean);
    if (firstError) {
      showWarning(firstError);
      event.target.value = '';
      return;
    }

    const previews = selectedFiles.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    const updater = type === 'mobile' ? setMobileForm : setDesktopForm;
    updater((current) => {
      current.previews.forEach((preview) => revokePreview(preview.url));
      return { files: selectedFiles, previews };
    });
  };

  const displayImages = useMemo(() => {
    const stagedExisting = images.map((image) => {
      const update = pendingUpdates[image.id];
      const isPendingDelete = pendingDeletes.includes(image.id);

      return {
        ...image,
        description:
          update?.description !== undefined ? update.description : image.description,
        image_path: update?.previewUrl || image.image_path,
        isMobile:
          update?.isMobile !== undefined
            ? toMobileBoolean(update.isMobile)
            : toMobileBoolean(image.isMobile),
        open_new_tab:
          update?.openNewTab !== undefined
            ? Boolean(update.openNewTab)
            : toBoolean(image.open_new_tab),
        sort_order:
          update?.sortOrder !== undefined
            ? Number(update.sortOrder)
            : Number(image.sort_order || 0),
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
      open_new_tab: item.openNewTab,
      sort_order: item.sortOrder,
      created_at: item.created_at,
      __pendingCreate: true,
    }));

    return [...stagedExisting, ...stagedCreates].sort((a, b) => {
      const typeDifference = Number(toMobileBoolean(a.isMobile)) - Number(toMobileBoolean(b.isMobile));
      if (typeDifference !== 0) return typeDifference;

      const orderDifference = Number(a.sort_order || 0) - Number(b.sort_order || 0);
      if (orderDifference !== 0) return orderDifference;

      return String(getImageKey(a)).localeCompare(String(getImageKey(b)));
    });
  }, [images, pendingCreates, pendingUpdates, pendingDeletes]);

  const getNextSortOrder = (isMobile, excludeId = null) => {
    const relevant = displayImages.filter((image) => {
      if (image.__pendingDelete) return false;
      if (excludeId !== null && String(getImageKey(image)) === String(excludeId)) return false;
      return toMobileBoolean(image.isMobile) === Boolean(isMobile);
    });

    return relevant.reduce(
      (maximum, image) => Math.max(maximum, Number(image.sort_order || 0)),
      0
    ) + 1;
  };

  const queueNewImages = (event, isMobile) => {
    event.preventDefault();

    const form = isMobile ? mobileForm : desktopForm;
    const setForm = isMobile ? setMobileForm : setDesktopForm;
    const fileRef = isMobile ? mobileFileRef : desktopFileRef;
    const slug = normalizeSlug(sharedLink.description);

    if (form.files.length < 1) {
      showWarning(`Please select at least 1 ${isMobile ? 'mobile' : 'desktop'} WEBP banner.`);
      return;
    }

    if (form.files.length > MAX_BULK_IMAGES) {
      showWarning(`A maximum of ${MAX_BULK_IMAGES} images can be queued at once.`);
      return;
    }

    if (!slug || !slug.startsWith('/')) {
      showWarning('Enter a valid slug starting with “/”.');
      return;
    }

    const startingOrder = getNextSortOrder(isMobile);
    const timestamp = Date.now();

    const pendingItems = form.files.map((file, index) => ({
      clientId: `pending-${timestamp}-${index}-${Math.random().toString(36).slice(2, 8)}`,
      description: slug,
      openNewTab: sharedLink.openNewTab,
      imageFile: file,
      previewUrl: form.previews[index]?.url || '',
      isMobile,
      sortOrder: startingOrder + index,
      created_at: new Date().toISOString(),
    }));

    setPendingCreates((current) => [...current, ...pendingItems]);
    setForm(emptyUploadForm());
    if (fileRef.current) fileRef.current.value = '';

    setNotice(
      `${pendingItems.length} ${isMobile ? 'mobile' : 'desktop'} banner${pendingItems.length === 1 ? '' : 's'} queued with ${slug}. Click “Update Carousel” to save.`
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

    const previewUrl = URL.createObjectURL(file);
    setEditForm((current) => {
      if (current.imageFile) revokePreview(current.previewUrl);
      return { ...current, imageFile: file, previewUrl };
    });
  };

  const handleEditImage = (image) => {
    if (image.__pendingCreate || image.__pendingDelete) return;

    setEditingId(image.id);
    setEditForm({
      description: normalizeSlug(image.description || '/'),
      imageFile: null,
      previewUrl: image.image_path,
      isMobile: toMobileBoolean(image.isMobile),
      openNewTab: toBoolean(image.open_new_tab),
      sortOrder: Number(image.sort_order || 0),
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

    const slug = normalizeSlug(editForm.description);
    if (!slug || !slug.startsWith('/')) {
      showWarning('Slug is required and must start with “/”.');
      return;
    }

    const currentImage = displayImages.find(
      (image) => !image.__pendingCreate && String(image.id) === String(editingId)
    );
    const typeChanged =
      currentImage &&
      toMobileBoolean(currentImage.isMobile) !== Boolean(editForm.isMobile);

    const existingPendingUpdate = pendingUpdates[editingId];
    if (
      editForm.imageFile &&
      existingPendingUpdate?.imageFile &&
      existingPendingUpdate.previewUrl !== editForm.previewUrl
    ) {
      revokePreview(existingPendingUpdate.previewUrl);
    }

    setPendingUpdates((current) => ({
      ...current,
      [editingId]: {
        ...current[editingId],
        description: slug,
        imageFile: editForm.imageFile || current[editingId]?.imageFile || null,
        previewUrl:
          editForm.imageFile
            ? editForm.previewUrl
            : (current[editingId]?.previewUrl || editForm.previewUrl),
        isMobile: editForm.isMobile,
        openNewTab: editForm.openNewTab,
        sortOrder: typeChanged
          ? getNextSortOrder(editForm.isMobile, editingId)
          : Number(editForm.sortOrder || currentImage?.sort_order || 1),
      },
    }));

    setNotice('Image changes queued. Click “Update Carousel” to save them permanently.');
    cancelEdit({ preserveQueuedPreview: true });
  };

  const cancelEdit = ({ preserveQueuedPreview = false } = {}) => {
    setEditingId(null);
    setEditForm((current) => {
      if (current.imageFile && !preserveQueuedPreview) revokePreview(current.previewUrl);
      return {
        description: '',
        imageFile: null,
        previewUrl: '',
        isMobile: false,
        openNewTab: false,
        sortOrder: 0,
      };
    });
    if (editFileRef.current) editFileRef.current.value = '';
  };

  const handleDeleteImage = async (image) => {
    if (image.__pendingCreate) {
      revokePreview(image.image_path);
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

  const revokePendingUpdatePreviews = () => {
    Object.values(pendingUpdates).forEach((update) => {
      if (update?.imageFile) revokePreview(update.previewUrl);
    });
  };

  const discardPendingChanges = async () => {
    if (!hasPendingChanges) return;

    const confirmed = await confirmAction({
      title: 'Discard unsaved carousel changes?',
      text: 'All queued additions, edits, deletions, and ordering changes on this page will be cleared.',
      confirmButtonText: 'Discard Changes',
      cancelButtonText: 'Keep Editing',
    });

    if (!confirmed) return;

    pendingCreates.forEach((item) => revokePreview(item.previewUrl));
    revokePendingUpdatePreviews();
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
      text: `This will permanently save ${createCount} new, ${updateCount} edited/reordered, and ${deleteCount} deleted carousel image${createCount + updateCount + deleteCount === 1 ? '' : 's'}.`,
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
        const requestData = {};

        if (update.description !== undefined) requestData.description = normalizeSlug(update.description);
        if (update.isMobile !== undefined) requestData.isMobile = update.isMobile;
        if (update.openNewTab !== undefined) requestData.openNewTab = update.openNewTab;
        if (update.sortOrder !== undefined) requestData.sortOrder = Number(update.sortOrder);

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
            description: normalizeSlug(item.description),
            isMobile: item.isMobile,
            openNewTab: item.openNewTab,
            sortOrder: Number(item.sortOrder),
          },
          { withCredentials: true }
        );
      }

      pendingCreates.forEach((item) => revokePreview(item.previewUrl));
      revokePendingUpdatePreviews();
      setPendingCreates([]);
      setPendingUpdates({});
      setPendingDeletes([]);
      setNotice('');
      cancelEdit();
      await fetchImages();
      await showSuccessAlert('Carousel images updated successfully.');
    } catch (error) {
      console.error('Error applying carousel changes:', error);

      pendingCreates.forEach((item) => revokePreview(item.previewUrl));
      revokePendingUpdatePreviews();
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

  const reorderTypeImages = (sourceKey, targetKey) => {
    if (activeFilter === 'all' || sourceKey === targetKey) return;

    const isMobile = activeFilter === 'mobile';
    const ordered = displayImages.filter(
      (image) =>
        !image.__pendingDelete &&
        toMobileBoolean(image.isMobile) === isMobile
    );

    const sourceIndex = ordered.findIndex((image) => getImageKey(image) === sourceKey);
    const targetIndex = ordered.findIndex((image) => getImageKey(image) === targetKey);

    if (sourceIndex < 0 || targetIndex < 0) return;

    const next = [...ordered];
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved);

    const pendingCreateOrders = new Map();
    const existingOrders = new Map();

    next.forEach((image, index) => {
      const newOrder = index + 1;
      if (image.__pendingCreate) {
        pendingCreateOrders.set(image.clientId, newOrder);
      } else {
        existingOrders.set(image.id, newOrder);
      }
    });

    setPendingCreates((current) =>
      current.map((item) =>
        pendingCreateOrders.has(item.clientId)
          ? { ...item, sortOrder: pendingCreateOrders.get(item.clientId) }
          : item
      )
    );

    setPendingUpdates((current) => {
      const nextUpdates = { ...current };
      for (const [id, sortOrder] of existingOrders.entries()) {
        nextUpdates[id] = {
          ...nextUpdates[id],
          sortOrder,
        };
      }
      return nextUpdates;
    });

    setNotice(
      `${isMobile ? 'Mobile' : 'Desktop'} banner order changed. Click “Update Carousel” to publish the new frontend order.`
    );
  };

  const handleDragStart = (event, image) => {
    if (activeFilter === 'all' || image.__pendingDelete || saving) {
      event.preventDefault();
      return;
    }

    const key = getImageKey(image);
    setDraggedKey(key);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', key);
  };

  const handleDrop = (event, targetImage) => {
    event.preventDefault();
    const sourceKey = draggedKey || event.dataTransfer.getData('text/plain');
    const targetKey = getImageKey(targetImage);

    if (sourceKey && targetKey) {
      reorderTypeImages(sourceKey, targetKey);
    }

    setDraggedKey(null);
    setDragOverKey(null);
  };

  const renderBulkPreviews = (form, isMobile) => {
    if (!form.previews.length) return null;

    return (
      <div className="bulk-preview-section">
        <div className="bulk-preview-header">
          <strong>{form.previews.length} image{form.previews.length === 1 ? '' : 's'} selected</strong>
          <span>1 to {MAX_BULK_IMAGES} images per upload</span>
        </div>
        <div className={`bulk-preview-grid ${isMobile ? 'bulk-preview-grid-mobile' : ''}`}>
          {form.previews.map((preview, index) => (
            <div className="bulk-preview-item" key={`${preview.name}-${index}`}>
              <img src={preview.url} alt={preview.name} />
              <span>{index + 1}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderUploadCard = ({ isMobile }) => {
    const form = isMobile ? mobileForm : desktopForm;
    const fileRef = isMobile ? mobileFileRef : desktopFileRef;
    const typeLabel = isMobile ? 'Mobile' : 'Desktop';

    return (
      <form
        className={`upload-card ${isMobile ? 'upload-card-mobile' : 'upload-card-desktop'}`}
        onSubmit={(event) => queueNewImages(event, isMobile)}
      >
        <div className="upload-card-heading">
          <div>
            <span className={`type-pill ${isMobile ? 'type-pill-mobile' : 'type-pill-desktop'}`}>
              {isMobile ? '📱' : '🖥️'} {typeLabel}
            </span>
            <h3>{typeLabel} Banner Upload</h3>
          </div>
          <p>
            Select 1 to {MAX_BULK_IMAGES} WEBP banners prepared for {typeLabel.toLowerCase()} screens.
          </p>
        </div>

        <div className="form-group">
          <label htmlFor={`${typeLabel.toLowerCase()}ImageFile`}>Image Files *</label>
          <input
            type="file"
            id={`${typeLabel.toLowerCase()}ImageFile`}
            ref={fileRef}
            onChange={(event) =>
              handleUploadFileSelect(event, isMobile ? 'mobile' : 'desktop')
            }
            accept=".webp,image/webp"
            multiple
            className="file-input"
          />
          <small>WEBP only. Select 1–20 images. Maximum 5MB per image.</small>
        </div>

        {renderBulkPreviews(form, isMobile)}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={form.files.length < 1 || saving}
        >
          Queue {form.files.length || ''} {typeLabel} Banner{form.files.length === 1 ? '' : 's'}
        </button>
      </form>
    );
  };

  return (
    <div className="carousel-admin">
      <div className="admin-header">
        <h1>Carousel Images Admin</h1>
        <p>Manage desktop/mobile banners, links, new-tab behavior, and frontend display order.</p>
      </div>

      <div className={`page-update-bar ${hasPendingChanges ? 'has-pending' : ''}`}>
        <div>
          <strong>{hasPendingChanges ? 'Unsaved carousel changes' : 'No unsaved changes'}</strong>
          <span>
            {hasPendingChanges
              ? `${pendingCreates.length} new · ${Object.keys(pendingUpdates).length} edited/reordered · ${pendingDeletes.length} deleted`
              : 'Nothing is stored or published until Update Carousel is confirmed.'}
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
          <p>One common link applies to the desktop or mobile batch you queue.</p>
        </div>

        <div className="shared-link-settings">
          <div className="form-group shared-slug-field">
            <label htmlFor="carouselSharedSlug">Common Slug *</label>
            <input
              type="text"
              id="carouselSharedSlug"
              value={sharedLink.description}
              onChange={(event) =>
                setSharedLink((current) => ({
                  ...current,
                  description: normalizeSlug(event.target.value),
                }))
              }
              onBlur={() =>
                setSharedLink((current) => ({
                  ...current,
                  description: normalizeSlug(current.description) || '/',
                }))
              }
              placeholder="/organization-slug"
            />
            <small>Stored as an internal path and always starts with “/”. Example: /karakoram-development-foundation-kdf</small>
          </div>

          <div className="new-tab-setting">
            <div>
              <strong>Open in New Tab</strong>
              <span>Use the same behavior for this upload batch.</span>
            </div>
            <label className="switch-control" aria-label="Open uploaded banner link in a new tab">
              <input
                type="checkbox"
                checked={sharedLink.openNewTab}
                onChange={(event) =>
                  setSharedLink((current) => ({
                    ...current,
                    openNewTab: event.target.checked,
                  }))
                }
              />
              <span className="switch-slider" />
            </label>
          </div>
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
            <p>Queue the change here, then use Update Carousel to store and publish it.</p>
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
                        description: normalizeSlug(event.target.value),
                      }))
                    }
                    required
                  />
                  <small>Slug is stored with a leading “/”.</small>
                </div>

                <div className="new-tab-setting edit-new-tab-setting">
                  <div>
                    <strong>Open in New Tab</strong>
                    <span>Open this banner link in a separate browser tab.</span>
                  </div>
                  <label className="switch-control" aria-label="Open this banner link in a new tab">
                    <input
                      type="checkbox"
                      checked={editForm.openNewTab}
                      onChange={(event) =>
                        setEditForm((current) => ({
                          ...current,
                          openNewTab: event.target.checked,
                        }))
                      }
                    />
                    <span className="switch-slider" />
                  </label>
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
        <div className="drag-order-help">
          {activeFilter === 'all'
            ? 'Select Desktop or Mobile to drag banners into frontend display order.'
            : `Drag ${activeFilter} cards to reorder them. Save with Update Carousel.`}
        </div>
      </div>

      <section className="images-list-section">
        <div className="section-header">
          <div>
            <h2>
              {activeFilter === 'all' && 'All Carousel Images '}
              {activeFilter === 'desktop' && 'Desktop Images '}
              {activeFilter === 'mobile' && 'Mobile Images '}
              ({filteredImages.length})
            </h2>
            {activeFilter !== 'all' && (
              <p className="order-section-note">↕ Drag and drop cards to change frontend banner order.</p>
            )}
          </div>
          <button
            type="button"
            onClick={fetchImages}
            disabled={loading || saving || hasPendingChanges}
            className="btn btn-refresh"
            title={hasPendingChanges ? 'Save or discard pending changes before refreshing.' : ''}
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
            {filteredImages.map((image) => {
              const imageKey = getImageKey(image);
              const canDrag =
                activeFilter !== 'all' && !image.__pendingDelete && !saving;

              return (
                <article
                  key={imageKey}
                  draggable={canDrag}
                  onDragStart={(event) => handleDragStart(event, image)}
                  onDragEnd={() => {
                    setDraggedKey(null);
                    setDragOverKey(null);
                  }}
                  onDragOver={(event) => {
                    if (!canDrag) return;
                    event.preventDefault();
                    event.dataTransfer.dropEffect = 'move';
                    setDragOverKey(imageKey);
                  }}
                  onDragLeave={() => {
                    if (dragOverKey === imageKey) setDragOverKey(null);
                  }}
                  onDrop={(event) => handleDrop(event, image)}
                  className={`image-card ${image.__pendingDelete ? 'pending-delete-card' : ''} ${
                    canDrag ? 'draggable-card' : ''
                  } ${draggedKey === imageKey ? 'dragging-card' : ''} ${
                    dragOverKey === imageKey ? 'drag-over-card' : ''
                  }`}
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

                    {activeFilter !== 'all' && !image.__pendingDelete && (
                      <div className="drag-handle" title="Drag to reorder">⋮⋮</div>
                    )}

                    <div className="order-badge">#{Number(image.sort_order || 0)}</div>

                    {image.__pendingCreate && (
                      <div className="pending-badge pending-badge-create">Pending new</div>
                    )}
                    {image.__pendingUpdate && !image.__pendingDelete && (
                      <div className="pending-badge pending-badge-update">Pending edit/order</div>
                    )}
                    {image.__pendingDelete && (
                      <div className="pending-badge pending-badge-delete">Pending delete</div>
                    )}
                  </div>

                  <div className="image-details">
                    <p className="image-description">{image.description || 'No slug'}</p>
                    <div className="link-behavior-row">
                      <span>{toBoolean(image.open_new_tab) ? '↗ Opens in new tab' : '→ Opens in same tab'}</span>
                    </div>
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
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default CarouselAdmin;
