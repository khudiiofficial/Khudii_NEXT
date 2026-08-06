import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from './OrganizationBycategory.module.css'
import "./OrganizationBycategory.css";
import { Link } from '@/lib/router-compat';
const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');
import { useNavigate } from '@/lib/router-compat';
const OrganizationBycategory = ({name}) => {
  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [err,seterr]=useState(null)
  const nav=useNavigate()
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${APIPath}/itemByCategory/${name}`,{withCredentials:true});
        
        setOrganizations(res.data); // replace with res.data later
      } catch (error) {
        console.log(error);
        seterr(error.message)
      }
      setLoading(false);
    })();
  }, [name]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loader"></div>
      </div>
    );
  }

if(err){
return (

    <div className={`errorContainer`}>
          <div className={`errorIcon`}>⚠️</div>
          <h2 className={`errorTitle`}>Unable to Load Content</h2>
          <p className={`errorMessage`}>{err}</p>
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
    <>
    {organizations.length===0 ?

 <div className={styles.errorContainer}>
      <div className={styles.errorIcon}>⚠️</div>
      <h2 className={styles.errorTitle}>NO Organizations Found</h2>
      <p className={styles.errorMessage}>It seems that data is yet to be added in Database</p>
    <Link to={'/'}>  <button 
        className={styles.retryButton}
        // onClick={() => window.location.reload()}
      >
         Back to Home Page
      </button></Link>
    </div>
        :
    <div className="org-container py-14 px-6 ">
      <div className="max-w-[1240px] mx-auto">
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org) => (
            <div key={org.id} className={`cursor-pointer org-card ${styles.card_size}`} onClick={()=>{nav(`/${org.slug}`,{state:{id:org.id}})}}>
              
              <div className="w-full overflow-hidden bg-white rounded-t-xl">
                <img src={org.introductory_image_path} alt={org.title} className="w-100 object-cover duration-500"/>
                <button className="cursor-pointer">
                  {/* <span>Explore</span> */}
                </button>
              </div>
              <div className="p-4 sm:p-4">
                <h3 className={`${styles.title} h-[55px] text-xl font-semibold text-[#022279] mb-2`}>
                  <p className="cursor-pointer text-left">{org.name}</p>
                </h3>
                {/* <div className="text-[#222222]-600 text-sm leading-relaxed mb-4 line-clamp-2">  <div dangerouslySetInnerHTML={{ __html: org.description }}></div></div> */}
                <div className="text-[#222222]-600 text-sm leading-relaxed mb-4">
                  <div
  dangerouslySetInnerHTML={{
    __html: org.description.replace(/<[^>]*>/g, '').length > 140
      ? org.description.replace(/<[^>]*>/g, '').slice(0, 140) + "..."
      : org.description.replace(/<[^>]*>/g, '')
  }}
></div>

                  </div>
                <button 
                className="cursor-pointer flex rounded-[25px] mx-auto w-auto px-5 py-2.5 text-sm font-medium bg-[#E3001C] text-white transition-all duration-300 focus:outline-none">
                  Explore {org.name.split(' ').slice(0, 2).join(' ')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

// nav(`/organization/${org.Slug}`,{state:{id:org.id}})
}

    </>
  );
};


export default OrganizationBycategory;
