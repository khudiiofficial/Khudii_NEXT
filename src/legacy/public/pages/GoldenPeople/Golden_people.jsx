import React from 'react'
import PageHeader from '../../componets/PageHeader/PageHeader'
import SEO from '../../componets/Helmet/Helmet'
const Golden_people = ({con,url}) => {
  return (
    <>

         <SEO 
        title={con?.meta_title||"Golden People - Inspiring Stories | Khudii Community Heroes"}
        description={con?.meta_description||"Discover the inspiring stories of Golden People - community heroes and changemakers making a difference across Pakistan. Coming soon on Khudii's platform."}
        keywords={con?.meta_keywords||"golden people, community heroes, inspiring stories, changemakers pakistan, social impact stories, khudii heroes, community leaders"}
        url={`${url}/golden-people`}
        image="/golden-people.png.webp"
      />
       <PageHeader 
            title="Golden People"
            breadcrumbs={[
              { label: "Home", link: "/" },
              { label: "Golden People" }
            ]}
          />


     <section className=" h-100 max-h-1000 bg-[#cedcff]/60 grid place-items-center px-6 py-0 ">
      <div className="grid md:grid-cols-2 items-center gap-10 text-center md:text-left">
        {/* Left: Heading + Text */}
        <div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#222222] mb-6">
            Coming Soon!!!
          </h2>
          <p className="text-[#222222] text-lg max-w-lg mx-auto md:mx-0">
            We&rsquo;re working hard behind the scenes to bring something amazing. 
            Stay tuned!
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
    </section>
    </>
  )
}

export default Golden_people