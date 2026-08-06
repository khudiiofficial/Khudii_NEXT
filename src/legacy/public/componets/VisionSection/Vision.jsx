// import React from 'react'
// import styles from './vision.module.css'
// const Vision = () => {
// return (<>
//     <div className={`${styles.parent} `}>
//     <div className={`${styles.class1}`}>
//         {/* <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=60" className={`${styles.class2}`} alt="" /> */}
//         <i className={`fa-solid fa-crosshairs ${styles.class2}`} aria-hidden="true"></i>
//         <h2 className={`${styles.class4}`}>Vision</h2>
//         <p className={`${styles.class3}`}>To build Pakistan’s largest digital home for welfare — a hub where organizations, donors, volunteers, and communities come together seamlessly to create lasting change and uplift every vulnerable life with dignity and hope.</p>
//     </div>
//     <div className={`${styles.class1}`}>
//         {/* <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=60" className={`${styles.class2}`} alt="" /> */}
//         <i className={`fa-solid fa-chart-area ${styles.class2}` } aria-hidden="true"></i>
//         <h2 className={`${styles.class4}`}>Goal</h2>
//         <p className={`${styles.class3}`}>To actively identify, support, and amplify credible welfare organizations across Pakistan—building bridges between changemakers and supporters, and laying the digital foundation to empower 25,000 model initiatives through strategic connection, visibility, and collaboration.</p>
//     </div>
    
//     <div className={`${styles.class1} `}>
//         {/* <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=60" className={`${styles.class2}`} alt="" /> */}
//         <i className={`fa-solid fa-magnifying-glass ${styles.class2}`} aria-hidden="true"></i>
//         <h2 className={`${styles.class4}`}>Mission</h2>
//         <p className={`${styles.class3}`}>To breathe life into Pakistan’s welfare ecosystem by shining a light on credible organizations, giving them the visibility they deserve, and connecting them with donors, volunteers, and professionals so their impact can reach further and touch more lives.</p>
//     </div>
    
//         </div>
//         <br />
// </>
// )
// }

// export default Vision

// // 2nd Code
// import React from 'react';
// import styles from './vision.module.css'
// import { useState,useEffect } from 'react';
// import axios from 'axios'
// const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');
// const Vision = () => {
//   const [items,setitems] =useState([
//     // {
//     //   icon: 'fa-solid fa-crosshairs',
//     //   title: 'Vision',
//     //   description:
//     //     'To build Pakistan’s largest digital home for welfare — a hub where organizations, donors, volunteers, and communities come together seamlessly to create lasting change and uplift every vulnerable life with dignity and hope.',
//     // },
//     // {
//     //   icon: 'fa-solid fa-chart-area',
//     //   title: 'Goal',
//     //   description:
//     //     'To actively identify, support, and amplify credible welfare organizations across Pakistan—building bridges between changemakers and supporters, and laying the digital foundation to empower 25,000 model initiatives through strategic connection, visibility, and collaboration.',
//     // },
//     // {
//     //   icon: 'fa-solid fa-magnifying-glass',
//     //   title: 'Mission',
//     //   description:
//     //     'To breathe life into Pakistan’s welfare ecosystem by shining a light on credible organizations, giving them the visibility they deserve, and connecting them with donors, volunteers, and professionals so their impact can reach further and touch more lives.',
//     // }
//   ])
//   useEffect(()=>{
// const call=async()=>{
//   try {
//     const res=await axios.get(`${APIPath}/api/vision-mission`)
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
//     <section className="pt-6 pb-8 px-5">
//       <div className="max-w-[1240px] mx-auto">
//         <div className="flex flex-wrap justify-center gap-4 sm:gap-8 md:gap-4">
//           {items.map((item, idx) => (
//             <div
//               key={idx}
//               className="flex-1 min-w-[300px] sm:min-w-[320px] md:min-w-[360px] max-w-[380px] 
//                          bg-[#E6EDFF] rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300
//                          p-5 sm:p-4 flex flex-col items-center justify-center ext-center"
//             >
//               <i
//                 className={`${item.icon} text-[#022279] text-4xl sm:text-5xl mb-3`}
//                 aria-hidden="true"
//               ></i>
//               <h2 className="font-semibold text-[#022279] text-xl sm:text-2xl md:text-[1.8rem] mb-3">
//                 {item.title}
//               </h2>
//               <p className="text-gray-800 text-center leading-relaxed text-sm sm:text-base">
//                 {item.description}
//               </p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Vision;


import React, { useState, useEffect } from 'react';
import axios from 'axios';

const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');

const Vision = () => {
  const [items, setitems] = useState([]);

  useEffect(() => {
    const call = async () => {
      try {
        const res = await axios.get(`${APIPath}/api/vision-mission`)
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
    <section aria-labelledby="vision-heading" className="pt-6 pb-8 px-5">
      <div className="max-w-[1240px] mx-auto">

        {/* SECTION HEADING (hidden but accessible) */}
        <h2 id="vision-heading" className="sr-only">
          Vision, Mission and Goals
        </h2>

        <ul className="flex flex-wrap justify-center gap-4 sm:gap-8 md:gap-4">
          {items.map((item, idx) => (
            <li
              key={idx}
              className="flex-1 min-w-[300px] sm:min-w-[320px] md:min-w-[360px] max-w-[380px] 
                         bg-[#dbe4ff] rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300
                         p-5 sm:p-4 flex flex-col items-center justify-center text-center"
            >

              {/* ICON */}
              <div>
                <i
                  className={`${item.icon} text-[#021a5c] text-4xl sm:text-5xl mb-3`}
                  aria-hidden="true"
                ></i>
                <span className="sr-only">{item.title}</span>
              </div>

              {/* TITLE */}
              <h3 className="font-semibold text-[#021a5c] text-xl sm:text-2xl md:text-[1.8rem] mb-3">
                {item.title}
              </h3>

              {/* DESCRIPTION */}
              <p className="text-gray-800 text-center leading-relaxed text-sm sm:text-base">
                {item.description}
              </p>

            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Vision;