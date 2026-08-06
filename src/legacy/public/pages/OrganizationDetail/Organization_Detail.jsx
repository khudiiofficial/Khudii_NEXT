// src/components/OrganizationDetail.jsx
import React, {  useState } from "react";
// import axios from "axios";
import SEO from "../../componets/Helmet/Helmet";
import "./Organization_Details.css";
import Crousel from "../../componets/OrganizationDetailPageComponents/Crousel/Crousel";
// import Services from "../../componets/OrganizationDetailPageComponents/Services/services";
// import Services from "../../componets/OrganizationDetailPageComponents/Services/Services";
// import Socials from "../../componets/OrganizationDetailPageComponents/GeneralInfo/GeneralInfo";
import YouTubeAndGoogle_map from "../../componets/OrganizationDetailPageComponents/YoutubeANDGoogleMap/YouTubeAndGoogle_map";
import Blogs from "../../componets/Blogs/Blogs";
// import { useLocation } from '@/lib/router-compat';
// import { useParams } from '@/lib/router-compat';
// const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');
const OrganizationDetail = ({url,org}) => {
  // const location=useLocation()
  // const {slug}=useParams()
  // const [org, setOrg] = useState(null);
  const id=org.id
  const [error,seterror]=useState(false)
  // const [id,setid]=useState(null)
  const [loader,setloader]=useState(false)
// console.log(googlemap)
  // useEffect(() => {
  //   (async () => {
  //     try {
  //       const res = await axios.get(`${APIPath}/item/${slug}`);
  //       setOrg(res.data);
  //       setid(res.data.id)
      
  //     } catch (err) {
  //       seterror(true)
  //       console.error("Error fetching org:", err);
  //     }
  //   })();
 
  // }, [slug]);

 
if (error) return (
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
  );


  return (
  <>

   <SEO 
  title={org ? `${org.name} - Verified Organization | Khudii` : "Organization - Khudii"}
  description={
    org 
      ? `${org.name} - ${org.description ? org.description.replace(/<[^>]*>/g, '').substring(0, 160) : 'Verified welfare organization partnered with Khudii for community impact in Pakistan.'}`
      : "Verified welfare organization working with Khudii for community support across Pakistan."
  }
  keywords={
    org
      ? `${org.name}, ${org.title || 'welfare organization'}, khudii partner, verified charity pakistan, community support`
      : "welfare organizations, verified charities, partner organizations, community support pakistan"
  }
  image={org?.introductory_image_path || "/Khudii.webp"}
  url={`${url}/${org?.slug || ''}`}
/>
<>
  <Crousel setloader={setloader} key={org.slug}/>
  </>
  {/* <Socials itemId={id}  /> */}
  {/* <Services id={id}/> */}
  <>
  {id && <YouTubeAndGoogle_map key={org.slug}  id={id}/>}
  </>
  {/* <>
  <Blogs loader1={loader} key={org.slug}/>
  </> */}
  </>
  );
};

export default OrganizationDetail;
