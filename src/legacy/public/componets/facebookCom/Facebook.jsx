// import React, { useState, useEffect, useRef } from "react";
// import { FacebookProvider, Page } from "react-facebook";

// export default function FacebookPage() {
//   const containerRef = useRef(null);
//   const [width, setWidth] = useState(600); // default width
//   const [isVisible, setIsVisible] = useState(false); // ✅ track visibility

//   useEffect(() => {
//     // Update width dynamically
//     const updateWidth = () => {
//       if (containerRef.current) {
//         const newWidth = containerRef.current.offsetWidth;
//         setWidth(newWidth > 600 ? 600 : newWidth);
//       }
//     };

//     updateWidth();
//     window.addEventListener("resize", updateWidth);

//     return () => {
//       window.removeEventListener("resize", updateWidth);
//     };
//   }, []);

//   useEffect(() => {
//     // ✅ Lazy load using IntersectionObserver
//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             setIsVisible(true);
//             observer.disconnect(); // stop observing after load
//           }
//         });
//       },
//       { threshold: 0.2 } // load when 20% of the component is visible
//     );

//     if (containerRef.current) {
//       observer.observe(containerRef.current);
//     }

//     return () => observer.disconnect();
//   }, []);

//   return (
//     <div
//       ref={containerRef}
//       className="w-full max-w-3xl mx-auto px-4 py-10 flex justify-center"
//     >
//       {isVisible ? (
//         <FacebookProvider appId="Your_APP_ID">
//           <Page
//             href="https://www.facebook.com/Khudiioficial/"
//             tabs="timeline"
//             height={600}
//             width={width}
//             adaptContainerWidth={false} // we control width manually
//           />
//         </FacebookProvider>
//       ) : (
//         // ✅ Placeholder (skeleton loader or spinner)
//         <div className="w-full h-[600px] flex items-center justify-center bg-gray-100 rounded-lg">
//           <span className="text-gray-500">Loading Facebook Page…</span>
//         </div>
//       )}
//     </div>
//   );
// }


// import React, { useState, useRef, useEffect } from 'react';

// const FacebookPage = () => {
//   const containerRef = useRef(null);
//   const [containerWidth, setContainerWidth] = useState(500);
//   const [containerHeight, setContainerHeight] = useState(900);
//   useEffect(() => {
//     const updateWidth = () => {
//       if (containerRef.current) {
//         const width = Math.min(containerRef.current.offsetWidth, 500);
//         setContainerWidth(width);
//       }
//     };


//       const updateHeight = () => {
//       if (containerRef.current) {
//         const height = Math.min(containerRef.current.offsetHeight, 500);
//         setContainerHeight(height);
//       }
//     };
//     updateHeight();
//     updateWidth();
//       window.addEventListener('resize', updateHeight);
//     window.addEventListener('resize', updateWidth);
//     return () => {
//       window.removeEventListener('resize', updateWidth);
//       window.removeEventListener('resize', updateHeight);
//     }
//   }, []);

//   const facebookSrc = `https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2FKhudiioficial&tabs=timeline&width=${containerWidth}&height=${containerHeight}&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId`;

//   return (
//     <div ref={containerRef} className="w-2/3 m-auto flex items-center justify-center py-10">
//       <iframe
//         src={facebookSrc}
//         width={containerWidth}
//         height={containerHeight}
//         style={{ border: 'none', overflow: 'hidden' }}
//         scrolling="no"
//         frameBorder="0"
//         allowFullScreen={true}
//         allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
//         title="Facebook Page"
//         loading="lazy"
//       />
//     </div>
//   );
// };

// export default FacebookPage;


import React, { useState, useRef, useEffect } from 'react';

const FacebookPage = () => {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(500);
  const [isVisible, setIsVisible] = useState(false);
  
  // Use a single useEffect for better performance
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = Math.min(containerRef.current.offsetWidth, 500);
        setContainerWidth(width);
      }
    };

    // Intersection Observer to load Facebook embed only when visible
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 } // Load when 10% visible
    );

    if (containerRef.current) {
      updateDimensions();
      observer.observe(containerRef.current);
    }

    // Throttled resize handler
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateDimensions, 150);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  const facebookSrc = `https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2FKhudiioficial&tabs=timeline&width=${containerWidth}&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId`;

  return (
    <div ref={containerRef} className="w-full max-w-2xl mx-auto flex items-center justify-center py-8 px-4">
      {isVisible ? (
        <iframe
          src={facebookSrc}
          width={containerWidth}
          height="500"
          style={{ border: 'none', overflow: 'hidden', borderRadius: '8px' }}
          scrolling="no"
          frameBorder="0"
          allowFullScreen={true}
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          title="Facebook Page"
          loading="lazy"
          className="shadow-lg"
        />
      ) : (
        // Loading placeholder
        <div 
          className="bg-gray-200 flex items-center justify-center rounded-lg shadow-lg"
          style={{ width: containerWidth, height: '500px' }}
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold text-lg">f</span>
            </div>
            <p className="text-gray-600 text-sm">Loading Facebook feed...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacebookPage;