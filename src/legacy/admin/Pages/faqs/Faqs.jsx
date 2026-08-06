import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const FAQManager = () => {
  const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');

  // State variables
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    display_order: 0,
    is_active: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all'); // 'all', 'active', 'inactive'
  const [sortBy, setSortBy] = useState('display_order'); // 'display_order', 'created_at', 'question'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'
  const [bulkActions, setBulkActions] = useState({
    selectedIds: [],
    allSelected: false
  });
  const [previewMode, setPreviewMode] = useState(false);
  const [expandedFAQs, setExpandedFAQs] = useState([]);

  const formRef = useRef(null);

  // Fetch FAQs on component mount
  useEffect(() => {
    fetchFAQs();
  }, []);

  // Scroll to form when opened
  useEffect(() => {
    if (showForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showForm]);

  // API Functions
  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${APIPath}/api/faqs`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setFaqs(response.data.data);
        setError(null);
      } else {
        setError('Failed to load FAQs');
      }
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      setError(err.response?.data?.message || 'Failed to load FAQs. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const createFAQ = async (faqData) => {
    try {
      const response = await axios.post(`${APIPath}/api/faqs`, faqData, {
        withCredentials: true
      });
      
      if (response.data.success) {
        alert('FAQ created successfully!');
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      throw error;
    }
  };

  const updateFAQ = async (id, faqData) => {
    try {
      const response = await axios.put(`${APIPath}/api/faqs/${id}`, faqData, {
        withCredentials: true
      });
      
      if (response.data.success) {
        alert('FAQ updated successfully!');
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      throw error;
    }
  };

  const deleteFAQ = async (id) => {
    try {
      const response = await axios.delete(`${APIPath}/api/faqs/${id}`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        alert('FAQ deleted successfully!');
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      throw error;
    }
  };

  const toggleFAQStatus = async (id) => {
    try {
      const response = await axios.put(`${APIPath}/api/faqs/${id}/toggle`, {}, {
        withCredentials: true
      });
      
      if (response.data.success) {
        alert(`FAQ ${response.data.data.is_active ? 'activated' : 'deactivated'} successfully!`);
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      throw error;
    }
  };

  const updateDisplayOrderBulk = async (faqsArray) => {
    try {
      const response = await axios.put(
        `${APIPath}/api/faqs/display-order/update`,
        { faqs: faqsArray },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      throw error;
    }
  };

  // Form Handling
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.question.trim()) {
      errors.question = 'Question is required';
    } else if (formData.question.length < 10) {
      errors.question = 'Question must be at least 10 characters';
    }
    
    if (!formData.answer.trim()) {
      errors.answer = 'Answer is required';
    } else if (formData.answer.length < 20) {
      errors.answer = 'Answer must be at least 20 characters';
    }
    
    if (formData.display_order < 0) {
      errors.display_order = 'Display order cannot be negative';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)
   
    if (!validateForm()) {
      return;
    }
    
    try {
      if (editingFAQ) {
        await updateFAQ(editingFAQ.id, formData);
      } else {
        await createFAQ(formData);
      }
      
      // Reset form and fetch updated list
      resetForm();
      fetchFAQs();
    } catch (err) {
      console.error('Error saving FAQ:', err);
      alert(err.response?.data?.message || 'Failed to save FAQ. Please try again.');
    }
    setLoading(false)
  };

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      display_order: 0,
      is_active: true
    });
    setFormErrors({});
    setEditingFAQ(null);
    setShowForm(false);
  };

  const handleEdit = (faq) => {
    setEditingFAQ(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      display_order: faq.display_order,
      is_active: faq.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this FAQ? This action cannot be undone.')) {
      try {
        await deleteFAQ(id);
        fetchFAQs();
      } catch (err) {
        alert('Failed to delete FAQ');
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleFAQStatus(id);
      fetchFAQs();
    } catch (err) {
      alert('Failed to update FAQ status');
    }
  };

  // Bulk Actions
  const handleBulkSelect = (id) => {
    setBulkActions(prev => {
      const newSelectedIds = prev.selectedIds.includes(id)
        ? prev.selectedIds.filter(selectedId => selectedId !== id)
        : [...prev.selectedIds, id];
      
      return {
        ...prev,
        selectedIds: newSelectedIds,
        allSelected: newSelectedIds.length === filteredFAQs.length && filteredFAQs.length > 0
      };
    });
  };

  const handleSelectAll = () => {
    if (bulkActions.allSelected) {
      setBulkActions({ selectedIds: [], allSelected: false });
    } else {
      setBulkActions({
        selectedIds: filteredFAQs.map(faq => faq.id),
        allSelected: true
      });
    }
  };

  const handleBulkDelete = async () => {
    if (bulkActions.selectedIds.length === 0) {
      alert('Please select FAQs to delete');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${bulkActions.selectedIds.length} FAQ(s)? This action cannot be undone.`)) {
      try {
        const deletePromises = bulkActions.selectedIds.map(id => deleteFAQ(id));
        await Promise.all(deletePromises);
        setBulkActions({ selectedIds: [], allSelected: false });
        fetchFAQs();
      } catch (err) {
        alert('Failed to delete selected FAQs');
      }
    }
  };

  const handleBulkStatusToggle = async (status) => {
    if (bulkActions.selectedIds.length === 0) {
      alert('Please select FAQs to update');
      return;
    }
    
    try {
      const togglePromises = bulkActions.selectedIds.map(id =>
        axios.put(`${APIPath}/api/faqs/${id}`, { is_active: status }, { withCredentials: true })
      );
      await Promise.all(togglePromises);
      setBulkActions({ selectedIds: [], allSelected: false });
      fetchFAQs();
      alert(`${bulkActions.selectedIds.length} FAQ(s) ${status ? 'activated' : 'deactivated'} successfully!`);
    } catch (err) {
      alert('Failed to Update Selected FAQs');
    }
  };

  // Sorting and Filtering
  const filteredFAQs = faqs
    .filter(faq => {
      const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterActive === 'active') return matchesSearch && faq.is_active;
      if (filterActive === 'inactive') return matchesSearch && !faq.is_active;
      return matchesSearch;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'display_order') {
        comparison = a.display_order - b.display_order;
      } else if (sortBy === 'created_at') {
        comparison = new Date(a.created_at) - new Date(b.created_at);
      } else if (sortBy === 'question') {
        comparison = a.question.localeCompare(b.question);
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Drag and Drop for display order
  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('text/plain', id.toString());
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetId) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');
    
    if (sourceId === targetId) return;
    
    // Reorder locally
    const sourceIndex = filteredFAQs.findIndex(f => f.id.toString() === sourceId);
    const targetIndex = filteredFAQs.findIndex(f => f.id.toString() === targetId);
    
    if (sourceIndex === -1 || targetIndex === -1) return;
    
    const updatedFAQs = [...filteredFAQs];
    const [movedFAQ] = updatedFAQs.splice(sourceIndex, 1);
    updatedFAQs.splice(targetIndex, 0, movedFAQ);
    
    // Update display order
    const reorderedFAQs = updatedFAQs.map((faq, index) => ({
      ...faq,
      display_order: index + 1
    }));
    
    // Update local state
    setFaqs(prev => prev.map(faq => {
      const updated = reorderedFAQs.find(f => f.id === faq.id);
      return updated || faq;
    }));
    
    // Update in database
    try {
      const faqsForUpdate = reorderedFAQs.map((faq, index) => ({
        id: faq.id,
        display_order: index + 1
      }));
      await updateDisplayOrderBulk(faqsForUpdate);
    } catch (err) {
      console.error('Failed to update display order:', err);
      // Revert on error
      fetchFAQs();
    }
  };

  // Toggle FAQ expansion in preview mode
  const toggleFAQExpansion = (id) => {
    setExpandedFAQs(prev =>
      prev.includes(id)
        ? prev.filter(faqId => faqId !== id)
        : [...prev, id]
    );
  };

  // Export FAQs
  const exportFAQs = () => {
    const dataStr = JSON.stringify(filteredFAQs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `faqs_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
// console.log(loading)
  // Render loading state
  if (loading && faqs.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading FAQs...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error && faqs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md w-full">
          <div className="text-red-500 text-5xl mb-4 text-center">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Error Loading FAQs</h2>
          <p className="text-gray-600 mb-6 text-center">{error}</p>
          <div className="flex justify-center">
            <button
              onClick={fetchFAQs}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">FAQ Management</h1>
              <p className="text-gray-600 mt-1">
                Manage Frequently Asked Questions for your organization
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="cursor-pointer px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {previewMode ? 'Back to List' : 'Preview Mode'}
              </button>
              <button
                onClick={exportFAQs}
                className="cursor-pointer px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Export FAQs
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="cursor-pointer px-6 py-2 bg-[#02236e] text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New FAQ
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={(searchTerm) ?? ''}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={(filterActive) ?? ''}
                onChange={(e) => setFilterActive(e.target.value)}
                className="cursor-pointer px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
              <select
                value={(sortBy) ?? ''}
                onChange={(e) => setSortBy(e.target.value)}
                className="cursor-pointer px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="display_order">Sort by Order</option>
                <option value="question">Sort by Question</option>
                <option value="created_at">Sort by Date</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {bulkActions.selectedIds.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-[#02236e] text-lg font-medium">
                  {bulkActions.selectedIds.length} FAQ(s) Selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleBulkStatusToggle(true)}
                  className="cursor-pointer px-4 py-2 bg-green-100 text-[#1c5e20] rounded-lg hover:bg-green-200 transition-colors text-sm"
                >
                  Activate Selected
                </button>
                <button
                  onClick={() => handleBulkStatusToggle(false)}
                  className="cursor-pointer px-4 py-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-colors text-sm"
                >
                  Deactivate Selected
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="cursor-pointer px-4 py-2 bg-red-100 text-[#e7001e] rounded-lg hover:bg-red-200 transition-colors text-sm"
                >
                  Delete Selected
                </button>
                <button
                  onClick={() => setBulkActions({ selectedIds: [], allSelected: false })}
                  className="cursor-pointer px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Form */}
        {showForm && (
          <div ref={formRef} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingFAQ ? 'Edit FAQ' : 'Create New FAQ'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question *
                </label>
                <input
                  type="text"
                  name="question"
                  value={(formData.question) ?? ''}
                  onChange={handleFormChange}
                  placeholder="e.g., What is your organization's mission?"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.question ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.question && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.question}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Make it clear and concise. Minimum 10 characters.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Answer *
                </label>
                <textarea
                  name="answer"
                  value={(formData.answer) ?? ''}
                  onChange={handleFormChange}
                  placeholder="Provide a detailed and helpful answer..."
                  rows={6}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.answer ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.answer && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.answer}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 20 characters. You can use basic HTML tags like &lt;strong&gt;, &lt;em&gt;, &lt;a&gt;
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    name="display_order"
                    value={(formData.display_order) ?? ''}
                    onChange={handleFormChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      formErrors.display_order ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="0"
                  />
                  {formErrors.display_order && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.display_order}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Lower numbers appear first. Leave as 0 for auto-ordering.
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={handleFormChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-3 block text-sm text-gray-700">
                    <span className="font-medium">Active</span>
                    <p className="text-gray-500">Visible to website visitors</p>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                disabled={loading}
                  type="submit"
                  className={` cursor-pointer px-6 py-2 text-white rounded-lg transition-colors font-medium  ${loading? 'bg-blue-300 hover:bg-blue-300':' bg-green-600  hover:bg-green-700'}`}
                >
                  {editingFAQ ? 'Update FAQ' : 'Create FAQ'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Content Area - Preview or List */}
        {previewMode ? (
          // Preview Mode
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">FAQ Preview</h2>
            <div className="space-y-4">
              {filteredFAQs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No FAQs to preview</p>
                </div>
              ) : (
                filteredFAQs.map((faq) => (
                  <div
                    key={faq.id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFAQExpansion(faq.id)}
                      className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors flex justify-between items-center"
                    >
                      <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                      <svg
                        className={`w-5 h-5 text-gray-500 transform transition-transform ${
                          expandedFAQs.includes(faq.id) ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedFAQs.includes(faq.id) && (
                      <div className="p-4 border-t border-gray-200">
                        <div
                          className="prose max-w-none text-gray-600"
                          dangerouslySetInnerHTML={{ __html: faq.answer }}
                        />
                        <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-500">
                          <div className="flex justify-between">
                            <span>Status: {faq.is_active ? 'Active' : 'Inactive'}</span>
                            <span>Order: {faq.display_order}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          // List Mode
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="px-6 py-3 bg-[#cedcff] border-b border-[#cedcff]">
              <div className="flex items-center">
                <div className="w-12">
                  <input
                    type="checkbox"
                    checked={bulkActions.allSelected}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="flex-1 grid grid-cols-12 gap-4">
                  <div className="col-span-1 font-medium text-[#222222] text-sm">Order</div>
                  <div className="col-span-4 font-medium text-[#222222] text-sm">Question</div>
                  <div className="col-span-3 font-medium text-[#222222] text-sm">Status</div>
                  <div className="col-span-2 font-medium text-[#222222] text-sm">Created</div>
                  <div className="col-span-2 font-medium text-[#222222] text-sm text-right">Actions</div>
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {filteredFAQs.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No FAQs found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || filterActive !== 'all'
                      ? 'Try adjusting your search or filter'
                      : 'Get started by creating a new FAQ'}
                  </p>
                  {!searchTerm && filterActive === 'all' && (
                    <button
                      onClick={() => {
                        resetForm();
                        setShowForm(true);
                      }}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      New FAQ
                    </button>
                  )}
                </div>
              ) : (
                filteredFAQs.map((faq) => (
                  <div
                    key={faq.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, faq.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, faq.id)}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors group cursor-move"
                  >
                    <div className="flex items-center">
                      <div className="w-12">
                        <input
                          type="checkbox"
                          checked={bulkActions.selectedIds.includes(faq.id)}
                          onChange={() => handleBulkSelect(faq.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-1">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            <span className="text-sm text-gray-600">{faq.display_order}</span>
                          </div>
                        </div>
                        <div className="col-span-4">
                          <div className="font-medium text-gray-900 truncate">{faq.question}</div>
                          <div className="text-xs text-gray-500 truncate mt-1">
                            {faq.answer.replace(/<[^>]*>/g, '').substring(0, 80)}...
                          </div>
                        </div>
                        <div className="col-span-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              faq.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {faq.is_active ? (
                              <>
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Active
                              </>
                            ) : (
                              <>
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                Inactive
                              </>
                            )}
                          </span>
                        </div>
                        <div className="col-span-2 text-sm text-gray-500">
                          {new Date(faq.created_at).toLocaleDateString()}
                        </div>
                        <div className="col-span-2">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(faq)}
                              className="p-1.5 text-[#02236e] hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleToggleStatus(faq.id)}
                              className="p-1.5 text-[#fcdd2d] hover:text-yellow-900 hover:bg-yellow-50 rounded transition-colors"
                              title={faq.is_active ? 'Deactivate' : 'Activate'}
                            >
                              {faq.is_active ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(faq.id)}
                              className="p-1.5 text-[#e7001e] hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Table Footer */}
            {filteredFAQs.length > 0 && (
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Showing {filteredFAQs.length} of {faqs.length} FAQ(s)
                  </div>
                  <div className="text-sm text-gray-500">
                    Drag and drop rows to reorder
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats Card */}
        {!previewMode && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-[#02236e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total FAQs</p>
                  <p className="text-2xl font-semibold text-gray-900">{faqs.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-[#1c5e20]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active FAQs</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {faqs.filter(f => f.is_active).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-[#fcdd2d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Last Updated</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {faqs.length > 0 
                      ? new Date(Math.max(...faqs.map(f => new Date(f.updated_at).getTime()))).toLocaleDateString()
                      : 'Never'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FAQManager;