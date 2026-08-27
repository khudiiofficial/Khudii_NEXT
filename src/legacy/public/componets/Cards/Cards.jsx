// import React, { useState } from 'react'
// import styles from './Cards.module.css'
// import { Link } from '@/lib/router-compat'

// const Cards = () => {
//     const [arr, setArr] = useState([
//         {
//             src: '/Sectors/health-khudii.png',
//             Name: 'Health',
//             Description: 'Healing lives with care and compassion — bringing affordable healthcare to those who need it most, so no one is left behind'
//         },
//         {
//             src: '/Sectors/autism-khudii.gif',
//             Name: 'Autism',
//             Description: 'Honoring each individual difference through empowering autistic individuals to develop, learn, and flourish within communities founded on love, acceptance, and inclusion.'
//         },
//         {
//             src: '/Sectors/orphange-khudii1.gif',
//             Name: 'Orphanage',
//             Description: 'Nurturing orphans with love and care, guiding each heart with hope to share. Empowering through education and light'
//         },
//         {
//             src: '/Sectors/health-khudii.png',
//             Name: 'Thalassemia',
//             Description: 'Standing with every fighter of Thalassemia—spreading awareness, delivering treatment, and restoring smiles one life at a time.'
//         },
//         {
//             src: '/Sectors/visually-impaired-khudii1.gif',
//             Name: 'Visually impaired',
//             Description: 'Opening worlds beyond vision by enabling the visually impaired with technology, learning, and opportunities to view life in hope, independence, and dignity.'
//         },
//         {
//             src: '/Sectors/education-khudii.gif',
//             Name: 'Education',
//             Description: 'Lighting the path to a brighter tomorrow by opening doors of knowledge, skills, and hope for every child and community.'
//         },
//         {
//             src: '/Sectors/different-abled-khudii.gif',
//             Name: 'Differently Abled',
//             Description: 'Championing ability in every heart—empowering people with disabilities to live with dignity, confidence, and opportunity.'
//         },
//         {
//             src: '/Sectors/Water-and-food.gif',
//             Name: 'Water And Food',
//             Description: 'Every drop and plate counts—delivering clean water and nourishing food now so families survive with health and dignity.'
//         },
//     ])

//     return (
//         <div className={styles.parent}>
//             {arr.map((ele, index) => (
//                 <div key={index} className={styles.class1}>
//                     <img 
//                         src={ele.src} 
//                         className={styles.class2} 
//                         alt={`${ele.Name} sector`}
//                         loading="lazy" // Added for better performance
//                     />
//                     <h2 className={styles.class4}>{ele.Name}</h2>
//                     <p className={styles.class3}>{ele.Description}</p>
//                     <Link to={`/Categories/${ele.Name.replace(/\s+/g, '-')}`}>
//                         <button className={styles.class5}>
//                             More about {ele.Name}
//                         </button>
//                     </Link>
//                 </div>
//             ))}
//         </div>
//     )
// }

// export default Cards


import React, { useState,useEffect } from 'react'
import styles from './Cards.module.css'
import { Link } from '@/lib/router-compat'
import axios from 'axios'
import { useNavigate } from '@/lib/router-compat'
import { cachedPublicGet } from '@/lib/public-api-cache';
const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');
const Cards = () => {
    const nav=useNavigate()
    const [arr, setArr] = useState([
 
    ])

    useEffect(()=>{
const call=async()=>{
    try {
        const res=await cachedPublicGet(`${APIPath}/getAllSectors`)
        if(res.status===200){
            setArr(res.data.data)
            // console.log(res.data.data)
        }
    } catch (error) {
        console.log(error)
    }
}
call()
    },[])

    return (
    
        <div className={styles.parent}>
            {/* {arr.map((ele, index) => (
                //   <div key={index} >
                // <div className={styles.class1} onClick={()=>{nav(`/${ele.slug}`)}} >
                //     <img 
                //         src={ele.src} 
                //         className={styles.class2} 
                //         alt={`${ele.Name} sector`}
                //         loading="lazy"
                //         width="280"
                //         height="160"
                //     />
                //     <h2 className={styles.class4}>{ele.name}</h2>
                //     <p className={styles.class3}>{ele.description}</p>
                //     <Link>
                //         <button className={styles.class5}>
                //             More About {ele.name}
                //         </button>
                //     </Link>
                // </div>
                //   </div>
                 ))} */}
                <ul className={styles.parent}>
  {arr.map((ele, index) => (
    <li key={index}>
      <Link 
        to={`/${ele.slug}`} 
        className={styles.class1}
        aria-label={`View ${ele.name} sector`}
      >
        <img 
          src={ele.src} 
          className={styles.class2} 
          alt={`${ele.name} sector illustration`}
          loading="lazy"
          width="280"
          height="160"
        />
        <h2 className={styles.class4}>{ele.name}</h2>
        <p className={styles.class3}>{ele.description}</p>

        <span className={styles.class5}>
          More About {ele.name}
        </span>
      </Link>
    </li>
  ))}
</ul>
           
        </div>
    )
}

export default Cards
