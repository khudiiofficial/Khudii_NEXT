import React from 'react'
import PageHeader from '../../componets/PageHeader/PageHeader'
import FacebookPage from '../../componets/facebookCom/Facebook'
import LogoCarousel from '../../componets/SocialMediaComponent/SocialMedia'
import SEO from '../../componets/Helmet/Helmet'
const SocialMedai = ({con,url}) => {
  return (
  <> 
        <SEO 
        title={con?.meta_title||"Social Media - Khudii Pakistan | Follow Our Welfare Journey"}
        description={con?.meta_description||"Connect with Khudii on social media platforms. Follow our latest updates, success stories, events, and welfare initiatives across Facebook, Instagram, YouTube, and TikTok."}
        keywords={con?.meta_keywords||"khudii social media, follow khudii, welfare organization social media, pakistan charity updates, khudii facebook, khudii instagram, khudii youtube, social welfare news, community updates"}
        url={`${url}/social-media`}
        type="website"
      />

   <PageHeader 
          title="Social Media"
          breadcrumbs={[
            { label: "Home", link: "/" },
            { label: "Social Media" }
          ]}
        />
       <LogoCarousel/>
        <FacebookPage/>
  </>

  )
}

export default SocialMedai