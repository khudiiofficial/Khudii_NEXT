import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from '@/lib/router-compat';
import { useAdminAuth } from '@/lib/admin-auth';

const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { auth, resetUser } = useAdminAuth();

  const handleLogout = async () => {
    try {
      const res = await axios.post(
        `${APIPath}/auth/logout`,
        {},
        { withCredentials: true }
      );
      if (res.status === 200) {
        resetUser();
        navigate("/admin-app/Login");
      }
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Error logging out!");
    }
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  const mainLinks = [
    { path: "/admin-app/dashboard/OrganizationPage", label: "Organizations" },
    { path: "/admin-app/dashboard/BlogPage", label: "Blogs" },
    { path: "/admin-app/dashboard/createorg", label: "Add Organization" },
    { path: "/admin-app/dashboard/create-document", label: "Add Blog" },
    { path: "/admin-app/dashboard/NewsEvents", label: "News & Events" },
    { path: "/admin-app/dashboard/welcome-secton", label: "Welcome Section" },
    { path: "/admin-app/dashboard/eventDescription", label: "Event Description" },
    { path: "/admin-app/dashboard/SuccessStories", label: "Success Stories" },
    { path: "/admin-app/dashboard/Vedios", label: "Videos" },
    { path: "/admin-app/dashboard/Inquiries", label: "Organization Inquiries" },
    { path: "/admin-app/dashboard/Donation", label: "Donations" },
    { path: "/admin-app/dashboard/Stories", label: "Contributed Stories" },
    { path: "/admin-app/dashboard/JobApplication", label: "Job Applications" },
    { path: "/admin-app/dashboard/Voulenteer", label: "Volunteers" },
    { path: "/admin-app/dashboard/Contacts", label: "Contacts" },
    { path: "/admin-app/dashboard/Topbar", label: "Top Bar" },
    { path: "/admin-app/dashboard/Certifications", label: "Certifications" },
    { path: "/admin-app/dashboard/Testimonials", label: "Testimonials" },
    { path: "/admin-app/dashboard/sectors", label: "Sectors" },
    { path: "/admin-app/dashboard/crousel-images", label: "Carousel Images" },
    { path: "/admin-app/dashboard/vision", label: "Vision" },
    { path: "/admin-app/dashboard/storiesDescription", label: "Home Page Story Description" },
    { path: "/admin-app/dashboard/contentAdmin", label: "About Page" },
    { path: "/admin-app/dashboard/seo", label: "SEO Management" },
    { path: "/admin-app/dashboard/footer", label: "Footer and other images" },
    { path: "/admin-app/dashboard/faqs", label: "FAQS" },
    { path: "/admin-app/dashboard/bank", label: "Conatct Bank Details" },
    { path: "/admin-app/dashboard/OrgRegistration", label: "Organization Registration Request" },
  ];

  // const moreLinks = [
  //   { path: "/dashboard/SuccessStories", label: "Success Stories" },
  //   { path: "/dashboard/Vedios", label: "Videos" },
  //   { path: "/dashboard/Inquiries", label: "Organization Inquiries" },
  //   { path: "/dashboard/Donation", label: "Donations" },
  //   { path: "/dashboard/Stories", label: "Contributed Stories" },
  //   { path: "/dashboard/JobApplication", label: "Job Applications" },
  //   { path: "/dashboard/Voulenteer", label: "Volunteers" },
  //   { path: "/dashboard/Contacts", label: "Contacts" },
  //   { path: "/dashboard/Topbar", label: "Top Bar" },
  //   { path: "/dashboard/Certifications", label: "Certifications" },
  //   { path: "/dashboard/Testimonials", label: "Testimonials" },
  //   { path: "/dashboard/sectors", label: "Sectors" },
  //   { path: "/dashboard/crousel-images", label: "Carousel Images" },
  //   { path: "/dashboard/vision", label: "Vision" },
  //   { path: "/dashboard/storiesDescription", label: "Home Page Story Description" },
  // ];

  if (!auth) return null;

  return (
    <div 
      className={`bg-[#02236e] text-white transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      } flex flex-col shadow-lg`}
    >
      {/* Header */}
      <div className="p-4 border-b border-[#02236e]-500 flex items-center justify-between">
        {!isCollapsed && (
          <div className="text-2xl font-bold tracking-wide">
            <Link to={'/admin-app/dashboard'}>Admin Panel</Link>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="cursor-pointer p-2 rounded-lg hover:bg-blue-600 transition"
        >
          {isCollapsed ? "→" : "←"}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {/* Main Links */}
          {mainLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center px-3 py-3 rounded-lg transition font-medium ${
                isActiveLink(link.path)
                  ? "bg-blue-500 text-white shadow-inner"
                  : "hover:bg-blue-500 hover:shadow"
              } ${isCollapsed ? "justify-center" : ""}`}
              title={isCollapsed ? link.label : ""}
            >
              {isCollapsed ? (
                <span className="text-xs font-bold">{link.label.charAt(0)}</span>
              ) : (
                link.label
              )}
            </Link>
          ))}

      
  
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-[#02236e]-500 space-y-2">
        <button
          onClick={() => navigate("/admin-app/dashboard/Profile")}
          className={`cursor-pointer w-full bg-white text-[#02236e] px-3 py-2 rounded-lg font-medium hover:bg-gray-100 transition shadow ${
            isCollapsed ? "text-xs" : ""
          }`}
          title={isCollapsed ? "Profile" : ""}
        >
          {isCollapsed ? "👤" : "Change Profile"}
        </button>
        <button
          onClick={handleLogout}
          className={`cursor-pointer w-full bg-[#e7001e] text-white px-3 py-2 rounded-lg font-medium hover:bg-opacity-10 transition shadow ${
            isCollapsed ? "text-xs" : ""
          }`}
          title={isCollapsed ? "Logout" : ""}
        >
          {isCollapsed ? "🚪" : "Logout"}
        </button>
      </div>
    </div>
  );
}