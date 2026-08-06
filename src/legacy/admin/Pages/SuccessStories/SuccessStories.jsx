import React, { useState, useEffect } from 'react';
import SuccessStoryForm from './SuccessStoryForm';
import SuccessStoryList from './SuccessStoryList';
const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');
import axios from 'axios'
const SuccessStories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingStory, setEditingStory] = useState(null);

  // Fetch all success stories
 const fetchStories = async () => {
  try {
    setLoading(true);

    const response = await axios.get(`${APIPath}/api/success-stories`, {
      withCredentials: true,
    });

    setStories(response.data);
    setError('');
  } catch (err) {
    setError('Failed to load success stories');
    console.error('Error:', err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchStories();
  }, []);

  // Handle create new story
  const handleCreate = () => {
    setEditingStory(null);
    setShowForm(true);
  };

  // Handle edit story
  const handleEdit = (story) => {
    setEditingStory(story);
    setShowForm(true);
  };

  // Handle delete story
 const handleDelete = async (id) => {
  if (!window.confirm('Are you sure you want to delete this success story?')) {
    return;
  }

  try {
    await axios.delete(`${APIPath}/api/success-stories/${id}`, {
      withCredentials: true,
    });

    // Remove from local state
    setStories(stories.filter((story) => story.id !== id));
    alert('Success story deleted successfully');
  } catch (err) {
    alert('Failed to delete success story');
    console.error('Error:', err);
  }
};

  // Handle form submission
  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingStory(null);
    fetchStories(); // Refresh the list
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingStory(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#222222]">Success Stories Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your success stories and inspirational content
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Action Bar */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <span className="text-md text-[#02236e]">
              Total Stories: <span className="text-lg font-semibold">{stories.length}</span>
            </span>
          </div>
          <button
            onClick={handleCreate}
            className="cursor-pointer bg-[#02236e] hover:bg-[#032f95] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Story
          </button>
        </div>

        {/* Content */}
        {showForm ? (
          <SuccessStoryForm
            story={editingStory}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        ) : (
          <SuccessStoryList
            stories={stories}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
};

export default SuccessStories;