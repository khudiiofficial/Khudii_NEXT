// import React from "react";
// import { Link } from '@/lib/router-compat';
// import styles from './Organizations.module.css'
// import { useState,useEffect } from "react";
// import axios from "axios";
// import { html } from "framer-motion/client";
// import { useNavigate } from '@/lib/router-compat';
// const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');

// function OrganizationsSection() {
//     const [loading, setLoading] = useState(false);
//     const [organizations, setOrganizations] = useState([]);
//     const nav=useNavigate()
//   useEffect(() => {
//     (async () => {
//       setLoading(true);
//       try {
//         const res = await axios.get(`${APIPath}/items`,{withCredentials:true});
//         if(res.data.length>6){ res.data=res.data.slice(0,6)}
//         setOrganizations(res.data); 
//       } catch (error) {
//         console.log(error);
//       }
//       setLoading(false);
//     })();
//   }, []);


// return (
//     <section className="bg-[#f8fafc]">
//       <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
//         <div className="flex flex-wrap items-center">

//   <div className={`${styles.org_sec_left} flex-shrink-0 invisible`}>
//     <span className="inline-block font-semibold text-[#E3001C]">
//       Explore Organizations
//     </span>
//   </div>

 
//   <div className="flex-1 text-center">
//     <h2 className="text-2xl sm:text-3xl font-bold text-[#022279] p-4 md:p-8 lg:p-10">
//       Organizations
//     </h2>
//   </div>

//   <div className={styles.exp_org_btn}>
//     <Link
//       to="/organizations/"
//       className="inline-flex items-center font-semibold transition-colors group"
//       aria-label="Explore all organizations"
//     >
//       Explore Organizations
//       <svg
//         className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform"
//         fill="none"
//         stroke="currentColor"
//         viewBox="0 0 24 24"
//         aria-hidden="true"
//       >
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//       </svg>
//     </Link>
//   </div>
// </div>

        
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
//           {organizations.length > 0 ? (
//             organizations.map((org, idx) => (
//               <article
//               onClick={() => nav(`/${org.slug}`, { state: { id: org.id } })}
//                 key={org.id || idx}
//                 className="cursor-pointer group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
//                 role="article"
//                 aria-labelledby={`org-title-${org.id || idx}`}
//               >
             
//                 <div className="w-full overflow-hidden bg-white rounded-t-xl">
//   <img
//     src={org.introductory_image_path || '/placeholder-org.webp'}
//     alt={org.name || 'Organization logo'}
//     className="w-full h-full object-cover duration-500"
//     loading="lazy"
//     onError={(e) => {
//       e.target.onerror = null;
//       e.target.src = '/fallback-org.png';
//     }}
//   />
// </div>

            
//                 <div className="p-5 sm:p-6">
//                   <h3
//                     id={`org-title-${org.id || idx}`}
//                     className="h-[50px] text-lg sm:text-xl font-semibold text-[#02236e] mb-2 transition-colors"
//                   >
//                     {org.name}
//                   </h3>

//                   <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
//                     {org.description
//                       ? org.description
//                           .replace(/<[^>]*>/g, '') 
//                           .substring(0, 120) + (org.description.length > 120 ? '...' : '')
//                       : 'Empowering communities through sustainable initiatives.'}
//                   </p>

//                   <div className="text-center">
//                     <button
//                       className="cursor-pointer inline-flex items-center justify-center rounded-[25px] w-50 sm:w-auto px-5 py-2.5 text-sm font-medium bg-[#E3001C] text-white transition-all duration-300 focus:outline-none"
//                       aria-label={`Explore ${org.name}`}
//                     >
//                       Explore {org.name.split(' ').slice(0, 2).join(' ')}
//                     </button>
//                   </div>
//                 </div>
//               </article>
//             ))
//           ) : (
//             <div className="col-span-full text-center py-10">
//               <p className="text-gray-500">No organizations found.</p>
//             </div>
//           )}
//         </div>
//       </div>

    
//       <style jsx>{`
//         .line-clamp-3 {
//           display: -webkit-box;
//           -webkit-line-clamp: 3;
//           -webkit-box-orient: vertical;
//           overflow: hidden;
//         }
//       `}</style>
//     </section>
//   );
// };

// export default OrganizationsSection;
import React from "react";
import { Link } from '@/lib/router-compat';
import styles from './Organizations.module.css'
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from '@/lib/router-compat';

const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');

function OrganizationsSection() {
  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${APIPath}/items`, { withCredentials: true });
        if (res.data.length > 6) {
          res.data = res.data.slice(0, 6);
        }
        setOrganizations(res.data);
      } catch (error) {
        console.log(error);
      }
      setLoading(false);
    })();
  }, []);

  // Handle keyboard navigation for cards
  const handleKeyPress = (e, org) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      nav(`/${org.slug}`, { state: { id: org.id } });
    }
  };

  return (
    <section className="bg-[#f8fafc]" aria-label="Organizations section">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* Header Section with improved accessibility */}
        <div className="flex flex-wrap items-center">
          {/* Left spacer - hidden but maintains layout */}
          <div className={`${styles.org_sec_left} flex-shrink-0 invisible`} aria-hidden="true">
            <span className="inline-block font-semibold text-[#E3001C]">
              Explore Organizations
            </span>
          </div>

          {/* Centered heading */}
          <div className="flex-1 text-center">
            <h2 
              className="text-2xl sm:text-3xl font-bold text-[#0033A0] p-4 md:p-8 lg:p-10"
              id="organizations-heading"
            >
              Organizations
            </h2>
          </div>

          {/* Right-aligned link - improved touch target */}
          <div className={styles.exp_org_btn}>
            <Link
              to="/organizations/"
              className="inline-flex items-center font-semibold transition-colors group min-h-[44px] min-w-[44px] px-4 py-2"
              aria-label="Explore all organizations"
            >
              Explore Organizations
              <svg
                className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Cards Grid with loading state */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
          {loading ? (
            // Loading state with ARIA announcement
            <div 
              className="col-span-full text-center py-10"
              role="status"
              aria-live="polite"
              aria-label="Loading organizations"
            >
              <p className="text-gray-500">Loading organizations...</p>
            </div>
          ) : organizations.length > 0 ? (
            organizations.map((org, idx) => (
              <article
                key={org.id || idx}
                className="cursor-pointer group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
                role="article"
                aria-labelledby={`org-title-${org.id || idx}`}
                onClick={() => nav(`/${org.slug}`, { state: { id: org.id } })}
                onKeyPress={(e) => handleKeyPress(e, org)}
                tabIndex={0}
              >
                {/* Image with improved accessibility */}
                <div className="w-full overflow-hidden bg-white rounded-t-xl">
                  <img
                    src={org.introductory_image_path || '/placeholder-org.webp'}
                    alt={`${org.name || 'Organization'} logo`}
                    className="w-full h-full object-cover duration-500"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/fallback-org.png';
                    }}
                  />
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6">
                  <h3
                    id={`org-title-${org.id || idx}`}
                    className="h-[50px] text-lg sm:text-xl font-semibold text-[#0033A0] mb-2 transition-colors line-clamp-2"
                  >
                    {org.name}
                  </h3>

                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                    {org.description
                      ? org.description
                          .replace(/<[^>]*>/g, '')
                          .substring(0, 120) + (org.description.length > 120 ? '...' : '')
                      : 'Empowering communities through sustainable initiatives.'}
                  </p>

                  <div className="text-center">
                    <button
                      className="cursor-pointer inline-flex items-center justify-center rounded-[25px] w-50 sm:w-auto px-5 py-2.5 text-sm font-medium bg-[#CC0000] text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 min-h-[44px] min-w-[44px]"
                      aria-label={`Learn more about ${org.name}`}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent double navigation
                        nav(`/${org.slug}`, { state: { id: org.id } });
                      }}
                    >
                      Explore {org.name.split(' ').slice(0, 2).join(' ')}
                    </button>
                  </div>
                </div>
              </article>
            ))
          ) : (
            // Empty state with ARIA announcement
            <div 
              className="col-span-full text-center py-10"
              role="status"
              aria-live="polite"
              aria-label="No organizations found"
            >
              <p className="text-gray-500">No organizations found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Skip to content link for keyboard users */}
    </section>
  );
};

export default OrganizationsSection;