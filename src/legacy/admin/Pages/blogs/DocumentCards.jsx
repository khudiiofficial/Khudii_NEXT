// frontend/src/components/DocumentCards.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from '@/lib/router-compat';
const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');
export default function DocumentCards() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = () => {
    setLoading(true);
    axios
      .get(`${APIPath}/api/documents`,{withCredentials:true})
      .then((res) => {
        setDocuments(res.data.reverse());
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load documents. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  const handleDelete = (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;
    
    setDeleteLoading(id);
    axios
      .delete(`${APIPath}/api/documents/${id}`,{withCredentials:true})
      .then(() => {
        alert("✅ Document deleted successfully!");
        fetchDocuments();
      })
      .catch((err) => {
        console.error(err);
        alert("❌ Failed to delete document");
      })
      .finally(() => setDeleteLoading(null));
  };

  const handleUpdate = (id) => {
    navigate(`/dashboard/edit-Blog/${id}`);
  };

  // const handleView = (id) => {
  //   navigate(`/document/${id}`);
  // };

  const handleCreate = () => {
    navigate("/dashboard/create-document");
  };

  if (loading) {
    return (
      <div className=" bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-lg">Loading Blogs...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className=" bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to load documents</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchDocuments}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=" bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text ">
            Blog Documents
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover and manage all your blog posts in one place
          </p>
          
          {/* Create Button */}
          {/* <button
            onClick={handleCreate}
            className="mt-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Blog
          </button> */}
        </div>

        {/* Documents Grid */}
        {documents.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-sm p-12 max-w-md mx-auto border border-gray-200">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No documents yet</h3>
              <p className="text-gray-500 mb-6">
                Start by creating your first blog document to share your stories and insights.
              </p>
              <button
                onClick={handleCreate}
                className="bg-[#02236e] text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create Your First Blog
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden group transform hover:-translate-y-2"
                >
                  {/* Image Section */}
                  <div className="relative overflow-hidden">
                    {doc.image_path ? (
                      <img
                        src={doc.image_path}
                        alt={doc.Name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        // onError={(e) => {
                        //   e.target.src = `https://via.placeholder.com/400x200/3B82F6/FFFFFF?text=${encodeURIComponent(doc.Name || 'Blog')}`;
                        // }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-[#02236e] to-purple-600 flex items-center justify-center">
                        <svg className="w-16 h-16 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    )}
                    {/* <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                      <span className="text-sm font-medium text-gray-700">
                        {doc.sections_count || 0} sections
                      </span>
                    </div> */}
                  </div>

                  {/* Content Section */}
                  <div className="p-6">
                    <h2 className="h-[57px] text-xl font-bold text-[#222222] mb-3 line-clamp-2 group-hover:text-[#02236e] transition-colors">
                      {doc.Name || "Untitled Document"}
                    </h2>
                    
                    <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
                      {doc.intro ? `${doc.intro.slice(0, 120)}${doc.intro.length > 120 ? '...' : ''}` : "No description available."}
                    </p>

                    {doc.conclusion && (
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                        {doc.conclusion.slice(0, 80)}...
                      </p>
                    )}

                    {/* Stats */}
                    {/* <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        {doc.headings?.length || 0} headings
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        {doc.bullet_headers?.length || 0} sections
                      </div>
                    </div> */}

                    {/* Action Buttons */}
                    <div className="flex gap-3  pt-4 border-t border-gray-100">
                      {/* <button
                        onClick={() => handleView(doc.id)}
                        className="flex-1 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2 group/view"
                      >
                        <svg className="w-4 h-4 group-hover/view:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </button> */}
                      <button
                        onClick={() => handleUpdate(doc.id)}
                        className="cursor-pointer flex-1 bg-green-50 text-green-700 px-4 py-2 rounded-lg hover:bg-green-100 transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2 group/edit"
                      >
                        <svg className="w-4 h-4 group-hover/edit:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id, doc.Name)}
                        disabled={deleteLoading === doc.id}
                        className="cursor-pointer flex-1 bg-red-50 text-red-700 px-4 py-2 rounded-lg hover:bg-red-100 transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2 group/delete disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleteLoading === doc.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700"></div>
                        ) : (
                          <>
                            <svg className="w-4 h-4 group-hover/delete:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Documents Count */}
            <div className="mt-12 text-center">
              <div className="bg-white rounded-xl shadow-sm p-6 max-w-md mx-auto border border-gray-200">
                <p className="text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{documents.length}</span> Blog{documents.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}