import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VideoForm from './VideoForm';
import VideoList from './VideoList';
const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');
const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);



  // Fetch all videos
const fetchVideos = async () => {
  try {
    setLoading(true);

    const response = await axios.get(`${APIPath}/api/videos`, {
      withCredentials: true,
    });

    setVideos(response.data);
    setError('');
  } catch (err) {
    setError('Failed to load videos');
    console.error('Error:', err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchVideos();
  }, []);

  // Handle create new video
  const handleCreate = () => {
    setEditingVideo(null);
    setShowForm(true);
  };

  // Handle edit video
  const handleEdit = (video) => {
    setEditingVideo(video);
    setShowForm(true);
  };

  // Handle delete video
  const handleDelete = async (id) => {
  if (!window.confirm('Are you sure you want to delete this video?')) {
    return;
  }

  try {
    await axios.delete(`${APIPath}/api/videos/${id}`, {
      withCredentials: true,
    });

    // Remove from local state
    setVideos(videos.filter((video) => video.id !== id));
    alert('Video deleted successfully');
  } catch (err) {
    alert('Failed to delete video');
    console.error('Error:', err);
  }
};

  // Handle form submission
  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingVideo(null);
    fetchVideos(); // Refresh the list
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingVideo(null);
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
          <h1 className="text-3xl font-bold text-[#222222]">Videos Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your video content and YouTube integrations
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
            <span className="text-md text-[#059b0f]">
              Total Videos: <span className="text-lg font-semibold">{videos.length}</span>
            </span>
          </div>
          <button
            onClick={handleCreate}
            className="cursor-pointer bg-[#059b0f] hover:bg-[#3cc645] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Add New Video
          </button>
        </div>

        {/* Content */}
        {showForm ? (
          <VideoForm
            video={editingVideo}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        ) : (
          <VideoList
            videos={videos}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
};

export default Videos;