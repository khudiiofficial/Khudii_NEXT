import React from 'react';
import { Link } from '@/lib/router-compat';
import './NotFound.css';
import { useNavigate } from '@/lib/router-compat';
import SEO from '../../componets/Helmet/Helmet';
const NotFound = ({url}) => {
    const nav=useNavigate()
  return (
    <>
    <SEO 
  title="Page Not Found | 404 Error - Khudii Pakistan Digital Welfare Platform"
  description="The page you're looking for on Khudii - Pakistan's largest digital welfare platform doesn't exist. Return to our homepage to continue supporting health, education, autism care, orphan support, and community development programs."
  keywords="404 error, page not found, khudii pakistan, digital welfare platform, charity donors, volunteer opportunities, community support"
  url={`${url}`}
  image="/Khudii.webp"
/>
    <div className="not-found-container">
      <div className="not-found-content">
        
        {/* Animated 404 Number */}
        <div className="not-found-number">
          <span className="digit" style={{ '--i': 1 }}>4</span>
          <div className="zero-container">
            <div className="zero"></div>
          </div>
          <span className="digit" style={{ '--i': 3 }}>4</span>
        </div>

        {/* Error Message */}
        <h1 className="not-found-title">Page Not Found</h1>
        
        <p className="not-found-description">
          Oops! The page you're looking for seems to have wandered off into the digital void.
          It might have been moved, deleted, or perhaps never existed.
        </p>

        {/* Action Buttons */}
        <div className="not-found-actions">
          <Link to="/" className="home-button">
            <svg className="home-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            Back to Home
          </Link>
          
          <button 
            className="search-button"
            onClick={() => {nav(-1)}}
          >
            <svg className="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Go Back
          </button>
        </div>


      </div>
      
      {/* Animated Background Elements */}
      <div className="background-elements">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-3"></div>
      </div>
    </div>
    </>
  );
};

export default NotFound;