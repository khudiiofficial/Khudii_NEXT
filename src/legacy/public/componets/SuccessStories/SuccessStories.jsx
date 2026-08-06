

// import React from 'react'
// import styles from './Success.module.css'
// import { useState,useEffect } from 'react'
// import { Link } from '@/lib/router-compat'
// const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');
// import axios from 'axios';
// const SuccessStories = () => {
// const [arr,setarr]=useState([
// ])
// const [width,setWidth]=useState(null)
// const [item,setitems]=useState({})

// useEffect(()=>{
// const adjustwidth=()=>{
// const getwidth=window.innerWidth;
// setWidth(getwidth)
// }
// adjustwidth();
// window.addEventListener('resize',adjustwidth)
// return ()=> window.removeEventListener('resize',adjustwidth)
// },[])
// useEffect(()=>{
// const func=async()=>{
// try {
//   const res=await axios.get(`${APIPath}/getsuccessstories`)
//   if(res.status===200 && res.data.length>6){
//     res.data=res.data.slice(0,6)
//     setarr(res.data)
//   }
// } catch (error) {
//   console.log(error)
// }
// }
// func()
// },[])


// useEffect(()=>{
// const call=async()=>{
//   try {
//     const res=await axios.get(`${APIPath}/api/stories`)
//     if(res.status===200){
//     setitems(res.data.data)
    
//     }
//   } catch (error) {
//     console.log(error)
//   }
// }
// call();
//   },[])


//   return (
//    <>
//    <div className={`${styles.class3}`}>
   
//     <div className="max-w-[1240px] w-full mx-auto relative px-4">
//   <div className="flex items-center justify-between py-8">
   
//     <div className={`${styles.ssh_left} flex-shrink-0 invisible`}>
//       <span className="inline-block font-semibold">
//       Explore Organizations
//     </span>
//     </div>

//   <div className="flex-1 text-center">
//   <h2 
//     className={`${styles.ssh_center} w-full text-2xl sm:text-3xl font-bold text-[#02236e] text-center block`}>
//     Success Stories
//   </h2>
//   </div>
  
//     <div className={`${styles.ssh_right} hidden`}>
//       <Link 
//         to="/success-stories/" 
//         className="inline-flex items-center font-medium transition-colors group"
//       >
//         Explore More Stories&nbsp;
//         <svg
//         className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform"
//         fill="none"
//         stroke="currentColor"
//         viewBox="0 0 24 24"
//         aria-hidden="true"
//       >
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//       </svg>
//       </Link>
//     </div>
//   </div>
// </div>



//     <div className="max-w-[1240px] w-full mx-auto pb-6 px-4 sm:px-6">
//   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//     {arr.map((ele, index) => (
//       <Link 
//         key={index} 
//         to={`/success-stories/${ele.slug}`} 
//         className="block group"
//       >
//         <div className="relative pb-[55.63%]"> 
//           <img
//             src={`https://img.youtube.com/vi/${ele.youtube_id}/maxresdefault.jpg`}
//             alt={`Success story ${index + 1}`}
//             title="Success Story"
//             loading="lazy"
//             className="absolute top-0 left-0 w-full h-full object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
//             width="380"
//             height="200"
//           />
//         </div>
//       </Link>
//     ))}
//   </div>
// </div>



//     <div style={{
//     backgroundImage: `url(${item.image_path})`,
// }} className={`${styles.class5}`}>
//     <div className={`${styles.class6} flex lg:items-center lg:justify-center`}>
//         <div className={styles.sample}>
//             <div className={`${styles.newparent} flex flex-cols-1 sm:flex-cols-1 md:flex-cols-1 lg:flex-cols-2`}>
              
//                 <div className="w-full px-[5%] items-center justify-center lg:px-0">
//                     <div className="max-w-[1240px] mx-auto">
//                         <div className="grid grid-cols-1 lg:grid-cols-[60%_40%]">
                         
//                             <div className="py-6 lg:py-8 flex flex-col gap-3">
//                                 <h3 className={`${styles.title_flood} text-white lg:text-[32px] md:text-2xl text-xl font-bold mb-2 md:mb-4 text-left lg:text-left flex-wrap`}>
//                                     {item.title}
//                                 </h3>
//                                 <p className={`${styles.desp_flood} text-white lg:text-[25px] md:text-lg text-base leading-relaxed mb-4 md:mb-6 text-left lg:text-left`}>
//                                     {item.description}
//                                 </p>

                               
//                                 <div className="text-center md:text-right lg:text-left">
//                                     <button className="bg-[#E3001C] rounded-[25px] text-white font-semibold py-3 px-6 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 ">
//                                         <Link to="/donate-now/" className="flex items-center gap-2">
//                                             Donate Now
//                                             <i className="fa-solid fa-hands-praying"></i>
//                                         </Link>
//                                     </button>
//                                 </div>
//                             </div>

                           
//                             <div className="hidden lg:block"></div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     </div>
// </div>
   
//     </div>
// </>
//   )
// }

// export default SuccessStories

import React from 'react'
import styles from './Success.module.css'
import { useState, useEffect } from 'react'
import { Link } from '@/lib/router-compat'
const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');
import axios from 'axios';

const SuccessStories = () => {
  const [arr, setarr] = useState([])
  const [width, setWidth] = useState(null)
  const [item, setitems] = useState({})

  useEffect(() => {
    const adjustwidth = () => {
      const getwidth = window.innerWidth;
      setWidth(getwidth)
    }
    adjustwidth();
    window.addEventListener('resize', adjustwidth)
    return () => window.removeEventListener('resize', adjustwidth)
  }, [])

  useEffect(() => {
    const func = async () => {
      try {
        const res = await axios.get(`${APIPath}/getsuccessstories`)
        if (res.status === 200 && res.data.length > 6) {
          res.data = res.data.slice(0, 6)
          setarr(res.data)
        }
      } catch (error) {
        console.log(error)
      }
    }
    func()
  }, [])

  useEffect(() => {
    const call = async () => {
      try {
        const res = await axios.get(`${APIPath}/api/stories`)
        if (res.status === 200) {
          setitems(res.data.data)
        }
      } catch (error) {
        console.log(error)
      }
    }
    call();
  }, [])

  return (
    <>
      <div className={`${styles.class3}`}>
        {/* Header Section with improved accessibility */}
        <div className="max-w-[1240px] w-full mx-auto relative px-4">
          <div className="flex items-center justify-between py-8">
            <div className={`${styles.ssh_left} flex-shrink-0 invisible`}>
              <span className="inline-block font-semibold" aria-hidden="true">
                Explore Organizations
              </span>
            </div>
            
            <div className="flex-1 text-center">
              <h2 
                className={`${styles.ssh_center} w-full text-2xl sm:text-3xl font-bold text-[#0033A0] text-center block`}
                id="success-stories-heading"
              >
                Success Stories
              </h2>
            </div>
            
            <div className={`${styles.ssh_right} hidden md:block`}>
              <Link 
                to="/success-stories/" 
                className="inline-flex items-center font-medium transition-colors group"
                aria-label="Explore more success stories"
              >
                Explore More Stories&nbsp;
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
        </div>

        {/* Stories Grid with improved accessibility */}
        <div className="max-w-[1240px] w-full mx-auto pb-6 px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {arr.map((ele, index) => (
              <Link 
                key={index} 
                to={`/success-stories/${ele.slug}`} 
                className="block group focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                aria-label={`Watch success story ${index + 1}`}
              >
                <div className="relative pb-[55.63%]"> 
                  <img
                    src={`https://img.youtube.com/vi/${ele.youtube_id}/maxresdefault.jpg`}
                    alt={`Success story video thumbnail ${index + 1}`}
                    title="Success Story Video"
                    loading="lazy"
                    className="absolute top-0 left-0 w-full h-full object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                    width="380"
                    height="200"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Hero Section with improved accessibility */}
        <div style={{
          backgroundImage: `url(${item.image_path})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          backgroundPosition: 'center',
        }} className={`${styles.class5}`}>
          <div className={`${styles.class6} flex lg:items-center lg:justify-center`}>
            <div className={styles.sample}>
              <div className={`${styles.newparent} flex flex-cols-1 sm:flex-cols-1 md:flex-cols-1 lg:flex-cols-2`}>
                <div className="w-full px-[5%] items-center justify-center lg:px-0">
                  <div className="max-w-[1240px] mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-[60%_40%]">
                      <div className="py-6 lg:py-8 flex flex-col gap-3">
                        <h3 className={`${styles.title_flood} text-white lg:text-[32px] md:text-2xl text-xl font-bold mb-2 md:mb-4 text-left lg:text-left flex-wrap`}>
                          {item.title}
                        </h3>
                        <p className={`${styles.desp_flood} text-white lg:text-[25px] md:text-lg text-base leading-relaxed mb-4 md:mb-6 text-left lg:text-left`}>
                          {item.description}
                        </p>

                        {/* Donate Button with proper accessible name */}
                        <div className="text-center md:text-right lg:text-left">
                          <button 
                            className="bg-[#CC0000] rounded-[25px] text-white font-semibold py-3 px-6 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 min-h-[44px] min-w-[44px]"
                            aria-label="Donate Now to support our cause"
                          >
                            <Link 
                              to="/donate-now/" 
                              className="flex items-center gap-2"
                              aria-label="Go to donation page"
                            >
                              Donate Now
                              <i className="fa-solid fa-hands-praying" aria-hidden="true"></i>
                            </Link>
                          </button>
                        </div>
                      </div>
                      <div className="hidden lg:block" aria-hidden="true"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SuccessStories