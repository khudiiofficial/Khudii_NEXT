import React from 'react'
import PageHeader from '../../componets/PageHeader/PageHeader'
import DifferentOrganizations from '../../componets/DifferentOrganizations/DifferentOrganizations'
import SEO from '../../componets/Helmet/Helmet'
const Organizations = ({con,url}) => {
  return (
    <>
    <SEO 
        title={con?.meta_title||"Verified Welfare Organizations in Pakistan | Khudii Partner Network"}
        description={con?.meta_description||"Browse Khudii's network of verified welfare organizations across Pakistan. Find credible charities working in health, education, orphan care, disability support, and community development."}
        keywords={con?.meta_keywords||"welfare organizations pakistan, verified charities, partner organizations, health NGOs, education charities, orphanages pakistan, disability support, community development, donor verification, khudii partners"}
        url={url}
      />
         <PageHeader 
        title="Organizations"
        breadcrumbs={[
          { label: "Home", link: "/" },
          { label: "Organizations" }
        ]}
      />

      <DifferentOrganizations/>
      </>
  )
}

export default Organizations