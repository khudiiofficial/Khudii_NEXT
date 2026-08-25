import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from '@/lib/router-compat';

const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rerender, setrerender] = useState(true);
  const navigate = useNavigate();

  const Delete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete Organization "${name}"? This action can not be undone `)) {
      return;
    }

    try {
      const res = await axios.post(`${APIPath}/api/delete/${id}`, {}, { withCredentials: true });
      if (res.status === 200) {
        alert('deleted successfully');
      }
    } catch (error) {
      alert('could not delete');
    } finally {
      setrerender(!rerender);
    }
  };

  // Function to generate fallback image URL
  const getFallbackImage = (orgName) => {
    // Use picsum.photos for reliable placeholder images
    return `https://picsum.photos/400/200?random=${Math.random()}`;
    
    // Alternative: If you want text on the placeholder, use this:
    // return `https://dummyimage.com/400x200/3B82F6/FFFFFF&text=${encodeURIComponent(orgName)}`;
  };

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${APIPath}/organizations`, { withCredentials: true });
        setOrganizations(res.data.reverse());
        setError(null);
      } catch (err) {
        console.error("Error fetching organizations:", err);
        setError("Failed to load organizations. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrganizations();
  }, [rerender]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading organizations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 bg-[#e7001e] text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
          <p className="text-[#222222] mt-2">
            Manage And Edit Your Organization Profiles
          </p>
        </div>

        {organizations.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-6 max-w-md mx-auto">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No organizations found
              </h3>
              <p className="mt-2 text-gray-500">
                Get started by creating your first organization.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {organizations.map((org) => (
              <div
                key={org.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 hover:border-gray-300"
              >
                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                  <img
                    src={org.introductory_image_path}
                    alt={org.name}
                    className="w-full h-48 object-cover"
                    // onError={(e) => {
                    //   // Use the reliable fallback image
                    //   e.target.src = getFallbackImage(org.name);
                    // }}
                  />
                </div>
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
                    {org.name}
                  </h2>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                    {org.description.replace(/<[^>]*>/g, '') || "No description available."}
                  </p>
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => navigate(`/admin-app/dashboard/edit-organization/${org.id}`)}
                      className="cursor-pointer bg-[#02236e] text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors duration-200 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Edit Organization
                    </button>
                    <button
                      onClick={() => { Delete(org.id, org.name) }}
                      className="cursor-pointer bg-[#e7001e] text-white px-4 py-2 rounded-lg hover:bg-red-500 transition-colors duration-200 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}