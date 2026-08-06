import React, { useEffect, useState } from "react";
import { useParams } from '@/lib/router-compat';
import axios from "axios";
import styles from "./SpecificBlog.module.css";
import { useLocation } from '@/lib/router-compat';
import SEO from "../../componets/Helmet/Helmet";

const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');
export default function BlogDetails({blog,url}) {
  
  // const [blog, setBlog] = useState(null);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);
  // const location=useLocation();
  // const {slug}=useParams()
  // useEffect(() => {
  //   (async () => {
  //     try {
  //       setLoading(true);
  //       const res = await axios.get(`${APIPath}/Blog/${slug}`);
  //       setBlog(res.data);
        
  //       setError(null);
  //     } catch (err) {
  //       console.error("Error fetching blog:", err);
  //       setError("Failed to load blog post. Please try again later.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   })();
  // }, [slug]);

  // if (loading) return (
  //  (  <div className="flex items-center justify-center h-90 ">
     
  //     {/* <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"> */}
  //       <img src="/siteicon.png" alt="" width={200} height={200}/>
  //     {/* </div> */}
  //   </div>)
  // );

  // if (error) return (
  //   <div className={styles.errorContainer}>
  //     <div className={styles.errorIcon}>⚠️</div>
  //     <h2 className={styles.errorTitle}>Unable to Load Content</h2>
  //     <p className={styles.errorMessage}>{error}</p>
  //     <button 
  //       className={styles.retryButton}
  //       onClick={() => window.location.reload()}
  //     >
  //       Retry
  //     </button>
  //   </div>
  // );

  // if (!blog) return null;

  return (


    <>  
    
        <SEO 
        title={blog ? `${blog.Name} - Khudii Blog | Community Insights` : "Blog Post - Khudii"}
        description={
          blog 
            ? `${blog.Intro || 'Read our latest blog post about community welfare and social impact in Pakistan.'}`
            : "Discover insights about community welfare, social impact, and Khudii's initiatives across Pakistan."
        }
        keywords={
          blog
            ? `${blog.Name}, khudii blog, community welfare, social impact pakistan, welfare insights, ${blog.Arr?.map(section => section.Heading).join(', ')}`
            : "khudii blog, community insights, welfare articles, social impact"
        }
        image={blog?.Image || "/Khudii.webp"}
        url={`${url}/${blog?.slug || ''}`}
        type="article"
      />
    
      <div className={styles.container}>
      <article className={styles.blogWrapper}>
        {/* Header with Gradient Background */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <nav className={styles.breadcrumb}>
              <a href="/blogs" className={styles.breadcrumbLink}>Blog</a>
              <span className={styles.breadcrumbSeparator}>/</span>
              <span className={styles.breadcrumbCurrent}>{blog.Name}</span>
            </nav>
            
            <h1 className={styles.title}>{blog.Name}</h1>
            
            {/* Meta Information */}
            <div className={styles.meta}>
              <span className={styles.metaItem}>📖 {blog.readTime || '5 min read'}</span>
              <span className={styles.metaItem}>📅 {new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {blog.Image && (
            <div className={styles.imageWrapper}>
              <img 
                src={blog.Image} 
                alt={blog.Name} 
                className={styles.image}
                loading="eager"
              />
              <div className={styles.imageOverlay}></div>
            </div>
          )}
        </header>

        {/* Main Content */}
        <main className={styles.mainContent}>
          {/* Intro */}
          <section className={styles.intro}>
            <div className={styles.introContent}>
              <p>{blog.Intro}</p>
            </div>
          </section>

          {/* Sections */}
          {blog.Arr?.map((section, index) => (
            <section key={index} className={styles.section}>
              {section.Heading && (
                <h2 className={styles.sectionHeading}>
                  <span className={styles.headingNumber}>{(index + 1).toString().padStart(2, '0')}</span>
                  {section.Heading}
                </h2>
              )}
              
              {section.Start && (
                <p className={styles.sectionText}>{section.Start}</p>
              )}

              {section.Bullet_Header && (
                <h3 className={styles.bulletHeader}>{section.Bullet_Header}</h3>
              )}
              
              {section.Bullets?.length > 0 && (
                <ul className={styles.bulletList}>
                  {section.Bullets.map((bullet, i) => (
                    <li key={i} className={styles.bulletItem}>
                      <div className={styles.bulletIconWrapper}>
                        <span className={styles.bulletIcon}>✓</span>
                      </div>
                      <span className={styles.bulletText}>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}

              {section.End && (
                // <p className={styles.sectionText}>{section.End}</p>
                <p
  className={styles.sectionText}
  dangerouslySetInnerHTML={{ __html: section.End }}
></p>
              )}
            </section>
          ))}

          {/* Conclusion */}
          {blog.Conclusion && (
            <section className={styles.conclusion}>
              <div className={styles.conclusionHeader}>
                <h2>Key Takeaways</h2>
                <div className={styles.conclusionIcon}>💡</div>
              </div>
              <p>{blog.Conclusion}</p>
            </section>
          )}

          {/* NGOs Section */}
          {blog.NGOs && blog.NGOs.Arr.length!==0 && (
            <section className={styles.ngosSection}>
              <div className={styles.ngosHeader}>
                <h2 className={styles.ngosIntro}>{blog.NGOs.INTRO}</h2>
                <div className={styles.ngosIcon}>🤝</div>
              </div>
              
              <div className={styles.ngosGrid}>
                {blog.NGOs.Arr?.map((ngoCategory, idx) => (
                  <div key={idx} className={styles.ngoCategory}>
                    <h3 className={styles.ngoHeading}>
                      <span className={styles.ngoCategoryIcon}>🏷️</span>
                      {ngoCategory.h1}
                    </h3>
                    <ul className={styles.ngoList}>
                      {ngoCategory.OF.map((ngo, j) => (
                        <li key={j} className={styles.ngoItem}>
                          <span className={styles.ngoIcon}>→</span>
                          <span className={styles.ngoText}>{ngo}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        {/* Call to Action */}
        {/* <footer className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <h3>Found this helpful?</h3>
            <p>Share your thoughts or explore more articles</p>
            <div className={styles.ctaButtons}>
              <button className={styles.ctaButtonPrimary}>Explore More Blogs</button>
              <button className={styles.ctaButtonSecondary}>Share Article</button>
            </div>
          </div>
        </footer> */}

      </article>
    </div>

    </>

  );

}