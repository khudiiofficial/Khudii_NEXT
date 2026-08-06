import React from 'react'
import PageHeader from '../../componets/PageHeader/PageHeader'
import VideoGallery from '../../componets/vediosComponent/VediosComponent'
import SEO from '../../componets/Helmet/Helmet'
const Vedios = ({con,url}) => {
  return (
    <>
         <SEO 
        title={con?.meta_title||"Videos - Khudii Pakistan | Welfare Initiatives & Success Stories"}
        description={con?.meta_description||"Watch Khudii's latest videos showcasing welfare projects, community initiatives, and success stories across Pakistan. Explore our humanitarian work through engaging video content."}
        keywords={con?.meta_keywords||"khudii videos, welfare organization videos, pakistan charity videos, humanitarian projects, community work videos, khudii youtube, social welfare videos, pakistan social work"}
        url={`${url}/videos`}
        type="website"
      />
      
     <PageHeader 
            title="Videos"
            breadcrumbs={[
              { label: "Home", link: "/" },
              { label: "Videos" }
            ]}
          />

          <VideoGallery/>
    </>
  )
}

export default Vedios