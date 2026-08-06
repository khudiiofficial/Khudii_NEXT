// import { Helmet } from 'react-helmet'

// const SEO = ({ 
//   title = "Khudii - Digital Welfare Platform for Pakistan",
//   description = "Pakistan's largest digital platform for welfare organizations. Connecting donors, volunteers, and communities to create lasting change.",
//   keywords = "khudii, pakistan, welfare, charity, donors, volunteers, community support, education, health, orphanage",
//   image = "/Khudii.webp",
//   url = "https://new.khudii.com",
//   type = "website"
// }) => {
//   return (
//     <Helmet>
//       {/* Basic Meta Tags */}
//       <title>{title}</title>
//       <meta name="description" content={description} />
//       <meta name="keywords" content={keywords} />
      
//       {/* Open Graph (Facebook) */}
//       <meta property="og:title" content={title} />
//       <meta property="og:description" content={description} />
//       <meta property="og:image" content={image} />
//       <meta property="og:url" content={url} />
//       <meta property="og:type" content={type} />
      
//       {/* Twitter */}
//       <meta name="twitter:card" content="summary_large_image" />
//       <meta name="twitter:title" content={title} />
//       <meta name="twitter:description" content={description} />
//       <meta name="twitter:image" content={image} />
//     </Helmet>
//   )
// }

// export default SEO


import { useEffect } from 'react'

const SEO = ({ 
  title = "Khudii - Digital Welfare Platform for Pakistan",
  description = "Pakistan's largest digital platform for welfare organizations. Connecting donors, volunteers, and communities to create lasting change.",
  keywords = "khudii, pakistan, welfare, charity, donors, volunteers, community support, education, health, orphanage",
  image = "/Khudii.webp",
  url = "https://www.khudii.com",
  type = "website"
}) => {
  useEffect(() => {
    // Update document title
    document.title = title
    
    // Update or create meta description
    let metaDesc = document.querySelector('meta[name="description"]')
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.name = 'description'
      document.head.appendChild(metaDesc)
    }
    metaDesc.content = description
    
    // Update or create meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]')
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta')
      metaKeywords.name = 'keywords'
      document.head.appendChild(metaKeywords)
    }
    metaKeywords.content = keywords
    
    // Update or create Open Graph tags
    const updateMetaProperty = (property, content) => {
      let meta = document.querySelector(`meta[property="${property}"]`)
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('property', property)
        document.head.appendChild(meta)
      }
      meta.content = content
    }
    
    updateMetaProperty('og:title', title)
    updateMetaProperty('og:description', description)
    updateMetaProperty('og:image', image)
    updateMetaProperty('og:url', url)
    updateMetaProperty('og:type', type)
    
    // Update or create Twitter tags
    const updateMetaName = (name, content) => {
      let meta = document.querySelector(`meta[name="${name}"]`)
      if (!meta) {
        meta = document.createElement('meta')
        meta.name = name
        document.head.appendChild(meta)
      }
      meta.content = content
    }
    
    updateMetaName('twitter:card', 'summary_large_image')
    updateMetaName('twitter:title', title)
    updateMetaName('twitter:description', description)
    updateMetaName('twitter:image', image)
    
  }, [title, description, keywords, image, url, type])
  
  return null // This component doesn't render anything
}

export default SEO