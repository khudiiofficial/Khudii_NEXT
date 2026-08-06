// import React, { useState, useRef,useEffect } from "react";
// import { Link } from '@/lib/router-compat';

// const ClientFeedbacks = () => {
//   const [activeVideo, setActiveVideo] = useState(null);
//   const videoRefs = useRef([]);
//   const [loading, setLoading] = useState(false);
//  const [feedbacks,setfeedback]=useState([])
//    const [message, setMessage] = useState('');
//     const [messageType, setMessageType] = useState('');
//   const fetchTestimonials = async () => {
//     setLoading(true);
//     try {
//       const response = await api.get('/testimonials');
//       if (response.data.success) {
//         setfeedback(response.data.data);
//       }
//     } catch (error) {
//       console.error('Error fetching testimonials:', error);
//       showMessage('Error fetching testimonials', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

  
//   const showMessage = (msg, type = 'success') => {
//     setMessage(msg);
//     setMessageType(type);
//     setTimeout(() => {
//       setMessage('');
//       setMessageType('');
//     }, 5000);
//   };
//   useEffect(() => {
//     fetchTestimonials();
//   }, []);
  
//   // const feedbacks = [
//   //   {
//   //     id: 1,
//   //     name: "Nabila Nasir",
//   //     position: "Amir Public School",
//   //     thumbnail:
//   //       "/Testimonials/nabila-00.png.webp",
//   //     videoUrl:
//   //       "/Vedios/NABILA-NASIR-AMIR-PIUBLIC-SCHOOL.mp4",
//   //     role: "School Principal",
     
//   //   },
//   //   {
//   //     id: 2,
//   //     name: "Ahsan Ghauri",
//   //     position: "Kalske Water RO Plant",
//   //     thumbnail:
//   //       "/Testimonials/ahsan-00.png.webp",
//   //     videoUrl:
//   //       "/Vedios/AHSAN-GHAURI-KALSKE-WATER-RO-PLANT.mp4",
//   //     role: "Plant Manager",
      
//   //   },
//   // ];

//   const playVideo = (index) => {
//     if (activeVideo === index) {
//       // pause if same video clicked
//       videoRefs.current[index]?.pause();
//       setActiveVideo(null);
//     } else {
//       // pause previously active video
//       if (activeVideo !== null) {
//         videoRefs.current[activeVideo]?.pause();
//       }
//       setActiveVideo(index);
//       setTimeout(() => {
//         videoRefs.current[index]?.play();
//       }, 100);
//     }
//   };

//   return (
//     <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header */}
//         <div className="text-center mb-12">
//           <h2 className="text-4xl font-bold text-[#222222] mb-4">
//             Our Client's Feedbacks
//           </h2>
//           <p className="text-lg text-[#222222] max-w-2xl mx-auto">
//             Hear what our valued clients have to say about their experience
//             working with Khudii.
//           </p>
//         </div>

//         {/* Feedback Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
//           {feedbacks.map((feedback, index) => (
//             <div
//               key={feedback.id}
//               className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
//             >
//               {/* Video or Thumbnail */}
//               <div className="relative overflow-hidden rounded-t-2xl">
//                 <video
//                   ref={(el) => (videoRefs.current[index] = el)}
//                   className="w-full h-64 object-cover rounded-t-2xl"
//                   controls={activeVideo === index}
//                   poster={feedback.thumbnail}
//                   preload="metadata"
//                   onEnded={() => setActiveVideo(null)}
//                 >
//                   <source src={feedback.videoUrl} type="video/mp4" />
//                   <source src={feedback.videoUrl} type="video/webm" />
//                   <source src={feedback.videoUrl} type="video/mkv" />
//                   Your browser does not support the video tag.
//                 </video>

//                 {/* Overlay Play Button (only if not active) */}
//                 {activeVideo !== index && (
//                   <div
//                     className="absolute inset-0 bg-opacity-30 flex items-center justify-center cursor-pointer"
//                     onClick={() => playVideo(index)}
//                   >
//                     <div className="bg-white bg-opacity-90 rounded-full p-4 transform transition-transform group-hover:scale-110">
//                       <svg
//                         className="w-12 h-12 text-blue-600"
//                         fill="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path d="M8 5v14l11-7z" />
//                       </svg>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Client Info */}
//               <div className="p-6">
//                 <div className="flex items-start space-x-4">
//                   {/* <div className="flex-shrink-0">
//                     <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl">
//                       {feedback.avatar}
//                     </div>
//                   </div> */}

//                   <div className="flex-1 min-w-0">
//                     <h3 className="text-lg font-semibold text-[#222222] truncate">
//                       {feedback.name}
//                     </h3>
//                     <p className="text-sm text-blue-600 font-medium">
//                       {feedback.position}
//                     </p>
//                     <p className="text-sm text-[#222222] mt-1">
//                       {feedback.role}
//                     </p>
//                   </div>

//                   {/* Play/Pause Button */}
//                   <button
//                     onClick={() => playVideo(index)}
//                     className="flex-shrink-0 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full p-2 transition-colors duration-200"
//                   >
//                     {activeVideo === index ? (
//                       <svg
//                         className="w-5 h-5"
//                         fill="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
//                       </svg>
//                     ) : (
//                       <svg
//                         className="w-5 h-5"
//                         fill="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path d="M8 5v14l11-7z" />
//                       </svg>
//                     )}
//                   </button>
//                 </div>
//               </div>

//               {/* Hover Border */}
//               <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-200 transition-all duration-300 pointer-events-none"></div>
//             </div>
//           ))}
//         </div>

//         {/* CTA */}
//         <div className="text-center mt-12">
//           <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
//             <h3 className="text-2xl font-bold text-[#222222] mb-4">
//               Share Your Experience
//             </h3>
//             <p className="text-[#222222] mb-6">
//               Have you worked with Khudii? We'd love to hear about your
//               experience and feature your feedback.
//             </p>
//             <Link to="/Story">
//               <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
//                 Share Your Story
//               </button>
//             </Link>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default ClientFeedbacks;


import React, { useState, useRef, useEffect } from "react";
import { Link } from '@/lib/router-compat';
import axios from "axios";

const ClientFeedbacks = () => {
  const [activeVideo, setActiveVideo] = useState(null);
  const videoRefs = useRef([]);
  const [loading, setLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Initialize axios instance
  const api = axios.create({
    baseURL: (process.env.NEXT_PUBLIC_BACKEND_PATH || ''),
    withCredentials: true,
    timeout: 10000, // 10 seconds timeout
  });

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const response = await api.get('/testimonials');
      if (response.data.success) {
        setFeedbacks(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch testimonials');
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      
      // Handle different types of errors
      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        showMessage('Network error: Unable to connect to server', 'error');
      } else if (error.code === 'ECONNABORTED') {
        showMessage('Request timeout: Please try again', 'error');
      } else if (error.response?.status === 404) {
        showMessage('Testimonials not found', 'error');
      } else if (error.response?.status >= 500) {
        showMessage('Server error: Please try again later', 'error');
      } else {
        showMessage(error.response?.data?.message || 'Error fetching testimonials', 'error');
      }
      
      // Set empty array as fallback
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const playVideo = (index) => {
    if (activeVideo === index) {
      // Pause if same video clicked
      videoRefs.current[index]?.pause();
      setActiveVideo(null);
    } else {
      // Pause previously active video
      if (activeVideo !== null) {
        videoRefs.current[activeVideo]?.pause();
      }
      setActiveVideo(index);
      setTimeout(() => {
        const videoElement = videoRefs.current[index];
        if (videoElement) {
          const playPromise = videoElement.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.error('Error Playing Video:', error);
              showMessage('Error Playing Video', 'error');
            });
          }
        }
      }, 100);
    }
  };

  // Handle video errors
  const handleVideoError = (index, error) => {
    console.error(`Error loading video for feedback ${index}:`, error);
    showMessage('Error loading video', 'error');
  };

  // Handle image errors
  const handleImageError = (event, fallbackImage = "/placeholder-thumbnail.jpg") => {
    event.target.src = fallbackImage;
  };

  // Fallback data in case API fails
  const fallbackFeedbacks = [
    {
      id: 1,
      name: "Nabila Nasir",
      position: "Amir Public School",
      thumbnail: "/Testimonials/nabila-00.png.webp",
      video_url: "/Vedios/NABILA-NASIR-AMIR-PIUBLIC-SCHOOL.mp4",
      role: "School Principal",
    },
    {
      id: 2,
      name: "Ahsan Ghauri",
      position: "Kalske Water RO Plant",
      thumbnail: "/Testimonials/ahsan-00.png.webp",
      video_url: "/Vedios/AHSAN-GHAURI-KALSKE-WATER-RO-PLANT.mp4",
      role: "Plant Manager",
    },
  ];

  // Use fallback if no feedbacks loaded
  const displayFeedbacks = feedbacks.length > 0 ? feedbacks : fallbackFeedbacks;

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Message Display */}
        {message && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            messageType === 'error' 
              ? 'bg-red-100 border border-red-400 text-red-700' 
              : 'bg-green-100 border border-green-400 text-green-700'
          }`}>
            <div className="flex items-center">
              <span className="mr-2">
                {messageType === 'error' ? '⚠️' : '✅'}
              </span>
              {message}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#222222] mb-4">
            Our Client's Feedbacks
          </h2>
          <p className="text-lg text-[#222222] max-w-3xl mx-auto">
            Hear What Our Valued Clients Have To Say About Their Experience Working With Khudii.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          // <div className="flex justify-center items-center py-12">
          //   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          //   <span className="ml-3 text-[#222222]">Loading testimonials...</span>
          // </div>
           <div className="flex items-center justify-center h-90 ">
     
      {/* <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"> */}
        <img src="/siteicon.png" alt="" width={200} height={200}/>
      {/* </div> */}
    </div>
        )}

        {/* Feedback Grid */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {displayFeedbacks.map((feedback, index) => (
              <div
                key={feedback.id || index}
                className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Video or Thumbnail */}
                <div className="relative overflow-hidden rounded-t-2xl">
                  <video
                    ref={(el) => (videoRefs.current[index] = el)}
                    className="w-full h-64 object-cover rounded-t-2xl"
                    controls={activeVideo === index}
                    poster={feedback.thumbnail}
                    preload="metadata"
                    onEnded={() => setActiveVideo(null)}
                    onError={() => handleVideoError(index)}
                  >
                    <source src={feedback.video_url} type="video/mp4" />
                    <source src={feedback.video_url} type="video/webm" />
                    <source src={feedback.video_url} type="video/ogg" />
                    Your browser does not support the video tag.
                  </video>

                  {/* Overlay Play Button (only if not active) */}
                  {activeVideo !== index && (
                    <div
                      className="absolute inset-0  flex items-center justify-center cursor-pointer transition-opacity duration-300 hover:bg-opacity-20"
                      onClick={() => playVideo(index)}
                    >
                      <div className="hover:bg-blue-100 bg-white bg-opacity-90 rounded-full p-4 transform transition-transform group-hover:scale-110">
                        <svg
                          className="w-12 h-12 text-[#02236e]"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Loading indicator for video */}
                  {activeVideo === index && (
                    <div className="absolute top-2 right-2 bg-[#fcdd2d] text-[#222222] text-sm font-medium px-2 py-1 rounded">
                      Playing...
                    </div>
                  )}
                </div>

                {/* Client Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-[#222222] truncate">
                        {feedback.name || "Client Name"}
                      </h3>
                      <p className="text-sm text-[#02236e] font-medium">
                        {feedback.position || "Position"}
                      </p>
                      <p className="text-sm text-[#009dc8] mt-1">
                        {feedback.role || "Role"}
                      </p>
                    </div>

                    {/* Play/Pause Button */}
                    <button
                      onClick={() => playVideo(index)}
                      className="cursor-pointer flex-shrink-0 bg-blue-100 hover:bg-blue-200 text-[#02236e] rounded-full p-2 transition-colors duration-200 ml-4"
                      aria-label={activeVideo === index ? "Pause video" : "Play video"}
                    >
                      {activeVideo === index ? (
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Hover Border */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-200 transition-all duration-300 pointer-events-none"></div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && displayFeedbacks.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
              <div className="text-6xl mb-4">🎬</div>
              <h3 className="text-2xl font-bold text-[#222222] mb-4">
                No Testimonials Available
              </h3>
              <p className="text-[#222222] mb-6">
                There are no client testimonials to display at the moment.
              </p>
              <button
                onClick={fetchTestimonials}
                className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition-colors duration-300"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-[#222222] mb-4">
              Share Your Experience
            </h3>
            <p className="text-[#222222] mb-6">
              Have you worked with Khudii? We'd love to hear about your
              experience and feature your feedback.
            </p>
            <Link to="/contribute-your-story/">
              <button className="cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                Share Your Story
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientFeedbacks;