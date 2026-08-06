// import React from 'react'
// import styles from './welcome.module.css'
// const WelcomeSection = () => {
//   return (
//     <>
// <br />

// <div className={`${styles.pad} grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6`}>
//   <div className={` ${styles.newclass} min-h-[270px] max-h-[1000px]`}> 
//     <h1 className={`${styles.size}`}>Welcome To Khudii</h1> 

//     Not the kind of dream that we see when asleep though. A dream that doesn’t discriminate between color, caste, creed, nationality, status or any other identity marker. This all-encompassing vision of service to mankind is what Islam also preaches and stands for. It has been stated in the Quran:
// “Indeed, We created you from a male and a female, and made you into peoples and tribes so that you may ˹get to˺ know one another. Surely the most noble of you in the sight of Allah is the most righteous among you. Allah is truly All-Knowing, All-Aware.” (Surah Al-Hujraat :13)

//     </div>



//   <div className={`flex items-center justify-center`}>

//        <iframe
//        className={`${styles.gborder}`}
//         width="560"
//         height="315"
//         src="https://www.youtube.com/embed/hZyp2wOkqBs"
//         title="YouTube video player"
//         frameBorder="0"
//         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//         allowFullScreen
//       ></iframe>
//   </div>
//   {/* <div className={`flex items-center justify-center`}><img  src="/maxresdefault.jpg" className={`${styles.class2} h-60 `} alt="" /></div> */}
// </div>
// <br /><br />
//     </>
//   )
// }

// export default WelcomeSection

// import React, { useState } from 'react'
// import styles from './welcome.module.css'

// const WelcomeSection = () => {
//   const [videoLoaded, setVideoLoaded] = useState(false);

//   const handlePlayVideo = () => {
//     setVideoLoaded(true);
//   };

//   return (
//     <>

//       <div className={styles.parent}>
//       <div className={`${styles.pad} grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6`}>
//         <div className={`${styles.newclass} min-h-[270px] max-h-[1000px]`}> 
//           <h1 className={`${styles.size}`}>Welcome To Khudii</h1> 
//           Not the kind of dream that we see when asleep though. A dream that doesn't discriminate between color, caste, creed, nationality, status or any other identity marker. This all-encompassing vision of service to mankind is what Islam also preaches and stands for. It has been stated in the Quran:
//           "Indeed, We created you from a male and a female, and made you into peoples and tribes so that you may ˹get to˺ know one another. Surely the most noble of you in the sight of Allah is the most righteous among you. Allah is truly All-Knowing, All-Aware." (Surah Al-Hujraat :13)
//         </div>

//         <div className={`flex items-center justify-center`}>
//           {!videoLoaded ? (
//             <div 
//               className={`${styles.gborder} ${styles.videoPlaceholder}`}
//               onClick={handlePlayVideo}
//             >
//               <div className={styles.playButtonContainer}>
//                <center>
//                 <div className={styles.playButton}>
//                   <svg width="80" height="80" viewBox="0 0 100 100">
//                     <circle cx="50" cy="50" r="45" fill="red" opacity="0.9"/>
//                     <polygon points="40,30 40,70 70,50" fill="white"/>
//                   </svg>
//                 </div>
//                 </center>
//                 <div className={styles.playText}>
//                   Click to play video
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <iframe
//               className={`${styles.gborder}`}
//               width="560"
//               height="315"
//               src="https://www.youtube.com/embed/hZyp2wOkqBs?autoplay=1"
//               title="YouTube video player"
//               frameBorder="0"
//               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//               allowFullScreen
//               loading="lazy"
//             ></iframe>
//           )}
//         </div>
//       </div>
//       </div>

//     </>
//   )
// }

// export default WelcomeSection

// 2nd Code

// import React, { useState,useEffect } from 'react'
// import axios from 'axios'
// const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');
// const WelcomeSection = () => {
//   const [videoLoaded, setVideoLoaded] = useState(false);
//   const [data,setdata]=useState({youtube_video_id:"hZyp2wOkqBs"})
//   useEffect(()=>{
// const call=async()=>{
//   try {
//     const res=await axios.get(`${APIPath}/api/welcome`)
//     if(res.status===200){
//     setdata(res.data.data)

//     }
//   } catch (error) {
//     console.log(error)
//   }
// }
// call();
//   },[])
//   const handlePlayVideo = () => {
//     setVideoLoaded(true);
//   };

//   return (
//     <>
//       <style>{`
//         .parent {
//           display: flex;
//           justify-content: center;
//           padding-bottom: 30px;
//         }

//         .pad {
//           width: 1240px;
//           max-width: 100%;
//           padding: 0 20px;
//           border-radius: 20px;
//           display: grid;
//           grid-template-columns: 1fr 1fr;
//           gap: 3rem;
//           align-items: center;
//         }

//         .size {
//           font-size: 3rem;
//           font-weight: 600;
//           color: #02236e;
//           margin-bottom: 1rem;
//         }

//         .newclass {
//           word-wrap: break-word;
//           overflow-wrap: break-word;
//           hyphens: auto;
//           text-align: justify;
//           line-height: 1.6;
//           font-size: 1.1rem;
//           color: #222;
//         }

//         .gborder {
//           border-radius: 20px;
//           overflow: hidden;
//           width: 100%;
//           max-width: 560px;
//           aspect-ratio: 16 / 9;
//           border: none;
//         }

//         .gborder iframe {
//           width: 100%;
//           height: 100%;
//           border: none;
//         }

//         .videoPlaceholder {

//           background-size: cover;
//           background-position: center;
//           cursor: pointer;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           position: relative;
//           transition: transform 0.3s ease;
//         }

//         .videoPlaceholder:hover {
//           transform: scale(1.02);
//         }

//         .videoPlaceholder:hover::before {
//           background: rgba(0, 0, 0, 0.2);
//         }

//         .playButtonContainer {
//           position: relative;
//           z-index: 2;
//           text-align: center;
//         }

//         .playButton {
//           transition: transform 0.3s ease;
//         }

//         .videoPlaceholder:hover .playButton {
//           transform: scale(1.1);
//         }

//         .playText {
//           margin-top: 10px;
//           color: white;
//           font-weight: 600;
//           font-size: 1rem;
//           text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
//         }

//         .videoContainer {
//           display: flex;
//           align-items: center;
//           justify-content: center;
//         }

//         /* Tablet Screens */
//         @media (max-width: 1280px) {
//           .pad {
//             width: 100%;
//             padding: 0 40px;
//           }
//         }

//         @media (max-width: 992px) {
//           .pad {
//             grid-template-columns: 1fr;
//             text-align: center;
//             padding: 0 20px;
//             gap: 2rem;
//           }

//           .size {
//             font-size: 2.5rem;
//           }

//           .newclass {
//             text-align: justify;
//             font-size: 1rem;
//           }

//           .gborder {
//             max-width: 100%;
//           }
//         }

//         /* Mobile Screens */
//         @media (max-width: 768px) {  
//           .pad {
//             padding: 0 30px;
//             gap: 1.5rem;
//           }

//           .size {
//             font-size: 2rem;
//           }

//           .newclass {
//             font-size: 0.95rem;
//             line-height: 1.5;
//           }

//           .gborder {
//             aspect-ratio: 16 / 9;
//           }

//           .playButton svg {
//             width: 60px;
//             height: 60px;
//           }

//           .playText {
//             font-size: 0.9rem;
//           }
//         }

//         @media (max-width: 576px) {
//         .parent {
//         padding: 0;
//         }

//         .size {
//             font-size: 1.6rem;
//             text-align: center;
//           }
//         .newclass {
//             font-size: 1rem;
//           }
//         }

//         @media (max-width: 480px) {
//           .pad {
//             padding: 0 15px;
//           }

//           .size {
//           font-size: 1.5rem;
//           text-align: center;
//           }

//           .newclass {
//             font-size: 1rem;
//           }

//           .gborder {
//             aspect-ratio: 16 / 9;
//             border-radius: 15px;
//           }

//           .playButton svg {
//             width: 50px;
//             height: 50px;
//           }

//           .playText {
//             font-size: 0.8rem;
//           }
//         }

//         @media (max-width: 360px) {
//           .size {
//             font-size: 1.4rem;
//           }
//           .newclass {
//             font-size: 0.85rem;
//           }
//         }
//       `}</style>

//       <div className="parent">
//         <div className="pad">
//           <div className="newclass"> 
//             <h1 className="size">{data.welcome_title}</h1> 
//             {data.welcome_description}
//           </div>

//           <div className="videoContainer">
//             {!videoLoaded ? (
//               <div 
//               style={{
//     backgroundImage: `url(https://img.youtube.com/vi/${data.youtube_video_id}/hqdefault.jpg)`
//   }}
//                 className="gborder videoPlaceholder"
//                 onClick={handlePlayVideo}
//               >
//                 <div className="playButtonContainer">
//                   <center>
//                     <div className="playButton">
//                       <svg width="80" height="80" viewBox="0 0 100 100">
//                         <circle cx="50" cy="50" r="45" fill="red" opacity="0.9"/>
//                         <polygon points="40,30 40,70 70,50" fill="white"/>
//                       </svg>
//                     </div>
//                   </center>
//                   <div className="playText">
//                     Click to play video
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <iframe
//                 className="gborder"
//                 width="560"
//                 height="315"
//                 src={`https://www.youtube.com/embed/${data.youtube_video_id}?autoplay=1`}
//                 title="YouTube video player"
//                 frameBorder="0"
//                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                 allowFullScreen
//                 loading="lazy"
//               ></iframe>
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   )
// }

// export default WelcomeSection



import React, { useState, useEffect } from 'react'
import axios from 'axios'
import styles from './welcome.module.css'

const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');

const WelcomeSection = () => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [data, setdata] = useState({ youtube_video_id: "hZyp2wOkqBs" });

  useEffect(() => {
    const call = async () => {
      try {
        const res = await axios.get(`${APIPath}/api/welcome`)
        if (res.status === 200) {
          setdata(res.data.data)
        }
      } catch (error) {
        console.log(error)
      }
    }
    call();
  }, [])

  const handlePlayVideo = () => {
    setVideoLoaded(true);
  };

  return (
    <section aria-labelledby="welcome-heading" className={styles.parent}>
      <div className={styles.pad}>

        {/* TEXT CONTENT */}
        <div className={styles.newclass}>
          <h2 id="welcome-heading" className={styles.size}>
            {data.welcome_title}
          </h2>
          <p>{data.welcome_description}</p>
        </div>

        {/* VIDEO SECTION */}
        <div className={styles.videoContainer}>
          {!videoLoaded ? (
            <button
              className={`${styles.gborder} ${styles.videoPlaceholder}`}
              onClick={handlePlayVideo}
              aria-label="Play welcome video"
              aria-pressed={videoLoaded}
              style={{
                backgroundImage: `url(https://img.youtube.com/vi/${data.youtube_video_id}/hqdefault.jpg)`
              }}
            >
              <div className={styles.playButtonContainer}>
                <div className={styles.playButton}>
                  <svg width="80" height="80" viewBox="0 0 100 100" aria-hidden="true">
                    <circle cx="50" cy="50" r="45" fill="red" opacity="0.9" />
                    <polygon points="40,30 40,70 70,50" fill="white" />
                  </svg>
                </div>
                <div className={styles.playText}>
                  Click to play video
                </div>
              </div>
            </button>
          ) : (
            <iframe
              className={styles.gborder}
              src={`https://www.youtube.com/embed/${data.youtube_video_id}?autoplay=1`}
              title={`Welcome video: ${data.welcome_title}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            ></iframe>
          )}
        </div>

      </div>
    </section>
  )
}

export default WelcomeSection