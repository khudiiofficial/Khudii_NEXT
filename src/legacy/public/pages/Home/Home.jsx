import React from 'react'
import Topbar from '../../componets/Topbar/Topbar'
import Crousel from '../../componets/crousel/Crousel'
import Cards from '../../componets/Cards/Cards'
import WelcomeSection from '../../componets/welcomeSection/WelcomeSection'
import Vision from '../../componets/VisionSection/Vision'
import SuccessStories from '../../componets/SuccessStories/SuccessStories'
import OrganizationsSection from '../../componets/organizations/Organizations'
import Events from '../../componets/Events/Events'
import Partners from '../../componets/Partners/Partners'
import Blogs from '../../componets/Blogs/Blogs'
import FacebookPage from '../../componets/facebookCom/Facebook'
import SEO from '../../componets/Helmet/Helmet'

const HomePage = ({con,url}) => {

  return (

    <>
      <SEO 
        title={con?.meta_titile ||"Khudii - Pakistan's Largest Digital Welfare Platform | Community Support"}
        description={con?.meta_description || "Khudii is Pakistan's premier digital welfare platform connecting donors, volunteers, and organizations across health, education, autism support, orphan care, and community development programs. Join us in creating lasting change."}
        keywords={con?.meta_keywords||"khudii pakistan, digital welfare platform, charity donors, volunteer opportunities, health programs pakistan, education support, autism care, orphanage support, visually impaired assistance, community development, social welfare, pakistan charity organizations"}
        url={ url||"https://khudii.com"}
        image="/Khudii.webp"
      />
    <Crousel/>
    <Cards/>
    <WelcomeSection/>
    <Vision/>
    <SuccessStories/>
    <OrganizationsSection/>
    <Events/>
    <Partners/>
    <Blogs/>
    <FacebookPage/>
   

    </>



  )
}

export default HomePage