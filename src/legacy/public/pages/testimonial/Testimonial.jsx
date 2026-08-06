import React from 'react'
import PageHeader from '../../componets/PageHeader/PageHeader'
import ClientFeedbacks from '../../componets/TestimonialComponents/TestimonialComponent'
import SEO from '../../componets/Helmet/Helmet'
const Testimonial = ({con,url}) => {
  return (
    <>
     <SEO 
        title={con?.meta_title||"Client Testimonials - Khudii Pakistan | Real Stories & Reviews"}
        description={con?.meta_description||"Read and watch authentic client testimonials and feedback about Khudii's welfare services. Hear from schools, organizations, and communities we've helped across Pakistan."}
        keywords={con?.meta_keywords||"khudii testimonials, client feedback, welfare organization reviews, pakistan charity testimonials, khudii client stories, donor testimonials, community feedback, social work reviews"}
        url={`${url}/testimonials`}
        type="website"
      />
       <PageHeader 
            title="Testimonial"
            breadcrumbs={[
              { label: "Home", link: "/" },
              { label: "Testimonial" }
            ]}
          />

          <ClientFeedbacks/>
    </>
  )
}

export default Testimonial