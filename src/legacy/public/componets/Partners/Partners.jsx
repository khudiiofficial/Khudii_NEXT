
// import React, { useEffect, useRef, useState } from 'react';
// import styles from './partners.module.css';
// const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');
// import { useNavigate } from '@/lib/router-compat';
// import axios from 'axios'
// const Partners = () => {
//   const [animatedIndices, setAnimatedIndices] = useState(new Set());
//   const imageRefs = useRef([]);
//   const nav=useNavigate()

//     const [arr,setarr] = useState([]);
//     useEffect(()=>{
// const call=async()=>{
//   try {
//     const res=await axios.get(`${APIPath}/items`)
//     if(res.status===200){
      
//   setarr(res.data)
//     }
    
//   } catch (error) {
//     console.error(error)
//   }
// }
// call()
//     },[])



//   useEffect(() => {
//   if (arr.length === 0) return;

//   const observer = new IntersectionObserver((entries) => {
//     entries.forEach((entry) => {
//       if (entry.isIntersecting) {
//         const index = imageRefs.current.indexOf(entry.target);
//         if (index !== -1) {
//           setAnimatedIndices(prev => new Set(prev).add(index));
//         }
//       }
//     });
//   });

//   imageRefs.current.forEach((ref) => ref && observer.observe(ref));

//   return () => observer.disconnect();
// }, [arr]);

//   return (
//     <div className="w-full flex flex-col bg-[#f0f0f0] items-center">
    
//       <h2 className="text-2xl sm:text-3xl font-bold text-[#02236e] p-4 md:p-8 lg:p-10">
//         Our Partners
//       </h2>

   
//       <div>
//       <div className="max-w-[1240px] mx-auto px-4 flex flex-wrap justify-center items-center gap-2 sm:gap-2 md:gap-4 pb-8">
//         {arr.map((ele, index) => (
//           <div onClick={()=>{nav(`/${ele.slug}`)}}
//             key={index}
//             ref={(el) => (imageRefs.current[index] = el)}
//             className={`${styles.partner_mob} cursor-pointer flex flex-wrap items-center justify-center transition-transform duration-300 hover:scale-105 overflow-hidden sm:w-[calc(40%-4px)] lg:w-[225px] lg:h-[225px] bg-white rounded-[20px]`}
//           >
          
//             <img
//               src={ele.partner_image}
//               alt={`Partner ${index + 1} logo`}
//               className={`w-full h-full object-contain transition-all duration-300 p-0 ${
//                 animatedIndices.has(index)
//                   ? 'opacity-100 translate-y-0'
//                   : 'opacity-0 translate-y-5'
//               }`}
//               style={{
//                 transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
//               }}
//               loading="lazy"
//             />
//           </div>
//         ))}
//       </div>
//     </div>
//     </div>
//   );
// };

// export default Partners;

import React, { useEffect, useRef, useState } from 'react';
import styles from './partners.module.css';
const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');
import { useNavigate } from '@/lib/router-compat';
import axios from 'axios';

const Partners = () => {
  const [animatedIndices, setAnimatedIndices] = useState(new Set());
  const imageRefs = useRef([]);
  const nav = useNavigate();

  const [arr, setarr] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const call = async () => {
      try {
        const res = await axios.get(`${APIPath}/items`);
        if (res.status === 200) {
          setarr(res.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    call();
  }, []);

  useEffect(() => {
    if (arr.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = imageRefs.current.indexOf(entry.target);
            if (index !== -1) {
              setAnimatedIndices((prev) => new Set(prev).add(index));
            }
          }
        });
      },
      {
        threshold: 0.1, // Trigger when at least 10% of element is visible
        rootMargin: '50px', // Start loading slightly before element enters viewport
      }
    );

    imageRefs.current.forEach((ref) => ref && observer.observe(ref));

    return () => observer.disconnect();
  }, [arr]);

  // Handle keyboard navigation for partner cards
  const handleKeyPress = (e, slug) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      nav(`/${slug}`);
    }
  };

  return (
    <section 
      className="w-full flex flex-col bg-[#f0f0f0] items-center"
      aria-label="Our Partners section"
    >
      {/* Heading with improved contrast */}
      <h2 
        className="text-2xl sm:text-3xl font-bold text-[#0033A0] p-4 md:p-8 lg:p-10"
        id="partners-heading"
      >
        Our Partners
      </h2>

      {/* Loading state */}
      {loading && (
        <div 
          className="text-center py-8"
          role="status"
          aria-live="polite"
          aria-label="Loading partners"
        >
          <p className="text-gray-600">Loading partners...</p>
        </div>
      )}

      {/* Partners Grid */}
      {!loading && arr.length > 0 && (
        <div className="max-w-[1240px] mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-2 md:gap-4 pb-8">
            {arr.map((ele, index) => (
              <div
                key={ele.id || index}
                onClick={() => nav(`/${ele.slug}`)}
                onKeyPress={(e) => handleKeyPress(e, ele.slug)}
                ref={(el) => (imageRefs.current[index] = el)}
                className={`${styles.partner_mob} cursor-pointer flex items-center justify-center transition-all duration-300 hover:scale-105 overflow-hidden sm:w-[calc(40%-4px)] lg:w-[225px] lg:h-[225px] bg-white rounded-[20px] shadow-md hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                role="button"
                tabIndex={0}
                aria-label={`View details for partner ${ele.name || `partner ${index + 1}`}`}
                aria-labelledby={`partner-name-${index}`}
              >
                <div className="w-full h-full p-4 flex items-center justify-center">
                  <img
                    src={ele.partner_image}
                    alt={`${ele.name || `Partner ${index + 1}`} logo`}
                    className={`w-full h-full object-contain transition-all duration-300 ${
                      animatedIndices.has(index)
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-5'
                    }`}
                    style={{
                      transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
                    }}
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/fallback-partner.png';
                      e.target.alt = `Logo for ${ele.name || 'partner'} (image unavailable)`;
                    }}
                  />
                </div>
                {/* Hidden name for screen readers */}
                <span id={`partner-name-${index}`} className="sr-only">
                  {ele.name || `Partner ${index + 1}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && arr.length === 0 && (
        <div 
          className="text-center py-8"
          role="status"
          aria-live="polite"
          aria-label="No partners found"
        >
          <p className="text-gray-600">No partners found.</p>
        </div>
      )}
    </section>
  );
};

export default Partners;