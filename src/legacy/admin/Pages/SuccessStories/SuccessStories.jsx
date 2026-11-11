import { adminConfirm } from '@/lib/admin-dialogs';
import React, { useState, useEffect, useRef } from 'react';
import SuccessStoryForm from './SuccessStoryForm';
import SuccessStoryList from './SuccessStoryList';
const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app');
import axios from 'axios'
const SuccessStories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [ordering,setOrdering]=useState(false);
  const dragId=useRef(null);

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
    setError(err.response?.data?.message || err.response?.data?.error || `Failed to load success stories (HTTP ${err.response?.status || 'network error'})`);
    console.error('Error:', err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchStories();
  }, []);

  const saveOrder=async(next)=>{
    const previous=stories;
    setStories(next);setOrdering(true);
    try{await axios.put(`${APIPath||'/api-app'}/admin/reorder/successstories`,{ids:next.map(s=>Number(s.id))},{headers:{'x-khudii-surface':'admin'},withCredentials:true});}
    catch(e){setStories(previous);setError(e.response?.data?.message||'Failed to save story order')}
    finally{setOrdering(false)}
  };
  const move=(from,to)=>{if(ordering||from<0||to<0||from>=stories.length||to>=stories.length||from===to)return;const next=[...stories];next.splice(to,0,next.splice(from,1)[0]);saveOrder(next)};
  const toggleStory=async(item,checked)=>{
    try{await axios.put(`${APIPath}/api/success-stories/${item.id}`,{...item,is_published:checked},{headers:{'x-khudii-surface':'admin'},withCredentials:true});
      setStories(v=>v.map(r=>r.id===item.id?{...r,is_published:checked?1:0}:r));}
    catch(e){setError(e.response?.data?.message||'Could not update publishing state');}
  };

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
  if (!(await adminConfirm('Are you sure you want to delete this success story?'))) {
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
    window.dispatchEvent(new CustomEvent('khudii:dirty',{detail:{source:'success-stories',dirty:false}}));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4">
      <div className="mx-auto w-full max-w-[1560px] px-2 sm:px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Success Stories Management</h1>
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
            <span className="text-md text-[#2563eb]">
              Total Stories: <span className="text-lg font-semibold">{stories.length}</span>
            </span>
            <p className="mt-1 text-xs text-slate-500">Drag records to control the public order. Publishing changes save immediately.</p>
          </div>
          <button
            onClick={handleCreate}
            className="cursor-pointer bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center"
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
            onMove={move}
            onToggle={toggleStory}
            onDropRow={(id,target)=>{const from=stories.findIndex(v=>v.id===id);move(from,target)}}
            dragId={dragId}
            ordering={ordering}
          />
        )}
      </div>
    </div>
  );
};

export default SuccessStories;