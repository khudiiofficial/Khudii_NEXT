import React, { useState, useEffect } from 'react';
const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');
const SuccessStoryForm = ({ story, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    urdu_title: '',
    link: '',
    youtube_id: '',
    description: '',
    slug: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [cap,setcap]=useState('')

  useEffect(() => {
    if (story) {
      setFormData({
        title: story.title || '',
        urdu_title: story.urdu_title || '',
        link: story.link || '',
        youtube_id: story.youtube_id || '',
        description: story.description || '',
        slug: story.slug ?? ''
      });
    }
  }, [story]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev =>{
      if(name==="title"){
        return {
          ...prev,
        title:value,
        slug:value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '') .replace(/\s+/g, '-')      

 

        }
      }

     return  {
      ...prev,
      [name]: value
    }});
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.youtube_id.trim()) {
      newErrors.youtube_id = 'YouTube ID is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
     if(cap){
      console.log('bot detected')
      setcap('')
      return
    }



    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const url = story 
        ? `${APIPath}/api/success-stories/${story.id}`
        : `${APIPath}/api/success-stories`;
      
      const method = story ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${story ? 'update' : 'create'} story`);
      }

      onSubmit();
      alert(`Success story ${story ? 'updated' : 'created'} successfully!`);
    } catch (err) {
      alert(`Failed to ${story ? 'update' : 'create'} success story`);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-[#222222] mb-6">
        {story ? 'Edit Success Story' : 'Create New Success Story'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        
    <input type="hidden" onChange={(e)=>{setcap(e.target.value)}} />


        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={(formData.title) ?? ''}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#02236e] focus:border-transparent ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter Success Story Title"
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
        </div>

        {/* Urdu Title */}
        <div>
          <label htmlFor="urdu_title" className="block text-sm font-medium text-gray-700 mb-2">
            Urdu Title
          </label>
          <input
            type="text"
            id="urdu_title"
            name="urdu_title"
            value={(formData.urdu_title) ?? ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#02236e] focus:border-transparent"
            placeholder="Enter Title in Urdu (Optional)"
          />
        </div>
{/* slug */}
   <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
            Slug
          </label>
          <input
            id="slug"
            name="slug"
            required
            value={(formData.slug) ?? ''}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#02236e] focus:border-transparent"
            placeholder="Enter slug"
          />
        </div>

        {/* YouTube ID */}
        <div>
          <label htmlFor="youtube_id" className="block text-sm font-medium text-gray-700 mb-2">
            YouTube Video ID *
          </label>
          <input
            type="text"
            id="youtube_id"
            name="youtube_id"
            required
            value={(formData.youtube_id) ?? ''}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#02236e] focus:border-transparent ${
              errors.youtube_id ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter YouTube Video ID (e.g., vCLNTJyC60I)"
          />
          {errors.youtube_id && <p className="mt-1 text-sm text-red-600">{errors.youtube_id}</p>}
          <p className="mt-1 text-sm text-[#009dc8]">
            The ID is the part after "v=" in YouTube URL
          </p>
        </div>

        {/* Link */}
        <div>
          <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-2">
            Custom Link
          </label>
          <input
            type="text"
            id="link"
            name="link"
         
            value={(formData.link) ?? ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#02236e] focus:border-transparent"
            placeholder="Enter Custom Link (Optional)"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            required
            value={(formData.description) ?? ''}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#02236e] focus:border-transparent"
            placeholder="Enter Story Description (Optional)"
          />
        </div>


        {/* Preview */}
        {formData.youtube_id && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video Preview
            </label>
            <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${formData.youtube_id}`}
                title="YouTube video preview"
                className="w-full h-48"
                frameBorder="0"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="bg-[#e7001e] btn border-[#f80120] hover:bg-[#f80120] text-white ml-3 rounded-xl"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-[#02236e] btn hover:bg-[#032f95] text-white rounded-xl"
          >
            {loading && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {story ? 'Update Story' : 'Create Story'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SuccessStoryForm;