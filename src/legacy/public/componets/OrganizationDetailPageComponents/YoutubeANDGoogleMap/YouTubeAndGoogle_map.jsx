import React from 'react'
import { useState,useEffect } from 'react'
import axios from 'axios';
import styles from './You_google.module.css'
const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');
import { useParams } from '@/lib/router-compat';
const YouTubeAndGoogle_map = ({id}) => {
    const {slug}=useParams()
    const [data,setdata]=useState({});
    useEffect(()=>{
(async ()=>{
    const res= await axios.get(`${APIPath}/item/${slug}`)
    setdata(res.data)
    // console.log(res.data)
})()
    },[id])


      const [socials, setSocials] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${APIPath}/socials/${id}`);
        setSocials(res.data);
        // console.log(res.data.googlemap)
        // if(setgooglemap) setgooglemap(res.data.googlemap);
      } catch (err) {
        console.error("Error fetching socials:", err);
      }
    })();
  }, [id]);

  return (
    <>
   <div className={`${styles.class2}`}>
    <div dangerouslySetInnerHTML={{__html:data.youtube_video_url}} className={`${styles.class1}`}/>
     <div dangerouslySetInnerHTML={{__html:socials.googlemap}} className={`${styles.class1}`}/>
     </div>
</>
  )
}

export default YouTubeAndGoogle_map