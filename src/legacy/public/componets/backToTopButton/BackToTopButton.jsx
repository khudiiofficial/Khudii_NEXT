import React, { useState, useEffect } from 'react';
import './BackToTopButton.css';

const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      const winHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const maxScroll = docHeight - winHeight;
      const currentScroll = window.scrollY;
      
      if (maxScroll > 0) {
        const progress = (currentScroll / maxScroll) * 100;
        setScrollProgress(Math.min(progress, 100));
      } else {
        setScrollProgress(0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <button 
      className={`back-to-top-btn ${isVisible ? 'show' : ''}`}
      onClick={scrollToTop}
      aria-label="Back to top"
      style={{ display: isVisible ? 'flex' : 'none' }}
    >
      <svg className="progress-ring" width="45" height="45">
        <circle
          className="progress-ring__circle-bg"
          strokeWidth="3"
          fill="transparent"
          r="20"
          cx="22.5"
          cy="22.5"
        />
        <circle
          className="progress-ring__circle"
          strokeWidth="3"
          fill="transparent"
          r="20"
          cx="22.5"
          cy="22.5"
          strokeDasharray={`${scrollProgress * 1.256} 126`}
          strokeDashoffset="0"
        />
      </svg>
      <i className="fas fa-arrow-up"></i>
    </button>
  );
};

export default BackToTopButton;