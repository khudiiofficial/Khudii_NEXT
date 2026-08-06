import React from 'react'

const DashboardIndex = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-indigo-50 flex items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-2xl p-10 text-center max-w-md w-full border border-gray-200">
        {/* <div className="text-5xl mb-4">👋</div> */}
        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          Welcome, <span className="text-[#02236e]">Admin</span>
        </h1>
        <p className="text-[#222222] text-lg">
          You’re now in your dashboard. Manage your content, and settings with ease.
        </p>
      </div>
    </div>
  )
}

export default DashboardIndex
