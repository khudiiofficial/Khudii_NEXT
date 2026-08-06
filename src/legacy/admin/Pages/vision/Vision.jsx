import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './VisionMissionAdmin.css';

const API_BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');

const VisionMissionAdmin = () => {
  
 const [cap,setcap]=useState('')

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    icon: '',
    title: '',
    description: '',
    sort_order: 0,
    is_active: true
  });
  const [message, setMessage] = useState('');

  // Fetch all items
  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/vision-mission`, {
        withCredentials: true
      });
      setItems(response.data.data);
    } catch (error) {
      console.error('Error fetching items:', error);
      setMessage('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  // Add new item
  const handleAdd = async (e) => {
    e.preventDefault();
    
 if(cap){
      console.log('bot detected')
setcap('')
      return
    }
    if (!formData.icon || !formData.title || !formData.description) {
      setMessage('Icon, title, and description are required');
      return;
    }

    try {
      setSaving(true);
      setMessage('');
      
      const response = await axios.post(`${API_BASE_URL}/api/vision-mission`, formData, {
        withCredentials: true
      });

      if (response.data.success) {
        setMessage('Item added successfully!');
        resetForm();
        fetchItems();
      }
    } catch (error) {
      console.error('Error adding item:', error);
      setMessage('Failed to add item: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  // Update item
  const handleUpdate = async (e) => {
    e.preventDefault();
    
 if(cap){
      console.log('bot detected')
setcap('')
      return
    }
    if (!formData.icon || !formData.title || !formData.description) {
      setMessage('Icon, title, and description are required');
      return;
    }

    try {
      setSaving(true);
      setMessage('');
      
      const response = await axios.put(`${API_BASE_URL}/api/vision-mission/${editingId}`, formData, {
        withCredentials: true
      });

      if (response.data.success) {
        setMessage('Item updated successfully!');
        resetForm();
        fetchItems();
      }
    } catch (error) {
      console.error('Error updating item:', error);
      setMessage('Failed to update item: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  // Delete item
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await axios.delete(`${API_BASE_URL}/api/vision-mission/${id}`, {
        withCredentials: true
      });

      if (response.data.success) {
        setMessage('Item deleted successfully!');
        fetchItems();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      setMessage('Failed to delete item: ' + (error.response?.data?.message || error.message));
    }
  };

  // Edit item
  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      icon: item.icon,
      title: item.title,
      description: item.description,
      sort_order: item.sort_order,
      is_active: item.is_active
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      icon: '',
      title: '',
      description: '',
      sort_order: items.length,
      is_active: true
    });
    setEditingId(null);
  };

  // Move item up
  const moveUp = async (index) => {
    
 if(cap){
      console.log('bot detected')
setcap('')
      return
    }
    if (index === 0) return;
    
    const updatedItems = [...items];
    const temp = updatedItems[index];
    updatedItems[index] = updatedItems[index - 1];
    updatedItems[index - 1] = temp;

    // Update sort orders
    const itemsWithNewOrder = updatedItems.map((item, idx) => ({
      ...item,
      sort_order: idx
    }));

    setItems(itemsWithNewOrder);

    try {
      await axios.patch(`${API_BASE_URL}/api/vision-mission/sort`, {
        items: itemsWithNewOrder.map(item => ({ id: item.id, sort_order: item.sort_order }))
      }, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Error updating sort order:', error);
      setMessage('Failed to update sort order');
      fetchItems(); // Revert to original order
    }
  };

  // Move item down
  const moveDown = async (index) => {
    
 if(cap){
      console.log('Bot Detected')
setcap('')
      return
    }
    if (index === items.length - 1) return;
    
    const updatedItems = [...items];
    const temp = updatedItems[index];
    updatedItems[index] = updatedItems[index + 1];
    updatedItems[index + 1] = temp;

    // Update sort orders
    const itemsWithNewOrder = updatedItems.map((item, idx) => ({
      ...item,
      sort_order: idx
    }));

    setItems(itemsWithNewOrder);

    try {
      await axios.patch(`${API_BASE_URL}/api/vision-mission/sort`, {
        items: itemsWithNewOrder.map(item => ({ id: item.id, sort_order: item.sort_order }))
      }, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Error updating sort order:', error);
      setMessage('Failed to update sort order');
      fetchItems(); // Revert to original order
    }
  };

  // Toggle active status
  const toggleActive = async (item) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/vision-mission/${item.id}`, {
        is_active: !item.is_active
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        setMessage(`Item ${!item.is_active ? 'activated' : 'deactivated'} successfully!`);
        fetchItems();
      }
    } catch (error) {
      console.error('Error toggling active status:', error);
      setMessage('Failed to update item status');
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="vision-mission-admin">
      <div className="admin-header">
        <h1>Vision, Mission & Goal Admin</h1>
        <p>Manage your vision, mission, and goal items</p>
      </div>

      {message && (
        <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {/* Add/Edit Form */}
      <div className="form-section">
        <h2>{editingId ? 'Edit Item' : 'Add New Item'}</h2>
        <form onSubmit={editingId ? handleUpdate : handleAdd} className="item-form">
              <input type="hidden" onChange={(e)=>{setcap(e.target.value)}} />



          <div className="form-row">
            <div className="form-group">
              <label>Icon Class *</label>
              <input
                type="text"
                value={(formData.icon) ?? ''}
                onChange={(e) => handleChange('icon', e.target.value)}
                placeholder="e.g., fa-solid fa-crosshairs"
                required
              />
              <small>Font Awesome icon classes</small>
            </div>

            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={(formData.title) ?? ''}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g., Vision, Mission, Goal"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              value={(formData.description) ?? ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter Detailed Description"
              rows="4"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Sort Order</label>
              <input
                type="number"
                value={(formData.sort_order) ?? ''}
                onChange={(e) => handleChange('sort_order', parseInt(e.target.value))}
                min="0"
              />
            </div>

            {/* <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => handleChange('is_active', e.target.checked)}
                />
                Active
              </label>
            </div> */}
          </div>

          <div className="form-actions">
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? 'Saving...' : (editingId ? 'Update Item' : 'Add Item')}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Items List */}
      <div className="items-section">
        <div className="section-header">
          <h2>Items ({items.length})</h2>
          <button onClick={fetchItems} disabled={loading} className="btn btn-refresh">
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading items...</div>
        ) : items.length === 0 ? (
          <div className="no-items">
            <p>No items found. Add your first item above.</p>
          </div>
        ) : (
          <div className="items-list">
            {items.map((item, index) => (
              <div key={item.id} className={`item-card ${!item.is_active ? 'inactive' : ''}`}>
                <div className="item-header">
                  <div className="item-icon">
                    <i className={item.icon}></i>
                  </div>
                  <div className="item-info">
                    <h3>{item.title}</h3>
                    <div className="item-badges">
                      {!item.is_active && <span className="badge inactive">Inactive</span>}
                      <span className="badge sort">Order: {item.sort_order}</span>
                    </div>
                  </div>
                  <div className="item-controls">
                    <button 
                      onClick={() => moveUp(index)} 
                      disabled={index === 0}
                      className="btn btn-control"
                      title="Move Up"
                    >
                      ↑
                    </button>
                    <button 
                      onClick={() => moveDown(index)} 
                      disabled={index === items.length - 1}
                      className="btn btn-control"
                      title="Move Down"
                    >
                      ↓
                    </button>
                  </div>
                </div>
                <p className="item-description">{item.description}</p>
                <div className="item-actions">
                  {/* <button 
                    onClick={() => toggleActive(item)} 
                    className={`btn ${item.is_active ? 'btn-warning' : 'btn-success'}`}
                  >
                    {item.is_active ? 'Deactivate' : 'Activate'}
                  </button> */}
                  <button onClick={() => handleEdit(item)} className="btn cursor-pointer bg-[#1c5e20] text-white rounded-lg">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="btn btn-delete">
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

export default VisionMissionAdmin;