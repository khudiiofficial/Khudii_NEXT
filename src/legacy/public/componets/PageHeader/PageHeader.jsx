import React, { useEffect, useRef, useState } from 'react';
import './pageHeader.css';
import { cachedPublicGet } from '@/lib/public-api-cache';
const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');
import axios from 'axios';
import { Link } from '@/lib/router-compat';
const PageHeader = ({ title, breadcrumbs = [] }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [footer,setFooterData]=useState({})
  const headerRef = useRef(null);
  const fetchFooterData = async () => {
    try {
     
      const response = await cachedPublicGet(`${APIPath}/api/footer`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setFooterData(response.data.data);
          
      }
    } catch (error) {
      console.error('Error fetching footer data:', error);
    } finally {
      
    }
  };
  useEffect(()=>{
fetchFooterData();    

  },[])
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (headerRef.current) {
      observer.observe(headerRef.current);
    }

    return () => {
      if (headerRef.current) {
        observer.unobserve(headerRef.current);
      }
    };
  }, []);

  return (
    <section ref={headerRef} className="page-header">
      {/* Lighter Gradient Overlay */}
      <div className="page-header-overlay"></div>

      {/* Background Image */}
      <div
        className="page-header-bg"
        style={{
          backgroundImage: `url(${footer.pageimage || '/page-title.jpg'} )`
        }}
      ></div>

      {/* Subtle Pattern */}
      <div className="page-header-pattern"></div>

      <div className="container">
        <div className={`page-header__inner ${isVisible ? 'animate-in' : ''}`}>
          <h1 className="page-header__title">
            <span className="title-text">{title}</span>
            <span className="title-underline"></span>
          </h1>

          {/* Breadcrumbs */}
          {/* <nav className="breadcrumb-nav">
            <ul className="thm-breadcrumb">
              {breadcrumbs.map((item, index) => (
                <li key={index} className="breadcrumb-item">
                  {item.link ? (
                    <Link to={item.link} className="breadcrumb-link">
                      <span className="breadcrumb-text">{item.label}</span>
                    </Link>
                  ) : (
                    <span className="breadcrumb-current">{item.label}</span>
                  )}
                  {index < breadcrumbs.length - 1 && (
                    <span className="breadcrumb-separator">/</span>
                  )}
                </li>
              ))}
            </ul>
          </nav> */}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="scroll-indicator">
        <div className="scroll-arrow"></div>
      </div>
    </section>
  );
};

// Default props
PageHeader.defaultProps = {
  breadcrumbs: [{ label: 'Organizations' }]
};

export default PageHeader;
