import React from 'react'
import PageHeader from '../../componets/PageHeader/PageHeader'
// import DonateNow from '../../componets/DonatePageComponents/DonateForm'
import DonationForm from '../../componets/DonatePageComponents/DonateForm'
import SEO from '../../componets/Helmet/Helmet'
const Donate = ({con,url}) => {
  return (
    <>
       <SEO 
        title={con?.meta_title||"Donate to Khudii Pakistan | Support Welfare Causes Online"}
        description={con?.meta_description||"Make a difference with your donation to Khudii - Pakistan's leading digital welfare platform. Support Zakat, Sadqa, and general donations to help communities in need."}
        keywords={con?.meta_keywords||"donate to khudii, pakistan donation, zakat online, sadqa donation, welfare charity, khudii donate, online donation pakistan, islamic charity, community support"}
        url={`${url}/donate-now`}
        type="website"
      />
      <PageHeader 
                    title="Donate"
                    breadcrumbs={[
                      { label: "Home", link: "/" },
                      { label: "Donate" }
                    ]}
                  />
                   {/* <DonateNow/> */}
    <DonationForm/>
    </>
  )
}

export default Donate