// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const API_URL = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');

// const TopbarAdmin = () => {
//   const [contents, setContents] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [editingContent, setEditingContent] = useState(null);
//   const [formData, setFormData] = useState({ text: '' });
//   const [message, setMessage] = useState('');
//   const [messageType, setMessageType] = useState('');
//   const [cap,setcap]=useState('')



//   // Axios instance with credentials
//   const api = axios.create({
//     baseURL: API_URL,
//     withCredentials: true,
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   });

//   // Show message helper
//   const showMessage = (msg, type = 'success') => {
//     setMessage(msg);
//     setMessageType(type);
//     setTimeout(() => {
//       setMessage('');
//       setMessageType('');
//     }, 5000);
//   };

//   // Fetch all contents
//   const fetchContents = async () => {
//     setLoading(true);
//     try {
//       const response = await api.get('/api/topbar');
//       if (response.data.success) {
//         setContents(response.data.data);
//       }
//     } catch (error) {
//       console.error('Error fetching contents:', error);
//       showMessage('Error fetching contents', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchContents();
//   }, []);

//   // Handle form input change
//   const handleInputChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   // Create new content
//   const handleCreate = async (e) => {
//     e.preventDefault();
//      if(cap){
//       console.log('bot detected')
//       setcap('')
//       return
//     }



//     if (!formData.text.trim()) {
//       showMessage('Text content is required', 'error');
//       return;
//     }

//     try {
//       const response = await api.post('/api/topbar', formData);
//       if (response.data.success) {
//         showMessage('Content created successfully!');
//         setFormData({ text: '' });
//         fetchContents();
//       }
//     } catch (error) {
//       console.error('Error creating content:', error);
//       showMessage('Error creating content', 'error');
//     }
//   };

//   // Update content
//   const handleUpdate = async (e) => {
//     e.preventDefault();
//     if (!formData.text.trim()) {
//       showMessage('Text content is required', 'error');
//       return;
//     }

//     try {
//       const response = await api.put(`/api/topbar/${editingContent.id}`, formData);
//       if (response.data.success) {
//         showMessage('Content updated successfully!');
//         setEditingContent(null);
//         setFormData({ text: '' });
//         fetchContents();
//       }
//     } catch (error) {
//       console.error('Error updating content:', error);
//       showMessage('Error updating content', 'error');
//     }
//   };

//   // Delete content
//   const handleDelete = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this content?')) {
//       return;
//     }

//     try {
//       const response = await api.delete(`/api/topbar/${id}`);
//       if (response.data.success) {
//         showMessage('Content deleted successfully!');
//         fetchContents();
//       }
//     } catch (error) {
//       console.error('Error deleting content:', error);
//       showMessage('Error deleting content', 'error');
//     }
//   };

//   // Start editing
//   const startEdit = (content) => {
//     setEditingContent(content);
//     setFormData({ text: content.text });
//   };

//   // Cancel editing
//   const cancelEdit = () => {
//     setEditingContent(null);
//     setFormData({ text: '' });
//   };

//   // Styles
//   const styles = {
//     admin: {
//       maxWidth: '1200px',
//       margin: '0 auto',
//       padding: '20px',
//       fontFamily: 'Arial, sans-serif',
//     },
//     message: {
//       padding: '10px',
//       margin: '10px 0',
//       borderRadius: '4px',
//       textAlign: 'center',
//     },
//     success: {
//       backgroundColor: '#d4edda',
//       color: '#155724',
//       border: '1px solid #c3e6cb',
//     },
//     error: {
//       backgroundColor: '#f8d7da',
//       color: '#721c24',
//       border: '1px solid #f5c6cb',
//     },
//     form: {
//       background: '#f8f9fa',
//       padding: '20px',
//       borderRadius: '8px',
//       marginBottom: '30px',
//       border: '1px solid #dee2e6',
//     },
//     formGroup: {
//       marginBottom: '15px',
//     },
//     label: {
//       display: 'block',
//       marginBottom: '5px',
//       fontWeight: 'bold',
//       color: '#495057',
//     },
//     textarea: {
//       width: '100%',
//       padding: '10px',
//       border: '1px solid #ced4da',
//       borderRadius: '4px',
//       fontSize: '14px',
//       resize: 'vertical',
//       minHeight: '80px',
//       fontFamily: 'Arial, sans-serif',
//     },
//     formActions: {
//       display: 'flex',
//       gap: '10px',
//     },
//     btn: {
//       padding: '10px 20px',
//       border: 'none',
//       borderRadius: '4px',
//       cursor: 'pointer',
//       fontSize: '14px',
//       transition: 'background-color 0.2s',
//     },
//     btnPrimary: {
//       backgroundColor: '#007bff',
//       color: 'white',
//     },
//     btnSecondary: {
//       backgroundColor: '#6c757d',
//       color: 'white',
//     },
//     btnEdit: {
//       backgroundColor: '#28a745',
//       color: 'white',
//     },
//     btnDelete: {
//       backgroundColor: '#dc3545',
//       color: 'white',
//     },
//     contentList: {
//       marginTop: '30px',
//     },
//     contentGrid: {
//       display: 'grid',
//       gap: '20px',
//       gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
//     },
//     contentCard: {
//       background: 'white',
//       border: '1px solid #dee2e6',
//       borderRadius: '8px',
//       padding: '20px',
//       boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
//     },
//     contentText: {
//       fontSize: '14px',
//       lineHeight: '1.5',
//       color: '#333',
//       marginBottom: '15px',
//     },
//     contentMeta: {
//       display: 'flex',
//       justifyContent: 'space-between',
//       marginBottom: '15px',
//       paddingTop: '15px',
//       borderTop: '1px solid #e9ecef',
//     },
//     metaText: {
//       color: '#6c757d',
//       fontSize: '12px',
//     },
//     contentActions: {
//       display: 'flex',
//       gap: '10px',
//     },
//     loading: {
//       textAlign: 'center',
//       padding: '20px',
//       fontSize: '16px',
//       color: '#6c757d',
//     },
//     emptyState: {
//       textAlign: 'center',
//       padding: '40px',
//       color: '#6c757d',
//       fontSize: '16px',
//     },
//   };

//   // Hover effects
//   const btnHover = {
//     btnPrimaryHover: { backgroundColor: '#0056b3' },
//     btnSecondaryHover: { backgroundColor: '#545b62' },
//     btnEditHover: { backgroundColor: '#1e7e34' },
//     btnDeleteHover: { backgroundColor: '#c82333' },
//   };

//   return (
//     <div style={styles.admin}>
//       <h1>Topbar Content Management</h1>
      
//       {message && (
//         <div style={{
//           ...styles.message,
//           ...(messageType === 'error' ? styles.error : styles.success)
//         }}>
//           {message}
//         </div>
//       )}

//       {/* Add/Edit Form */}
//       <form 
//         onSubmit={editingContent ? handleUpdate : handleCreate} 
//         style={styles.form}
//       >
        
//     <input type="hidden" onChange={(e)=>{setcap(e.target.value)}} />


//         <h2>{editingContent ? 'Edit Content' : 'Add New Content'}</h2>
//         <div style={styles.formGroup}>
//           <label htmlFor="text" style={styles.label}>
//             Content Text:
//           </label>
//           <textarea
//             id="text"
//             name="text"
//             value={formData.text}
//             onChange={handleInputChange}
//             placeholder="Enter topbar content text..."
//             rows="3"
//             required
//             style={styles.textarea}
//           />
//         </div>
//         <div style={styles.formActions}>
//           <button 
//             type="submit" 
//             style={{ ...styles.btn, ...styles.btnPrimary }}
//             onMouseOver={(e) => e.target.style.backgroundColor = btnHover.btnPrimaryHover.backgroundColor}
//             onMouseOut={(e) => e.target.style.backgroundColor = styles.btnPrimary.backgroundColor}
//           >
//             {editingContent ? 'Update' : 'Create'}
//           </button>
//           {editingContent && (
//             <button 
//               type="button" 
//               onClick={cancelEdit}
//               style={{ ...styles.btn, ...styles.btnSecondary }}
//               onMouseOver={(e) => e.target.style.backgroundColor = btnHover.btnSecondaryHover.backgroundColor}
//               onMouseOut={(e) => e.target.style.backgroundColor = styles.btnSecondary.backgroundColor}
//             >
//               Cancel
//             </button>
//           )}
//         </div>
//       </form>

//       {/* Content List */}
//       <div style={styles.contentList}>
//         <h2>Existing Contents</h2>
//         {loading ? (
//           <div style={styles.loading}>Loading...</div>
//         ) : contents.length === 0 ? (
//           <div style={styles.emptyState}>
//             No content found. Create your first topbar content!
//           </div>
//         ) : (
//           <div style={styles.contentGrid}>
//             {contents.map((content) => (
//               <div key={content.id} style={styles.contentCard}>
//                 <div style={styles.contentText}>{content.text}</div>
//                 <div style={styles.contentMeta}>
//                   <small style={styles.metaText}>
//                     Created: {new Date(content.created_at).toLocaleDateString()}
//                   </small>
//                   <small style={styles.metaText}>
//                     Updated: {new Date(content.updated_at).toLocaleDateString()}
//                   </small>
//                 </div>
//                 <div style={styles.contentActions}>
//                   <button
//                     onClick={() => startEdit(content)}
//                     style={{ ...styles.btn, ...styles.btnEdit, flex: 1 }}
//                     onMouseOver={(e) => e.target.style.backgroundColor = btnHover.btnEditHover.backgroundColor}
//                     onMouseOut={(e) => e.target.style.backgroundColor = styles.btnEdit.backgroundColor}
//                   >
//                     Edit
//                   </button>
//                   <button
//                     onClick={() => handleDelete(content.id)}
//                     style={{ ...styles.btn, ...styles.btnDelete, flex: 1 }}
//                     onMouseOver={(e) => e.target.style.backgroundColor = btnHover.btnDeleteHover.backgroundColor}
//                     onMouseOut={(e) => e.target.style.backgroundColor = styles.btnDelete.backgroundColor}
//                   >
//                     Delete
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Responsive styles for mobile */}
//       <style>
//         {`
//           @media (max-width: 768px) {
//             .content-grid {
//               grid-template-columns: 1fr !important;
//             }
            
//             .content-meta {
//               flex-direction: column;
//               gap: 5px;
//             }
            
//             .form-actions {
//               flex-direction: column;
//             }
            
//             button {
//               width: 100%;
//             }
//           }
//         `}
//       </style>
//     </div>
//   );
// };

// export default TopbarAdmin;

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');

const TopbarAdmin = () => {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [formData, setFormData] = useState({ text: '' });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [cap, setcap] = useState('');

  // Telephone state
  const [telephoneData, setTelephoneData] = useState({
    phone_number: '',
    icon_name: ''
  });
  const [telephoneLoading, setTelephoneLoading] = useState(false);
  const [telephoneSaving, setTelephoneSaving] = useState(false);

  // Axios instance with credentials
  const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Show message helper
  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  // Fetch all contents
  const fetchContents = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/topbar');
      if (response.data.success) {
        setContents(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching contents:', error);
      showMessage('Error fetching contents', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch telephone data
  const fetchTelephoneData = async () => {
    setTelephoneLoading(true);
    try {
      const response = await api.get('/api/telephone');
      if (response.data.success) {
        setTelephoneData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching telephone data:', error);
      showMessage('Error fetching telephone data', 'error');
    } finally {
      setTelephoneLoading(false);
    }
  };

  // Update telephone data
  const updateTelephoneData = async (e) => {
    e.preventDefault();
    
    if (!telephoneData.phone_number.trim() || !telephoneData.icon_name.trim()) {
      showMessage('Phone number and icon name are required', 'error');
      return;
    }

    setTelephoneSaving(true);
    try {
      const response = await api.put('/api/telephone', telephoneData);
      if (response.data.success) {
        showMessage('Telephone data updated successfully!');
        setTelephoneData(response.data.data);
      }
    } catch (error) {
      console.error('Error updating telephone data:', error);
      showMessage('Error updating telephone data', 'error');
    } finally {
      setTelephoneSaving(false);
    }
  };

  useEffect(() => {
    fetchContents();
    fetchTelephoneData();
  }, []);

  // Handle form input change
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle telephone input change
  const handleTelephoneChange = (field, value) => {
    setTelephoneData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Create new content
  const handleCreate = async (e) => {
    e.preventDefault();
    if (cap) {
      console.log('bot detected');
      setcap('');
      return;
    }

    if (!formData.text.trim()) {
      showMessage('Text content is required', 'error');
      return;
    }

    try {
      const response = await api.post('/api/topbar', formData);
      if (response.data.success) {
        showMessage('Content Created Successfully!');
        setFormData({ text: '' });
        fetchContents();
      }
    } catch (error) {
      console.error('Error Creating Content:', error);
      showMessage('Error Creating Content', 'error');
    }
  };

  // Update content
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.text.trim()) {
      showMessage('Text Content is Required', 'error');
      return;
    }

    try {
      const response = await api.put(`/api/topbar/${editingContent.id}`, formData);
      if (response.data.success) {
        showMessage('Content Updated Successfully!');
        setEditingContent(null);
        setFormData({ text: '' });
        fetchContents();
      }
    } catch (error) {
      console.error('Error Updating Content:', error);
      showMessage('Error Updating Content', 'error');
    }
  };

  // Delete content
  const handleDelete = async (id) => {
    if (!window.confirm('Are You Sure You Want to Delete This Content?')) {
      return;
    }

    try {
      const response = await api.delete(`/api/topbar/${id}`);
      if (response.data.success) {
        showMessage('Content Deleted Successfully!');
        fetchContents();
      }
    } catch (error) {
      console.error('Error Deleting Content:', error);
      showMessage('Error Deleting Content', 'error');
    }
  };

  // Start editing
  const startEdit = (content) => {
    setEditingContent(content);
    setFormData({ text: content.text });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingContent(null);
    setFormData({ text: '' });
  };

  // Styles
  const styles = {
    admin: {
      maxWidth: '1240px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Mulish, sans-serif',
    },
    message: {
      padding: '10px',
      margin: '10px 0',
      borderRadius: '4px',
      textAlign: 'center',
    },
    success: {
      backgroundColor: '#d4edda',
      color: '#155724',
      border: '1px solid #c3e6cb',
    },
    error: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      border: '1px solid #f5c6cb',
    },
    form: {
      background: '#f8f9fa',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '30px',
      border: '1px solid #dee2e6',
    },
    formGroup: {
      marginBottom: '15px',
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      fontWeight: 'bold',
      color: '#495057',
    },
    input: {
      width: '100%',
      padding: '10px',
      border: '1px solid #ced4da',
      borderRadius: '4px',
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
    },
    textarea: {
      width: '100%',
      padding: '10px',
      border: '1px solid #ced4da',
      borderRadius: '4px',
      fontSize: '14px',
      resize: 'vertical',
      minHeight: '80px',
      fontFamily: 'Arial, sans-serif',
    },
    formActions: {
      display: 'flex',
      gap: '10px',
    },
    btn: {
      padding: '10px 20px',
      backgroundColor: '#02236e',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'background-color 0.2s',
    },
    btnPrimary: {
      backgroundColor: '#02236e',
      color: 'white',
    },
    btnSecondary: {
      backgroundColor: '#fcdd2d',
      color: '#222222',
    },
    btnEdit: {
      backgroundColor: '#1c5e20',
      color: 'white',
    },
    btnDelete: {
      backgroundColor: '#e7001e',
      color: 'white',
    },
    contentList: {
      marginTop: '30px',
    },
    contentGrid: {
      display: 'grid',
      gap: '20px',
      gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    },
    contentCard: {
      background: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    contentText: {
      fontSize: '14px',
      lineHeight: '1.5',
      color: '#333',
      marginBottom: '15px',
    },
    contentMeta: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '15px',
      paddingTop: '15px',
      borderTop: '1px solid #e9ecef',
    },
    metaCreated: {
      color: '#02236e',
      fontSize: '12px',
    },
    metaUpdated: {
      color: '#009dc8',
      fontSize: '12px',
    },
    contentActions: {
      display: 'flex',
      gap: '10px',
    },
    loading: {
      textAlign: 'center',
      padding: '20px',
      fontSize: '16px',
      color: '#6c757d',
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px',
      color: '#6c757d',
      fontSize: '16px',
    },
    telephonePreview: {
      background: '#e9ecef',
      padding: '15px',
      borderRadius: '6px',
      marginTop: '15px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    telephoneIcon: {
      fontSize: '18px',
      color: '#02236e',
    },
  };

  // Hover effects
  const btnHover = {
    btnPrimaryHover: { backgroundColor: '#0056b3' },
    btnSecondaryHover: { backgroundColor: '#fcdd2d' },
    btnEditHover: { backgroundColor: '#1e7e34' },
    btnDeleteHover: { backgroundColor: '#c82333' },
  };

  return (
    <div style={styles.admin}>
      <h1>Topbar Content Management</h1>
      
      {message && (
        <div style={{
          ...styles.message,
          ...(messageType === 'error' ? styles.error : styles.success)
        }}>
          {message}
        </div>
      )}

      {/* Telephone Section */}
      <form onSubmit={updateTelephoneData} style={styles.form}>
        <h2>Telephone Information</h2>
        <div style={styles.formGroup}>
          <label htmlFor="phone_number" style={styles.label}>
            Phone Number *
          </label>
          <input
            type="text"
            id="phone_number"
            value={(telephoneData.phone_number) ?? ''}
            onChange={(e) => handleTelephoneChange('phone_number', e.target.value)}
            placeholder="Enter Phone Number (e.g., +92 300 1234567)"
            required
            style={styles.input}
            disabled={telephoneLoading}
          />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="icon_name" style={styles.label}>
            Icon Name *
          </label>
          <input
            type="text"
            id="icon_name"
            value={(telephoneData.icon_name) ?? ''}
            onChange={(e) => handleTelephoneChange('icon_name', e.target.value)}
            placeholder="Enter Font Awesome Icon Class (e.g., fa-solid fa-phone)"
            required
            style={styles.input}
            disabled={telephoneLoading}
          />
          <small style={{ color: '#009dc8', fontSize: '12px' }}>
            Use Font Awesome icon classes like "fa-solid fa-phone"
          </small>
        </div>

        {/* Live Preview */}
        {telephoneData.phone_number && telephoneData.icon_name && (
          <div style={styles.telephonePreview}>
            <i className={telephoneData.icon_name} style={styles.telephoneIcon}></i>
            <span>{telephoneData.phone_number}</span>
          </div>
        )}
<br />
        <div style={styles.formActions}>
          <button 
            type="submit" 
            style={{ ...styles.btn  , ...styles.btnPrimary }}
            onMouseOver={(e) => e.target.style.backgroundColor = btnHover.btnPrimaryHover.backgroundColor}
            onMouseOut={(e) => e.target.style.backgroundColor = styles.btnPrimary.backgroundColor}
            disabled={telephoneSaving || telephoneLoading}
          >
            {telephoneSaving ? 'Saving...' : 'Update Telephone'}
          </button>
          <button 
            type="button" 
            onClick={fetchTelephoneData}
            style={{ ...styles.btn, ...styles.btnSecondary }}
            onMouseOver={(e) => e.target.style.backgroundColor = btnHover.btnSecondaryHover.backgroundColor}
            onMouseOut={(e) => e.target.style.backgroundColor = styles.btnSecondary.backgroundColor}
            disabled={telephoneLoading}
          >
            {telephoneLoading ? 'Loading...' : 'Reload Data'}
          </button>
        </div>
      </form>

      {/* Topbar Content Section */}
      <form 
        onSubmit={editingContent ? handleUpdate : handleCreate} 
        style={styles.form}
      >
        <input type="hidden" onChange={(e) => { setcap(e.target.value) }} />
        <h2>{editingContent ? 'Edit Content' : 'Add New Content'}</h2>
        <div style={styles.formGroup}>
          <label htmlFor="text" style={styles.label}>
            Content Text:
          </label>
          <textarea
            id="text"
            name="text"
            value={(formData.text) ?? ''}
            onChange={handleInputChange}
            placeholder="Enter Topbar Content Text..."
            rows="3"
            required
            style={styles.textarea}
          />
        </div>
        <div style={styles.formActions}>
          <button 
            type="submit" 
            style={{ ...styles.btn, ...styles.btnPrimary }}
            onMouseOver={(e) => e.target.style.backgroundColor = btnHover.btnPrimaryHover.backgroundColor}
            onMouseOut={(e) => e.target.style.backgroundColor = styles.btnPrimary.backgroundColor}
          >
            {editingContent ? 'Update' : 'Create'}
          </button>
          {editingContent && (
            <button 
              type="button" 
              onClick={cancelEdit}
              style={{ ...styles.btn, ...styles.btnSecondary }}
              onMouseOver={(e) => e.target.style.backgroundColor = btnHover.btnSecondaryHover.backgroundColor}
              onMouseOut={(e) => e.target.style.backgroundColor = styles.btnSecondary.backgroundColor}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Content List */}
      <div style={styles.contentList}>
        <h2>Existing Contents</h2>
        {loading ? (
          <div style={styles.loading}>Loading...</div>
        ) : contents.length === 0 ? (
          <div style={styles.emptyState}>
            No Content Found. Create your First Topbar Content!
          </div>
        ) : (
          <div style={styles.contentGrid}>
            {contents.map((content) => (
              <div key={content.id} style={styles.contentCard}>
                <div style={styles.contentText}>{content.text}</div>
                <div style={styles.contentMeta}>
                  <small style={styles.metaCreated}>
                    Created: {new Date(content.created_at).toLocaleDateString()}
                  </small>
                  <small style={styles.metaUpdated}>
                    Updated: {new Date(content.updated_at).toLocaleDateString()}
                  </small>
                </div>
                <div style={styles.contentActions}>
                  <button
                    onClick={() => startEdit(content)}
                    style={{ ...styles.btn, ...styles.btnEdit, flex: 1 }}
                    onMouseOver={(e) => e.target.style.backgroundColor = btnHover.btnEditHover.backgroundColor}
                    onMouseOut={(e) => e.target.style.backgroundColor = styles.btnEdit.backgroundColor}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(content.id)}
                    style={{ ...styles.btn, ...styles.btnDelete, flex: 1 }}
                    onMouseOver={(e) => e.target.style.backgroundColor = btnHover.btnDeleteHover.backgroundColor}
                    onMouseOut={(e) => e.target.style.backgroundColor = styles.btnDelete.backgroundColor}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Responsive styles for mobile */}
      <style>
        {`
          @media (max-width: 768px) {
            .content-grid {
              grid-template-columns: 1fr !important;
            }
            
            .content-meta {
              flex-direction: column;
              gap: 5px;
            }
            
            .form-actions {
              flex-direction: column;
            }
            
            button {
              width: 100%;
            }
          }
        `}
      </style>
    </div>
  );
};

export default TopbarAdmin;