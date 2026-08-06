import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');

const BankDataManager = () => {
  // State variables
  const [bankData, setBankData] = useState({
    name: '',
    account_title: '',
    branch: '',
    iban: '',
    accountNumber: '',
    imagepath: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [newImageBase64, setNewImageBase64] = useState(null); // NEW image only
  const [imageChanged, setImageChanged] = useState(false); // Track if image changed
  const fileInputRef = useRef(null);

  // Fetch bank data on component mount
  useEffect(() => {
    fetchBankData();
  }, []);

  const fetchBankData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${APIPath}/api/bank`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setBankData(response.data.data);
      } else {
        setError('Failed to load bank data');
      }
    } catch (err) {
      console.error('Error fetching bank data:', err);
      setError(err.response?.data?.message || 'Failed to load bank data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBankData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setNewImageBase64(base64String);
      setImageChanged(true); // Mark image as changed
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setNewImageBase64(null);
    setImageChanged(true); // Mark that we want to remove image
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Prepare payload - ONLY include image_base64 if image was changed
      const payload = {
        name: bankData.name,
        account_title: bankData.account_title,
        branch: bankData.branch,
        iban: bankData.iban,
        accountNumber: bankData.accountNumber
      };

      // Add image_base64 to payload ONLY if image was changed
      if (imageChanged) {
        payload.image_base64 = newImageBase64; // null means remove, string means upload new
      }
      // If image was NOT changed, DON'T send image_base64 at all

      console.log('Sending payload:', {
        ...payload,
        image_base64: payload.image_base64 ? 'base64 string present' : 'not sent'
      });

      const response = await axios.put(`${APIPath}/api/bank`, payload, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setBankData(response.data.data);
        
        // Reset image states only if we sent an image
        if (imageChanged) {
          setNewImageBase64(null);
          setImageChanged(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
        
        setSuccess('Bank data updated successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Failed to update bank data');
      }
    } catch (err) {
      console.error('Error updating bank data:', err);
      setError(err.response?.data?.message || 'Failed to update bank data');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!window.confirm('Are you sure you want to remove the bank logo?')) {
      return;
    }

    try {
      const response = await axios.delete(`${APIPath}/api/bank/logo`, {
        withCredentials: true
      });

      if (response.data.success) {
        setBankData(response.data.data);
        setNewImageBase64(null);
        setImageChanged(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setSuccess('Bank logo removed successfully!');
        
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Failed to remove logo');
      }
    } catch (err) {
      console.error('Error removing logo:', err);
      setError(err.response?.data?.message || 'Failed to remove logo');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bank data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h1 className="text-3xl font-bold text-[#222222]">Bank Account Details</h1>
          <p className="text-[#222222] mt-2">
            Manage your organization's bank account information
          </p>
        </div>

        {/* Success/Error Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-[#e7001e] mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-[#e7001e]">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-[#1c5e20] hover:text-[#247b2a]">{success}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Logo Upload */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Bank Logo</h2>
            
            {/* Logo Preview */}
            <div className="mb-6">
              {newImageBase64 ? (
                <div className="text-center">
                  <div className="relative inline-block">
                    <img
                      src={newImageBase64}
                      alt="New Bank Logo Preview"
                      className="h-48 w-48 object-contain rounded-lg border-2 border-[#02236e] mx-auto"
                    />
                    <div className="mt-4 text-sm text-[#02236e] font-medium">
                      ✓ New logo ready to save
                    </div>
                  </div>
                </div>
              ) : bankData.imagepath ? (
                <div className="text-center">
                  <div className="relative inline-block">
                    <img
                      src={bankData.imagepath}
                      alt="Current Bank Logo"
                      className="h-48 w-48 object-contain rounded-lg border border-gray-300 mx-auto"
                    />
                    <div className="mt-4 text-md font-medium text-[#222222]">
                      Current Logo
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">No bank logo uploaded</p>
                </div>
              )}
            </div>

            {/* File Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#222222] mb-2">
                {newImageBase64 ? 'New Logo Selected' : 'Upload New Logo'}
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="cursor-pointer block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-[#02236e] hover:file:bg-blue-200"
              />
              <p className="text-xs text-[#009dc8] mt-1">
                Supported formats: <b>WebP</b> Only (Max size: 5MB)
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {newImageBase64 ? (
                <>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel New Logo
                  </button>
                  <div className="w-full mt-2">
                    <p className="text-sm text-[#02236e] font-medium">
                      ⚠️ Remember: Click "Save Bank Details" to upload this new logo
                    </p>
                  </div>
                </>
              ) : bankData.imagepath ? (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="cursor-pointer px-6 py-2 bg-[#e7001e] text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Remove Current Logo
                </button>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  Select an image file to upload new logo
                </p>
              )}
            </div>

            {/* Current Image Info */}
            {/* {bankData.imagepath && !newImageBase64 && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  Current logo is stored on FTP server
                </p>
                <a 
                  href={bankData.imagepath} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  View Current Logo →
                </a>
              </div>
            )} */}
          </div>

          {/* Right Column - Bank Details Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Bank Account Information</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Bank Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={(bankData.name) ?? ''}
                  onChange={handleInputChange}
                  placeholder="e.g., Habib Bank Limited"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Account Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Title *
                </label>
                <input
                  type="text"
                  name="account_title"
                  value={(bankData.account_title) ?? ''}
                  onChange={handleInputChange}
                  placeholder="e.g., KHUDII WELFARE ORGANIZATION"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Branch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branch Name
                </label>
                <input
                  type="text"
                  name="branch"
                  value={(bankData.branch) ?? ''}
                  onChange={handleInputChange}
                  placeholder="e.g., Main Branch, DHA Phase 1"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* IBAN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IBAN Number
                </label>
                <input
                  type="text"
                  name="iban"
                  value={(bankData.iban) ?? ''}
                  onChange={handleInputChange}
                  placeholder="e.g., PK00HABB0000001234567890"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={(bankData.accountNumber) ?? ''}
                  onChange={handleInputChange}
                  placeholder="e.g., 1234567890123"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Status Indicator */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Image Status:</p>
                    <p className="text-sm text-gray-500">
                      {newImageBase64 
                        ? "New logo ready to upload" 
                        : bankData.imagepath 
                          ? "Using existing logo" 
                          : "No logo set"}
                    </p>
                  </div>
                  {newImageBase64 && (
                    <div className="px-3 py-1 bg-blue-100 text-[#02236e] rounded-full text-xs font-medium">
                      Pending Upload
                    </div>
                  )}
                </div>
              </div>

              {/* Last Updated */}
              {bankData.updated_at && (
                <div className="text-sm text-[#009dc8] pt-4 border-t">
                  Last updated: {new Date(bankData.updated_at).toLocaleString()}
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className={`cursor-pointer w-full px-6 py-3 rounded-lg font-medium text-white transition-colors ${
                    saving
                      ? 'bg-[#1c5e20] cursor-allowed'
                      : 'bg-[#1c5e20] hover:bg-[#247b2a]'
                  }`}
                >
                  {saving ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : 'Save Bank Details'}
                </button>
                <p className="animate-pulse text-sm font-medium text-red-700 mt-2 text-center">
                  {newImageBase64 
                    ? "⚠️ This Will Upload The New Logo And Update Bank Details" 
                    : "Only Bank Details Will Be Updated, Logo Remains Unchanged"}
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Information Card */}
        {/* <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="font-medium text-blue-900">Important Notes</h3>
              <ul className="text-blue-700 text-sm mt-1 list-disc list-inside space-y-1">
                <li>Bank details and logo are saved separately</li>
                <li>Selecting a new image doesn't upload it until you click "Save Bank Details"</li>
                <li>If you don't select a new image, the existing logo is preserved</li>
                <li>Images are uploaded to FTP server and URLs are stored in database</li>
              </ul>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default BankDataManager;