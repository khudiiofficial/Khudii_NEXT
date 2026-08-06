import React from 'react';

const VideoList = ({ videos, onEdit, onDelete }) => {
  if (videos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">No videos found</h3>
        <p className="mt-2 text-sm text-gray-500">
          Get started by creating your first video entry.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#cedcff]">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-[#222222] uppercase tracking-wider">
                Thumbnail
              </th>
              <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-[#222222] uppercase tracking-wider">
                Title
              </th>
              <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-[#222222] uppercase tracking-wider">
                YouTube ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-[#222222] uppercase tracking-wider">
                Description
              </th>
              <th scope="col" className="px-6 py-3 text-right text-sm font-medium text-[#222222] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {videos.map((video) => (
              <tr key={video.id} className="hover:bg-[#f0f0f0] transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="w-20 h-12 bg-gray-100 rounded overflow-hidden border">
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 max-w-xs">
                    {video.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                    {video.youtube_id}
                  </code>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600 line-clamp-2 max-w-md">
                    {video.description || 'No description'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => onEdit(video)}
                      className="cursor-pointer text-[#059b0f] hover:text-[#3cc645] transition-colors duration-200 flex items-center font-medium"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(video.id)}
                      className="cursor-pointer text-[#e7001e] hover:text-[#f80120] transition-colors duration-200 flex items-center font-medium"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VideoList;