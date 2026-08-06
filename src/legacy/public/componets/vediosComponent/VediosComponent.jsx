import React, { useState, useEffect, useRef } from 'react';
import './VedioGallery.css';
import axios from 'axios';
const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');
const VideoGallery = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [slidesToShow, setSlidesToShow] = useState(3);
  const [selectedVideo, setSelectedVideo] = useState(null); // ✅ Track selected video
  const carouselRef = useRef(null);
  const [videoData,setvideodata]=useState([])
  const [Error,setError]=useState(null)
  const [numberOfSlides,setnumberOfSlides]=useState(null)
  const [loader,setloader]=useState(false)
 function Loader() {
  return (
    // <div className="flex items-center justify-center h-40 ">
    //   <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
    // </div>
     <div className="flex items-center justify-center h-90 ">
     
      {/* <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"> */}
        <img src="/siteicon.png" alt="" width={200} height={200}/>
      {/* </div> */}
    </div>
  );
}



useEffect(()=>{
const get=async ()=>{
  setloader(true)
  try {
     const res= await axios.get(`${APIPath}/getAllVedios`,{withCredentials:true})
     if(res.status===200){
      setvideodata(res.data)
     }
     else{
      throw new Error("could not get")
     }
  } catch (error) {
    setError(error.message)
  }
 setloader(false)
}
get();

},[])
  // const videoData = [
  //   {
  //     id: 1,
  //     title: "Help Line - Episode 1",
  //     youtubeId: "1d4tp4am58A",
  //     thumbnail: "/Vedios/Vedios1.webp",
  //     description: "A Social Welfare Organization"
  //   },
  //   {
  //     id: 2,
  //     title: "Alif Laila Library",
  //     youtubeId: "Ob9lF4g81dM",
  //     thumbnail: "/Vedios/Vedios2.webp",
  //     description: "From Double Decker to Space Race"
  //   },
  //   {
  //     id: 3,
  //     title: "Aziz Jehan Trust",
  //     youtubeId: "-5GtF9MtiCU",
  //     thumbnail: "/Vedios/Vedios3.webp",
  //     description: "School for the Blinds"
  //   },
  //   {
  //     id: 4,
  //     title: "Deaf Support",
  //     youtubeId: "uChRS8dUhsM",
  //     thumbnail: "/Vedios/Vedios4.webp",
  //     description: "Supporting the hearing impaired community"
  //   },
  //   {
  //     id: 5,
  //     title: "Autism Awareness",
  //     youtubeId: "EIDVkd2z8d8",
  //     thumbnail: "/Vedios/Vedios5.webp",
  //     description: "Understanding and supporting autism"
  //   },
  //   {
  //     id: 6,
  //     title: "Ezshifa Healthcare",
  //     youtubeId: "4SAThP87PLk",
  //     thumbnail: "/Vedios/Vedios6.webp",
  //     description: "Medical assistance programs"
  //   },
  //   {
  //     id: 7,
  //     title: "Rashidabad Project",
  //     youtubeId: "5PJaqM-dN4c",
  //     thumbnail: "/Vedios/Vedios7.webp",
  //     description: "Community development initiative"
  //   },
  //   {
  //     id: 8,
  //     title: "Meethi Foundation",
  //     youtubeId: "PMNeLz60pG4",
  //     thumbnail: "/Vedios/Vedios8.webp",
  //     description: "Sweetening lives through education"
  //   },
  //   {
  //     id: 9,
  //     title: "Hand Pump Project",
  //     youtubeId: "lXfMCv9sDPo",
  //     thumbnail: "/Vedios/Vedios9.webp",
  //     description: "Clean water access initiative"
  //   }
  // ];

  // ✅ Default to first video
  useEffect(() => {
    if (!selectedVideo) {
      setSelectedVideo(videoData[0]);
    }
  }, [selectedVideo,videoData]);

  // Calculate number of slides/groups based on items to show
  const totalSlides = Math.ceil(videoData.length / slidesToShow);

  // Update slides to show based on screen size
  useEffect(() => {
    const updateSlidesToShow = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setSlidesToShow(1);
        setnumberOfSlides(100)
      } else if (width < 1024) {
        setSlidesToShow(2);
         setnumberOfSlides(200)
      } else {
        setSlidesToShow(3);
        setnumberOfSlides(300)
      }
    };

    updateSlidesToShow();
    window.addEventListener('resize', updateSlidesToShow);

    return () => window.removeEventListener('resize', updateSlidesToShow);
  }, []);

  // Auto-rotate slides
  useEffect(() => {
    if (!autoplay) return;

    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % totalSlides);
    }, 9000);

    return () => clearInterval(interval);
  }, [autoplay, totalSlides]);

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index) => {
    setActiveSlide(index);
  };

  const toggleAutoplay = () => {
    setAutoplay(!autoplay);
  };

  // Check if a video is in the current active group
  const isVideoActive = (index) => {
    const startIndex = activeSlide * slidesToShow;
    const endIndex = startIndex + slidesToShow;
    return index >= startIndex && index < endIndex;
  };

if(loader){
  return <Loader/>
}
      if (Error) return (
      <div className={`errorContainer`}>
        <div className={`errorIcon`}>⚠️</div>
        <h2 className={`errorTitle`}>Unable to Load Content</h2>
        <p className={`errorMessage`}>{Error}</p>
        <button 
          className={`bg-[#e7001e] retryButton`}
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );

  return (
    <section className="video-gallery-section">
      <div className="video-gallery-container">
        {/* Main Featured Video */}
        {selectedVideo && (
          <div className="featured-video-section">
            <div className="featured-video-container">
              <div className="video-wrapper">
                <iframe
                  className="featured-video"
                  src={`https://www.youtube.com/embed/${selectedVideo.youtube_id}?rel=0&modestbranding=1&autoplay=1`}
                  title={selectedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
              <div className="video-info">
                <h2 className="video-title">{selectedVideo.title}</h2>
                <p className="video-description">{selectedVideo.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Video Carousel */}
        <div className="carousel-section">
          <div className="carousel-header">
            <h3>Our Projects & Initiatives</h3>
            <button 
              className={`autoplay-toggle ${autoplay ? 'active' : ''}`}
              onClick={toggleAutoplay}
              aria-label={autoplay ? 'Pause autoplay' : 'Play autoplay'}
            >
              <span className="toggle-icon">
                {autoplay ? '⏸️' : '▶️'}
              </span>
              {autoplay ? 'Pause' : 'Play'}
            </button>
          </div>

          <div className="carousel-container" ref={carouselRef}>
            <button 
              className="carousel-nav carousel-prev"
              onClick={prevSlide}
              aria-label="Previous video group"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
            </button>

            <div className="carousel-track">
              <div 
                className="carousel-slides"
                style={{ 
                  transform: `translateX(-${activeSlide * (numberOfSlides / slidesToShow)}%)`,
                  gridTemplateColumns: `repeat(${videoData.length}, calc(${numberOfSlides}% / ${slidesToShow}))`
                }}
              >
                {videoData && videoData.map((video, index) => (
                  <div
                    key={video.id}
                    className={`carousel-slide ${isVideoActive(index) ? 'active' : ''}`}
                    onClick={() => setSelectedVideo(video)}  // ✅ Play video on click
                    style={{ flex: `0 0 calc(100% / ${slidesToShow})` }}
                  >
                    <div className="slide-thumbnail">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        loading="lazy"
                      />
                      <div className="play-overlay">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                    <div className="slide-info">
                      <h4>{video.title}</h4>
                      <p>{video.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              className="carousel-nav carousel-next"
              onClick={nextSlide}
              aria-label="Next video group"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </button>
          </div>

          {/* Pagination Dots - Now based on total slides/groups */}
          <div className="carousel-pagination">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                className={`pagination-dot ${index === activeSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide group ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoGallery;
