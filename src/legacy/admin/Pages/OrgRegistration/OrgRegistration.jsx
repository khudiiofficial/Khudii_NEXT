// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import './OrgRegistartion.css';

// const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');

// const OrgRegistration = () => {
//   const [submissions, setSubmissions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedSubmission, setSelectedSubmission] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [deleteConfirm, setDeleteConfirm] = useState(null);

//   useEffect(() => {
//     fetchSubmissions();
//   }, []);

//   const fetchSubmissions = async () => {
//     try {
//       const response = await axios.get(`${APIPath}/api/admin/submissions`);
//       setSubmissions(response.data.data);
//     } catch (error) {
//       console.error('Error fetching submissions:', error);
//       alert('Failed to fetch submissions');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const viewSubmission = async (id) => {
//     try {
//       const response = await axios.get(`${APIPath}/api/admin/submissions/${id}`);
//       setSelectedSubmission(response.data.data);
//       setShowModal(true);
//     } catch (error) {
//       alert('Failed to fetch submission details');
//     }
//   };

//   const deleteSubmission = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this submission?')) {
//       return;
//     }

//     try {
//       const response = await axios.delete(`${APIPath}/api/admin/submissions/${id}`);
      
//       if (response.data.success) {
//         alert('Submission deleted successfully');
//         fetchSubmissions();
//         if (selectedSubmission?.id === id) {
//           setShowModal(false);
//           setSelectedSubmission(null);
//         }
//       }
//     } catch (error) {
//       alert('Failed to delete submission');
//     }
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleString();
//   };

//   if (loading) {
//     return <div className="loading">Loading...</div>;
//   }

//   return (
//     <div className="admin-panel">
//       <h1>Organization Submissions</h1>
      
//       <div className="submissions-table-container">
//         <table className="submissions-table">
//           <thead>
//             <tr>
//               <th>ID</th>
//               <th>Organization</th>
//               <th>Contact Person</th>
//               <th>Mobile</th>
//               <th>Year</th>
//               <th>Documents</th>
//               <th>Submitted</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {submissions.map((sub) => (
//               <tr key={sub.id}>
//                 <td>{sub.id}</td>
//                 <td>{sub.organization_name}</td>
//                 <td>{sub.contact_person_name}</td>
//                 <td>{sub.contact_person_mobile}</td>
//                 <td>{sub.year_established}</td>
//                 <td>{sub.documents_count || 0}</td>
//                 <td>{formatDate(sub.created_at)}</td>
//                 <td>
//                   <button 
//                     onClick={() => viewSubmission(sub.id)}
//                     className="view-btn"
//                   >
//                     View
//                   </button>
//                   <button 
//                     onClick={() => deleteSubmission(sub.id)}
//                     className="delete-btn"
//                   >
//                     Delete
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* View Modal */}
//       {showModal && selectedSubmission && (
//         <div className="modal-overlay">
//           <div className="modal-content">
//             <div className="modal-header">
//               <h2>Submission Details - {selectedSubmission.organization_name}</h2>
//               <button onClick={() => setShowModal(false)} className="close-btn">×</button>
//             </div>
            
//             <div className="modal-body">
//               <div className="details-section">
//                 <h3>Basic Information</h3>
//                 <p><strong>Organization:</strong> {selectedSubmission.organization_name}</p>
//                 <p><strong>Contact Person:</strong> {selectedSubmission.contact_person_name}</p>
//                 <p><strong>Mobile:</strong> {selectedSubmission.contact_person_mobile}</p>
//                 <p><strong>Landline:</strong> {selectedSubmission.landline_uan || 'N/A'}</p>
//                 <p><strong>Website:</strong> {selectedSubmission.website_url || 'N/A'}</p>
//                 <p><strong>Email:</strong> {selectedSubmission.email_address || 'N/A'}</p>
//               </div>

//               <div className="details-section">
//                 <h3>Social Media</h3>
//                 <p><strong>Facebook:</strong> {selectedSubmission.facebook_link || 'N/A'}</p>
//                 <p><strong>Instagram:</strong> {selectedSubmission.instagram_link || 'N/A'}</p>
//                 <p><strong>YouTube:</strong> {selectedSubmission.youtube_link || 'N/A'}</p>
//                 <p><strong>LinkedIn:</strong> {selectedSubmission.linkedin_link || 'N/A'}</p>
//                 <p><strong>Twitter:</strong> {selectedSubmission.twitter_link || 'N/A'}</p>
//               </div>

//               <div className="details-section">
//                 <h3>Organization Profile</h3>
//                 <p><strong>Year Established:</strong> {selectedSubmission.year_established}</p>
//               </div>

//               <div className="details-section">
//                 <h3>KPIs</h3>
//                 <p><strong>Beneficiaries:</strong> {selectedSubmission.total_beneficiaries_served || 'N/A'}</p>
//                 <p><strong>Projects Completed:</strong> {selectedSubmission.total_projects_completed || 'N/A'}</p>
//                 <p><strong>Active Projects:</strong> {selectedSubmission.active_projects || 'N/A'}</p>
//               </div>

//               <div className="details-section">
//                 <h3>Google Account</h3>
//                 <p><strong>Email:</strong> {selectedSubmission.user_google_email || 'N/A'}</p>
//                 <p><strong>Name:</strong> {selectedSubmission.user_google_name || 'N/A'}</p>
//               </div>

//               {selectedSubmission.organization_logo_path && (
//                 <div className="details-section">
//                   <h3>Organization Logo</h3>
//                   <img 
//                     src={selectedSubmission.organization_logo_path} 
//                     alt="Organization Logo" 
//                     className="logo-image"
//                   />
//                 </div>
//               )}

//               {selectedSubmission.documents?.length > 0 && (
//                 <div className="details-section">
//                   <h3>Supporting Documents</h3>
//                   <ul className="document-list">
//                     {selectedSubmission.documents.map((doc, index) => (
//                       <li key={index}>
//                         <a href={doc.file_path} target="_blank" rel="noopener noreferrer">
//                           {doc.file_name || `Document ${index + 1}`}
//                         </a>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               )}

//               <div className="details-section">
//                 <h3>Metadata</h3>
//                 <p><strong>Submitted:</strong> {formatDate(selectedSubmission.created_at)}</p>
//                 <p><strong>Last Updated:</strong> {formatDate(selectedSubmission.updated_at)}</p>
//               </div>
//             </div>

//             <div className="modal-footer">
//               <button onClick={() => setShowModal(false)} className="close-modal-btn">Close</button>
//               <button 
//                 onClick={() => deleteSubmission(selectedSubmission.id)} 
//                 className="delete-modal-btn"
//               >
//                 Delete Submission
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default OrgRegistration;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './OrgRegistartion.css';

const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');

const OrgRegistration = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await axios.get(`${APIPath}/api/admin/submissions`);
      setSubmissions(response.data.data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      alert('Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  const viewSubmission = async (id) => {
    try {
      const response = await axios.get(`${APIPath}/api/admin/submissions/${id}`);
      setSelectedSubmission(response.data.data);
      setShowModal(true);
    } catch (error) {
      alert('Failed to fetch submission details');
    }
  };

  const deleteSubmission = async (id) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) {
      return;
    }

    try {
      const response = await axios.delete(`${APIPath}/api/admin/submissions/${id}`);
      
      if (response.data.success) {
        alert('Submission deleted successfully');
        fetchSubmissions();
        if (selectedSubmission?.id === id) {
          setShowModal(false);
          setSelectedSubmission(null);
        }
      }
    } catch (error) {
      alert('Failed to delete submission');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

//   Function to download logo
  const downloadLogo = (imageUrl, organizationName) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.target='blank'
    link.download = `${organizationName.replace(/\s+/g, '_')}_logo.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-panel">
      <h1>Organization Submissions</h1>
      
      <div className="submissions-table-container">
        <table className="submissions-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Organization</th>
              <th>Contact Person</th>
              <th>Mobile</th>
              <th>Year</th>
              <th>Documents</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((sub) => (
              <tr key={sub.id}>
                <td>{sub.id}</td>
                <td>{sub.organization_name}</td>
                <td>{sub.contact_person_name}</td>
                <td>{sub.contact_person_mobile}</td>
                <td>{sub.year_established}</td>
                <td>{sub.documents_count || 0}</td>
                <td>{formatDate(sub.created_at)}</td>
                <td>
                  <button 
                    onClick={() => viewSubmission(sub.id)}
                    className="view-btn"
                  >
                    View
                  </button>
                  <button 
                    onClick={() => deleteSubmission(sub.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {showModal && selectedSubmission && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Submission Details - {selectedSubmission.organization_name}</h2>
              <button onClick={() => setShowModal(false)} className="close-btn">×</button>
            </div>
            
            <div className="modal-body">
              <div className="details-section">
                <h3>Basic Information</h3>
                <p><strong>Organization:</strong> {selectedSubmission.organization_name}</p>
                <p><strong>Contact Person:</strong> {selectedSubmission.contact_person_name}</p>
                <p><strong>Mobile:</strong> {selectedSubmission.contact_person_mobile}</p>
                <p><strong>Landline:</strong> {selectedSubmission.landline_uan || 'N/A'}</p>
                <p><strong>Website:</strong> {selectedSubmission.website_url || 'N/A'}</p>
                <p><strong>Email:</strong> {selectedSubmission.email_address || 'N/A'}</p>
              </div>

              <div className="details-section">
                <h3>Social Media</h3>
                <p><strong>Facebook:</strong> {selectedSubmission.facebook_link || 'N/A'}</p>
                <p><strong>Instagram:</strong> {selectedSubmission.instagram_link || 'N/A'}</p>
                <p><strong>YouTube:</strong> {selectedSubmission.youtube_link || 'N/A'}</p>
                <p><strong>LinkedIn:</strong> {selectedSubmission.linkedin_link || 'N/A'}</p>
                <p><strong>Twitter:</strong> {selectedSubmission.twitter_link || 'N/A'}</p>
              </div>

              <div className="details-section">
                <h3>Organization Profile</h3>
                <p><strong>Year Established:</strong> {selectedSubmission.year_established}</p>
              </div>

              <div className="details-section">
                <h3>KPIs</h3>
                <p><strong>Beneficiaries:</strong> {selectedSubmission.total_beneficiaries_served || 'N/A'}</p>
                <p><strong>Projects Completed:</strong> {selectedSubmission.total_projects_completed || 'N/A'}</p>
                <p><strong>Active Projects:</strong> {selectedSubmission.active_projects || 'N/A'}</p>
              </div>

              <div className="details-section">
                <h3>Google Account</h3>
                <p><strong>Email:</strong> {selectedSubmission.user_google_email || 'N/A'}</p>
                <p><strong>Name:</strong> {selectedSubmission.user_google_name || 'N/A'}</p>
              </div>

              {selectedSubmission.organization_logo_path && (
                <div className="details-section">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0 }}>Organization Logo</h3>
                   
                  </div>
                  <div className='flex items-end justify-between flex-wrap'>
                  <img 
                    src={selectedSubmission.organization_logo_path} 
                    alt="Organization Logo" 
                    className="logo-image"
                  />
                   <button 
                      onClick={() => downloadLogo(selectedSubmission.organization_logo_path, selectedSubmission.organization_name)}
                      className="download-btn"
                    >
                      Open in new tab to Download Logo
                    </button>
                    </div>
                </div>
              )}

              {selectedSubmission.documents?.length > 0 && (
                <div className="details-section">
                  <h3>Supporting Documents</h3>
                  <ul className="document-list">
                    {selectedSubmission.documents.map((doc, index) => (
                      <li key={index}>
                        <a href={doc.file_path} target="_blank" rel="noopener noreferrer">
                          {doc.file_name || `Document ${index + 1}`}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="details-section">
                <h3>Metadata</h3>
                <p><strong>Submitted:</strong> {formatDate(selectedSubmission.created_at)}</p>
                <p><strong>Last Updated:</strong> {formatDate(selectedSubmission.updated_at)}</p>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowModal(false)} className="close-modal-btn">Close</button>
              <button 
                onClick={() => deleteSubmission(selectedSubmission.id)} 
                className="delete-modal-btn"
              >
                Delete Submission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgRegistration;