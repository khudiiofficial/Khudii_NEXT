// import React, { useEffect, useRef, useState } from 'react';
// import styles from './Event.module.css';
// import { Link } from '@/lib/router-compat';
// import axios from 'axios'
// const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');
// const Events = () => {
//   const [events,setevents]=useState([])
//   const [items,setitems]=useState({})
  
// //   useEffect(()=>{
// // const callevents=async ()=>{
// //   try {
// //     const res=await axios.get(`${APIPath}/events`)
// //     if(res.status===200){
// //       setevents(res.data.data.slice(0,6))
// //     }
// //   } catch (error) {
// //     console.error(error)
// //   }
// // }
// // callevents()
// //   },[])

//   useEffect(()=>{
// const call=async()=>{
//   try {
//     const res=await axios.get(`${APIPath}/api/events`)
//     if(res.status===200){
//     setitems(res.data.data)
    
//     }
//   } catch (error) {
//     console.log(error)
//   }
// }
// call();
//   },[])

//  function embedToWatchUrl(embedUrl) {
//   const videoId = embedUrl.split("/embed/")[1].split("?")[0];
//   return `https://www.youtube.com/watch?v=${videoId}`;
// }

//     useEffect(() => {
//     (async () => {
//       // setLoading(true);
//       try {
//         const res = await axios.get(`${APIPath}/items`,{withCredentials:true});
      
// const arr=await Promise.all( res.data.slice(0,6).map(async(ele,idx)=>{
// const parser = new DOMParser();
// const doc = parser.parseFromString(ele.youtube_video_url
// , "text/html");
// const src = doc.querySelector("iframe").getAttribute("src");
// let title;
//   const watchUrl = embedToWatchUrl(src);
  
//       const res = await fetch(
//         `https://www.youtube.com/oembed?url=${encodeURIComponent(
//           watchUrl
//         )}&format=json`
//       );

//       if (res.ok) {
//         const data = await res.json();
//         title = data.title;
//       }
   
    

// let videoId=src.split('/')[src.split('/').length-1]
//  videoId=videoId.split("?")[0]
// return {
// url:src,
// videoId,
// title
// };
//         }))
        
// // const arr = await Promise.all(
// //   res.data.slice(0, 6).map(async (ele) => {
// //     const parser = new DOMParser();
// //     const doc = parser.parseFromString(
// //       ele.youtube_video_url,
// //       "text/html"
// //     );

// //     const iframe = doc.querySelector("iframe");
// //     if (!iframe) return null;

// //     const src = iframe.getAttribute("src");

// //     const videoId = src.split("/embed/")[1].split("?")[0];
// //     const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

// //     let title = null;

// //     try {
// //       const res = await fetch(
// //         `https://www.youtube.com/oembed?url=${encodeURIComponent(
// //           watchUrl
// //         )}&format=json`
// //       );

// //       if (res.ok) {
// //         const data = await res.json();
// //         title = data.title;
// //       }
// //     } catch (err) {
// //       console.error(err);
// //     }

// //     return {
// //       url: src,
// //       videoId,
// //       title,
// //     };
// //   })
// // ).then(results => results.filter(Boolean));

// setevents(arr)
//       } catch (error) {
//         console.log(error);
//         // setError(error.message)
//       }
//       // setLoading(false);
//     })();
//   }, []);
 
 

//   const [isVisible, setIsVisible] = useState(false);
//   const [loadedVideos, setLoadedVideos] = useState({});
//   const sectionRef = useRef(null);

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         if (entry.isIntersecting) {
//           setIsVisible(true);
//         }
//       },
//       { threshold: 0.1 }
//     );

//     if (sectionRef.current) {
//       observer.observe(sectionRef.current);
//     }

//     return () => {
//       if (sectionRef.current) {
//         observer.unobserve(sectionRef.current);
//       }
//     };
//   }, []);

//   const handleVideoLoad = (index) => {
//     setLoadedVideos(prev => ({
//       ...prev,
//       [index]: true
//     }));
    
//   };


// return (
//     <section ref={sectionRef} className="bg-white pb-6">
//       <div className="max-w-[1240px] mx-auto px-4">
//         {/* Section Header */}
//         <div className={`${isVisible ? 'animate-fade-in-up' : 'opacity-0'} transition-opacity duration-700`}>
//           <h2 className="text-2xl sm:text-3xl font-bold text-[#02236e] text-center pt-6 md:pt-8 lg:pt-10">
//             News & Events
//           </h2>
//           <p className="text-gray-600 text-lg md:text-xl max-w-4xl mx-auto text-center animate-slide-in-right pb-6 md:pb-8 lg:pb-10">
//             Watch highlights from our partner organizations and community events.
//           </p>
//         </div>

//         {/* Events Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
//           {events.map((evt, idx) => (
//             <div
//               key={evt.id || idx}
//               className={`group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transform transition-all duration-500 hover:-translate-y-2 animate-fade-in-up`}
//               style={{ animationDelay: `${idx * 0.15}s` }}
//             >
//               <div className="relative pb-[57%] h-0 overflow-hidden">
//                 {!loadedVideos[idx] ? (
//                   // Thumbnail View
//                   <div 
//                     className="absolute inset-0 cursor-pointer bg-gray-100 flex items-center justify-center"
//                     onClick={() => handleVideoLoad(idx)}
//                     role="button"
//                     tabIndex={0}
//                     onKeyDown={(e) => e.key === 'Enter' && handleVideoLoad(idx)}
//                     aria-label={`Play video: ${evt.title}`}
//                   >
//                     <img 
//                       src={`https://img.youtube.com/vi/${evt.videoId}/hqdefault.jpg`}
//                       alt={`${evt.title} thumbnail`}
//                       className="w-full h-full object-cover"
//                       loading="lazy"
//                       onError={(e) => {
//                         e.target.onerror = null;
//                         e.target.src = 'https://img.youtube.com/vi/0/hqdefault.jpg'; // fallback
//                       }}
//                     />
//                     <div className="absolute inset-0 flex items-center justify-center transition-opacity group-hover:bg-opacity-30">
//                       <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors group-hover:scale-110">
//                         <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
//                           <path d="M8 5v14l11-7z"/>
//                         </svg>
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   // Video View
//                   <iframe

//                     className="absolute top-0 left-0 w-full h-full"
//                     src={`${evt.url}?autoplay=1&rel=0&modestbranding=1`}
//                     title={evt.title}
//                     frameBorder="0"
//                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                     allowFullScreen
//                     loading="lazy"
//                   ></iframe>
//                 )}
//               </div>

//               <div className="pt-6 pb-6">
//                 <h3 className="text-lg sm:text-xl px-6 font-semibold text-[#222222] group-hover:text-[#02236e] transition-colors duration-300 line-clamp-2">
//                   {evt.title}
//                 </h3>
//               </div>
//             </div>
//           ))}
//         </div>
//         {/* Nasf e Mutmainna Img */}
//         <div className="max-w-[3/4] lg:col-span-1 order-1 lg:order-2 flex justify-center lg:mt-6">
//               <img 
//                 src={items.imagepath1}
//                 alt="Community members receiving support from EHDI Foundation" 
//                 className="w-full max-w-[500px] h-auto duration-500"
//                 loading="lazy"
//               />
//             </div>
//         {/* CTA Section */}
//         <div className={`max-w-[1240px] mx-auto px-4 sm:px-2 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'} transition-opacity duration-700`}>
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-4 items-center">
//             {/* Text Content */}
//             <div className="max-w-[100%] lg:col-span-1 order-2 lg:order-1">
//               <div className="bg-gradient-to-r from-gray-50 to-white p-5 sm:p-6 md:p-4 rounded-xl border-l-5 border-[#E3001C] shadow-sm hover:shadow-md transition-shadow duration-300">
//                 <p className="sm:text-xl md:text-2xl lg:text-3xl font-light text-[#222222] leading-relaxed mb-3 break-words text-justify">
//                   {/* We empower communities by providing essential services in health, education, disability support, water access, thalassemia care, and food security. */}
//              {items.description}
//                 </p>
//                 <div className="flex flex-row xs:flex-row gap-3 sm:gap-4 justify-center xs:justify-start">
//                   <Link to="/contribute-your-story/">
//                     <button 
//                       className={`${styles.event_btn1} text-white px-5 py-3 sm:px-6 sm:py-3.5 rounded-full font-medium hover:from-[#FF6B6B] hover:to-[#E3001C] transform hover:scale-[1.03] transition-all duration-300 shadow hover:shadow-md whitespace-nowrap"
//                       aria-label="Contribute your story`}
//                     >
//                       <span className="text-sm sm:text-base">Contribute your Story</span>
//                       <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 ml-1.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
//                       </svg>
//                     </button>
//                   </Link>
//                   <Link to="/donate-now/">
//                     <button 
//                       className={`${styles.event_btn2} text-white px-5 py-3 sm:px-6 sm:py-3.5 rounded-full font-medium hover:from-[#3B82F6] hover:to-[#022279] transform hover:scale-[1.03] transition-all duration-300 shadow hover:shadow-md whitespace-nowrap`}
//                       aria-label="Donate Now"
//                     >
//                       <span className="text-sm sm:text-base">Donate Now</span>
//                       <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 ml-1.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//                       </svg>
//                     </button>
//                   </Link>
//                 </div>
//               </div>
//             </div>

//             {/* Image */}
//             <div className="lg:col-span-1 order-1 lg:order-2 flex justify-center">
//               <img 
//                 src={items.imagepath2}
//                 alt="Community members receiving support from EHDI Foundation" 
//                 className="w-full max-w-[450px] h-auto rounded-xl shadow-md transform hover:scale-105 transition-transform duration-500"
//                 loading="lazy"
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Scoped Animations */}
//       <style jsx>{`
//         @keyframes fadeInUp {
//           from { opacity: 0; transform: translateY(20px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         @keyframes slideInRight {
//           from { opacity: 0; transform: translateX(20px); }
//           to { opacity: 1; transform: translateX(0); }
//         }
//         .animate-fade-in-up {
//           animation: fadeInUp 0.6s ease-out forwards;
//         }
//         .animate-slide-in-right {
//           animation: slideInRight 0.6s ease-out 0.2s forwards;
//         }
//         .line-clamp-2 {
//           display: -webkit-box;
//           -webkit-line-clamp: 2;
//           -webkit-box-orient: vertical;
//           overflow: hidden;
//         }
//       `}</style>
//     </section>
//   );
// };

// export default Events;

// import React, { useEffect, useRef, useState } from 'react';
// import styles from './Event.module.css';
// import { Link } from '@/lib/router-compat';
// import axios from 'axios'
// const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');
// const Events = () => {
//   const [events,setevents]=useState([])
//   const [items,setitems]=useState({})
  
// //   useEffect(()=>{
// // const callevents=async ()=>{
// //   try {
// //     const res=await axios.get(`${APIPath}/events`)
// //     if(res.status===200){
// //       setevents(res.data.data.slice(0,6))
// //     }
// //   } catch (error) {
// //     console.error(error)
// //   }
// // }
// // callevents()
// //   },[])

//   useEffect(()=>{
// const call=async()=>{
//   try {
//     const res=await axios.get(`${APIPath}/api/events`)
//     if(res.status===200){
//     setitems(res.data.data)
    
//     }
//   } catch (error) {
//     console.log(error)
//   }
// }
// call();
//   },[])

//  function embedToWatchUrl(embedUrl) {
//   const videoId = embedUrl.split("/embed/")[1].split("?")[0];
//   return `https://www.youtube.com/watch?v=${videoId}`;
// }

//     useEffect(() => {
//     (async () => {
//       // setLoading(true);
//       try {
//         const res = await axios.get(`${APIPath}/items`,{withCredentials:true});
      
// const arr=await Promise.all( res.data.slice(0,6).map(async(ele,idx)=>{
// const parser = new DOMParser();
// const doc = parser.parseFromString(ele.youtube_video_url
// , "text/html");
// const src = doc.querySelector("iframe").getAttribute("src");
// let title;
//   const watchUrl = embedToWatchUrl(src);
  
//       const res = await fetch(
//         `https://www.youtube.com/oembed?url=${encodeURIComponent(
//           watchUrl
//         )}&format=json`
//       );

//       if (res.ok) {
//         const data = await res.json();
//         title = data.title;
//       }
   
    

// let videoId=src.split('/')[src.split('/').length-1]
//  videoId=videoId.split("?")[0]
// return {
// url:src,
// videoId,
// title
// };
//         }))
        
// // const arr = await Promise.all(
// //   res.data.slice(0, 6).map(async (ele) => {
// //     const parser = new DOMParser();
// //     const doc = parser.parseFromString(
// //       ele.youtube_video_url,
// //       "text/html"
// //     );

// //     const iframe = doc.querySelector("iframe");
// //     if (!iframe) return null;

// //     const src = iframe.getAttribute("src");

// //     const videoId = src.split("/embed/")[1].split("?")[0];
// //     const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

// //     let title = null;

// //     try {
// //       const res = await fetch(
// //         `https://www.youtube.com/oembed?url=${encodeURIComponent(
// //           watchUrl
// //         )}&format=json`
// //       );

// //       if (res.ok) {
// //         const data = await res.json();
// //         title = data.title;
// //       }
// //     } catch (err) {
// //       console.error(err);
// //     }

// //     return {
// //       url: src,
// //       videoId,
// //       title,
// //     };
// //   })
// // ).then(results => results.filter(Boolean));

// setevents(arr)
//       } catch (error) {
//         console.log(error);
//         // setError(error.message)
//       }
//       // setLoading(false);
//     })();
//   }, []);
 
 

//   const [isVisible, setIsVisible] = useState(false);
//   const [loadedVideos, setLoadedVideos] = useState({});
//   const sectionRef = useRef(null);

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         if (entry.isIntersecting) {
//           setIsVisible(true);
//         }
//       },
//       { threshold: 0.1 }
//     );

//     if (sectionRef.current) {
//       observer.observe(sectionRef.current);
//     }

//     return () => {
//       if (sectionRef.current) {
//         observer.unobserve(sectionRef.current);
//       }
//     };
//   }, []);

//   const handleVideoLoad = (index) => {
//     setLoadedVideos(prev => ({
//       ...prev,
//       [index]: true
//     }));
    
//   };


// return (
//     <section ref={sectionRef} className="bg-white pb-6">
//       <div className="max-w-[1240px] mx-auto px-4">
//         {/* Section Header */}
//         <div className={`${isVisible ? 'animate-fade-in-up' : 'opacity-0'} transition-opacity duration-700`}>
//           <h2 className="text-2xl sm:text-3xl font-bold text-[#02236e] text-center pt-6 md:pt-8 lg:pt-10">
//             News & Events
//           </h2>
//           <p className="text-gray-600 text-lg md:text-xl max-w-4xl mx-auto text-center animate-slide-in-right pb-6 md:pb-8 lg:pb-10">
//             Watch highlights from our partner organizations and community events.
//           </p>
//         </div>

//         {/* Events Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
//           {events.map((evt, idx) => (
//             <div
//               key={evt.id || idx}
//               className={`group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transform transition-all duration-500 hover:-translate-y-2 animate-fade-in-up`}
//               style={{ animationDelay: `${idx * 0.15}s` }}
//             >
//               <div className="relative pb-[57%] h-0 overflow-hidden">
              
                  
//                   <iframe
//                     className="absolute top-0 left-0 w-full h-full"
//                     src={`${evt.url}?autoplay=1&rel=0&modestbranding=1`}
//                     title={evt.title}
//                     frameBorder="0"
//                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                     allowFullScreen
//                     loading="lazy"
//                   ></iframe>
                
//               </div>

//               <div className="pt-6 pb-6">
//                 <h3 className="text-lg sm:text-xl px-6 font-semibold text-[#222222] group-hover:text-[#02236e] transition-colors duration-300 line-clamp-2">
//                   {evt.title}
//                 </h3>
//               </div>
//             </div>
//           ))}
//         </div>
//         {/* Nasf e Mutmainna Img */}
//         <div className="max-w-[3/4] lg:col-span-1 order-1 lg:order-2 flex justify-center lg:mt-6">
//               <img 
//                 src={items.imagepath1}
//                 alt="Community members receiving support from EHDI Foundation" 
//                 className="w-full max-w-[500px] h-auto duration-500"
//                 loading="lazy"
//               />
//             </div>
//         {/* CTA Section */}
//         <div className={`max-w-[1240px] flex items-center justify-center px-4 sm:px-2 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'} transition-opacity duration-700`}>
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-4 items-center">
//             {/* Text Content */}
//             <div className="max-w-[100%] lg:col-span-1 order-2 lg:order-1">
//               <div className="bg-gradient-to-r from-gray-50 to-white p-5 sm:p-6 md:p-4 rounded-xl border-l-5 border-[#E3001C] shadow-sm hover:shadow-md transition-shadow duration-300">
//                 <p className="sm:text-xl md:text-2xl lg:text-xl font-light text-[#222222] leading-relaxed mb-3 break-words text-justify">
//                   {/* We empower communities by providing essential services in health, education, disability support, water access, thalassemia care, and food security. */}
//              {items.description}
//                 </p>
//                 <div className="flex flex-row xs:flex-row gap-3 sm:gap-4 justify-center xs:justify-start">
//                   <Link to="/contribute-your-story/">
//                     <button 
//                       className={`${styles.event_btn1} text-white px-5 py-3 sm:px-6 sm:py-3.5 rounded-full font-medium hover:from-[#FF6B6B] hover:to-[#E3001C] transform hover:scale-[1.03] transition-all duration-300 shadow hover:shadow-md whitespace-nowrap"
//                       aria-label="Contribute your story`}
//                     >
//                       <span className="text-sm sm:text-base">Contribute your Story</span>
//                       <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 ml-1.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
//                       </svg>
//                     </button>
//                   </Link>
//                   <Link to="/donate-now/">
//                     <button 
//                       className={`${styles.event_btn2} text-white px-5 py-3 sm:px-6 sm:py-3.5 rounded-full font-medium hover:from-[#3B82F6] hover:to-[#022279] transform hover:scale-[1.03] transition-all duration-300 shadow hover:shadow-md whitespace-nowrap`}
//                       aria-label="Donate Now"
//                     >
//                       <span className="text-sm sm:text-base">Donate Now</span>
//                       <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 ml-1.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//                       </svg>
//                     </button>
//                   </Link>
//                 </div>
//               </div>
//             </div>

//             {/* Image */}
//             <div className="lg:col-span-1 order-1 lg:order-2 flex justify-center">
//               <img 
//                 src={items.imagepath2}
//                 alt="Community members receiving support from EHDI Foundation" 
//                 className="w-full max-w-[350px] h-auto rounded-xl shadow-md transform hover:scale-105 transition-transform duration-500"
//                 loading="lazy"
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Scoped Animations */}
//       <style jsx>{`
//         @keyframes fadeInUp {
//           from { opacity: 0; transform: translateY(20px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         @keyframes slideInRight {
//           from { opacity: 0; transform: translateX(20px); }
//           to { opacity: 1; transform: translateX(0); }
//         }
//         .animate-fade-in-up {
//           animation: fadeInUp 0.6s ease-out forwards;
//         }
//         .animate-slide-in-right {
//           animation: slideInRight 0.6s ease-out 0.2s forwards;
//         }
//         .line-clamp-2 {
//           display: -webkit-box;
//           -webkit-line-clamp: 2;
//           -webkit-box-orient: vertical;
//           overflow: hidden;
//         }
//       `}</style>
//     </section>
//   );
// };

// export default Events;
import React, { useEffect, useRef, useState } from 'react';
import styles from './Event.module.css';
import { Link } from '@/lib/router-compat';
import axios from 'axios'
const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');

const Events = () => {
  const [events, setevents] = useState([])
  const [items, setitems] = useState({})
  const [activeVideo, setActiveVideo] = useState(null)

  useEffect(() => {
    const call = async () => {
      try {
        const res = await axios.get(`${APIPath}/api/events`)
        if (res.status === 200) {
          setitems(res.data.data)
        }
      } catch (error) {
        console.log(error)
      }
    }
    call();
  }, [])

  function embedToWatchUrl(embedUrl) {
    const videoId = embedUrl.split("/embed/")[1].split("?")[0];
    return `https://www.youtube.com/watch?v=${videoId}`;
  }

  // Extracts the 11-char video ID and builds a clean autoplay URL
  // Handles URLs like: /embed/PjFx5nMX8V4?si=K3wiQiIu8OPY99Mb or /embed/PjFx5nMX8V4?autoplay=0
  function buildAutoplayUrl(rawSrc) {
    const baseMatch = rawSrc.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
    if (!baseMatch) return rawSrc;
    const videoId = baseMatch[1];
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
  }

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${APIPath}/items`, { withCredentials: true });

        const arr = await Promise.all(res.data.slice(0, 6).map(async (ele) => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(ele.youtube_video_url, "text/html");
          const src = doc.querySelector("iframe").getAttribute("src");
          let title;
          const watchUrl = embedToWatchUrl(src);

          const oembedRes = await fetch(
            `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`
          );

          if (oembedRes.ok) {
            const data = await oembedRes.json();
            title = data.title;
          }

          let videoId = src.split('/')[src.split('/').length - 1]
          videoId = videoId.split("?")[0]

          return {
            url: src,
            videoId,
            title
          };
        }))

        setevents(arr)
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  const openVideo = (evt) => {
    setActiveVideo({ url: evt.url, title: evt.title });
  };

  const closeVideo = () => {
    setActiveVideo(null);
  };

  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="bg-white pb-6">
      <div className="max-w-[1240px] mx-auto px-4">

        {/* Section Header */}
        <div className={`${isVisible ? 'animate-fade-in-up' : 'opacity-0'} transition-opacity duration-700`}>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#02236e] text-center pt-6 md:pt-8 lg:pt-10">
            News & Events
          </h2>
          <p className="text-gray-600 text-lg md:text-xl max-w-4xl mx-auto text-center animate-slide-in-right pb-6 md:pb-8 lg:pb-10">
            Watch highlights from our partner organizations and community events.
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
          {events.map((evt, idx) => (
            <div
              key={evt.id || idx}
              className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transform transition-all duration-500 hover:-translate-y-2 animate-fade-in-up"
              style={{ animationDelay: `${idx * 0.15}s` }}
            >
              {/* Thumbnail */}
              <div className="relative pb-[57%] h-0 overflow-hidden">
                <div
                  className="absolute inset-0 cursor-pointer bg-gray-100 flex items-center justify-center"
                  onClick={() => openVideo(evt)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && openVideo(evt)}
                  aria-label={`Play video: ${evt.title}`}
                >
                  <img
                    src={`https://img.youtube.com/vi/${evt.videoId}/hqdefault.jpg`}
                    alt={`${evt.title} thumbnail`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://img.youtube.com/vi/0/hqdefault.jpg';
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center transition-opacity  group-hover:bg-opacity-20">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors group-hover:scale-110">
                      <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="pt-6 pb-6">
                <h3 className="text-lg sm:text-xl px-6 font-semibold text-[#222222] group-hover:text-[#02236e] transition-colors duration-300 line-clamp-2">
                  {evt.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Nasf e Mutmainna Img */}
        <div className="max-w-[3/4] lg:col-span-1 order-1 lg:order-2 flex justify-center lg:mt-6">
          <img
            src={items.imagepath1}
            alt="Community members receiving support from EHDI Foundation"
            className="w-full max-w-[500px] h-auto duration-500"
            loading="lazy"
          />
        </div>

        {/* CTA Section */}
        <div className={`max-w-[1240px] mx-auto px-4 sm:px-2 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'} transition-opacity duration-700`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-4 items-center">

            {/* Text Content */}
            <div className="max-w-[100%] lg:col-span-1 order-2 lg:order-1">
              <div className="bg-gradient-to-r from-gray-50 to-white p-5 sm:p-6 md:p-4 rounded-xl border-l-5 border-[#E3001C] shadow-sm hover:shadow-md transition-shadow duration-300">
                <p className="sm:text-xl md:text-2xl lg:text-3xl font-light text-[#222222] leading-relaxed mb-3 break-words text-justify">
                  {items.description}
                </p>
                <div className="flex flex-row xs:flex-row gap-3 sm:gap-4 justify-center xs:justify-start">
                  <Link to="/contribute-your-story/">
                    <button
                      className={`${styles.event_btn1} text-white px-5 py-3 sm:px-6 sm:py-3.5 rounded-full font-medium hover:from-[#FF6B6B] hover:to-[#E3001C] transform hover:scale-[1.03] transition-all duration-300 shadow hover:shadow-md whitespace-nowrap`}
                      aria-label="Contribute your story"
                    >
                      <span className="text-sm sm:text-base">Contribute your Story</span>
                      <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 ml-1.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                  </Link>
                  <Link to="/donate-now/">
                    <button
                      className={`${styles.event_btn2} text-white px-5 py-3 sm:px-6 sm:py-3.5 rounded-full font-medium hover:from-[#3B82F6] hover:to-[#022279] transform hover:scale-[1.03] transition-all duration-300 shadow hover:shadow-md whitespace-nowrap`}
                      aria-label="Donate Now"
                    >
                      <span className="text-sm sm:text-base">Donate Now</span>
                      <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 ml-1.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="lg:col-span-1 order-1 lg:order-2 flex justify-center">
              <img
                src={items.imagepath2}
                alt="Community members receiving support from EHDI Foundation"
                className="w-full max-w-[450px] h-auto rounded-xl shadow-md transform hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── YouTube Popup Modal ── */}
      {activeVideo && (
        <div
          style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={closeVideo}
        >
          <div
            className="relative w-full max-w-3xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeVideo}
              className="absolute -top-10 right-0 text-white text-4xl font-light leading-none hover:text-gray-300 transition-colors focus:outline-none"
              aria-label="Close video"
            >
              &times;
            </button>

            {/* Video iFrame — clean 11-char video ID extracted, fresh autoplay URL built */}
            <div className="relative pb-[56.25%] h-0 rounded-xl overflow-hidden shadow-2xl">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={buildAutoplayUrl(activeVideo.url)}
                title={activeVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Video Title */}
            <p className="text-white text-center mt-3 text-sm sm:text-base font-medium px-2 line-clamp-2">
              {activeVideo.title}
            </p>
          </div>
        </div>
      )}

      {/* Scoped Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .animate-slide-in-right {
          animation: slideInRight 0.6s ease-out 0.2s forwards;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
};

export default Events;
