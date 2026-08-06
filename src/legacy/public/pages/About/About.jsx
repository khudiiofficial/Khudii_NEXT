import React from 'react'
import PageHeader from '../../componets/PageHeader/PageHeader'
import AboutUs from '../../componets/AboutUS/AboutUs'
import SEO from '../../componets/Helmet/Helmet'
const About = ({con,url}) => {
  return (
    <>
      <SEO 
        title={con?.meta_title||"About Khudii - Our Mission, Team & Impact | Pakistan's Digital Welfare Platform"}
        description={con?.meta_description||"Learn about Khudii - Pakistan's first digital welfare hub founded in 2024. Meet our expert team led by Amir Saeed Bhatti, discover our mission, and see how we connect donors with 75+ verified organizations across health, education, and community support sectors."}
        keywords={con?.meta_keywords||"about khudii, khudii mission, khudii team, amir saeed bhatti, welfare organization pakistan, digital charity platform, khudii founders, our impact, volunteer opportunities, donor platform, khudii about us"}
        url={`${url}/about-khudii`}
        image="/Khudii.webp"
      />
    <PageHeader  title="About"
        breadcrumbs={[
          { label: "Home", link: "/" },
          { label: "About" }
        ]}/>
        <AboutUs/>
    </>
  )
}

export default About