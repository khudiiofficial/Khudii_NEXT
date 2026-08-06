// import React from 'react'
// import { useState, useEffect,useRef } from 'react'
// import styles from './Crousel.module.css'
// import axios from 'axios'
// import { useNavigate } from '@/lib/router-compat'
// const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');
// // import img from '../../../public/'
// const Crousel = () => {
//         const [hero,sethero]=useState([
//             {image_path:'/1-taryaq-flood-2025-monthly-theme-khudii.webp'},
//             {image_path:'/2-taryaq-flood-2025-monthly-theme-khudii.webp'},
//             { image_path:'/3-taryaq-flood-2025-monthly-theme-khudii.webp'},
//             {image_path:'/6-taryaq-flood-2025-monthly-theme-khudii.webp'},
//             { image_path:'/7-taryaq-flood-2025-monthly-theme-khudii.webp'},
//             { image_path:'/8-taryaq-flood-2025-monthly-theme-khudii.webp'},
            
//         ])
//     const nav=useNavigate()

// const heroRef = useRef(hero);
// const [temp,settemp]=useState([])
// useEffect(() => {
//   heroRef.current = temp; // keep ref updated
// }, [temp]);

//     useEffect(()=>{
//      const func=async()=>{
//         try {
//             const res=await axios.get(`${APIPath}/getCrouselimages`)
//             if(res.status===200){
//                settemp(res.data.data)
//                 if(window.innerWidth<600){
    
// const arr=res.data.data.filter((ele,index)=>{
//     return ele.isMobile===1
// })   

// sethero([...arr])
// }
// else{
//     const arr=res.data.data.filter((ele,index)=>{
//     return ele.isMobile===0
// })
// sethero([...arr])   
// }
//             }
//         } catch (error) {
//             console.log(error)
//         }
//      }
// func()
//     },[])

// ///////////////////
//   useEffect(() => {
//     const handleResize = () => {
       
//                   if(window.innerWidth<600){
    
// const arr=heroRef.current.filter((ele,index)=>{
//     return ele.isMobile===1
// })   
// // console.log(arr) 
// sethero([...arr])
// }
// else{
//     const arr=heroRef.current.filter((ele,index)=>{
//     return ele.isMobile===0
// })
// sethero([...arr])   
// }
      
   
//     };
// // handleResize()
//     window.addEventListener("resize", handleResize);

//     return () => window.removeEventListener("resize", handleResize);
//   }, []);


// ///////////////////

//     const [index, setIndex] = useState(0);
    
//     useEffect(() => {
//         const t = setInterval(() => setIndex(i => (i + 1) % hero.length), 6000);
//         return () => clearInterval(t);
//     }, [hero.length]);

//     return (
//         <>
//             <section aria-roledescription="carousel" aria-label="Homepage banners" className={`${styles.homePage} ${styles.carouselSection}`}>
//                 <div className={styles.carouselContainer}>
//                     {hero.map((src, i) => (
// //                        <img onClick={()=>{nav(`/${src.description}`)}}
// //   key={i}
// //   src={src.image_path}
// //   alt={`Slide ${i}`}
// //   className={`${styles.slide} ${i === index ? styles.slideActive : styles.slideInactive}`}
// //   fetchPriority="high"
// //   decoding="async"
// // />
// <button
//   onClick={() => nav(`/${src.description}`)}
//   className={styles.imageButton}
//   aria-label={`Open ${src.description}`}
// >
//   <img
//     src={src.image_path}
//     alt={src.description || `Slide ${i + 1}`}
//     className={`${styles.slide} ${i === index ? styles.slideActive : styles.slideInactive}`}
//     fetchPriority="high"
//     decoding="async"
//   />
// </button>
//                     ))}
//                     <div className={styles.overlay}></div>
//                 </div>
//                 <div id='star' className={styles.controls}>
//                     {hero.map((_, i) => (
//                     <button  
//   key={i} 
//   onClick={() => setIndex(i)} 
//   className={`${styles.indicator} ${i === index ? styles.indicatorActive : styles.indicatorInactive}`}
//   aria-label={`Go to slide ${i + 1}`}
// aria-current={i === index}
// ></button>
//                     ))}
//                 </div>
//             </section>
//         </>
//     )
//     // 2nd Code
// //     return (
// //   <>
// //     <section className={`${styles.homePage} ${styles.carouselSection}`}>
// //       <div className={styles.carouselContainer}>
// //         {hero.map((item, i) => (
// //           <div 
// //             key={i} 
// //             className={`${styles.slide} ${i === index ? styles.slideActive : styles.slideInactive}`}
// //             aria-hidden={i !== index}
// //           >
// //             <img
// //               src={item.image_path}
// //               alt={`Slide ${i + 1}`}
// //               className={styles.slideImage}
// //               loading="eager"
// //               fetchPriority="high"
// //               decoding="async"
// //             />
// //           </div>
// //         ))}
// //         <div className={styles.overlay}></div>
// //       </div>

// //       <div id="star" className={styles.controls} aria-label="Carousel navigation">
// //         {hero.map((_, i) => (
// //           <button
// //             key={i}
// //             onClick={() => setIndex(i)}
// //             className={`${styles.indicator} ${
// //               i === index ? styles.indicatorActive : styles.indicatorInactive
// //             }`}
// //             aria-label={`Go to slide ${i + 1}`}
// //             aria-current={i === index ? "true" : "false"}
// //           />
// //         ))}
// //       </div>
// //     </section>
// //   </>
// // );
// }

// export default Crousel;


// import React from 'react'
// import { useState, useEffect, useRef } from 'react'
// import styles from './Crousel.module.css'
// import axios from 'axios'
// import { useNavigate } from '@/lib/router-compat'
// const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');

// const Crousel = () => {
//     const [hero, sethero] = useState([
//         { image_path: '/1-taryaq-flood-2025-monthly-theme-khudii.webp' },
//         { image_path: '/2-taryaq-flood-2025-monthly-theme-khudii.webp' },
//         { image_path: '/3-taryaq-flood-2025-monthly-theme-khudii.webp' },
//         { image_path: '/6-taryaq-flood-2025-monthly-theme-khudii.webp' },
//         { image_path: '/7-taryaq-flood-2025-monthly-theme-khudii.webp' },
//         { image_path: '/8-taryaq-flood-2025-monthly-theme-khudii.webp' },
//     ])
//     const nav = useNavigate()
//     const heroRef = useRef(hero);
//     const [temp, settemp] = useState([])
//     const [index, setIndex] = useState(0);
//     const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
//     const [firstImageLoaded, setFirstImageLoaded] = useState(false);

//     useEffect(() => {
//         heroRef.current = temp;
//     }, [temp]);

//     useEffect(() => {
//         const func = async () => {
//             try {
//                 const res = await axios.get(`${APIPath}/getCrouselimages`)
//                 if (res.status === 200) {
//                     settemp(res.data.data)
//                     const isMobileView = window.innerWidth < 600;
//                     const filtered = res.data.data.filter((ele) =>
//                         isMobileView ? ele.isMobile === 1 : ele.isMobile === 0
//                     )
//                     sethero([...filtered])
//                 }
//             } catch (error) {
//                 console.log(error)
//             }
//         }
//         func()
//     }, [])

//     useEffect(() => {
//         const handleResize = () => {
//             const isMobileView = window.innerWidth < 600;
//             setIsMobile(isMobileView);
//             const filtered = heroRef.current.filter((ele) =>
//                 isMobileView ? ele.isMobile === 1 : ele.isMobile === 0
//             )
//             sethero([...filtered])
//         };

//         window.addEventListener("resize", handleResize);
//         return () => window.removeEventListener("resize", handleResize);
//     }, []);

//     useEffect(() => {
//         if (hero.length === 0) return;
//         const t = setInterval(() => setIndex(i => (i + 1) % hero.length), 6000);
//         return () => clearInterval(t);
//     }, [hero.length]);

//     // Preload first image for LCP optimization on mobile
//     useEffect(() => {
//         if (hero.length > 0 && hero[0]?.image_path && !firstImageLoaded) {
//             // Create preload link
//             const link = document.createElement('link');
//             link.rel = 'preload';
//             link.as = 'image';
//             link.href = hero[0].image_path;
//             link.fetchPriority = 'high';
//             document.head.appendChild(link);
            
//             // Preconnect to media domain
//             const preconnect = document.createElement('link');
//             preconnect.rel = 'preconnect';
//             preconnect.href = 'https://media.khudii.com';
//             preconnect.crossOrigin = 'anonymous';
//             document.head.appendChild(preconnect);
            
//             return () => {
//                 if (document.head.contains(link)) {
//                     document.head.removeChild(link);
//                 }
//                 if (document.head.contains(preconnect)) {
//                     document.head.removeChild(preconnect);
//                 }
//             };
//         }
//     }, [hero, firstImageLoaded]);

//     return (
//         <>
//             <section 
//                 aria-roledescription="carousel" 
//                 aria-label="Homepage banners" 
//                 className={`${styles.homePage} ${styles.carouselSection}`}
//             >
//                 <div className={styles.carouselContainer}>
//                     {hero.map((src, i) => (
//                         <button
//                             key={i}
//                             onClick={() => nav(`/${src.description}`)}
//                             className={styles.imageButton}
//                             aria-label={`Open ${src.description || `slide ${i + 1}`}`}
//                         >
//                             <img
//                                 src={src.image_path}
//                                 alt={src.description || `Slide ${i + 1}`}
//                                 className={`${styles.slide} ${i === index ? styles.slideActive : styles.slideInactive}`}
//                                 fetchPriority={i === 0 ? "high" : "low"}
//                                 decoding={i === 0 ? "sync" : "async"}
//                                 loading={i === 0 ? "eager" : "lazy"}
//                                 onLoad={() => {
//                                     if (i === 0) setFirstImageLoaded(true);
//                                 }}
//                                 width={isMobile ? "600" : "1200"}
//                                 height={isMobile ? "400" : "600"}
//                             />
//                         </button>
//                     ))}
//                     <div className={styles.overlay}></div>
//                 </div>
//                 <div id='star' className={styles.controls}>
//                     {hero.map((_, i) => (
//                         <button  
//                             key={i} 
//                             onClick={() => setIndex(i)} 
//                             className={`${styles.indicator} ${i === index ? styles.indicatorActive : styles.indicatorInactive}`}
//                             aria-label={`Go to slide ${i + 1}`}
//                             aria-current={i === index}
//                         />
//                     ))}
//                 </div>
//             </section>
//         </>
//     )
// }

// export default Crousel;





// import React from 'react'
// import { useState, useEffect, useRef } from 'react'
// import styles from './Crousel.module.css'
// import axios from 'axios'
// import { useNavigate } from '@/lib/router-compat'
// const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');

// const Crousel = () => {
//     const [hero, sethero] = useState([
//         { image_path: '/1-taryaq-flood-2025-monthly-theme-khudii.webp' },
//         { image_path: '/2-taryaq-flood-2025-monthly-theme-khudii.webp' },
//         { image_path: '/3-taryaq-flood-2025-monthly-theme-khudii.webp' },
//         { image_path: '/6-taryaq-flood-2025-monthly-theme-khudii.webp' },
//         { image_path: '/7-taryaq-flood-2025-monthly-theme-khudii.webp' },
//         { image_path: '/8-taryaq-flood-2025-monthly-theme-khudii.webp' },
//     ])
//     const nav = useNavigate()
//     const heroRef = useRef(hero);
//     const [temp, settemp] = useState([])
//     const [index, setIndex] = useState(0);
//     const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
//     const [firstImageLoaded, setFirstImageLoaded] = useState(false);

//     useEffect(() => {
//         heroRef.current = temp;
//     }, [temp]);

//     useEffect(() => {
//         const func = async () => {
//             try {
//                 const res = await axios.get(`${APIPath}/getCrouselimages`)
//                 if (res.status === 200) {
//                     settemp(res.data.data)
//                     const isMobileView = window.innerWidth < 600;
//                     const filtered = res.data.data.filter((ele) =>
//                         isMobileView ? ele.isMobile === 1 : ele.isMobile === 0
//                     )
//                     sethero([...filtered])
//                     // Force index to 0 on load to ensure first image is active
//                     setIndex(0);
//                 }
//             } catch (error) {
//                 console.log(error)
//             }
//         }
//         func()
//     }, [])

//     useEffect(() => {
//         const handleResize = () => {
//             const isMobileView = window.innerWidth < 600;
//             setIsMobile(isMobileView);
//             const filtered = heroRef.current.filter((ele) =>
//                 isMobileView ? ele.isMobile === 1 : ele.isMobile === 0
//             )
//             sethero([...filtered])
//             setIndex(0); // Reset index on resize
//         };

//         window.addEventListener("resize", handleResize);
//         return () => window.removeEventListener("resize", handleResize);
//     }, []);

//     useEffect(() => {
//         if (hero.length === 0) return;
//         const t = setInterval(() => setIndex(i => (i + 1) % hero.length), 6000);
//         return () => clearInterval(t);
//     }, [hero.length]);

//     // Critical: Preload and ensure first image is visible
//     useEffect(() => {
//         if (hero.length > 0 && hero[0]?.image_path) {
//             // Preconnect to CDN
//             const preconnect = document.createElement('link');
//             preconnect.rel = 'preconnect';
//             preconnect.href = 'https://media.khudii.com';
//             preconnect.crossOrigin = 'anonymous';
//             document.head.appendChild(preconnect);
            
//             // Preload first image
//             const link = document.createElement('link');
//             link.rel = 'preload';
//             link.as = 'image';
//             link.href = hero[0].image_path;
//             link.fetchPriority = 'high';
//             document.head.appendChild(link);
            
//             return () => {
//                 if (document.head.contains(link)) document.head.removeChild(link);
//                 if (document.head.contains(preconnect)) document.head.removeChild(preconnect);
//             };
//         }
//     }, [hero]);

//     return (
//         <>
//             <section 
//                 aria-roledescription="carousel" 
//                 aria-label="Homepage banners" 
//                 className={`${styles.homePage} ${styles.carouselSection}`}
//             >
//                 <div className={styles.carouselContainer}>
//                     {hero.map((src, i) => {
//                         // Critical: First image should always be visible initially
//                         const isActive = i === index;
//                         const shouldBeVisible = i === 0; // First image always visible initially
                        
//                         return (
//                             <div
//                                 key={i}
//                                 className={`${styles.slideWrapper} ${isActive ? styles.activeWrapper : ''}`}
//                                 style={{ display: shouldBeVisible && !isActive ? 'block' : undefined }}
//                             >
//                                 <button
//                                     onClick={() => nav(`/${src.description}`)}
//                                     className={styles.imageButton}
//                                     aria-label={`Open ${src.description || `slide ${i + 1}`}`}
//                                 >
//                                     <img
//                                         src={src.image_path}
//                                         alt={src.description || `Slide ${i + 1}`}
//                                         className={`${styles.slide} ${isActive ? styles.slideActive : styles.slideInactive}`}
//                                         fetchPriority={i === 0 ? "high" : "low"}
//                                         decoding={i === 0 ? "sync" : "async"}
//                                         loading={i === 0 ? "eager" : "lazy"}
//                                         onLoad={() => {
//                                             if (i === 0) setFirstImageLoaded(true);
//                                         }}
//                                         width={isMobile ? "600" : "1200"}
//                                         height={isMobile ? "400" : "600"}
//                                         style={{ 
//                                             position: i === 0 && !isActive ? 'relative' : 'absolute',
//                                             opacity: i === 0 && !isActive ? 0 : undefined,
//                                             visibility: i === 0 && !isActive ? 'hidden' : undefined
//                                         }}
//                                     />
//                                 </button>
//                             </div>
//                         );
//                     })}
//                     <div className={styles.overlay}></div>
//                 </div>
//                 <div id='star' className={styles.controls}>
//                     {hero.map((_, i) => (
//                         <button  
//                             key={i} 
//                             onClick={() => setIndex(i)} 
//                             className={`${styles.indicator} ${i === index ? styles.indicatorActive : styles.indicatorInactive}`}
//                             aria-label={`Go to slide ${i + 1}`}
//                             aria-current={i === index}
//                         />
//                     ))}
//                 </div>
//             </section>
//         </>
//     )
// }

// export default Crousel;





import React from 'react'
import { useState, useEffect, useRef } from 'react'
import styles from './Crousel.module.css'
import axios from 'axios'
import { useNavigate } from '@/lib/router-compat'
const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');

const Crousel = () => {
    const [hero, sethero] = useState([
        { image_path: '/1-taryaq-flood-2025-monthly-theme-khudii.webp' },
        { image_path: '/2-taryaq-flood-2025-monthly-theme-khudii.webp' },
        { image_path: '/3-taryaq-flood-2025-monthly-theme-khudii.webp' },
        { image_path: '/6-taryaq-flood-2025-monthly-theme-khudii.webp' },
        { image_path: '/7-taryaq-flood-2025-monthly-theme-khudii.webp' },
        { image_path: '/8-taryaq-flood-2025-monthly-theme-khudii.webp' },
    ])
    const nav = useNavigate()
    const heroRef = useRef(hero);
    const [temp, settemp] = useState([])
    const [index, setIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
    const preloadLinkRef = useRef(null);

    useEffect(() => {
        heroRef.current = temp;
    }, [temp]);

    useEffect(() => {
        const func = async () => {
            try {
                const res = await axios.get(`${APIPath}/getCrouselimages`)
                if (res.status === 200) {
                    settemp(res.data.data)
                    const isMobileView = window.innerWidth < 600;
                    const filtered = res.data.data.filter((ele) =>
                        isMobileView ? ele.isMobile === 1 : ele.isMobile === 0
                    )
                    sethero([...filtered])
                    setIndex(0);
                }
            } catch (error) {
                console.log(error)
            }
        }
        func()
    }, [])

    // Dynamic preload for first image
    useEffect(() => {
        if (hero.length > 0 && hero[0]?.image_path) {
            if (preloadLinkRef.current && document.head.contains(preloadLinkRef.current)) {
                document.head.removeChild(preloadLinkRef.current);
            }
            
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = hero[0].image_path;
            link.fetchPriority = 'high';
            document.head.appendChild(link);
            preloadLinkRef.current = link;
            
            return () => {
                if (preloadLinkRef.current && document.head.contains(preloadLinkRef.current)) {
                    document.head.removeChild(preloadLinkRef.current);
                }
            };
        }
    }, [hero]);

    useEffect(() => {
        const handleResize = () => {
            const isMobileView = window.innerWidth < 600;
            setIsMobile(isMobileView);
            const filtered = heroRef.current.filter((ele) =>
                isMobileView ? ele.isMobile === 1 : ele.isMobile === 0
            )
            sethero([...filtered])
            setIndex(0);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (hero.length === 0) return;
        const t = setInterval(() => setIndex(i => (i + 1) % hero.length), 6000);
        return () => clearInterval(t);
    }, [hero.length]);

    return (
        <>
            <section 
                aria-roledescription="carousel" 
                aria-label="Homepage banners" 
                className={`${styles.homePage} ${styles.carouselSection}`}
            >
                <div className={styles.carouselContainer}>
                    {hero.map((src, i) => {
                        const isActive = i === index;
                        
                        return (
                            <button
                                key={i}
                                onClick={() => nav(`/${src.description}`)}
                                className={styles.imageButton}
                                aria-label={`Open ${src.description || `slide ${i + 1}`}`}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    width: '100%',
                                    height: '100%',
                                    padding: 0,
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    zIndex: isActive ? 10 : 0,
                                    opacity: isActive ? 1 : 0,
                                    transition: 'opacity 0.7s ease-in-out'
                                }}
                            >
                                <img
                                    src={src.image_path}
                                    alt={src.description || `Slide ${i + 1}`}
                                    className={styles.slide}
                                    fetchPriority={i === 0 ? "high" : "low"}
                                    decoding={i === 0 ? "sync" : "async"}
                                    loading={i === 0 ? "eager" : "lazy"}
                                    width={isMobile ? "600" : "1200"}
                                    height={isMobile ? "400" : "600"}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            </button>
                        );
                    })}
                    <div className={styles.overlay}></div>
                </div>
                <div id='star' className={styles.controls}>
                    {hero.map((_, i) => (
                        <button  
                            key={i} 
                            onClick={() => setIndex(i)} 
                            className={`${styles.indicator} ${i === index ? styles.indicatorActive : styles.indicatorInactive}`}
                            aria-label={`Go to slide ${i + 1}`}
                            aria-current={i === index}
                        />
                    ))}
                </div>
            </section>
        </>
    )
}

export default Crousel;