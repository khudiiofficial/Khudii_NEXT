import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from './ContentAdmin.module.css';

const API_URL = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');

const ContentAdmin = () => {
  const [contentData, setContentData] = useState({
    who_we_are: {},
    dream_and_purpose: {},
    impact: {},
    ceo: {},
    people_behind: {},
    expert_team: [],
    join_us: {},
    new_section: []
  });
   const [cap,setcap]=useState('')


  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('who_we_are');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loader,setlaoder]=useState(false)
const [show,setshow]=useState('image')
  // Expert Team states
  const [editingExpert, setEditingExpert] = useState(null);
  const [expertForm, setExpertForm] = useState({
    name: '',
    position: '',
    description: '',
    image_alt: '',
    sort_order: 0,
    imageFile: null
  });
  const [expertPreview, setExpertPreview] = useState('');

  // New Section states
  const [editingNewSection, setEditingNewSection] = useState(null);
  const [newSectionForm, setNewSectionForm] = useState({
    heading: '',
    paragraphs: [''],
    bullets_header: '',
    bullets: [''],
    youtube_video_id: '',
    imageFile: null
  });
  const [newSectionPreview, setNewSectionPreview] = useState('');

  const fileInputRefs = useRef({});

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

  // Fetch all content
  const fetchAllContent = async () => {
    setLoading(true);
    setExpertPreview('')
    setExpertForm((pre)=>{
      return {...pre,
        imageFile:null
      }
    })
    setNewSectionPreview('')
    setNewSectionForm((pre)=>{
      return {...pre,
        imageFile:null
      }
    })
    try {
      const response = await api.get('/api/content');
      if (response.data.success) {
        setContentData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      showMessage('Error fetching content', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Update single instance sections
  const updateSection = async (section, data) => {
    setSaving(true);
     if(cap){
      console.log('bot detected')
setcap('')
      return
    }


    try {
      let updateData = { ...data };
      
      // Handle image upload if present
      if (data.imageBase64) {
        updateData.imageBase64 = data.imageBase64;
      }

      // Handle bullets array
      if (data.bullets && Array.isArray(data.bullets)) {
        updateData.bullets = data.bullets;
      }

      const response = await api.put(`/api/content/section/${section}`, updateData);
      if (response.data.success) {
        showMessage(`${section.replace(/_/g, ' ')} updated successfully!`);
        fetchAllContent();
        return true;
      }
    } catch (error) {
      console.error(`Error updating ${section}:`, error);
      showMessage(`Error updating ${section}`, 'error');
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Expert Team CRUD
  const createExpertTeam = async (e) => {
    e.preventDefault();
     if(cap){
      console.log('bot detected')
setcap('')
      return
    }


    setlaoder(true)
    try {
      let imageBase64 = null;
      if (expertForm.imageFile) {
        imageBase64 = await fileToBase64(expertForm.imageFile);
      }

      const response = await api.post('/api/content/expert-team', {
        ...expertForm,
        imageBase64
      });

      if (response.data.success) {
        showMessage('Expert team member created successfully!');
        resetExpertForm();
        fetchAllContent();
      }
    } catch (error) {
      console.error('Error creating expert team member:', error);
      showMessage('Error creating expert team member', 'error');
    }
     setlaoder(false)
  };

  const updateExpertTeam = async (e) => {
     setlaoder(true)
    e.preventDefault();
     if(cap){
      console.log('bot detected')
setcap('')
      return
    }


    try {
      let imageBase64 = null;
      if (expertForm.imageFile) {
        imageBase64 = await fileToBase64(expertForm.imageFile);
      }

      const response = await api.put(`/api/content/expert-team/${editingExpert.id}`, {
        ...expertForm,
        imageBase64
      });

      if (response.data.success) {
        showMessage('Expert team member updated successfully!');
        resetExpertForm();
        fetchAllContent();
      }
    } catch (error) {
      console.error('Error updating expert team member:', error);
      showMessage('Error updating expert team member', 'error');
    }
     setlaoder(false)
  };

  const deleteExpertTeam = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expert team member?')) return;

    try {
      const response = await api.delete(`/api/content/expert-team/${id}`);
      if (response.data.success) {
        showMessage('Expert team member deleted successfully!');
        fetchAllContent();
      }
    } catch (error) {
      console.error('Error deleting expert team member:', error);
      showMessage('Error deleting expert team member', 'error');
    }
  };

  // New Section CRUD
  const createNewSection = async (e) => {
    e.preventDefault();
     if(cap){
      console.log('bot detected')
setcap('')
      return
    }


    try {
      let imageBase64 = null;
      if (newSectionForm.imageFile) {
        imageBase64 = await fileToBase64(newSectionForm.imageFile);
      }

      const response = await api.post('/api/content/new-section', {
        ...newSectionForm,
        imageBase64
      });

      if (response.data.success) {
        showMessage('New section created successfully!');
        resetNewSectionForm();
        fetchAllContent();
      }
    } catch (error) {
      console.error('Error creating new section:', error);
      showMessage('Error creating new section', 'error');
    }
  };

  const updateNewSection = async (e) => {
    e.preventDefault();
     if(cap){
      console.log('bot detected')
setcap('')
      return
    }


    try {
      let imageBase64 = null;
      if (newSectionForm.imageFile) {
        imageBase64 = await fileToBase64(newSectionForm.imageFile);
      }

      const response = await api.put(`/api/content/new-section/${editingNewSection.id}`, {
        ...newSectionForm,
        imageBase64
      });

      if (response.data.success) {
        showMessage('New section updated successfully!');
        resetNewSectionForm();
        fetchAllContent();
      }
    } catch (error) {
      console.error('Error updating new section:', error);
      showMessage('Error updating new section', 'error');
    }
  };

  const deleteNewSection = async (id) => {
    if (!window.confirm('Are you sure you want to delete this section?')) return;

    try {
      const response = await api.delete(`/api/content/new-section/${id}`);
      if (response.data.success) {
        showMessage('Section deleted successfully!');
        fetchAllContent();
      }
    } catch (error) {
      console.error('Error deleting section:', error);
      showMessage('Error deleting section', 'error');
    }
  };

  // Helper functions
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileSelect = (section, field, event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      if (section === 'expert') {
        setExpertForm(prev => ({ ...prev, [field]: file }));
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => setExpertPreview(e.target.result);
        reader.readAsDataURL(file);
      } else if (section === 'newSection') {
        setNewSectionForm(prev => ({ ...prev, [field]: file }));
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => setNewSectionPreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        // For single instance sections
        const reader = new FileReader();
        reader.onload = (e) => {
          handleSectionChange(section, 'imageBase64', e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSectionChange = (section, field, value) => {
    setContentData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleExpertChange = (field, value) => {
    setExpertForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNewSectionChange = (field, value) => {
    setNewSectionForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addArrayItem = (section, field) => {
    if (section === 'newSection') {
      setNewSectionForm(prev => ({
        ...prev,
        [field]: [...prev[field], '']
      }));
    } else {
      setContentData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: [...(prev[section][field] || []), '']
        }
      }));
    }
  };

  const updateArrayItem = (section, field, index, value) => {
    if (section === 'newSection') {
      setNewSectionForm(prev => {
        const newArray = [...prev[field]];
        newArray[index] = value;
        return { ...prev, [field]: newArray };
      });
    } else {
      setContentData(prev => {
        const newArray = [...(prev[section][field] || [])];
        newArray[index] = value;
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: newArray
          }
        };
      });
    }
  };

  const removeArrayItem = (section, field, index) => {
    if (section === 'newSection') {
      setNewSectionForm(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    } else {
      setContentData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: (prev[section][field] || []).filter((_, i) => i !== index)
        }
      }));
    }
  };

  const resetExpertForm = () => {
    setExpertForm({
      name: '',
      position: '',
      description: '',
      image_alt: '',
      sort_order: 0,
      imageFile: null
    });
    setExpertPreview('');
    setEditingExpert(null);
    if (fileInputRefs.current.expert) {
      fileInputRefs.current.expert.value = '';
    }
  };

  const resetNewSectionForm = () => {
    setNewSectionForm({
      heading: '',
      paragraphs: [''],
      bullets_header: '',
      bullets: [''],
      youtube_video_id: '',
      imageFile: null
    });
    setNewSectionPreview('');
    setEditingNewSection(null);
    if (fileInputRefs.current.newSection) {
      fileInputRefs.current.newSection.value = '';
    }
  };

  const startEditExpert = (expert) => {
    setEditingExpert(expert);
    setExpertForm({
      name: expert.name,
      position: expert.position,
      description: expert.description,
      image_alt: expert.image_alt,
      sort_order: expert.sort_order,
      imageFile: null
    });
    setExpertPreview(expert.image_path || '');
  };

  const startEditNewSection = (section) => {
    setEditingNewSection(section);
    setNewSectionForm({
      heading: section.heading,
      paragraphs: Array.isArray(section.paragraphs) ? section.paragraphs : [section.paragraphs || ''],
      bullets_header: section.bullets_header,
      bullets: Array.isArray(section.bullets) ? section.bullets : [section.bullets || ''],
      youtube_video_id: section.youtube_video_id,
      imageFile: null
    });
    setNewSectionPreview(section.image_path || '');
  };

  // YouTube Preview Component
  const YouTubePreview = ({ videoId }) => {
    if (!videoId) return null;
    
    return (
      <div className={styles.youtubePreview}>
        <h4>YouTube Preview:</h4>
        <iframe
          width="100%"
          height="315"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  };

  useEffect(() => {
    fetchAllContent();
  }, []);

  // Render sections based on active section
  const renderSectionContent = () => {
    const section = contentData[activeSection];
    if (!section) return null;

    switch (activeSection) {
      case 'who_we_are':
      case 'impact':
      case 'people_behind':
        return (
          <div className={styles.sectionForm}>
            <div className={styles.formGroup}>
                 <input type="hidden" onChange={(e)=>{setcap(e.target.value)}} />



              <label>Heading</label>
              <input
                type="text"
                value={section.heading || ''}
                onChange={(e) => handleSectionChange(activeSection, 'heading', e.target.value)}
                placeholder="Enter Heading"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Paragraph 1</label>
              <textarea
                value={section.paragraph1 || ''}
                onChange={(e) => handleSectionChange(activeSection, 'paragraph1', e.target.value)}
                rows="4"
                placeholder="Enter first paragraph"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Paragraph 2</label>
              <textarea
                value={section.paragraph2 || ''}
                onChange={(e) => handleSectionChange(activeSection, 'paragraph2', e.target.value)}
                rows="4"
                placeholder="Enter second paragraph"
              />
            </div>
            {activeSection === 'who_we_are' && (
              <>
                <div className={styles.formGroup}>
                  <label>YouTube Video ID</label>
                  <input
                    type="text"
                    value={section.youtube_video_id || ''}
                    onChange={(e) => handleSectionChange(activeSection, 'youtube_video_id', e.target.value)}
                    placeholder="Enter YouTube video ID"
                  />
                </div>
                <YouTubePreview videoId={section.youtube_video_id} />
              </>
            )}
            {activeSection === 'impact' && (
              <div className={styles.formGroup}>
                <label>Paragraph 3</label>
                <textarea
                  value={section.paragraph3 || ''}
                  onChange={(e) => handleSectionChange(activeSection, 'paragraph3', e.target.value)}
                  rows="4"
                  placeholder="Enter third paragraph"
                />
              </div>
            )}
          </div>
        );

      case 'dream_and_purpose':
      case 'join_us':
        return (
          <div className={styles.sectionForm}>
            <div className={styles.formGroup}>
                 <input type="hidden" onChange={(e)=>{setcap(e.target.value)}} />



              <label>Heading</label>
              <input
                type="text"
                value={section.heading || ''}
                onChange={(e) => handleSectionChange(activeSection, 'heading', e.target.value)}
                placeholder="Enter heading"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Paragraph</label>
              <textarea
                value={section.paragraph || ''}
                onChange={(e) => handleSectionChange(activeSection, 'paragraph', e.target.value)}
                rows="4"
                placeholder="Enter paragraph"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Bullets Header</label>
              <input
                type="text"
                value={section.bullets_header || ''}
                onChange={(e) => handleSectionChange(activeSection, 'bullets_header', e.target.value)}
                placeholder="Enter bullets header"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Bullets</label>
              {(section.bullets ? JSON.parse(section.bullets) : []).map((bullet, index) => (
                <div key={index} className={styles.arrayItem}>
                  <input
                    type="text"
                    value={(bullet) ?? ''}
                    onChange={(e) => {
                      const newBullets = [...JSON.parse(section.bullets || '[]')];
                      newBullets[index] = e.target.value;
                      handleSectionChange(activeSection, 'bullets', JSON.stringify(newBullets));
                    }}
                    placeholder="Enter bullet point"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newBullets = JSON.parse(section.bullets || '[]').filter((_, i) => i !== index);
                      handleSectionChange(activeSection, 'bullets', JSON.stringify(newBullets));
                    }}
                    className={styles.removeBtn}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const currentBullets = JSON.parse(section.bullets || '[]');
                  handleSectionChange(activeSection, 'bullets', JSON.stringify([...currentBullets, '']));
                }}
                className={styles.addBtn}
              >
                Add Bullet
              </button>
            </div>
            {activeSection === 'dream_and_purpose' && (
              <div className={styles.formGroup}>
                <label>Conclusion</label>
                <textarea
                  value={section.conclusion || ''}
                  onChange={(e) => handleSectionChange(activeSection, 'conclusion', e.target.value)}
                  rows="3"
                  placeholder="Enter conclusion"
                />
              </div>
            )}
            {activeSection === 'join_us' && (
              <>
                <div className={styles.formGroup}>
                  <label>Paragraph 2</label>
                  <textarea
                    value={section.paragraph2 || ''}
                    onChange={(e) => handleSectionChange(activeSection, 'paragraph2', e.target.value)}
                    rows="3"
                    placeholder="Enter second paragraph"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Paragraph 3</label>
                  <textarea
                    value={section.paragraph3 || ''}
                    onChange={(e) => handleSectionChange(activeSection, 'paragraph3', e.target.value)}
                    rows="3"
                    placeholder="Enter third paragraph"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>YouTube Video ID</label>
                  <input
                    type="text"
                    value={section.youtube_video_id || ''}
                    onChange={(e) => handleSectionChange(activeSection, 'youtube_video_id', e.target.value)}
                    placeholder="Enter YouTube video ID"
                  />
                </div>
                <YouTubePreview videoId={section.youtube_video_id} />
              </>
            )}
          </div>
        );

      case 'ceo':
        return (
          <div className={styles.sectionForm}>
            <div className={styles.formGroup}>
                 <input type="hidden" onChange={(e)=>{setcap(e.target.value)}} />



              <label>Name</label>
              <input
                type="text"
                value={section.name || ''}
                onChange={(e) => handleSectionChange(activeSection, 'name', e.target.value)}
                placeholder="Enter CEO name"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Title</label>
              <input
                type="text"
                value={section.title || ''}
                onChange={(e) => handleSectionChange(activeSection, 'title', e.target.value)}
                placeholder="Enter CEO title"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(activeSection, 'image', e)}
              />
              {(section.image_path || section.imageBase64) && (
                <div className={styles.imagePreview}>
                  <h4>Image Preview:</h4>
                  <img src={section.imageBase64 || section.image_path} alt="CEO Preview" />
                </div>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>Paragraph 1</label>
              <textarea
                value={section.paragraph1 || ''}
                onChange={(e) => handleSectionChange(activeSection, 'paragraph1', e.target.value)}
                rows="3"
                placeholder="Enter first paragraph"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Paragraph 2</label>
              <textarea
                value={section.paragraph2 || ''}
                onChange={(e) => handleSectionChange(activeSection, 'paragraph2', e.target.value)}
                rows="3"
                placeholder="Enter second paragraph"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Paragraph 3</label>
              <textarea
                value={section.paragraph3 || ''}
                onChange={(e) => handleSectionChange(activeSection, 'paragraph3', e.target.value)}
                rows="3"
                placeholder="Enter third paragraph"
              />
            </div>
          </div>
        );

      case 'expert_team':
        return (
          <div className={styles.crudSection}>
            <form onSubmit={editingExpert ? updateExpertTeam : createExpertTeam} className={styles.crudForm}>
                <input type="hidden" onChange={(e)=>{setcap(e.target.value)}} />



              <h3>{editingExpert ? 'Edit Expert' : 'Add New Expert'}</h3>
              
              <div className={styles.formGroup}>
                <label>Name *</label>
                <input
                  type="text"
                  value={(expertForm.name) ?? ''}
                  onChange={(e) => handleExpertChange('name', e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Position *</label>
                <input
                  type="text"
                  value={(expertForm.position) ?? ''}
                  onChange={(e) => handleExpertChange('position', e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Description *</label>
                <textarea
                  value={(expertForm.description) ?? ''}
                  onChange={(e) => handleExpertChange('description', e.target.value)}
                  rows="3"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Image Alt Text</label>
                <input
                  type="text"
                  value={(expertForm.image_alt) ?? ''}
                  onChange={(e) => handleExpertChange('image_alt', e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Sort Order</label>
                <input
                  type="number"
                  value={(expertForm.sort_order) ?? ''}
                  onChange={(e) => handleExpertChange('sort_order', parseInt(e.target.value))}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Image</label>
                <input
                  type="file"
                  ref={el => fileInputRefs.current.expert = el}
                  accept="image/*"
                  onChange={(e) => handleFileSelect('expert', 'imageFile', e)}
                />
                {(expertPreview || expertForm.imageFile) && (
                  <div className={styles.imagePreview}>
                    <h4>Image Preview:</h4>
                    <img src={expertPreview} alt="Expert Preview" />
                  </div>
                )}
              </div>

              <div className={styles.formActions}>
                <button type="submit" disabled={loader} className={styles.primaryBtn}>
                  {loader && editingExpert?'updating' :loader && !editingExpert? 'Adding' :!loader && editingExpert ? 'Update Expert' : 'Add Expert'}
                </button>
                {editingExpert && (
                  <button type="button" onClick={resetExpertForm} className={styles.secondaryBtn}>
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className={styles.itemsList}>
              <h3>Expert Team Members ({contentData.expert_team.length})</h3>
              {[...contentData.expert_team].reverse().map((expert) => (
                <div key={expert.id} className={styles.itemCard}>
                  <div className={styles.itemContent}>
                    <h4>{expert.name}</h4>
                    <p className={styles.position}>{expert.position}</p>
                    <p className={styles.description}>{expert.description}</p>
                    {expert.image_path && (
                      <div className={styles.imagePreview}>
                        <h5>Current Image:</h5>
                        <img src={expert.image_path} alt={expert.image_alt} />
                      </div>
                    )}
                  </div>
                  <div className={styles.itemActions}>
                    <button onClick={() => startEditExpert(expert)} className={styles.editBtn}>
                      Edit
                    </button>
                    <button onClick={() => deleteExpertTeam(expert.id)} className={styles.deleteBtn}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

//       case 'new_section':
//         return (
//           <div className={styles.crudSection}>
//             <form onSubmit={editingNewSection ? updateNewSection : createNewSection} className={styles.crudForm}>
//               <h3>{editingNewSection ? 'Edit Section' : 'Add New Section'}</h3>
              
//               <div className={styles.formGroup}>
//                 <label>Heading *</label>
//                 <input
//                   type="text"
//                   value={newSectionForm.heading}
//                   onChange={(e) => handleNewSectionChange('heading', e.target.value)}
//                   required
//                 />
//               </div>

//               <div className={styles.formGroup}>
//                 <label>Paragraphs</label>
//                 {newSectionForm.paragraphs.map((paragraph, index) => (
//                   <div key={index} className={styles.arrayItem}>
//                     <textarea
//                       value={paragraph}
//                       onChange={(e) => {
//                         const newParagraphs = [...newSectionForm.paragraphs];
//                         newParagraphs[index] = e.target.value;
//                         handleNewSectionChange('paragraphs', newParagraphs);
//                       }}
//                       rows="2"
//                       placeholder="Enter paragraph"
//                     />
//                     {newSectionForm.paragraphs.length > 1 && (
//                       <button
//                         type="button"
//                         onClick={() => removeArrayItem('newSection', 'paragraphs', index)}
//                         className={styles.removeBtn}
//                       >
//                         Remove
//                       </button>
//                     )}
//                   </div>
//                 ))}
//                 <button
//                   type="button"
//                   onClick={() => addArrayItem('newSection', 'paragraphs')}
//                   className={styles.addBtn}
//                 >
//                   Add Paragraph
//                 </button>
//               </div>

//               <div className={styles.formGroup}>
//                 <label>Bullets Header</label>
//                 <input
//                   type="text"
//                   value={newSectionForm.bullets_header}
//                   onChange={(e) => handleNewSectionChange('bullets_header', e.target.value)}
//                 />
//               </div>

//               <div className={styles.formGroup}>
//                 <label>Bullets</label>
//                 {newSectionForm.bullets.map((bullet, index) => (
//                   <div key={index} className={styles.arrayItem}>
//                     <input
//                       type="text"
//                       value={bullet}
//                       onChange={(e) => {
//                         const newBullets = [...newSectionForm.bullets];
//                         newBullets[index] = e.target.value;
//                         handleNewSectionChange('bullets', newBullets);
//                       }}
//                       placeholder="Enter bullet point"
//                     />
//                     {newSectionForm.bullets.length > 1 && (
//                       <button
//                         type="button"
//                         onClick={() => removeArrayItem('newSection', 'bullets', index)}
//                         className={styles.removeBtn}
//                       >
//                         Remove
//                       </button>
//                     )}
//                   </div>
//                 ))}
//                 <button
//                   type="button"
//                   onClick={() => addArrayItem('newSection', 'bullets')}
//                   className={styles.addBtn}
//                 >
//                   Add Bullet
//                 </button>
//               </div>
// <br />
// Choose: <br />
// <div className='flex items-center justify-center gap-2'>
// <div className='flex items-center justify-items-end gap-2'>
// <label htmlFor="img">image</label>
// <input  type="radio" onChange={(e)=>{setshow(e.target.value)}} checked={show==='image'} value={'image'} name="choose" id="img" />
// </div>
// <div className='flex items-center justify-items-end gap-2'>
// <label htmlFor="ved">Youtube vedio</label>
// <input type="radio" onChange={(e)=>{setshow(e.target.value)}}  value={'vedio'} name="choose" id="ved" />
// </div>
// </div>

// {show==='vedio'&&
//               <div className={styles.formGroup}>
//                 <label>YouTube Video ID</label>
//                 <input
//                   type="text"
//                   value={newSectionForm.youtube_video_id}
//                   onChange={(e) => handleNewSectionChange('youtube_video_id', e.target.value)}
//                 />
//                 <YouTubePreview videoId={newSectionForm.youtube_video_id} />
//               </div>

// }

//         {    show==='image'&&  <div className={styles.formGroup}>
//                 <label>Image</label>
//                 <input
//                   type="file"
//                   ref={el => fileInputRefs.current.newSection = el}
//                   accept="image/*"
//                   onChange={(e) => handleFileSelect('newSection', 'imageFile', e)}
//                 />
//                 {(newSectionPreview || newSectionForm.imageFile) && (
//                   <div className={styles.imagePreview}>
//                     <h4>Image Preview:</h4>
//                     <img src={newSectionPreview} alt="Section Preview" />
//                   </div>
//                 )}
//               </div>
//               }

//               <div className={styles.formActions}>
//                 <button type="submit" className={styles.primaryBtn}>
//                   {editingNewSection ? 'Update Section' : 'Add Section'}
//                 </button>
//                 {editingNewSection && (
//                   <button type="button" onClick={resetNewSectionForm} className={styles.secondaryBtn}>
//                     Cancel
//                   </button>
//                 )}
//               </div>
//             </form>

//             <div className={styles.itemsList}>
//               <h3>New Sections ({contentData.new_section.length})</h3>
//               {contentData.new_section.map((section) => (
//                 <div key={section.id} className={styles.itemCard}>
//                   <div className={styles.itemContent}>
//                     <h4>{section.heading}</h4>
//                     <p>{Array.isArray(section.paragraphs) ? section.paragraphs[0] : section.paragraphs}</p>
//                     {section.youtube_video_id && (
//                       <YouTubePreview videoId={section.youtube_video_id} />
//                     )}
//                     {section.image_path && (
//                       <div className={styles.imagePreview}>
//                         <h5>Current Image:</h5>
//                         <img src={section.image_path} alt={section.heading} />
//                       </div>
//                     )}
//                   </div>
//                   <div className={styles.itemActions}>
//                     <button onClick={() => startEditNewSection(section)} className={styles.editBtn}>
//                       Edit
//                     </button>
//                     <button onClick={() => deleteNewSection(section.id)} className={styles.deleteBtn}>
//                       Delete
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         );

//  
      default:
        return null;
    }
  };

  const sectionTitles = {
    who_we_are: 'Who We Are',
    dream_and_purpose: 'Dream & Purpose',
    impact: 'Impact',
    ceo: 'CEO Section',
    people_behind: 'People Behind',
    expert_team: 'Expert Team',
    join_us: 'Join Us',
    new_section: 'New Sections'
  };

  return (
    <div className={styles.admin}>
      <div className={styles.header}>
        <h1>Content Management</h1>
        <p>Manage All Website Content Sections</p>
      </div>

      {message && (
        <div className={`${styles.message} ${styles[messageType]}`}>
          {message}
        </div>
      )}

      <div className={styles.container}>
        <div className={styles.sidebar}>
          <h3>Sections</h3>
          <nav className={styles.nav}>
            {Object.keys(sectionTitles).map(section =>{
              
              if(sectionTitles[section]!=='New Sections'){
                return(
              <button
                key={section}
                className={`${styles.navItem} ${activeSection === section ? styles.active : ''}`}
                onClick={() => setActiveSection(section)}
              >
                {sectionTitles[section]}
              </button>
            )}})}
          </nav>
        </div>

        <div className={styles.main}>
          <div className={styles.sectionHeader}>
            <h2>{sectionTitles[activeSection]}</h2>
            <button
              onClick={fetchAllContent}
              disabled={loading}
              className={styles.refreshBtn}
            >
              {loading ? 'Loading...' : 'Refresh Data'}
            </button>
          </div>

          {loading ? (
            <div className={styles.loading}>Loading content...</div>
          ) : (
            <>
              {!['expert_team', 'new_section'].includes(activeSection) && (
                <div className={styles.sectionActions}>
                  <button
                    onClick={() => updateSection(activeSection, contentData[activeSection])}
                    disabled={saving}
                    className={styles.primaryBtn}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}

              {renderSectionContent()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentAdmin;