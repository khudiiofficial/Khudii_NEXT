import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './WelcomeAdmin.css';

const API_BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');

const WelcomeAdmin = () => {
  const [welcomeData, setWelcomeData] = useState({
    welcome_title: '',
    welcome_description: '',
    youtube_video_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [cap,setcap]=useState('')



  // Fetch welcome section data
  const fetchWelcomeData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/welcome`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setWelcomeData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching welcome data:', error);
      setMessage('Failed to load welcome section data');
    } finally {
      setLoading(false);
    }
  };

  // Update welcome section data
  const handleUpdate = async (e) => {
    e.preventDefault();
    
 if(cap){
      console.log('bot detected')
setcap('')
      return
    }


    if (!welcomeData.welcome_title.trim()) {
      setMessage('Welcome title is required');
      return;
    }

    try {
      setSaving(true);
      setMessage('');
      
      const response = await axios.put(`${API_BASE_URL}/api/welcome`, welcomeData, {
        withCredentials: true
      });

      if (response.data.success) {
        setMessage('Welcome section updated successfully!');
        // Update with the latest data from server
        setWelcomeData(response.data.data);
      }
    } catch (error) {
      console.error('Error updating welcome data:', error);
      setMessage('Failed to update welcome section: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setWelcomeData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    fetchWelcomeData();
  }, []);

  return (
    <div className="welcome-admin">
      <div className="admin-header">
        <h1>Welcome Section For Home Page</h1>
        <p>Manage your website's welcome section</p>
      </div>

      {message && (
        <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="welcome-form-section">
        <form onSubmit={handleUpdate} className="w-full welcome-form">
              <input type="hidden" onChange={(e)=>{setcap(e.target.value)}} />

          <div className="form-group">
            <label htmlFor="welcome_title">Welcome Title *</label>
            <input
              type="text"
              id="welcome_title"
              value={(welcomeData.welcome_title) ?? ''}
              onChange={(e) => handleChange('welcome_title', e.target.value)}
              placeholder="Enter Welcome Title"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="welcome_description">Welcome Description</label>
            <textarea
              id="welcome_description"
              value={welcomeData.welcome_description || ''}
              onChange={(e) => handleChange('welcome_description', e.target.value)}
              placeholder="Enter welcome description"
              rows="6"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="youtube_video_id">YouTube Video ID</label>
            <input
              type="text"
              id="youtube_video_id"
              value={welcomeData.youtube_video_id || ''}
              onChange={(e) => handleChange('youtube_video_id', e.target.value)}
              placeholder="Enter YouTube Video ID (e.g., dQw4w9WgXcQ)"
              disabled={loading}
            />
            <small>
              Only the video ID from YouTube URL. 
              Example: For "https://www.youtube.com/watch?v=<b>dQw4w9WgXcQ</b>", use "<b>dQw4w9WgXcQ</b>"
            </small>
          </div>

          {welcomeData.youtube_video_id && (
            <div className="video-preview">
              <label>YouTube Preview:</label>
              <div className="video-container">
                <iframe
                  width="100%"
                  height="350"
                  src={`https://www.youtube.com/embed/${welcomeData.youtube_video_id}`}
                  title="YouTube Video Player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}
<br /><br />
          <div className="form-actions">
            <button 
              type="submit" 
              disabled={saving || loading}
              className="cursor-pointer bg-[#02236e] btn hover:bg-[#032f95] text-white"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            
            <button 
              type="button" 
              onClick={fetchWelcomeData}
              disabled={loading}
              className="cursor-pointer bg-[#fbf137] btn border-[#fbf137] hover:bg-[#f7e029] text-[#222222] ml-3"
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
          <h2>{welcomeData.welcome_title || 'Welcome Title Preview'}</h2>
          <p>{welcomeData.welcome_description || 'Welcome Description will Appear here...'}</p>
          {welcomeData.youtube_video_id && (
            <div className="preview-video">
              <iframe
                width="100%"
                height="315"
                src={`https://www.youtube.com/embed/${welcomeData.youtube_video_id}`}
                title="YouTube video preview"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WelcomeAdmin;