import React from 'react'
import PageHeader from '../../componets/PageHeader/PageHeader'
import SEO from '../../componets/Helmet/Helmet'
const Tribute = ({con,url}) => {
  return (
    <>  
    
       <SEO 
        title={con?.meta_title||"Tribute - Khudii Pakistan | Honoring Our Supporters & Partners"}
        description={con?.meta_description||"Khudii's tribute page is coming soon. We're preparing to honor and recognize our dedicated supporters, partners, and contributors who make our welfare work possible."}
        keywords={con?.meta_keywords||"khudii tribute, honor supporters, welfare partners, pakistan charity recognition, donor appreciation, community contributors, khudii acknowledgments"}
        url={`${url}/tribute`}
        type="website"
      />
    
       <PageHeader 
                title="Tribute"
                breadcrumbs={[
                  { label: "Home", link: "/" },
                  { label: "Tribute" }
                ]}
              />
    
    
         <section className=" h-100 max-h-1000 bg-[#cedcff] grid place-items-center px-6 py-0 ">
          <div className="grid md:grid-cols-2 items-center gap-10 text-center md:text-left">
            {/* Left: Heading + Text */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#222222] mb-6">
                Coming Soon!!!
              </h2>
              <p className="text-[#222222] text-lg max-w-lg mx-auto md:mx-0">
                We&rsquo;re working hard behind the scenes to bring something amazing. 
                Stay Tuned!
              </p>
            </div>
    
            {/* Right: Image */}
            <div className="flex justify-center">
              <img
                src="/golden-people.png.webp"
                alt="Golden People"
                className="w-full max-w-md h-auto drop-shadow-2xl rounded-2xl"
              />
            </div>
          </div>
        </section></>
  )
}

export default Tribute