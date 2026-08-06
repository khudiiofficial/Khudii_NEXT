import React, { useState, useEffect } from 'react';
import axios from 'axios';
const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');
import { useAdminAuth } from '@/lib/admin-auth';
const Profile = () => {
  const { setUser } = useAdminAuth();
  const [user, setuser] = useState({

    email: ''
  });
  const [formData, setFormData] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [cap,setcap]=useState('')

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      
      const response = await axios.get(`${APIPath}/api/profile`, {
       withCredentials:true
      });
      //  console.log(response)
      if (response.data.success) {
      
        const userData = response.data.user;
        setuser(userData);
        setFormData(prev => ({
          ...prev,
          email: userData.email || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      showMessage('Error fetching profile', 'error');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

 if(cap){
      console.log('bot detected')
      setcap('')
      return
    }


    // Validation
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      showMessage('New passwords do not match', 'error');
      setLoading(false);
      return;
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      showMessage('New password must be at least 6 characters', 'error');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const updateData = {
        email: formData.email
      };

      // Only include password fields if new password is provided
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await axios.put(`${APIPath}/api/profile`, updateData, {
     withCredentials:true
      });
      // console.log(response)
      if (response.status===200) {
       
        setUser(response.data.user)
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        showMessage('Profile updated successfully!', 'success');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 'Error updating profile';
      showMessage(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Profile Settings</h2>
          <p className="text-gray-600 mb-8">Manage your account information and password</p>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              messageType === 'success' 
                ? 'bg-green-100 text-[#1c5e20] border border-green-200' 
                : 'bg-red-100 text-[#e7001e] border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            
    <input type="hidden" onChange={(e)=>{setcap(e.target.value)}} />


            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-700 border-b pb-2">
                Personal Information
              </h3>
              
          
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={(formData.email) ?? ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02236e] focus:border-[#02236e] transition-colors"
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>

            {/* Password Change */}
            <div className="space-y-4 pt-6 border-t">
              <h3 className="text-xl font-semibold text-gray-700 border-b pb-2">
                Change Password
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={(formData.currentPassword) ?? ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02236e] focus:border-[#02236e] transition-colors"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={(formData.newPassword) ?? ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02236e] focus:border-[#02236e] transition-colors"
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={(formData.confirmPassword) ?? ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02236e] focus:border-[#02236e] transition-colors"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`cursor-pointer w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#02236e] hover:bg-blue-600 focus:ring-2 focus:ring-[#02236e] focus:ring-offset-2'
              }`}
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;