import React from 'react';
import styles from './Success.module.css'
import PageHeader from '../PageHeader/PageHeader';
import { useEffect,useState } from 'react';
import SEO from '../Helmet/Helmet';
import axios from 'axios';
import { useNavigate } from '@/lib/router-compat';
import Vedios from '../../pages/Vedios/Vedios';
const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');
const VideoGallery = ({con,url}) => {
  const nav=useNavigate()
  const [videoData,setvideodata]=useState(null)
  const[error,setError]=useState(null)
  const[loader,setloader]=useState(false)
   function Loader() {
  return (
    <div className="flex items-center justify-center h-40 ">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
    </div>
  );
}
  useEffect(()=>{
  const getStories=async()=>{
    setloader(true)
try {
  const res=await axios.get(`${APIPath}/getsuccessstories`,{withCredentials:true})
if(res.status===200){
setvideodata(res.data)
}
else{
throw new Error("could not get")
}

} catch (error) {
  
  setError(error.message)
}
setloader(false)
}
getStories();
  },[])

  
  // const videoData = [
  //   {
  //     id: 1,
  //     youtubeId: "vCLNTJyC60I",
  //     title: "A Heart Warming Act of a Noble Family",
  //     link: "/a-heart-warming-act-of-a-noble-family/",
  //     description: "Join us in an inspiring conversation with Mr & Mrs Zafeer Ud Din & Mr & Mrs Pervez Rasheed, as they shared their remarkable visit of the Aziz Jahan Begum Trust and taken a responsibilities of 2 children's studies for their bright future."
  //   },
  //   {
  //     id: 2,
  //     youtubeId: "wVS92e-UQaY",
  //     title: "A Success Story of Aziz Jehan Begum Trust For Blinds",
  //     link: "/four-visually-impaired-brothers/",
  //     description: "Join us in an inspiring conversation with Mr. Shoaib Siddique's family, where his four sons Muaz, Salman, Khizar, and Zaid share their remarkable journeys as Aziz Jahan Begum Trust students. These shining stars have excelled in their respective fields and are all Hafiz-e-Quran."
  //   },
  //   {
  //     id: 3,
  //     youtubeId: "UEiZOyd66NE",
  //     title: "A Success Story of WATER HANDPUMPS",
  //     link: "/water-hand-pumps-larkana/",
  //     description: "The successful installation of nearly 100 hand pumps in a district within 5-6 months, addressing the water scarcity issue in the region. The process involves surveying, identifying locations, and the actual drilling."
  //   },
  //   {
  //     id: 4,
  //     youtubeId: "q5-rzsH7AGU",
  //     title: "A Success Story Of Fatima Shafi Welfare Foundation's Lahore Visit",
  //     link: "/fatima-shafi-welfare-foundation/",
  //     description: "Join us as we welcome the esteemed Jahanzeb Sahib and his dedicated team from Charbagh, Swat, to Lahore. In this video, we explore their impressive setup including the Fatima Shafi Hospital, orphanage center, and school."
  //   },
  //   {
  //     id: 5,
  //     youtubeId: "xEBleJ_UV0o",
  //     title: "Khudii & CHT Pakistan - Joining Hands for the Greater Cause",
  //     description: "In a remarkable move towards social responsibility, CHT and KHUDII have joined hands to drive meaningful change in society."
  //   },
  //   {
  //     id: 6,
  //     youtubeId: "s7v90vIM44Y",
  //     title: "Aabroo Educational Welfare Organization",
  //     urduTitle: "جب بد لی ایک سوچ نے ان بچوں کی قسمت",
  //     description: "Where Education Meets Compassion, And Futures Are Rewritten With The Help Of Waste Management."
  //   },
  //   {
  //     id: 7,
  //     youtubeId: "Fwf3ipJybEE",
  //     title: "All You Want to Know About - AUTISM - ARCL",
  //     description: "What is AUTISM? A short and brief info by Dr. Ahmad Faraz Bhatti exploring the incredible work of 'ARCL' an organization dedicated to uplift Autistic children."
  //   },
  //   {
  //     id: 8,
  //     youtubeId: "_Wi43cEkG-0",
  //     title: "Abeera Siddiqui - a Role Model for Visually Impaired Youth",
  //     description: "Join us in an inspiring conversation with Abeera Siddiqui. Learn about her experiences, challenges, and successes, and discover how the trust has played a pivotal role in her life."
  //   },
  //   {
  //     id: 9,
  //     youtubeId: "E8rA7QKJ9p8",
  //     title: "In the Chairperson's Own Words - Islands of Hope School",
  //     description: "Testimonial by chairperson Mr. Raza Khan IOH school, Ameera Khan campus. Join us in a Most Inspiring journey of ISLANDS OF HOPE SCHOOL NEW BALAKOT."
  //   },
  //   {
  //     id: 10,
  //     youtubeId: "M9n0Wk4deK4",
  //     title: "Cancer Care Hospital - A Visit With A Group Of Respected CEO's & Chairmen",
  //     description: "Team Khudii Welfare proudly organized a visit to the Cancer Care Hospital & Research Centre, taking along a group of respected CEOs and Chairmen from the business community."
  //   },
  //   {
  //     id: 11,
  //     youtubeId: "y-hwAIOt59g",
  //     title: "Muhammadi Eye Hospital - Complete Tour - Philanthropist Visit",
  //     description: "Muhammadi Eye Hospital is a state of the art facility located in Lahore, Pakistan. Established with the mission to provide high-quality free and accessible eye care for needies."
  //   },
  //   {
  //     id: 12,
  //     youtubeId: "6GtcrkDFpRg",
  //     title: "Spreading Happiness All Over Pakistan - Meethi Eid - Gifts Distribution",
  //     description: "KHUDII has specially been rewarded us by Allah after spending the most part of our lives serving humanity, for the first time in PAKISTAN."
  //   },
  //   {
  //     id: 13,
  //     youtubeId: "T4UWCeJ7ERE",
  //     title: "Mr Atif Waheed & Other Philanthropists Visited PKLI With Khudii",
  //     description: "Khudii is honoured to lead a group of Philanthropists & Business community on their visit to PKLI, Mr Atif Waheed from Quran Academy is sharing his thought about Hospital."
  //   },
  //   {
  //     id: 14,
  //     youtubeId: "eIty5g_4YHI",
  //     title: "Philanthropist And Business Community Visit - Ghurki Trust Hospital",
  //     description: "Khudii is honored to lead a group of Philanthropists & Business community on their visit to GHURKI TRUST HOSPITAL. Explore the incredible journey of GHURKI TRUST HOSPITAL, Lahore."
  //   }
  // ];

  const VideoCard = ({ video }) => {
    
    return(
    <div key={video.id} onClick={()=>{nav(`/success-stories/${video.slug}`)}} className="bg-gray-200 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
      <div className="relative pb-[56.25%] h-0 overflow-hidden"> {/* 16:9 aspect ratio */}
        {/* <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={`https://www.youtube.com/embed/${video.youtube_id}?rel=0`}
          title={video.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        /> */}
       <img 
  src={`https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`}
  alt={`${video.title} thumbnail`}
  className="absolute top-0 left-0 w-full h-full object-cover"
  loading="lazy"
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = 'https://img.youtube.com/vi/0/hqdefault.jpg';
  }}
/>
      </div>
      
      <div className="p-4">
        <h3 className="text-xl font-semibold text-[#222222] mb-3 leading-tight line-clamp-2">
          {video.link ? (
            <a 
              href={video.link} 
              className="hover:text-blue-600 transition-colors duration-200"
            >
              {video.title}
            </a>
          ) : (
            video.title
          )}
        </h3>
        
        {video.urduTitle && (
          <p className="text-lg text-[#222222] mb-3 font-urdu" dir="rtl">
            {video.urdu_title}
          </p>
        )}
        
        <p className="text-[#222222] text-md leading-relaxed text-justify">
          {video.description}
        </p>
        
        {/* <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-gray-500">Video #{video.id}</span>
        </div> */}
      </div>
    </div>
  )};
    
   
    
    
    
    
    // if (error) return (
    //   <div className={styles.errorContainer}>
    //     <div className={styles.errorIcon}>⚠️</div>
    //     <h2 className={styles.errorTitle}>Unable to Load Content</h2>
    //     <p className={styles.errorMessage}>{error}</p>
    //     <button 
    //       className={styles.retryButton}
    //       onClick={() => window.location.reload()}
    //     >
    //       Retry
    //     </button>
    //   </div>
    // );

  return (<>
  <SEO 
        title={con?.meta_title||"Success Stories - Khudii Pakistan | Inspiring Welfare Journeys"}
        description={con?.meta_description||"Watch inspiring success stories from Khudii's welfare initiatives across Pakistan. Real stories of hope, community impact, and transformative change through education, healthcare, and social welfare."}
        keywords={con?.meta_keywords||"khudii success stories, pakistan welfare stories, inspiring charity stories, community impact stories, khudii videos, welfare organization success, humanitarian stories pakistan, social impact videos"}
        url={`${url}/success-stories`}
        type="website"
      />

    <PageHeader 
            title="Success Stories"
            breadcrumbs={[
              { label: "Home", link: "/" },
              { label: "Success Stories" }
            ]}
          />

      {loader ?  <Loader/> : <> {error? 
       <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>⚠️</div>
        <h2 className={styles.errorTitle}>Unable to Load Content</h2>
        <p className={styles.errorMessage}>{error}</p>
        <button 
          className={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>

:

    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#222222] mb-4">
            Khudii Success Stories
          </h1>
          <p className="text-xl text-[#222222] max-w-3xl mx-auto">
            Inspiring stories of hope, compassion, and community impact. 
            Discover how Khudii and its partners are making a difference across Pakistan.
          </p>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {videoData && videoData.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </div>
    </div>
    }
</>
}
    </>
  );
};

export default VideoGallery;