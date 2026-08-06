// import React from 'react';
// // import styles from './SuccessStory.module.css'
// import { useEffect,useState } from 'react';
// import SEO from '../../componets/Helmet/Helmet';
// import { useNavigate } from '@/lib/router-compat';
// import axios from 'axios';
// import Styles from './SuccessStory.module.css'
// const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');
// import { useParams } from '@/lib/router-compat';
// const SuccessStoryDetail = ({url}) => {
//   const nav=useNavigate()
//   let {slug}=useParams();
//   const [videoData,setvideodata]=useState([])
//   const [Error,setError]=useState(null)
//   const [loader,setloader]=useState(false)
//  function Loader() {
//   return (
//     // <div className="flex items-center justify-center h-40 ">
//     //   <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
//     // </div>
//      <div className="flex items-center justify-center h-90 ">
     
//       {/* <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"> */}
//         <img src="/siteicon.png" alt="" width={200} height={200}/>
//       {/* </div> */}
//     </div>
//   );
// }

//   const seoTitle = videoData.title 
//     ? `${videoData.title} - Khudii Success Story | Pakistan Welfare Initiatives`
//     : "Khudii Success Story | Inspiring Stories from Pakistan";

//   const seoDescription = videoData.description 
//     ? `${videoData.description.substring(0, 160)}... Watch this inspiring success story from Khudii's welfare initiatives across Pakistan.`
//     : "Watch inspiring success stories from Khudii's welfare initiatives across Pakistan. Discover real impact stories of hope, compassion, and community transformation.";

//   const seoKeywords = videoData.title 
//     ? `khudii success story, ${videoData.title}, pakistan welfare, community impact, humanitarian work, social welfare pakistan, khudii stories, inspirational videos`
//     : "khudii success stories, pakistan welfare initiatives, community impact stories, humanitarian work pakistan, social welfare success";



// useEffect(()=>{
// const get=async ()=>{
//   setloader(true)
//   try {
//      const res= await axios.get(`${APIPath}/success-story/${slug}`,{withCredentials:true})
//      if(res.status===200){
//       setvideodata(res.data)
//      }
//      else{
//       throw new Error("could not get")
//      }
//   } catch (error) {
//     setError(error.message)
//   }
//  setloader(false)
// }
// get();

// },[])
  

// //   useEffect(() => {
// //     if (!selectedVideo) {
// //       setSelectedVideo(videoData[0]);
// //     }
// //   }, [selectedVideo,videoData]);

// //   // Calculate number of slides/groups based on items to show
// //   const totalSlides = Math.ceil(videoData.length / slidesToShow);

// //   // Update slides to show based on screen size
 

 

// if(loader){
//   return <Loader/>
// }
//       if (Error) return (
//       <div className={`errorContainer`}>
//       <div className={`errorIcon`}>⚠️</div>
//       <h2 className={`errorTitle`}>Unable to Load Content</h2>
//       <p className={`errorMessage`}>{Error}</p>
//       <button 
//         className={`retryButton`}
//         onClick={() =>nav("/")}
//       >
//         Back to Home
//       </button>
//     </div>
//     );

//   return (
//    <>
//       {/* <SEO 
//         title={con?.meta_title||"Videos - Khudii Pakistan | Welfare Initiatives & Success Stories"}
//         description={con?.meta_description||"Watch Khudii's latest videos showcasing welfare projects, community initiatives, and success stories across Pakistan. Explore our humanitarian work through engaging video content."}
//         keywords={con?.meta_keywords||"khudii videos, welfare organization videos, pakistan charity videos, humanitarian projects, community work videos, khudii youtube, social welfare videos, pakistan social work"}
//         url={`${url}/videos`}
//         type="website"
//       /> */}
      

//   <SEO 
//         title={seoTitle}
//         description={seoDescription}
//         keywords={seoKeywords}
//         url={url}
//         type="article" // Changed to article for story content
//       />

//    <section className={Styles.section}>
//      <div className="text-center mb-12">
//           <h1 className="text-4xl font-bold text-[#222222] mb-4">
//             Khudii Success Stories
//           </h1>
//           <p className="text-xl text-[#222222] max-w-3xl mx-auto">
//             Inspiring stories of hope, compassion, and community impact. 
//             Discover how Khudii and its partners are making a difference across Pakistan.
//           </p>
//         </div>
//       <div className="video-gallery-container">
//         {/* Main Featured Video */}
    
//           <div className="featured-video-section">
//             <div className="featured-video-container">
//               <div className="video-wrapper">
//                 <iframe
//                   className="featured-video"
//                   src={`https://www.youtube.com/embed/${videoData.youtube_id}?rel=0&modestbranding=1&autoplay=1`}
//                   title={videoData.title}
//                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                   allowFullScreen
//                   loading="lazy"
//                 />
//               </div>
//               <div className="video-info !bg-gray-200 ">
//                 <h2 className="video-title">{videoData.title}</h2>
//                 <p className="video-description">{videoData.description}</p>
//               </div>
//             </div>
//           </div>
    
//       </div>
//     </section>
//     </>
//   );
// };


// export default SuccessStoryDetail


import React from 'react';
import { useEffect, useState } from 'react';
import SEO from '../../componets/Helmet/Helmet';
import { useNavigate } from '@/lib/router-compat';
import axios from 'axios';
import { useParams } from '@/lib/router-compat';

const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');

const SuccessStoryDetail = ({ url }) => {
  const nav = useNavigate()
  let { slug } = useParams();
  const [videoData, setvideodata] = useState([])
  const [Error, setError] = useState(null)
  const [loader, setloader] = useState(false)

  function Loader() {
    return (
      <div className="flex items-center justify-center min-h-[360px]" role="status" aria-label="Loading">
        <img 
          src="/siteicon.png" 
          alt="Loading spinner" 
          width={200} 
          height={200}
          fetchPriority="high"
          decoding="sync"
          className="max-w-full h-auto"
        />
        <span className="sr-only">Loading content, please wait...</span>
      </div>
    );
  }

  const seoTitle = videoData.title 
    ? `${videoData.title} - Khudii Success Story | Pakistan Welfare Initiatives`
    : "Khudii Success Story | Inspiring Stories from Pakistan";

  const seoDescription = videoData.description 
    ? `${videoData.description.substring(0, 160)}... Watch this inspiring success story from Khudii's welfare initiatives across Pakistan.`
    : "Watch inspiring success stories from Khudii's welfare initiatives across Pakistan. Discover real impact stories of hope, compassion, and community transformation.";

  const seoKeywords = videoData.title 
    ? `khudii success story, ${videoData.title}, pakistan welfare, community impact, humanitarian work, social welfare pakistan, khudii stories, inspirational videos`
    : "khudii success stories, pakistan welfare initiatives, community impact stories, humanitarian work pakistan, social welfare success";

  useEffect(() => {
    const get = async () => {
      setloader(true)
      try {
        const res = await axios.get(`${APIPath}/success-story/${slug}`, { withCredentials: true })
        if (res.status === 200) {
          setvideodata(res.data)
        } else {
          throw new Error("could not get")
        }
      } catch (error) {
        setError(error.message)
      }
      setloader(false)
    }
    get();
  }, [slug])

  if (loader) {
    return <Loader />
  }

  if (Error) return (
    <div className="text-center py-16 px-4 max-w-md mx-auto">
      <div className="text-6xl mb-4">⚠️</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Content</h2>
      <p className="text-gray-600 mb-6">{Error}</p>
      <button 
        className="bg-[#e7001e] text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors cursor-pointer min-h-[44px] min-w-[44px]"
        onClick={() => nav("/")}
      >
        Back to Home
      </button>
    </div>
  );

  return (
    <>
      <SEO 
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        url={`${url}/success-stories/${slug}`}
        type="article"
      />

      <section className="py-8 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Khudii Success Stories
            </h1>
            <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto">
              Inspiring stories of hope, compassion, and community impact. 
              Discover how Khudii and its partners are making a difference across Pakistan.
            </p>
          </div>

          {/* Video Container */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Video Wrapper - 16:9 Aspect Ratio */}
              <div className="relative pb-[56.25%] h-0 bg-black">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${videoData.youtube_id}?rel=0&modestbranding=1&autoplay=1`}
                  title={videoData.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
              
              {/* Video Info */}
              <div className="p-6 bg-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                  {videoData.title}
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {videoData.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default SuccessStoryDetail;