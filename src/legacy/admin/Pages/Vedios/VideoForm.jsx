import React, { useState, useEffect } from 'react';
const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');
const VideoForm = ({ video, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    youtube_id: '',
    thumbnail: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [cap,setcap]=useState('')
  
  useEffect(() => {
    if (video) {
      setFormData({
        title: video.title || '',
        youtube_id: video.youtube_id || '',
        thumbnail: video.thumbnail || '',
        description: video.description || ''
      });
      
      // Set image preview if thumbnail exists and is base64
      if (video.thumbnail && video.thumbnail.startsWith('data:image')) {
        setImagePreview(video.thumbnail);
      } else if (video.thumbnail) {
        setImagePreview(video.thumbnail);
      }
    }
  }, [video]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle image upload and convert to base64
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size should be less than 2MB');
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setImagePreview(base64String);
      setFormData(prev => ({
        ...prev,
        thumbnail: base64String
      }));
    };
    reader.readAsDataURL(file);
  };

  // Remove uploaded image
  const handleRemoveImage = () => {
    setImagePreview('');
    setImageFile(null);
    setFormData(prev => ({
      ...prev,
      thumbnail: ''
    }));
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
      const url = video 
        ? `${APIPath}/api/videos/${video.id}`
        : `${APIPath}/api/videos`;
      
      const method = video ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
          credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${video ? 'update' : 'create'} video`);
      }

      onSubmit();
      alert(`Video ${video ? 'updated' : 'created'} successfully!`);
    } catch (err) {
      alert(`Failed to ${video ? 'update' : 'create'} video`);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {video ? 'Edit Video' : 'Create New Video'}
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
            value={(formData.title) ?? ''}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter video title"
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
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
            value={(formData.youtube_id) ?? ''}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              errors.youtube_id ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter YouTube video ID (e.g., 1d4tp4am58A)"
          />
          {errors.youtube_id && <p className="mt-1 text-sm text-red-600">{errors.youtube_id}</p>}
          <p className="mt-1 text-sm text-gray-500">
            The ID is the part after "v=" in YouTube URL
          </p>
        </div>

        {/* Thumbnail Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thumbnail Image *
          </label>
          
          {/* Image Upload Area */}
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
            <div className="space-y-1 text-center">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Thumbnail preview"
                    className="mx-auto h-32 w-56 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <>
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="thumbnail-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500">
                      <span>Upload a file</span>
                      <input
                        id="thumbnail-upload"
                        name="thumbnail-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 2MB
                  </p>
                </>
              )}
            </div>
          </div>
          
          {/* Error message for thumbnail */}
          {errors.thumbnail && (
            <p className="mt-1 text-sm text-red-600">{errors.thumbnail}</p>
          )}
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter video description (optional)"
          />
        </div>

        {/* Preview Section */}
        {formData.youtube_id && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* YouTube Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  YouTube Video Preview
                </label>
                <div className="bg-gray-100 rounded-lg overflow-hidden border">
                  <iframe
                    src={`https://www.youtube.com/embed/${formData.youtube_id}`}
                    title="YouTube video preview"
                    className="w-full h-48"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>

              {/* Thumbnail Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thumbnail Preview
                </label>
                <div className="bg-gray-100 rounded-lg border h-48 flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Custom thumbnail preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-gray-500">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="mt-2 text-sm">No thumbnail uploaded</p>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-500 text-center">
                  {imagePreview ? 'Custom thumbnail preview' : 'Upload a thumbnail to see preview'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !imagePreview}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center"
          >
            {loading && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {video ? 'Update Video' : 'Create Video'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VideoForm;