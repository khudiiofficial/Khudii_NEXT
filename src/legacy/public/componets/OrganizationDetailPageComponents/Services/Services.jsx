
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import styles from "./Services.module.css";
// import { a } from "framer-motion/client";
// const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');

// const Services = ({ id }) => {
//   const [data, setData] = useState([]);

//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await axios.get(`${APIPath}/icons/${id}`, {
//           withCredentials: true,
//         });
//         setData(res.data);
//       } catch (err) {
//         console.error("Error fetching services:", err);
//       }
//     })();
//   }, [id]);

//   return (
//     <>

//     {data.length!==0 && (    <div className={`${styles.container}`}>
//     <section className={styles.services}>
//       {data.map((ele, idx) => (
//         <div className={styles.card} key={idx}>
//           <div
//             className={styles.icon}
//             dangerouslySetInnerHTML={{ __html: ele.svg }}
//           ></div>
//           <div className={styles.info}>
//             <p className={styles.qty}>{ele.qty}</p>
//             <p className={styles.name}>{ele.name}</p>
//           </div>
//         </div>
//       ))}
//     </section>
//     </div>)}


//     </>
//   );
// };

// export default Services;

import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./Services.module.css";

const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');

const Services = ({ id }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${APIPath}/icons/${id}`, {
          withCredentials: true,
        });
        setData(res.data);
      } catch (err) {
        console.error("Error fetching services:", err);
      }
    })();
    
  }, [id]);

  if (!data) return '';

  return (
    <div className={`${styles.container}`}>
      <section className={styles.services}>
        {data.map((ele, idx) => (
          <div className={styles.card} key={idx}>
            <div
              className={styles.icon}
              dangerouslySetInnerHTML={{ __html: ele.svg }}
            ></div>
            <div className={styles.info}>
              <p className={styles.qty}>{ele.qty}</p>
              <p className={styles.name}>{ele.name}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Services;
