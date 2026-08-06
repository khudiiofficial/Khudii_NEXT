import React from 'react'
import Blogs from '../../componets/Blogs/Blogs'
import PageHeader from '../../componets/PageHeader/PageHeader'
import SEO from '../../componets/Helmet/Helmet'
const Blogss = ({con,url}) => {
  return (
    <>
       <SEO 
        title={con?.meta_tilte||"Blog - Khudii Pakistan | Welfare Insights & Community Stories"}
        description={con?.meta_description||"Read the latest blog posts from Khudii Welfare Organization. Get insights into our welfare projects, community stories, humanitarian work, and updates from across Pakistan."}
        keywords={con?.meta_keywords||"khudii blog, welfare organization blog, pakistan charity news, humanitarian stories, community updates, social work articles, khudii insights, welfare projects blog"}
        url={`${url}/blogs`}
        type="blog"
      />
       <PageHeader 
                       title="Blogs"
                       breadcrumbs={[
                         { label: "Home", link: "/" },
                         { label: "Blogs" }
                       ]}
                     />

<Blogs/>


    </>
  )
}

export default Blogss