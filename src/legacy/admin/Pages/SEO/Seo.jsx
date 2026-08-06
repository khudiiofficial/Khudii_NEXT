import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './SEOAdmin.module.css';

const API_URL = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');

const SEOAdmin = () => {
  const [seoData, setSeoData] = useState({
    url: '',
    pages: []
  });
   const [cap,setcap]=useState('')


  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedPage, setSelectedPage] = useState(0);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  // Fetch SEO data
  const fetchSEOData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/seo');
      if (response.data.success) {
        setSeoData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching SEO data:', error);
      showMessage('Error fetching SEO data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Update SEO data
  const updateSEOData = async () => {
    setSaving(true);
     if(cap){
      console.log('bot detected')
setcap('')
      return
    }


    try {
      const response = await api.put('/api/seo', seoData);
      if (response.data.success) {
        showMessage('SEO data updated successfully!');
        alert("SEO data updated successfully!")
      }
    } catch (error) {
      console.error('Error updating SEO data:', error);
      showMessage('Error updating SEO data', 'error');
      alert('Error updating SEO data')
    } finally {
      setSaving(false);
    }
  };

  // Handle URL change
  const handleURLChange = (value) => {
    setSeoData(prev => ({
      ...prev,
      url: value
    }));
  };

  // Handle page field change
  const handlePageChange = (index, field, value) => {
    setSeoData(prev => {
      const updatedPages = [...prev.pages];
      updatedPages[index] = {
        ...updatedPages[index],
        [field]: value
      };
      return {
        ...prev,
        pages: updatedPages
      };
    });
  };

  useEffect(() => {
    fetchSEOData();
  }, []);

  const currentPage = seoData.pages[selectedPage] || {};

  return (
    <div className={styles.admin}>
      <div className={styles.header}>
        <h1>SEO Management</h1>
        <p>Manage meta tags and SEO settings for all pages</p>
      </div>

      {message && (
        <div className={`${styles.message} ${styles[messageType]}`}>
          {message}
        </div>
      )}

      <div className={styles.container}>
        {/* Website URL Section */}
        <div className={styles.urlSection}>
          <h2>Website URL</h2>
          <div className={styles.formGroup}>
                <input type="hidden" onChange={(e)=>{setcap(e.target.value)}} />


            <label>Main Website URL *</label>
            <input
              type="url"
              value={(seoData.url) ?? ''}
              onChange={(e) => handleURLChange(e.target.value)}
              placeholder="Like https://khudii.com"
              className={styles.urlInput}
            />
          </div>
        </div>

        {/* Page Selection */}
        <div className={styles.pageSelection}>
          <h2>Select Page</h2>
          <div className={styles.pageButtons}>
            {seoData.pages.map((page, index) => (
              <button
                key={index}
                className={`${styles.pageBtn} ${selectedPage === index ? styles.active : ''}`}
                onClick={() => setSelectedPage(index)}
              >
                {page.page_name}
              </button>
            ))}
          </div>
        </div>

        {/* Page SEO Form */}
        {currentPage && (
          <div className={styles.seoForm}>
            <h2>SEO for: {currentPage.page_name}</h2>
            <div className={styles.formGroup}>
              <label>Page URL</label>
              <input
                type="text"
                value={currentPage.page_url || ''}
                disabled
                className={styles.disabledInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Meta Title *</label>
              <input
                type="text"
                value={currentPage.meta_title || ''}
                onChange={(e) => handlePageChange(selectedPage, 'meta_title', e.target.value)}
                placeholder="Enter meta title (50-60 characters)"
              
              />
             
            </div>

            <div className={styles.formGroup}>
              <label>Meta Description *</label>
              <textarea
                value={currentPage.meta_description || ''}
                onChange={(e) => handlePageChange(selectedPage, 'meta_description', e.target.value)}
                placeholder="Enter meta description (150-160 characters)"
                rows="3"
             
              />
            
            </div>

            <div className={styles.formGroup}>
              <label>Meta Keywords</label>
              <textarea
                value={currentPage.meta_keywords || ''}
                onChange={(e) => handlePageChange(selectedPage, 'meta_keywords', e.target.value)}
                placeholder="Enter Keywords Separated by Commas"
                rows="2"
              />
              <small>Separate Keywords with Commas</small>
            </div>

            {/* Preview Section */}
            <div className={styles.preview}>
              <h3>Search Engine Preview</h3>
              <div className={styles.previewBox}>
                <div className={styles.previewTitle}>
                  {currentPage.meta_title || 'Page Title'}
                </div>
                <div className={styles.previewUrl}>
                  {seoData.url}{currentPage.page_url}
                </div>
                <div className={styles.previewDescription}>
                  {currentPage.meta_description || 'Page description will appear here in search results.'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className={styles.actions}>
          <button
            onClick={updateSEOData}
            disabled={saving || loading}
            className={styles.primaryBtn}
          >
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
          <button
            onClick={fetchSEOData}
            disabled={loading}
            className={styles.secondaryBtn}
          >
            {loading ? 'Loading...' : 'Reload Data'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SEOAdmin;