// src/components/FooterAdmin.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FooterAdmin.css';

const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');

const FooterAdmin = () => {
  const [footerData, setFooterData] = useState({
    logoimage: '',
    pageimage: '',
    footertext: '',
    email: '',
    location: '',
    locationinfo:""
  });
   const [cap,setcap]=useState('')

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [pagePreview, setPagePreview] = useState('');

  useEffect(() => {
    fetchFooterData();
  }, []);

  const fetchFooterData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${APIPath}/api/footer`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setFooterData(response.data.data);
        setLogoPreview(response.data.data.logoimage || '');
        setPagePreview(response.data.data.pageimage || '');
      }
    } catch (error) {
      console.error('Error fetching footer data:', error);
      setMessage('Error loading footer content');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFooterData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    
    if (files && files[0]) {
      const file = files[0];
      
      // Convert file to base64 for preview and upload
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        if (name === 'logoimage') {
          setLogoPreview(base64);
        } else if (name === 'pageimage') {
          setPagePreview(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
 if(cap){
      console.log('bot detected')
setcap('')
      return
    }

    setLoading(true);
    setMessage('');

    try {
      const formData = { ...footerData };

      // Convert files to base64 if selected
      const logoFileInput = document.querySelector('input[name="logoimage"]');
      const pageFileInput = document.querySelector('input[name="pageimage"]');
      
      if (logoFileInput && logoFileInput.files[0]) {
        formData.logoimage_base64 = await convertFileToBase64(logoFileInput.files[0]);
      }

      if (pageFileInput && pageFileInput.files[0]) {
        formData.pageimage_base64 = await convertFileToBase64(pageFileInput.files[0]);
      }

      const response = await axios.put(`${APIPath}/api/footer`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        setMessage('Footer content updated successfully!');
        alert('Footer content updated successfully!')
        // Update previews with actual URLs from response if needed
        if (response.data.data.logoimage) {
          setLogoPreview(response.data.data.logoimage);
        }
        if (response.data.data.pageimage) {
          setPagePreview(response.data.data.pageimage);
        }
      }
    } catch (error) {
      console.error('Error updating footer:', error);
      setMessage('Error updating footer content');
      alert('Error updating footer content')
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (imageType) => {
    if (!window.confirm(`Are you sure you want to delete the ${imageType} image?`)) {
      return;
    }

    try {
      const response = await axios.delete(`${APIPath}/api/footer/image/${imageType}`, {
        withCredentials: true
      });

      if (response.data.success) {
        setMessage(`${imageType} image deleted successfully!`);
        
        // Update state to remove the image
        if (imageType === 'logo') {
          setFooterData(prev => ({ ...prev, logoimage: '' }));
          setLogoPreview('');
        } else if (imageType === 'page') {
          setFooterData(prev => ({ ...prev, pageimage: '' }));
          setPagePreview('');
        }
        
        // Refresh data to get updated state
        fetchFooterData();
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      setMessage('Error deleting image');
    }
  };

  if (loading && !footerData.id) {
    return <div className="loading">Loading footer content...</div>;
  }

  return (
    <div className="footer-admin">
      <h1>Footer Content Management</h1>
      
      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="footer-form">
        {/* Logo Image */}
        <div className="form-group">
          

    <input type="hidden" onChange={(e)=>{setcap(e.target.value)}} />


          <label htmlFor="logoimage">Logo Image</label>
          <div className="file-input-group">
            <input
              type="file"
              id="logoimage"
              name="logoimage"
              accept="image/*"
              onChange={handleFileChange}
            />
            {footerData.logoimage && (
              <button 
                type="button" 
                className="delete-btn"
                onClick={() => handleDeleteImage('logo')}
              >
                Delete Logo
              </button>
            )}
          </div>
          {logoPreview && (
            <div className="image-preview">
              <img src={logoPreview} alt="Logo preview" />
            </div>
          )}
          {footerData.logoimage && !logoPreview && (
            <div className="current-image">
              <p>Current Logo:</p>
              <img src={footerData.logoimage} alt="Current logo" />
            </div>
          )}
        </div>

        {/* Page Image */}
        <div className="form-group">
          <label htmlFor="pageimage">Page Image</label>
          <div className="file-input-group">
            <input
              type="file"
              id="pageimage"
              name="pageimage"
              accept="image/*"
              onChange={handleFileChange}
            />
            {footerData.pageimage && (
              <button 
                type="button" 
                className="delete-btn"
                onClick={() => handleDeleteImage('page')}
              >
                Delete Page Image
              </button>
            )}
          </div>
          {pagePreview && (
            <div className="image-preview">
              <img src={pagePreview} alt="Page preview" />
            </div>
          )}
          {footerData.pageimage && !pagePreview && (
            <div className="current-image">
              <p>Current Page Image:</p>
              <img src={footerData.pageimage} alt="Current page" />
            </div>
          )}
        </div>

        {/* Footer Text */}
        <div className="form-group">
          <label htmlFor="footertext">Footer Text</label>
          <textarea
            id="footertext"
            name="footertext"
            value={footerData.footertext || ''}
            onChange={handleInputChange}
            rows="4"
            placeholder="Enter footer text..."
          />
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={footerData.email || ''}
            onChange={handleInputChange}
            placeholder="Enter email address"
          />
        </div>

        {/* Location */}
        <div className="form-group">
          <label htmlFor="location">Location</label>
          <textarea
            id="location"
            name="location"
            value={footerData.location || ''}
            onChange={handleInputChange}
            rows="3"
            placeholder="Enter google map location url"
          />
        </div>
 <div className="form-group">
          <label htmlFor="locationinfo">Location info</label>
          <input
            id="locationinfo"
            name="locationinfo"
            value={footerData.locationinfo || ''}
            onChange={handleInputChange}
            maxLength={40}
            placeholder="Enter location info"
          />
        </div>
        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Updating...' : 'Update Footer'}
        </button>
      </form>
    </div>
  );
};

export default FooterAdmin;