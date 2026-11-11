import React, { useState, useEffect } from 'react';
import AdminPublishSwitch from '@/components/AdminPublishSwitch';
import { youtubeVideoId, slugifyContent } from '@/server/shared/youtube';
import { normalizeSuccessStoryLink } from '@/lib/success-story-link';
const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app');
const SuccessStoryForm = ({ story, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    urdu_title: '',
    link: '',
    youtube_id: '',
    description: '',
    slug: '',
    is_published: true,
    meta_title: '', meta_description: '', meta_keywords: ''
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
        slug: slugifyContent(story.slug ?? ''),
        is_published: story.is_published!==0,
        meta_title: story.meta_title||'', meta_description: story.meta_description||'', meta_keywords: story.meta_keywords||''
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
        slug: (story && prev.slug) ? prev.slug : slugifyContent(value)

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
    
    if (!youtubeVideoId(formData.youtube_id)) {
      newErrors.youtube_id = 'Enter a valid 11-character YouTube video ID or YouTube URL';
    }
    if (formData.title.trim().length > 255) newErrors.title = 'Title must be under 256 characters';
    const normalizedSlug = slugifyContent(formData.slug || formData.title);
    if (!normalizedSlug || normalizedSlug.length > 200) newErrors.slug = 'Enter a valid slug (up to 200 characters)';
    const checkedLink = normalizeSuccessStoryLink(formData.link);
    if (checkedLink.error) newErrors.link = checkedLink.error;
    
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

      const checkedLink = normalizeSuccessStoryLink(formData.link);
      const payload = {
        ...formData,
        slug: slugifyContent(formData.slug || formData.title),
        link: checkedLink.link,
      };
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-khudii-surface': 'admin',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || body.error || `Failed to ${story ? 'update' : 'create'} story (HTTP ${response.status})`);
      }

      window.dispatchEvent(new CustomEvent('khudii:dirty', { detail: { source: 'success-stories', dirty: false } }));
      onSubmit();
      alert(`Success story ${story ? 'updated' : 'created'} successfully!`);
    } catch (err) {
      alert(err.message || `Failed to ${story ? 'update' : 'create'} success story`);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
      <h2 className="text-2xl font-bold text-[#222222] mb-6">
        {story ? 'Edit Success Story' : 'Create New Success Story'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6" data-khudii-editor="success-stories">
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
            maxLength={255}
            value={(formData.title) ?? ''}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent ${
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
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
            value={(formData.slug) ?? ''}
            onChange={handleChange}
            onBlur={() => setFormData(prev => ({ ...prev, slug: slugifyContent(prev.slug || prev.title) }))}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent ${errors.slug ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Auto-generated from title, e.g. demo"
          />
          <p className="mt-1 text-xs text-slate-500">Enter demo or /demo. The story URL uses /success-stories/demo.</p>
          {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
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
            maxLength={2048}
            value={(formData.youtube_id) ?? ''}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent ${
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
            onBlur={() => {
              const checked = normalizeSuccessStoryLink(formData.link);
              if (!checked.error) setFormData(prev => ({ ...prev, link: checked.link }));
            }}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent ${errors.link ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="/internal-page or https://www.youtube.com/watch?v=..."
          />
          <p className="mt-1 text-xs text-slate-500">Optional. Internal links get / automatically; YouTube and other https:// links are accepted.</p>
          {errors.link && <p className="mt-1 text-sm text-red-600">{errors.link}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={(formData.description) ?? ''}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
            placeholder="Enter Story Description (Optional)"
          />
        </div>


        {/* Preview */}
        {youtubeVideoId(formData.youtube_id) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video Preview
            </label>
            <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeVideoId(formData.youtube_id)}`}
                title="YouTube video preview"
                className="w-full h-48"
                frameBorder="0"
                allowFullScreen
              />
            </div>
          </div>
        )}

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h3 className="text-lg font-bold text-slate-900">Publishing & SEO</h3><AdminPublishSwitch checked={formData.is_published} onChange={v=>setFormData(p=>({...p,is_published:v}))} label={formData.is_published?'Published':'Draft'}/></div>
          {[['meta_title','SEO title',120],['meta_description','Meta description',320],['meta_keywords','SEO keywords',500]].map(([key,label,max])=><label key={key} className="mb-4 block text-sm font-semibold text-slate-700">{label}<span className="float-right text-xs font-normal text-slate-400">{(formData[key] ?? '').length}/{max}</span>{key==='meta_description'?<textarea rows={3} maxLength={max} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm" value={formData[key] ?? ''} onChange={handleChange} name={key}/>:<input maxLength={max} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm" value={formData[key] ?? ''} onChange={handleChange} name={key}/>}</label>)}
        </div>
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
            className="bg-[#2563eb] btn hover:bg-[#1d4ed8] text-white rounded-xl"
          >
            {loading && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {story ? 'Save changes' : 'Create Story'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SuccessStoryForm;