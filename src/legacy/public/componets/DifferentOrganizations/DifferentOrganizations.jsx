import React, { useEffect, useState } from "react";
import axios from "axios";
import { cachedPublicGet } from '@/lib/public-api-cache';
import "./DifferentOrganizations.css";
import { useNavigate } from '@/lib/router-compat';
const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');
const DifferentOrganizations = () => {
  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [error,setError]=useState(null)
  const nav=useNavigate()
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await cachedPublicGet(`${APIPath}/items`, {
          withCredentials: true,
        }, 15000);
      
        setOrganizations(res.data); // replace with res.data later
     
      } catch (error) {
        console.log(error);
        setError(error.message)
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      // <div className="flex justify-center items-center h-64">
      //   <div className="loader"></div>
      // </div>
      <div className="flex items-center justify-center h-90 ">
     
      {/* <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"> */}
        <img src="/siteicon.png" alt="" width={200} height={200}/>
      {/* </div> */}
    </div>
    );
  }

if(error){
  return(
     <div className={`errorContainer`}>
          <div className={`errorIcon`}>⚠️</div>
          <h2 className={`errorTitle`}>Unable to Load Content</h2>
          <p className={`errorMessage`}>{error}</p>
          <button 
            className={`bg-[#e7001e] retryButton`}
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
        )
}
  return (
    <div className="org-container py-14 px-6">
      <div className="max-w-7xl mx-auto">
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {organizations.map((org) => (
            <div key={org.id} className="org-card cursor-pointer" onClick={()=>{nav(`/organization/${org.slug}`,{state:{id:org.id}})}}>
              <div className="org-img-wrapper">
                <img src={org.introductory_image_path} alt={org.title} className="org-img" />
                <button onClick={()=>{nav(`/organization/${org.slug}`,{state:{id:org.id}})}} className="org-overlay">
                  <span>Explore</span>
                </button>
              </div>
              <div className="org-content">
                <h3 className="org-title">
                  <button onClick={()=>{nav(`/organization/${org.slug}`,{state:{id:org.id}})}}>{org.name}</button>
                </h3>
                <p className="org-excerpt ellipsisMultiline">  <div dangerouslySetInnerHTML={{ __html: org.description }}></div></p>
                <button onClick={()=>{nav(`/organization/${org.slug}`,{state:{id:org.id}})}} className="org-btn">
                  Explore Org
                </button>
              </div>
            </div>
          ))}
        </div> */}
         <div className="max-w-[1240px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {organizations.length > 0 ? (
            organizations.map((org, idx) => (
              <article
              onClick={()=>{nav(`/${org.slug}`,{state:{id:org.id}})}}
                key={org.id || idx}
                className="cursor-pointer group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
                role="article"
                aria-labelledby={`org-title-${org.id || idx}`}
              >
                {/* Image */}
                <div className="w-full overflow-hidden bg-white rounded-t-xl">
              <img
                src={org.introductory_image_path || '/placeholder-org.webp'}
                alt={org.name || 'Organization logo'}
                className="w-100 object-cover duration-500"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/fallback-org.png';
                }}
              />
</div>

                {/* Content */}
                <div className="p-4 sm:p-4">
                  <h3
                    id={`org-title-${org.id || idx}`}
                    className="h-[50px] text-lg sm:text-xl font-semibold text-[#022279] mb-2"
                  >
                    {org.name}
                  </h3>

                  <p className="text-[#222222]-600 text-sm leading-relaxed mb-4 line-clamp-3">
                    {org.description
                      ? org.description
                          .replace(/<[^>]*>/g, '') // strip HTML for safety (or use DOMPurify if rich text needed)
                          .substring(0, 140) + (org.description.length > 140 ? '...' : '')
                      : 'Empowering communities through sustainable initiatives.'}
                  </p>

                  <div className="text-center">
                    <button
                      className="cursor-pointer inline-flex item-center justify-center rounded-[25px] w-50 sm:w-auto px-5 py-2.5 text-sm font-medium bg-[#E3001C] text-white transition-all duration-300 focus:outline-none"
                      aria-label={`Explore ${org.name}`}
                    >
                      Explore {org.name.split(' ').slice(0, 2).join(' ')}
                    </button>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500">No organizations found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export default DifferentOrganizations;
