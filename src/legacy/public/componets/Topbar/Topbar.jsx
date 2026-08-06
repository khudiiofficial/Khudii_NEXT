import React, { useState, useEffect } from 'react'
import styles from './Topbar.module.css'
import { Link } from '@/lib/router-compat'
import SplitText from '../Paragraph/Title'
import axios from 'axios'
const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');
const Topbar = () => {
  const [isMobile, setIsMobile] = useState(false)
  const [texts,settexts]=useState([])
  const [data,setdata]=useState({})
  const [tel,settel]=useState('')
const handleAnimationComplete = () => {
  console.log('All letters have animated!');
};
const [idx,setidx]=useState(0)

  useEffect(()=>{
const fun=async ()=>{
  try {
    const res=await axios.get(`${APIPath}/api/topbar`,{withCredentials:true})
    if(res.status===200){
      let arr=res.data.map((ele,i)=>{
        return ele.text
      })
     
     settexts(arr)
    }
    
  } catch (error) {
    
  }
}
fun()
  },[])



  useEffect(()=>{
const fun=async ()=>{
  try {
    const res=await axios.get(`${APIPath}/api/telephone`,{withCredentials:true})
    if(res.status===200){
      let ch=''
    for(let i=0; i<res.data.data.phone_number.length; i++){
      if(Number.isInteger(parseInt(res.data.data.phone_number[i])) || res.data.data.phone_number[i]==='+' ){
ch=ch+res.data.data.phone_number[i]
      }
    }
    settel(ch)
     setdata(res.data.data)
    }
    
  } catch (error) {
    console.log(error)
  }
}
fun()
  },[])

  useEffect(()=>{
    if(texts.length===0){return}
const fun=setInterval(()=>{
  
if (idx===texts.length-1){
  setidx(0)
}
else{
  setidx((pre)=>pre+1)
}

},7000)

return ()=>clearInterval(fun)
  },[idx,texts.length])
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 600)
    }
    
    // Check initially
    checkScreenSize()
    
    // Add event listener
    window.addEventListener('resize', checkScreenSize)
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])



  return (
    <div className={`${styles.topbar} ${styles.color}`}>
      <p className={styles.contact}>
        <a href={`tel:${tel}`} target="_blank"><i className="text-[#e7001e]  fa-solid fa-phone-volume"></i> &nbsp;{data.phone_number} </a>
      </p>

      {/* <p className={styles.mid}>
        Pakistan's 1st E-Community of Human Purpose!
      </p> */}
      { texts.length!==0?
<SplitText
key={idx}
  text={`${texts[idx]}`}
  className={styles.mid}
  delay={20}
  duration={0.5}
  ease="power3.out"
  splitType="chars"
  from={{ opacity: 0, y: 40 }}
  to={{ opacity: 1, y: 0 }}
  threshold={0.1}
  rootMargin="-100px"
  textAlign="center"
  onLetterAnimationComplete={handleAnimationComplete}/>
  :
  <p className={styles.mid}>
        Pakistan's 1st E-Community of Human Purpose!
      </p> 
 
}
      <p className={styles.buttonWrapper}>
        <Link to="/contribute-your-story/">
          <button className={styles.last}>Contribute Your Story</button>
        </Link>
        {isMobile && (
          <Link to="/donate-now/">
            <button className={styles.last}>Donate Now</button>
          </Link>
        )}
      </p>
    </div>
  )
}

export default Topbar